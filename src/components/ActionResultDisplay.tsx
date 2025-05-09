// src/components/ActionResultDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Card } from './Card';
import { theme } from '../theme';
import { Player } from '../game/player';
import { Game } from '../game/game';
import { IRole } from '../game/roles'; // Assuming IRole is exported from roles.ts

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const ResultCard = styled(Card)`
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
`;

const ResultMessage = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  text-align: center;
  color: ${theme.colors.text};
  min-height: 1.2em;
`;

const RoleDisplay = styled.div`
    font-weight: bold;
    color: ${theme.colors.accent}; // Example color for role name
    margin: ${theme.spacing.sm} 0;
`;

interface ActionResultDisplayProps {
  currentPlayer: Player;
  game: Game; // Need access to game state for Werewolf/Mason/Center info lookup
  onComplete: () => void; // Callback when the player clicks continue
}

export const ActionResultDisplay: React.FC<ActionResultDisplayProps> = ({ currentPlayer, game, onComplete }) => {

  // Helper to render a role, handling undefined or null
  const renderRole = (role: IRole | undefined | null) => {
    if (!role) {
      return "Unknown Role"; // Should not happen if logic is correct
    }
    // You might want more details like team color here
    return role.roleName;
  }

  const renderResultContent = () => {
    const resultData = game.nightResults.get(currentPlayer.id); // Get the specific result data for this player

    switch (currentPlayer.OriginalRole.roleName) {
      // Werewolves see other werewolves
      case 'Werewolf':
        {
          const otherWerewolves = game.players.filter(p =>
            p.id !== currentPlayer.id && p.OriginalRole.roleName === "Werewolf"
          );
          if (otherWerewolves.length === 0) {
            return <p>You are the only Werewolf. No one else woke up with you.</p>;
          } else {
            return (
              <>
                <p>The other Werewolves are:</p>
                {<ul>{otherWerewolves.map(p => <li key={p.id}>{p.name}</li>)}</ul>}
              </>
            );
          }
        }

      // Minion sees werewolves
      case 'Minion':
        {
          const allWerewolves = game.players.filter(p => p.OriginalRole.roleName === "Werewolf");

          if (allWerewolves.length === 0) {
            return <p>There are no Werewolves in play.</p>;
          } else {
            return (
              <>
                <p>The Werewolves are:</p>
                {<ul>{allWerewolves.map(p => <li key={p.id}>{p.name}</li>)}</ul>}
              </>
            );
          }
        }


      // Masons see other masons
      case 'Mason':
        {
          const otherMasons = game.players.filter(p =>
            p.id !== currentPlayer.id && p.OriginalRole.roleName === "Mason" // Masons only see other *original* masons
          );

          if (otherMasons.length === 0) {
            return <p>You are the only Mason.</p>;
          } else {
            return (
              <>
                <p>The other Masons are:</p>
                <ul>{otherMasons.map(p => <li key={p.id}>{p.name}</li>)}</ul>
              </>
            );
          }
        }


      case 'Seer':
        if (resultData?.type === 'player') {
          return (
            <>
              <p>You looked at {resultData.targetName}'s card.</p>
              <p>Their role is: <RoleDisplay>{renderRole(resultData.role)}</RoleDisplay></p>
            </>
          );
        } else if (resultData?.type === 'center') {
          return (
            <>
              <p>You looked at center cards {resultData.indices.map(i => i + 1).join(' and ')}.</p>
              <p>Their roles are:
                {resultData.roles.map((role, index) => (
                  <RoleDisplay key={index}>{renderRole(role)}</RoleDisplay>
                ))}
              </p>
            </>
          );
        } else {
          return <p>You looked, but no specific result data was recorded.</p>; // Should not happen if game.ts is correct
        }


      case 'Robber':
        // Robber sees their new role (stored in nightResults)
        if (resultData?.type === 'robber') {
          return (
            <>
              <p>You swapped roles with {resultData.targetName}.</p>
              <p>Your new role is: <RoleDisplay>{renderRole(resultData.newRole)}</RoleDisplay></p>
            </>
          );
        } else {
          return <p>You swapped roles. Your new role was not recorded here.</p>; // Should not happen
        }


      case 'Troublemaker':
        // Troublemaker just knows they swapped two players. They don't see the roles. (stored in nightResults)
        if (resultData?.type === 'troublemaker') {
          return <p>You swapped roles between {resultData.targetName1} and {resultData.targetName2}.</p>;
        } else {
          return <p>You performed your action.</p>; // Should not happen
        }


      case 'Drunk':
        // Drunk knows they swapped with a center card. They don't know the role yet. (stored in nightResults)
        if (resultData?.type === 'drunk') {
          return <p>You swapped your role with center card {resultData.centerIndex + 1}.</p>;
        } else {
          return <p>You performed your action.</p>; // Should not happen
        }


      case 'Clone':
        // Clone sees the role they copied (stored in nightResults)
        if (resultData?.type === 'clone') {
          return (
            <>
              <p>You cloned {resultData.targetName}'s role.</p>
              <p>Your role is now: <RoleDisplay>{renderRole(resultData.clonedRole)}</RoleDisplay></p>
            </>
          );
        } else {
          return <p>You cloned a role. Your new role was not recorded here.</p>; // Should not happen
        }

      case 'Joker':
        return <p>You are the Joker. You had no night action.</p>;
      // Add cases for other roles with no action/specific result display if needed (e.g., Tanner)
      default:
        return <p>No specific result to display for your role.</p>;
    }
  };


  return (
    <Container>
      <h2>Night Action Result</h2>
      <ResultCard>
        <h3>{currentPlayer.name}, here is the result of your night action:</h3>

        <ResultMessage>
          {renderResultContent()}
        </ResultMessage>

        <Button onClick={onComplete} disabled={false}> {/* No processing here */}
          Continue
        </Button>
      </ResultCard>
    </Container>
  );
};
