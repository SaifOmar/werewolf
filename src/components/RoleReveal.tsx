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
    text-align: center;
`;

const RoleCard = styled(Card)`
    text-align: center;
    margin: ${theme.spacing.xl} auto;
    max-width: 400px;
`;

interface RoleRevealProps {
  currentPlayer: Player;
  onNext: () => void;
}

export const RoleReveal: React.FC<RoleRevealProps> = ({ currentPlayer, onNext }) => {
  const [showRole, setShowRole] = useState(false);

  const handleNext = () => {
    setShowRole(false);
    onNext();
  };

  return (
    <Container>
      <h2>{currentPlayer.name}'s Turn</h2>
      <RoleCard>
        {!showRole ? (
          <>
            <p>Pass the device to {currentPlayer.name}</p>
            <Button onClick={() => setShowRole(true)}>
              Show My Role
            </Button>
          </>
        ) : (
          <>
            <h3>Your Role</h3>
            <p>{currentPlayer.OriginalRole.roleName}</p>
            <p>Team: {currentPlayer.OriginalRole.team}</p>
            <Button onClick={handleNext}>
              Done
            </Button>
          </>
        )}
      </RoleCard>
    </Container>
  );
};
