// src/App.js
import React, { useState } from 'react';
import PlayerRegistration from './components/PlayerRegistration'; // Adjust path if needed
import TimerScreen from './components/TimerScreen';     // Adjust path if needed
import ThemeToggle from './components/ThemeToggle';     // Adjust path if needed

// Import CSS files ONCE here
import './App.css';          // Main App styles (if any)
import './assets/creatinggame.css'; // Styles for registration AND theme/decorations
import './assets/timer.css';        // Styles for timer AND theme/decorations

function App() {
  // State to control which component/view is active
  const [gameState, setGameState] = useState('registration'); // 'registration' or 'timer'
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

  return (
    // Main container handles the overall theme and structure
    <div className={`game-container ${themeClass}`}>

      {/* Render Theme Toggle - Render it based on gameState if needed */}
      {/* Or always render it */}
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      {/* Conditional Rendering based on gameState */}
      {gameState === 'registration' ? (
        // Pass the callback function as a prop
        <PlayerRegistration onStartGame={handleGameStart} />
      ) : (
        // Render the Timer screen, pass theme props if needed by its children
        <TimerScreen theme={theme} toggleTheme={toggleTheme} />
      )}

      {/* --- Decorative Elements (Rendered always) --- */}
      <div className="moon"></div>
      <div className="tree tree1">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>
      {/* Include tree2 if it exists in your CSS/original HTML */}
      <div className="tree tree2">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>
      <div className="tree tree3">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>
      <div className="ground"></div>
      {/* --- End Decorative Elements --- */}
    </div>
  );
}

export default App;
