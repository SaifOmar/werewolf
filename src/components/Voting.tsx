import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { Player } from '../game/player';

const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg};
`;

const PlayerButton = styled(Button) <{ selected: boolean }>`
    width: 100%;
    margin: ${theme.spacing.xs} 0;
    background-color: ${props =>
    props.selected ? theme.colors.primary : theme.colors.surface};
`;

interface VotingProps {
  players: Player[];
  currentPlayer: Player;
  onVote: (target: Player) => void;
}

export const Voting: React.FC<VotingProps> = ({ players, currentPlayer, onVote }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleVote = () => {
    if (selectedPlayer) {
      onVote(selectedPlayer);
    }
  };

  return (
    <Container>
      <h2>{currentPlayer.name}'s Vote</h2>
      <Card>
        <h3>Select a player to vote for:</h3>
        {players
          .filter(p => p.id !== currentPlayer.id)
          .map(player => (
            <PlayerButton
              key={player.id}
              selected={selectedPlayer?.id === player.id}
              onClick={() => setSelectedPlayer(player)}
            >
              {player.name}
            </PlayerButton>
          ))}
        <Button
          variant="primary"
          disabled={!selectedPlayer}
          onClick={handleVote}
          style={{ marginTop: theme.spacing.md }}
        >
          Confirm Vote
        </Button>
      </Card>
    </Container>
  );
};
