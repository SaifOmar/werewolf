import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Game } from "../game/game.js"; // Adjust path if needed

export const GameContext = createContext();

const NIGHT_ACTION_ORDER = [
  "Werewolf",
  "Minion",
  "Maison",
  "Seer",
  "Robber",
  "TroubleMaker",
  "Drunk",
  "Insomniac",
];

// 10 minutes in seconds
const DAY_DISCUSSION_TIME = 1 * 1;

export const GameProvider = ({ children }) => {
  const gameInstanceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const [gameState, setGameState] = useState({
    phase: "initial", // 'initial', 'setup', 'role_reveal', 'night', 'day_discussion', 'voting', 'results', 'finished' (finished is legacy, use results)
    players: [],
    groundCards: [],
    currentPlayerTurnIndex: 0, // For role reveal & voting
    currentNightRoleIndex: -1, // Index into NIGHT_ACTION_ORDER
    actionResult: null,
    playerVotes: {}, // { voterId: votedPlayerId }
    winners: null, // Can be team name ('Villager', 'Werewolf', 'Tanner') or Draw
    timerValue: DAY_DISCUSSION_TIME,
    isLoading: false,
    errorMessage: null,
  });

  // Function to safely get current game data for updates
  const getCurrentGameData = useCallback(() => {
    const game = gameInstanceRef.current;
    if (!game) {
      return {
        phase: "initial",
        players: [],
        groundCards: [],
        winners: null,
      };
    }
    return {
      phase: game.phase, // Raw phase from game logic
      players: [...game.players],
      groundCards: [...game.groundCards],
      winners: game.winners, // Raw winners from game logic
    };
  }, []);
  const updateGameState = useCallback((newState) => {
    setGameState((prev) => {
      const nextState = typeof newState === 'function' ? newState(prev) : newState;
      return { ...prev, ...nextState };
    });
  }, []);

  // Centralized state update function
  // const updateGameState = useCallback((newState) => {
  //   setGameState((prev) => ({ ...prev, ...newState }));
  // }, []);
  //
  // --- Game Lifecycle Functions ---

  const initializeGame = useCallback(
    (playerNames) => {
      // Check if game is already initialized with these players
      if (gameInstanceRef.current &&
        gameInstanceRef.current.playerNames.length === playerNames.length) {
        return;
      }

      updateGameState({ isLoading: true, errorMessage: null });

      try {
        const game = new Game();
        game.SetPlayerNames(playerNames);
        game.Init(playerNames.length);
        gameInstanceRef.current = game;

        const currentData = getCurrentGameData();

        updateGameState({
          ...currentData,        // Base data from game
          currentPlayerTurnIndex: 0,
          currentNightRoleIndex: -1,
          playerVotes: {},
          actionResult: null,
          winners: null,
          isLoading: false,
        });
      } catch (error) {
        updateGameState({
          errorMessage: error.message,
          isLoading: false,
          phase: "initial",
        });
      }
    },
    [getCurrentGameData, updateGameState],
  );

  const advanceRoleReveal = useCallback(() => {
    updateGameState((prev) => {
      const nextPlayerIndex = prev.currentPlayerTurnIndex + 1;
      // if there is a game running and we didn't show all player roles 
      if (
        gameInstanceRef.current &&
        nextPlayerIndex < gameInstanceRef.current.numberOfPlayers
      ) {
        return {
          ...prev,
          currentPlayerTurnIndex: nextPlayerIndex,
          actionResult: null,
        }; // Next player
      } else {
        // All roles revealed, start Night phase
        return {
          ...prev,
          phase: "night",
          currentPlayerTurnIndex: null,
          currentNightRoleIndex: 0, // Start with the first role in the order
          actionResult: null,
        };
      }
    });
  }, [updateGameState]);

  const advanceNightAction = useCallback(() => {
    updateGameState((prev) => {
      const nextRoleIndex = prev.currentNightRoleIndex + 1;
      if (nextRoleIndex < NIGHT_ACTION_ORDER.length) {
        return {
          ...prev,
          currentNightRoleIndex: nextRoleIndex,
          actionResult: null,
        };
      } else {
        // End of Night Phase -> Start Day Discussion
        // Insomniac might need a special check here *after* all swaps
        // This requires inspecting the game state one last time for Insomniac view
        return {
          ...prev,
          phase: "day_discussion",
          currentNightRoleIndex: -1,
          actionResult: null,
          timerValue: DAY_DISCUSSION_TIME, // Reset timer
        };
      }
    });
  }, [updateGameState]);

  const performNightAction = useCallback(
    async (playerId, args) => {
      const game = gameInstanceRef.current;
      if (!game) {
        updateGameState({
          isLoading: true,
          actionResult: null,
          errorMessage: null,
        });
        return
      };
      try {
        const player = game.findPlayer(playerId);
        if (!player)
          throw new Error(
            `Player with ID ${playerId} not found.`,
          );
        // Note: doneAction logic might need review if players can act multiple times or if judge controls flow
        // if (player.doneAction) throw new Error("Action already performed.");

        const role = player.GetOriginalRole(); // Assumes action based on CURRENT role after potential swaps
        const result = role.effect.doEffect(player, game, args); // This mutates the game state
        if (!result.success) {
          throw new Error(
            result.message ||
            `Action failed for ${role.roleName}`,
          );
        }

        // Update reactive state AFTER the game instance has been potentially mutated
        const currentData = getCurrentGameData(); // Get fresh data
        currentData.phase = "night";
        updateGameState({
          ...currentData, // Update glayers/ground cards if they changed
          actionResult: result, // Store result to show the player/judge
          isLoading: false,
        });
        return result; // Return for potential immediate feedback in component
      } catch (error) {
        updateGameState({
          errorMessage: error.message,
          isLoading: false,
        });
        // Don't automatically advance on error, let user decide
        return { success: false, message: error.message };
      }
    },
    [getCurrentGameData, updateGameState],
  );

  // --- Day/Voting Functions ---

  const startDayTimer = useCallback(() => {
    clearInterval(timerIntervalRef.current); // Clear any existing timer
    updateGameState({ timerValue: DAY_DISCUSSION_TIME });

    timerIntervalRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timerValue <= 1) {
          clearInterval(timerIntervalRef.current);
          return {
            ...prev,
            phase: "voting",
            currentPlayerTurnIndex: 0, // Start voting with first player
            timerValue: 0,
          };
        }
        return { ...prev, timerValue: prev.timerValue - 1 };
      });
    }, 1000);
  }, [updateGameState]);

  // Stop timer on component unmount or phase change
  useEffect(() => {
    return () => clearInterval(timerIntervalRef.current);
  }, []);
  useEffect(() => {
    if (gameState.phase !== "day_discussion") {
      clearInterval(timerIntervalRef.current);
    }
  }, [gameState.phase]);

  const castVote = useCallback(
    (voterId, votedPlayerId) => {
      updateGameState((prev) => {
        const newVotes = {
          ...prev.playerVotes,
          [voterId]: votedPlayerId,
        };
        const nextVoterIndex = prev.currentPlayerTurnIndex + 1;

        if (
          gameInstanceRef.current &&
          nextVoterIndex <
          gameInstanceRef.current.players.length
        ) {
          // Move to next voter
          return {
            ...prev,
            playerVotes: newVotes,
            currentPlayerTurnIndex: nextVoterIndex,
          };
        } else {
          // Last vote cast, move to results calculation
          return {
            ...prev,
            phase: "results", // Transition to results phase
            playerVotes: newVotes,
            currentPlayerTurnIndex: null,
          };
        }
      });
    },
    [updateGameState],
  );

  // --- Results ---
  const determineWinner = useCallback(() => {
    const game = gameInstanceRef.current;
    const votes = gameState.playerVotes;
    if (!game || Object.keys(votes).length !== game.players.length) {
      return "Error";
    }

    game.players.forEach((p) => {
      console.log(
        `- ${p.name}: Final Role: ${p.GetRole()?.roleName}, Original: ${p.GetOriginalRole()?.roleName}`,
      );
    });

    // ** ---------- THIS IS THE CRITICAL LOGIC YOU NEED TO IMPLEMENT ---------- **
    // Based on One Night Ultimate Werewolf rules:
    // 1. Count votes for each player.
    // 2. Find player(s) with the most votes.
    // 3. If a Tanner is killed, Tanner wins alone.
    // 4. If a Hunter is killed, the player they voted for also dies.
    // 5. If Werewolf(s) are killed, Villagers win (unless Tanner/Hunter overrides).
    // 6. If no Werewolves are killed, Werewolves win (unless Tanner/Hunter overrides).
    // 7. If multiple players tied for most votes, ALL tied players die (check rules for specifics).
    // 8. Consider Minion win conditions (if Werewolves win, Minion also wins).
    // 9. Consider Doppelganger win conditions (wins with the team they copied).

    // Placeholder Logic:
    const voteCounts = {};
    let maxVotes = 0;
    game.players.forEach((p) => {
      voteCounts[p.id] = 0;
    });
    Object.values(votes).forEach((votedId) => {
      if (voteCounts[votedId] !== undefined) {
        voteCounts[votedId]++;
        if (voteCounts[votedId] > maxVotes) {
          maxVotes = voteCounts[votedId];
        }
      }
    });

    if (maxVotes === 0) return "Draw (No votes cast?)"; // Or handle differently

    const killedPlayerIds = Object.entries(voteCounts)
      .filter(([id, count]) => count === maxVotes)
      .map(([id, count]) => parseInt(id)); // Ensure IDs are numbers if needed


    let winnerTeam = "Placeholder: Implement Winning Logic"; // Default placeholder

    // Example snippet (incomplete):
    let werewolfKilled = false;
    let villagerKilled = false;
    let werewolfExists = false;

    killedPlayerIds.forEach((id) => {
      const player = game.findPlayer(id);
      if (player?.GetRole()?.team?.name === "Werewolf") {
        // Use team name/type
        werewolfKilled = true;
      } else if (player?.GetRole()?.team?.name === "Villager") {
        villagerKilled = true;
      }
      // Add Tanner, Hunter checks here
    });
    game.players.forEach((p) => {
      if (p.GetRole()?.team?.name === "Werewolf")
        werewolfExists = true;
    });

    if (werewolfKilled) {
      winnerTeam = "Villager Team";
    } else if (werewolfExists && !villagerKilled) {
      // simplified
      winnerTeam = "Werewolf Team";
    } else if (!werewolfExists && villagerKilled) {
      // simplified - no ww, villager died
      winnerTeam = "Werewolf Team (by default)"; // Or Draw? Check rules
    } else {
      winnerTeam = "Draw/Undetermined";
    }
    // ** THIS PLACEHOLDER IS VERY INCOMPLETE - REPLACE WITH FULL RULES **

    // Reveal all cards at the end
    game.players.forEach((p) => (p.isRevealed = true));
    updateGameState({ winners: winnerTeam, ...getCurrentGameData() }); // Update players with revealed state
    return winnerTeam;
  }, [gameState.playerVotes, updateGameState, getCurrentGameData]);

  useEffect(() => {
    if (gameState.phase === "results" && gameState.winners === null) {
      determineWinner();
    }
  }, [gameState.phase, gameState.winners, determineWinner]);

  const resetGame = useCallback(() => {
    clearInterval(timerIntervalRef.current);
    updateGameState({
      phase: "role_reveal",
      groundCards: [],
      currentPlayerTurnIndex: 0,
      currentNightRoleIndex: -1,
      actionResult: null,
      playerVotes: {},
      winners: null,
      timerValue: DAY_DISCUSSION_TIME,
      isLoading: false,
      errorMessage: null,
    });
  }, [updateGameState]);

  // --- Provide Context Value ---
  const value = {
    gameState,
    initializeGame,
    advanceRoleReveal,
    performNightAction,
    advanceNightAction,
    startDayTimer,
    castVote,
    resetGame,
    NIGHT_ACTION_ORDER, // Make order available if needed
    // No direct setGameState exposed, use specific functions
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
