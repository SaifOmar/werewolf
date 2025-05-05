import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { Button } from './Button';
import { Card } from './Card';

const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: ${theme.spacing.lg};
`;

const Input = styled.input`
    width: 100%;
    padding: ${theme.spacing.sm};
    margin: ${theme.spacing.xs} 0;
    border: 1px solid ${theme.colors.primary};
    border-radius: ${theme.borderRadius.sm};
    background-color: ${theme.colors.background};
    color: ${theme.colors.onBackground};
`;

const PlayerList = styled.div`
    margin: ${theme.spacing.md} 0;
`;

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [error, setError] = useState<string>('');

  const addPlayer = () => {
    if (playerNames.length < 14) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    const newNames = playerNames.filter((_, i) => i !== index);
    setPlayerNames(newNames);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = () => {
    const filteredNames = playerNames.filter(name => name.trim() !== '');
    if (filteredNames.length < 6) {
      setError('At least 6 players are required');
      return;
    }
    if (filteredNames.length > 14) {
      setError('Maximum 14 players allowed');
      return;
    }
    if (new Set(filteredNames).size !== filteredNames.length) {
      setError('All player names must be unique');
      return;
    }
    setError('');
    onStartGame(filteredNames);
  };

  return (
    <Container>
      <h1>One Night Werewolf</h1>
      <Card>
        <h2>Enter Player Names</h2>
        <PlayerList>
          {playerNames.map((name, index) => (
            <div key={index} style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Input
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
              />
              {playerNames.length > 1 && (
                <Button variant="error" onClick={() => removePlayer(index)}>
                  X
                </Button>
              )}
            </div>
          ))}
        </PlayerList>
        {error && <div style={{ color: theme.colors.error }}>{error}</div>}
        <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
          <Button onClick={addPlayer} disabled={playerNames.length >= 14}>
            Add Player
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Start Game
          </Button>
        </div>
      </Card>
    </Container>
  );
};
