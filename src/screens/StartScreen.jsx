import React from 'react';
import PlayerSetupScreen from './PlayerSetupScreen';

function StartScreen() {
  // Directly render the setup screen as the starting point
  // Or have a button here that sets gameState.phase to 'setup' via context if needed
  return (
    <div>
      <h2>Welcome!</h2>
      <p>Enter player names to begin.</p>
      <PlayerSetupScreen />
    </div>
  );
}

export default StartScreen;
