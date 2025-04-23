// src/components/Creategame.js (or wherever PlayerRegistration is)
import React, { useState, useRef } from 'react';
// Assuming MIN_PLAYERS and game object are defined/imported elsewhere
const MIN_PLAYERS = 1; // Example minimum players
const game = { // Mock game object
  SetPlayerNames: (names) => console.log("Setting player names:", names),
  Start: () => console.log("Game logic started."),
  Debug: () => console.log("Debugging game state."),
};

// Expects an onStartGame function prop
function PlayerRegistration({ onStartGame }) { // Added onStartGame prop
  // const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [players, setPlayers] = useState([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ]);
  const nextPlayerId = useRef(players.length + 1);

  // const handleThemeToggle = () => {
  //   setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  // };

  const handleAddPlayer = () => {
    setPlayers(prevPlayers => [
      ...prevPlayers,
      { id: nextPlayerId.current, name: '' }
    ]);
    nextPlayerId.current += 1;
  };

  const handleRemovePlayer = (idToRemove) => {
    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== idToRemove));
  };

  const handlePlayerNameChange = (idToUpdate, event) => {
    const newName = event.target.value;
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === idToUpdate ? { ...player, name: newName } : player
      )
    );
  };

  const handleStartGame = () => {
    const playerNames = players
      .map(player => player.name.trim())
      .filter(name => name !== '');

    if (playerNames.length < MIN_PLAYERS) {
      alert(`You need at least ${MIN_PLAYERS} players with names to start the game!`);
      return;
    }

    // Call game logic functions
    game.SetPlayerNames(playerNames);
    game.Start();
    game.Debug();

    console.log("Game started event triggered with players:", playerNames);

    // *** Call the callback function passed from App ***
    if (onStartGame) {
      onStartGame(playerNames); // Pass names if needed by the next screen
    }
  };

  // const containerClassName = `game-container ${theme === 'light' ? 'light-theme' : ''}`;

  // *** IMPORTANT: We will let App handle the main container and theme toggle ***
  // *** This component should only render the registration specific parts ***
  return (
    <> {/* Use Fragment */}
      {/* Game Title */}
      <div className="game-title">
        <h1>WEREWOLF</h1>
        <h2>PLAYER REGISTRATION</h2>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <h3 className="form-title">ENTER PLAYER NAMES</h3>
        <div className="players-section" id="playersContainer">
          {players.map((player, index) => (
            <div className="player-input" key={player.id}>
              <span className="player-number">{index + 1}.</span>
              <input
                type="text"
                placeholder="Player name..."
                className="player-name"
                value={player.name}
                onChange={(e) => handlePlayerNameChange(player.id, e)}
              />
              {players.length > 1 && (
                <button
                  className="remove-player"
                  onClick={() => handleRemovePlayer(player.id)}
                  aria-label={`Remove player ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="form-buttons">
          <button className="menu-button add-player-btn" onClick={handleAddPlayer}>
            ADD PLAYER
          </button>
          {/* This button now calls the internal handler which then calls the prop */}
          <button className="menu-button start-game-btn" onClick={handleStartGame}>
            START GAME
          </button>
        </div>
      </div>
      {/* Decorative elements are rendered in App */}
      {/* Theme toggle is rendered in App */}
    </>
  );
}

export default PlayerRegistration;
