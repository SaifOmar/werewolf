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
			phase: game.GetCurrentPhase(), // Raw phase from game logic
			players: [...game.players],
			groundCards: [...game.groundCards],
			winners: game.winners, // Raw winners from game logic
		};
	}, []);
	const updateGameState = useCallback((newState) => {
		setGameState((prev) => {
			const nextState =
				typeof newState === "function"
					? newState(prev)
					: newState;
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
			if (
				gameInstanceRef.current &&
				gameInstanceRef.current.playerNames.length ===
				playerNames.length
			) {
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
					...currentData, // Base data from game
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
		[getCurrentGameData, updateGameState]
	);

	const advanceRoleReveal = useCallback(() => {
		updateGameState((prev) => {
			const nextPlayerIndex = prev.currentPlayerTurnIndex + 1;
			// if there is a game running and we didn't show all player roles
			if (
				gameInstanceRef.current &&
				nextPlayerIndex <
				gameInstanceRef.current.numberOfPlayers
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
				return;
			}
			try {
				const player = game.findPlayer(playerId);
				if (!player)
					throw new Error(
						`Player with ID ${playerId} not found.`
					);
				// Note: doneAction logic might need review if players can act multiple times or if judge controls flow
				// if (player.doneAction) throw new Error("Action already performed.");

				const role = player.GetOriginalRole(); // Assumes action based on CURRENT role after potential swaps
				const result = role.effect.doEffect(player, game, args); // This mutates the game state
				if (!result.success) {
					throw new Error(
						result.message ||
						`Action failed for ${role.roleName}`
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
		[getCurrentGameData, updateGameState]
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


	// const castVote = useCallback((voterId, votedPlayerId) => {
	// 	const game = gameInstanceRef.current
	// })

	const castVote = useCallback(
		(voterId, votedPlayerId) => {
			updateGameState((prev) => {
				const newVotes = {
					...prev.playerVotes,
					[voterId]: votedPlayerId,
				};
				const nextVoterIndex = prev.currentPlayerTurnIndex + 1;

				if (gameInstanceRef.current) {
					gameInstanceRef.current.castVotes(votedPlayerId);
				}
				const updatedPlayers = prev.players.map((p) => {
					if (p.id === voterId) {
						p.vote = votedPlayerId;
					}
					return p;
				});

				if (gameInstanceRef.current) {
					gameInstanceRef.current.players = updatedPlayers
				}

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
						players: updatedPlayers,
					};
				} else {
					const winners = gameInstanceRef.current.FinishGame();
					// Last vote cast, move to results calculation
					return {
						...prev,
						phase: gameInstanceRef.current.GetCurrentPhase(), // Transition to results phase
						winners: winners,
						playerVotes: newVotes,
						currentPlayerTurnIndex: null,
						players: updatedPlayers,
					};
				}
			});
		},
		[updateGameState]
	);

	const resetGame = useCallback(() => {
		// Clear any running timers
		clearInterval(timerIntervalRef.current);

		// Store the player names before resetting
		const previousPlayerNames = gameState.players.map(p => p.name);

		// Reset game state
		updateGameState({
			phase: "initial", // Temporarily set to initial
			players: [],
			groundCards: [],
			currentPlayerTurnIndex: 0,
			currentNightRoleIndex: -1,
			actionResult: null,
			playerVotes: {},
			winners: null,
			timerValue: DAY_DISCUSSION_TIME,
			isLoading: true, // Show loading state
			errorMessage: null,
		});

		// Clear the game instance reference
		gameInstanceRef.current = null;

		// Create a new game with the same players after a short delay
		setTimeout(() => {
			if (previousPlayerNames.length > 0) {
				try {
					// Create a fresh game instance
					const game = new Game();
					game.SetPlayerNames(previousPlayerNames);
					game.Init(previousPlayerNames.length);
					gameInstanceRef.current = game;

					// Update state with the new game data
					const currentData = getCurrentGameData();
					updateGameState({
						...currentData,
						phase: "role_reveal", // Go directly to role reveal
						currentPlayerTurnIndex: 0,
						isLoading: false,
					});

					console.log("Game successfully reset with the same players");
				} catch (error) {
					updateGameState({
						phase: "initial",
						errorMessage: "Failed to restart game: " + error.message,
						isLoading: false,
					});
					console.error("Error resetting game:", error);
				}
			} else {
				// If there were no players, just go to initial setup
				updateGameState({
					isLoading: false,
				});
			}
		}, 300); // Short delay to allow state update and UI refresh
	}, [gameState.players, updateGameState, getCurrentGameData]);

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
