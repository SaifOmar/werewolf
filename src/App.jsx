// // // src/App.jimport React from 'react';
import { useGame } from './context/useGame'; // Corrected import path
import { GameProvider } from './context/GameContext'; // Corrected import path
import StartScreen from './screens/StartScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import RoleRevealScreen from './screens/RoleRevealScreen';
import NightPhaseScreen from './screens/NightPhaseScreen';
import DayDiscussionScreen from './screens/DayDiscussionScreen'; // Added
import VotingScreen from './screens/VotingScreen';
import ResultsScreen from './screens/ResultsScreen';
import LoadingScreen from './screens/LoadingScreen';
import './App.css';

function CurrentScreen() {
  const { gameState } = useGame();

  if (gameState.isLoading) {
    return <LoadingScreen />;
  }
  // console.log(gameState)

  // Add Error Display
  if (gameState.errorMessage) {
    // Provide a way to dismiss error or reset
    return (
      <div className="error-message">
        Error: {gameState.errorMessage}
        {/* <button onClick={() => updateGameState({ errorMessage: null })}>Dismiss</button> */}
        {/* Or a reset button */}
      </div>
    );
  }
  // console.log("Current gameState.phase:", gameState.phase, "Type:", typeof gameState.phase);
  // console.log('before starting')
  switch (gameState.phase) {
    case 'initial':
      return <StartScreen />;
    // case 'setup': // Should transition quickly, maybe just show loading or setup directly
    //   return <PlayerSetupScreen />;
    case 'role_reveal':
      return <RoleRevealScreen />;
    case 'night':
      return <NightPhaseScreen />;
    case 'day_discussion':
      return <DayDiscussionScreen />; // New screen for timer
    case 'voting':
      return <VotingScreen />;
    case 'results': // Final results display
      return <ResultsScreen />;
    case 'finished': // Legacy state, map to results
      console.warn("Mapping 'finished' phase to 'results'");
      return <ResultsScreen />;
    default:
      console.warn("Unknown game phase:", gameState.phase);
      return <StartScreen />; // Fallback
  }
}

function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <h1>One Night Ultimate Werewolf</h1>
        <CurrentScreen />
      </div>
    </GameProvider>
  );
}

export default App
// import React, { useState } from 'react';
// import { Game } from "./game/game.js"
// import PlayerRegistration from './components/PlayerRegistration'; // Adjust path if needed
// // import Index from './components/Index'
// // import TimerScreen from './components/TimerScreen';     // Adjust path if needed
// // import ThemeToggle from './components/ThemeToggle';     // Adjust path if needed
// // Import CSS files ONCE here
// import './App.css';          // Main App styles (if any)
// import './assets/creatinggame.css'; // Styles for registration AND theme/decorations
// import './assets/timer.css';        // Styles for timer AND theme/decorations
// // import { game } from '../main';
// //
//
// function App() {
//   const gameInstance = new Game();
//   const [game, setGame] = useState(gameInstance)
//   //
//   return (
//     <>
//       <div>{game.players != null ? game.players : "hello"}</div>
//       <div>fashdlfhasldf</div>
//       <div>fashdlfhasldf</div>
//       <div>fashdlfhasldf</div>
//       <div>fashdlfhasldf</div>
//       {game.phase === 'setup' ? (
//         <Setup game={game} />
//       ) : (
//         <div>hello</div>
//       )}
//     </>
//   );
//   // return (
//   // <>
//   //     {game.phase === "setup" ?
//   //       (<Setup game={game} />) : (<div>hello<div />)}
//   //         )
//   //
//   //       </>
//   //     });
//   //
// }
// function Setup({ game }) {
//   const [players, setPlayers] = useState(Array(2).fill(''));
//
//   const handleChange = (index, value) => {
//     const updatedPlayers = [...players];
//     updatedPlayers[index] = value;
//     setPlayers(updatedPlayers);
//   };
//
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     game.playerNames = players
//     game.Init()
//     console.log(game.players); // or do whatever i need with the players array
//     alert(`Players: ${players.join(', ')}`);
//   };
//
//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         {players.map((player, index) => (
//           <input
//             key={index}
//             type="text"
//             placeholder={`player ${index + 1}`}
//             value={player}
//             onChange={(e) => handleChange(index, e.target.value)}
//           />
//         ))}
//         <button type="submit">Add Players</button>
//       </form>
//     </div>
//   );
// }
//
//
//
// // function App() {
// //   // State to control which component/view is active
// //   const [gameState, setGameState] = useState('index'); // 'index', 'registration' or 'timer'
// //   // const [gameState, setGameState] = useState('registration'); // 'registration' or 'timer'
// //   const [theme, setTheme] = useState('dark'); // Manage theme centrally
// //
// //   // Function to be passed to PlayerRegistration
// //   const handleGameStart = (playerNames) => {
// //     console.log("App received start signal with players:", playerNames);
// //     // Here you could store playerNames in state if TimerScreen needs them
// //     // setStoredPlayerNames(playerNames);
// //     setGameState('timer'); // Switch the view to the TimerScreen
// //   };
// //
// //   // Function to toggle theme
// //   const toggleTheme = () => {
// //     setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
// //   };
// //
// //   // Apply theme class to the main container
// //   const themeClass = theme === 'light' ? 'light-theme' : '';
// //
// //
// //   const navigateToRegistration = () => {
// //     setGameState('registration');
// //   };
// //
// //
// //   return (
// //     // Main container handles the overall theme and structure
// //     <div className={`game-container ${themeClass}`}>
// //
// //       {/* Render Theme Toggle - Render it based on gameState if needed */}
// //       {/* Or always render it */}
// //       <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
// //
// //       {/* Conditional Rendering based on gameState */}
// //       {gameState === 'index' ? (
// //         <Index onStartGame={navigateToRegistration} />
// //       ) : gameState === 'registration' ? (
// //         <PlayerRegistration onStartGame={handleGameStart} />
// //       ) : (
// //         <TimerScreen theme={theme} toggleTheme={toggleTheme} />
// //       )}
// //     </div>
// //   );
// // }
//
// export default App;
