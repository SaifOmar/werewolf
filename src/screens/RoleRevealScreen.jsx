import React, { useState } from 'react';
import { useGame } from '../context/useGame';
import RoleCard from '../components/RoleCard'; // Component to display role info

function RoleRevealScreen() {
  const { gameState, advanceRoleReveal } = useGame()
  const [showRole, setShowRole] = useState(false);


  const currentPlayerIndex = gameState.currentPlayerTurnIndex;
  const currentPlayer = gameState.players[currentPlayerIndex];

  // console.log(currentPlayerIndex);
  if (!currentPlayer) {
    return <div>Loading player data...</div>; // Or handle end of reveal
  }

  const handleReveal = () => {
    setShowRole(true);
  };

  const handleNext = () => {
    setShowRole(false);
    advanceRoleReveal(); // Move to next player or next phase via context
  };

  return (
    <div>
      <h2>Pass the device to: {currentPlayer.name}</h2>
      {!showRole && (
        <button onClick={handleReveal}>
          I am {currentPlayer.name}, Show My Role
        </button>
      )}

      {showRole && (
        <div>
          <h3>Your Role:</h3>
          <RoleCard role={currentPlayer.GetOriginalRole()} /> {/* Show initial role */}
          <button onClick={handleNext}>
            OK, I've seen my role.
          </button>
          <p>(Remember your role!)</p>
        </div>
      )}
    </div>
  );
}

export default RoleRevealScreen;
