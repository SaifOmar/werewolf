// src/App.js
import React, { useState } from 'react';
import PlayerRegistration from './components/PlayerRegistration'; // Adjust path if needed
import Index from './components/Index'
import TimerScreen from './components/TimerScreen';     // Adjust path if needed
import ThemeToggle from './components/ThemeToggle';     // Adjust path if needed

// Import CSS files ONCE here
import './App.css';          // Main App styles (if any)
import './assets/creatinggame.css'; // Styles for registration AND theme/decorations
import './assets/timer.css';        // Styles for timer AND theme/decorations

function App() {
  // State to control which component/view is active
  const [gameState, setGameState] = useState('index'); // 'index', 'registration' or 'timer'
  // const [gameState, setGameState] = useState('registration'); // 'registration' or 'timer'
  const [theme, setTheme] = useState('dark'); // Manage theme centrally

  // Function to be passed to PlayerRegistration
  const handleGameStart = (playerNames) => {
    console.log("App received start signal with players:", playerNames);
    // Here you could store playerNames in state if TimerScreen needs them
    // setStoredPlayerNames(playerNames);
    setGameState('timer'); // Switch the view to the TimerScreen
  };

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Apply theme class to the main container
  const themeClass = theme === 'light' ? 'light-theme' : '';
  
  
  const navigateToRegistration = () => {
    setGameState('registration');
  };


  return (
    // Main container handles the overall theme and structure
    <div className={`game-container ${themeClass}`}>

      {/* Render Theme Toggle - Render it based on gameState if needed */}
      {/* Or always render it */}
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      {/* Conditional Rendering based on gameState */}
      {gameState === 'index' ? (
        <Index onStartGame={navigateToRegistration} />
      ) : gameState === 'registration' ? (
        <PlayerRegistration onStartGame={handleGameStart} />
      ) : (
        <TimerScreen theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;
