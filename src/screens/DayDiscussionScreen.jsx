import React, { useEffect } from 'react';
import { useGame } from '../context/useGame';
import TimerDisplay from '../components/TimerDisplay';

function DayDiscussionScreen() {
  const { gameState, startDayTimer } = useGame();

  // Start the timer when the component mounts if it's not already running
  useEffect(() => {
    startDayTimer();
    // Cleanup function will be handled by the context's useEffect
  }, [startDayTimer]);


  return (
    <div>
      <h2>Day Phase - Discussion Time!</h2>
      <p>Everyone wakes up! Discuss who you think the werewolves are.</p>
      <p>You have 10 minutes before the vote.</p>

      <TimerDisplay seconds={gameState.timerValue} />

      <h3>Players:</h3>
      <ul>
        {gameState.players.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      {/* Add display of ground cards if needed for rules */}
    </div>
  );
}

export default DayDiscussionScreen;
