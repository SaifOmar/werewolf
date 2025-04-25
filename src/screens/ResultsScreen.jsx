import React from 'react';
import { useGame } from '../context/useGame';
import LoadingScreen from './LoadingScreen';

function ResultsScreen() {
  const { gameState, resetGame } = useGame();

  if (gameState.winners === null) {
    return <LoadingScreen message="Calculating results..." />;
  }

  return (
    <div>
      <h2>Game Over!</h2>
      <h3>Winning Team: {gameState.winners}</h3>

      <div className="results-section">
        <h4>Player Roles:</h4>
        <ul>
          {gameState.players.map(player => (
            <li key={player.id}>
              <strong>{player.name}</strong>
              <br />
              Started as: {player.GetOriginalRole()?.roleName || 'N/A'} ({player.GetOriginalRole()?.team?.name || 'N/A'})
              <br />
              Ended as: {player.GetRole()?.roleName || 'N/A'} ({player.GetRole()?.team?.name || 'N/A'})
              {/* Optionally show who voted for whom */}
              {/* Voted for: {gameState.players.find(p => p.id === gameState.playerVotes[player.id])?.name || 'N/A'} */}
            </li>
          ))}
        </ul>
      </div>

      <div className="results-section">
        <h4>Ground Cards:</h4>
        <ul>
          {gameState.groundCards.map((card, index) => (
            <li key={index}>
              Center Card {index + 1}: {card.roleName} ({card.team.name})
            </li>
          ))}
        </ul>
      </div>


      <button onClick={resetGame} style={{ marginTop: '20px' }}>
        Play Again?
      </button>
    </div>
  );
}

export default ResultsScreen;
