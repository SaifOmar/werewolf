import React, { useState } from 'react';
import { useGame } from '../context/useGame';
import PlayerInput from '../components/PlayerInput'; // Assuming a simple input component

const MIN_PLAYERS = 6; // Or maybe 3 for testing? Adjust as needed.

function PlayerSetupScreen() {
  const { initializeGame } = useGame();
  const [playerNames, setPlayerNames] = useState(Array(MIN_PLAYERS).fill(''));

  const handleNameChange = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validNames = playerNames.map(name => name.trim()).filter(name => name !== '');
    if (validNames.length < MIN_PLAYERS) {
      alert(`Please enter at least ${MIN_PLAYERS} valid player names.`);
      return;
    }
    // Add unique default names if needed
    const finalNames = validNames.map((name, index) => name || `Player ${index + 1}`);
    console.log("Submitting player names:", finalNames);
    initializeGame(finalNames); // Call context function to start game logic
  };

  return (
    <div>
      <h2>Enter Player Names</h2>
      <form onSubmit={handleSubmit}>
        {playerNames.map((name, index) => (
          <PlayerInput
            key={index}
            index={index}
            value={name}
            onChange={handleNameChange}
          />
        ))}
        <button type="button" onClick={addPlayer}>
          Add Another Player
        </button>
        <button type="submit">Start Game with {playerNames.length} Players</button>
      </form>
    </div>
  );
}

export default PlayerSetupScreen;
