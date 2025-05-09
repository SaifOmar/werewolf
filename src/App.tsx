/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-irregular-whitespace */
import React, { useState, useRef, useEffect } from 'react'; // Import useRef and useEffect
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './theme';
import { GameSetup } from './components/GameSetup';
import { RoleReveal } from './components/RoleReveal';
import { NightAction } from './components/NightAction';
import { Timer } from './components/Timer'; // Assuming Timer component exists
import { Voting } from './components/Voting';
import { Card } from './components/Card'; // Assuming Card component exists
import { Game, GamePhase } from './game/game'; // Ensure Game class is updated as discussed
import { ActionResultDisplay } from './components/ActionResultDisplay';
import { Player } from './game/player'; // Assuming Player class exists
import { IRole } from './game/roles'; // Assuming IRole exists

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: ${theme.colors.background};
        color: ${theme.colors.onBackground};
    }
`;

const App: React.FC = () => {
  // Use useRef to hold the mutable Game instance
  const gameRef = useRef<Game>(new Game());

  interface pendingAction {
    playerIndex: number;
    actionArgs: any[];
  }
  // Use useState for the specific data pieces the UI needs
  const [phase, setPhase] = useState<GamePhase>(GamePhase.Setup);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]); // Keep players list in state
  const [centerCards, setCenterCards] = useState<IRole[]>([]); // Keep center cards in state
  const [pendingActions, setPendingActions] = useState<pendingAction[]>([]); // Keep center cards in state
  const [nightResults, setNightResults] = useState<Map<number, any>>(new Map()); // Keep results in state

  // Initialize the game instance when the component mounts
  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Game();
      // Initial state is already Setup, players/cards are empty
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Helper function to update React state from the game instance
  // Call this after any gameRef.current method that changes state the UI cares about
  const updateUIStateFromGame = () => {
    const currentGame = gameRef.current;
    if (currentGame) {
      setPlayers([...currentGame.players]); // Spread to create a new array reference
      setCenterCards([...currentGame.centerCards]); // Spread to create a new array reference
      setPhase(currentGame.phase);
      setCurrentPlayerIndex(currentGame.currentPlayerIndex);
      setPendingActions([...currentGame.pendingActions]);
      setNightResults(new Map(currentGame.nightResults)); // Create a new Map reference
    }
  };

  const handleStartGame = (playerNames: string[]) => {
    const currentGame = gameRef.current;
    if (!currentGame) {
      console.error("Game instance not initialized.");
      return;
    }
    try {
      currentGame.setup(playerNames); // Mutates the game instance
      currentGame.startRoleReveal(); // Mutates the game instance
      // Manually update React state based on the new game instance state
      updateUIStateFromGame();
      // Explicitly set initial phase after setup if setup doesn't do it
    } catch (error) {
      console.error("Failed to setup game:", error);
      // Reset React state on error
      setPhase(GamePhase.Setup);
      setCurrentPlayerIndex(0);
      setPlayers([]);
      setCenterCards([]);
      setNightResults(new Map());
    }
  };

  // Handler for moving from one Role Reveal player to the next
  const handleRoleRevealComplete = () => {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    const nextPlayerIndex = currentPlayerIndex + 1;

    if (nextPlayerIndex >= players.length) {
      // All players have revealed their roles, move to Night
      currentGame.startNight(); // Mutates the game instance
      // Update React state
      updateUIStateFromGame();
    } else {
      // Move to the next player for role reveal
      currentGame.currentPlayerIndex = nextPlayerIndex; // Update game instance
      setCurrentPlayerIndex(nextPlayerIndex); // Only update index state
    }
  };

  // Handler for when a player completes their Night Action *selection*
  const handleNightActionComplete = (actionArgs: any[]) => {
    const currentGame = gameRef.current;
    if (!currentGame) return;


    const playerIndex = currentPlayerIndex; // Use current state index

    currentGame.recordNightAction(playerIndex, actionArgs); // Mutates the game instance

    const nextPlayerIndex = playerIndex + 1;

    if (nextPlayerIndex >= players.length) {
      // All players have recorded their actions
      currentGame.executeNightActions(); // Mutates the game instance (executes actions, populates results)
      // Update React state based on executed actions
      currentGame.currentPlayerIndex = 0;
      currentGame.phase = GamePhase.ActionResult;
      currentGame.nightResults = (new Map(currentGame.nightResults));
      updateUIStateFromGame();

      // setPhase(GamePhase.ActionResult); // Explicitly set next phase
      // setCurrentPlayerIndex(0); // Reset index for Action Result phase
      // setPlayers([...currentGame.players]); // Update players state (roles may have changed)
      // setCenterCards([...currentGame.centerCards]); // Update center state (roles may have changed)
      // setNightResults(new Map(currentGame.nightResults)); // Update results state
    } else {
      // Move to the next player for their night action selection
      setCurrentPlayerIndex(nextPlayerIndex); // Only update index state
    }
  };

  // Handler for moving from one Action Result player to the next
  const handleActionResultComplete = () => {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    const nextPlayerIndex = currentPlayerIndex + 1;

    if (nextPlayerIndex >= players.length) {
      currentGame.startDiscussion(); // Mutates the game instance
      currentGame.currentPlayerIndex = 0
      updateUIStateFromGame();
    } else {
      setCurrentPlayerIndex(nextPlayerIndex); // Only update index state
    }
  };

  // Handler for when the Discussion timer ends
  const handleDiscussionEnd = () => {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    currentGame.stopTimer(); // Mutates game instance
    currentGame.startVoting(); // Mutates game instance
    // Update React state
    setPhase(GamePhase.Voting); // Explicitly set next phase
    setCurrentPlayerIndex(0); // Voting starts with player 0
    // No need to explicitly set timerActive state here as Discussion is ending
  };

  // Handler for when a player casts a vote
  const handlePlayerVote = (targetPlayerIndex: number) => {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    const votingPlayerIndex = currentPlayerIndex; // Use current state index

    currentGame.processVote(votingPlayerIndex, targetPlayerIndex); // Mutates game instance

    const nextPlayerIndex = votingPlayerIndex + 1;

    if (nextPlayerIndex >= players.length) {
      // All players have voted
      currentGame.countVotes(); // Mutates isAlive, *may* set phase to GameOver
      // Update React state
      setPhase(GamePhase.GameOver); // Explicitly set next phase (or read from game.phase if tallyVotes sets it)
      setCurrentPlayerIndex(0); // Index not used in Game Over
      setPlayers([...currentGame.players]); // Update players state (isAlive has changed)
    } else {
      // Move to the next player to vote
      setCurrentPlayerIndex(nextPlayerIndex); // Only update index state
    }
  };


  const renderGamePhase = () => {
    // Use state variables directly for rendering logic
    switch (phase) {
      case GamePhase.Setup:
        return <GameSetup onStartGame={handleStartGame} />;

      case GamePhase.RoleReveal:
        // Ensure current player index is valid for rendering
        {
          const revealPlayer = players[currentPlayerIndex];
          if (!revealPlayer) {
            console.error("Invalid player index in Role Reveal phase state:", currentPlayerIndex, players.length);
            // Attempt to move to the next state to recover
            handleRoleRevealComplete();
            return <Card>Loading next player...</Card>; // Placeholder while state updates
          }
          return (
            <RoleReveal
              currentPlayer={revealPlayer}
              totalPlayers={players.length}
              onNext={handleRoleRevealComplete}
            />
          );
        }

      case GamePhase.Night:
        // Ensure current player index is valid for rendering
        {
          const nightPlayer = players[currentPlayerIndex];
          if (!nightPlayer) {
            console.error("Invalid player index in Night phase state:", currentPlayerIndex, players.length);
            handleNightActionComplete([]); // Attempt to advance night action to skip
            return <Card>Loading next player...</Card>; // Placeholder
          }
          return (
            <NightAction
              currentPlayer={nightPlayer}
              game={gameRef.current!} // Pass the game instance to NightAction (used for player/center lists)
              onActionComplete={handleNightActionComplete}
            />
          );
        }

      case GamePhase.ActionResult:
        {
          const resultPlayer = players[currentPlayerIndex];
          if (!resultPlayer) {
            console.error("Invalid player index in Action Result phase state:", currentPlayerIndex, players.length);
            handleActionResultComplete(); // Attempt to move to the next state to recover
            return <Card>Loading next result...</Card>; // Placeholder
          }
          return (
            <ActionResultDisplay
              currentPlayer={resultPlayer}
              game={gameRef.current!} // Pass the game instance to lookup results, other players etc.
              onComplete={handleActionResultComplete}
            />
          );
        }

      case GamePhase.Discussion:
        return (
          <>
            {/* Timer needs access to the game instance or timer state from it */}
            {/* Assuming Timer component reads gameRef.current.discussionTimeRemaining and gameRef.current.timerActive */}
            <Timer
              game={gameRef.current!} // Pass game instance so Timer can read state/call updateTimer if needed
              // Or pass state explicitly: seconds={gameRef.current?.discussionTimeRemaining}, isActive={gameRef.current?.timerActive}
              onComplete={handleDiscussionEnd}
            />
            <Card>
              <h2>Discussion Time</h2>
              <p>Discuss and try to figure out who the werewolves are!</p>
            </Card>
          </>
        );

      case GamePhase.Voting:
        // Ensure current player index is valid for rendering
        {
          const votingPlayer = players[currentPlayerIndex];
          if (!votingPlayer) {
            console.error("Invalid player index in Voting phase state:", currentPlayerIndex, players.length);
            handlePlayerVote(-1); // Attempt to advance vote phase
            return <Card>Loading next voter...</Card>;
          }
          return (
            <Voting
              players={players} // Pass players list from state
              currentPlayer={votingPlayer} // Pass current player from state
              onVote={handlePlayerVote}
            />
          );
        }

      case GamePhase.GameOver:
        // Game Over doesn't use currentPlayerIndex for rendering players list
        return (
          <Card>
            <h2>Game Over</h2>
            {/* determineWinners needs to access the final state from gameRef */}
            {/* Ensure gameRef.current exists before calling */}
            <p>Winner: {gameRef.current?.determineWinners() || 'Undetermined'}</p>
            <h3>Final Roles:</h3>
            <ul>
              {players.map(player => ( // Use players from state
                <li key={player.id}>
                  {player.name}: {player.CurrentRole?.roleName || 'Unknown Role'} ({player.isAlive ? 'Alive' : 'Eliminated'})
                </li>
              ))}
              {centerCards.map((card, index) => ( // Use centerCards from state
                <li key={`center-${index}`}>
                  Center Card {index + 1}: {card?.roleName || 'Unknown Role'}
                </li>
              ))}
            </ul>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {renderGamePhase()}
    </ThemeProvider>
  );
};

export default App;
