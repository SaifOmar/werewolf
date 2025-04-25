import React, { useState } from 'react';
import '../assets/style.css'; // Assuming your CSS file is named style.css

function Index({ onStartGame }) {
  const [isLightTheme, setIsLightTheme] = useState(false);

  const handleThemeToggle = () => {
    setIsLightTheme(!isLightTheme);
  };

  const handleStartGameClick = () => {
    onStartGame(); // This will call the function from App.jsx to navigate
  };

  return (
    <div className={`game-container ${isLightTheme ? 'light-theme' : ''}`} id="gameContainer">
      <div className="theme-toggle">
        <div className="toggle-switch" id="themeToggle" onClick={handleThemeToggle}></div>
        <div className="toggle-text" id="themeText"></div>
      </div>

      <div className="moon"></div>

      {/* Improved Trees */}
      <div className="tree tree1">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
          <div className="tree-layer tree-layer-3"></div>
        </div>
        <div className="tree-trunk"></div>
      </div>

      <div className="tree tree2">
        <div className="tree-foliage">
          <div className="tree-layer tree-layer-1"></div>
          <div className="tree-layer tree-layer-2"></div>
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

      <div className="game-title">
        <h1>WEREWOLF</h1>
        <h2>THE ULTIMATE NIGHT</h2>
      </div>

      <div className="menu-container">
        <button className="menu-button startingGame" onClick={handleStartGameClick}>
          START GAME
        </button>
      </div>

      {/* Improved Characters */}
      <div className="character werewolf">
        <div className="werewolf-sprite">
          <div className="werewolf-head">
            <div className="werewolf-ear-left"></div>
            <div className="werewolf-ear-right"></div>
            <div className="werewolf-eye-left"></div>
            <div className="werewolf-eye-right"></div>
            <div className="werewolf-snout"></div>
          </div>
          <div className="werewolf-body"></div>
          <div className="werewolf-arm-left"></div>
          <div className="werewolf-arm-right"></div>
          <div className="werewolf-leg-left"></div>
          <div className="werewolf-leg-right"></div>
        </div>
      </div>

      <div className="character villager">
        <div className="villager-sprite">
          <div className="villager-hat-top"></div>
          <div className="villager-hat"></div>
          <div className="villager-head">
            <div className="villager-eye-left"></div>
            <div className="villager-eye-right"></div>
            <div className="villager-mouth"></div>
          </div>
          <div className="villager-body"></div>
          <div className="villager-arm-left"></div>
          <div className="villager-arm-right"></div>
          <div className="villager-leg-left"></div>
          <div className="villager-leg-right"></div>
        </div>
      </div>

      <div className="ground"></div>
    </div>
  );
}

export default Index;
