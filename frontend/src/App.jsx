// // src/App.js
import React, { useState } from 'react';
import { Game } from '../entities/game';
import PlayerRegistration from './components/PlayerRegistration'; // Adjust path if needed
// import Index from './components/Index'
// import TimerScreen from './components/TimerScreen';     // Adjust path if needed
// import ThemeToggle from './components/ThemeToggle';     // Adjust path if needed

// Import CSS files ONCE here
import './App.css';          // Main App styles (if any)
import './assets/creatinggame.css'; // Styles for registration AND theme/decorations
import './assets/timer.css';        // Styles for timer AND theme/decorations
//

function App() {
  const gameInstance = new Game();
  const [game, setGame] = useState(gameInstance)
  //
  return (
    <>
      <div>{game.players != null ? game.players : "hello"}</div>
      <div>fashdlfhasldf</div>
      <div>fashdlfhasldf</div>
      <div>fashdlfhasldf</div>
      <div>fashdlfhasldf</div>
      {game.phase === 'setup' ? (
        <Setup game={game} />
      ) : (
        <div>hello</div>
      )}
    </>
  );
  // return (
  // <>
  //     {game.phase === "setup" ?
  //       (<Setup game={game} />) : (<div>hello<div />)}
  //         )
  //
  //       </>
  //     });
  //
}
function Setup({ game }) {
  const [players, setPlayers] = useState(Array(2).fill(''));

  const handleChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    game.playerNames = players
    game.Init()
    console.log(game.players); // or do whatever i need with the players array
    alert(`Players: ${players.join(', ')}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {players.map((player, index) => (
          <input
            key={index}
            type="text"
            placeholder={`player ${index + 1}`}
            value={player}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}
        <button type="submit">Add Players</button>
      </form>
    </div>
  );
}



// function App() {
//   // State to control which component/view is active
//   const [gameState, setGameState] = useState('index'); // 'index', 'registration' or 'timer'
//   // const [gameState, setGameState] = useState('registration'); // 'registration' or 'timer'
//   const [theme, setTheme] = useState('dark'); // Manage theme centrally
//
//   // Function to be passed to PlayerRegistration
//   const handleGameStart = (playerNames) => {
//     console.log("App received start signal with players:", playerNames);
//     // Here you could store playerNames in state if TimerScreen needs them
//     // setStoredPlayerNames(playerNames);
//     setGameState('timer'); // Switch the view to the TimerScreen
//   };
//
//   // Function to toggle theme
//   const toggleTheme = () => {
//     setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
//   };
//
//   // Apply theme class to the main container
//   const themeClass = theme === 'light' ? 'light-theme' : '';
//
//
//   const navigateToRegistration = () => {
//     setGameState('registration');
//   };
//
//
//   return (
//     // Main container handles the overall theme and structure
//     <div className={`game-container ${themeClass}`}>
//
//       {/* Render Theme Toggle - Render it based on gameState if needed */}
//       {/* Or always render it */}
//       <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
//
//       {/* Conditional Rendering based on gameState */}
//       {gameState === 'index' ? (
//         <Index onStartGame={navigateToRegistration} />
//       ) : gameState === 'registration' ? (
//         <PlayerRegistration onStartGame={handleGameStart} />
//       ) : (
//         <TimerScreen theme={theme} toggleTheme={toggleTheme} />
//       )}
//     </div>
//   );
// }

export default App;
