import { useState, useEffect } from 'react'; // Import useEffect
import styled from 'styled-components';
import { Button } from './Button';
import { Card } from './Card';
import { theme } from '../theme';
import { Player } from '../game/player';
import { Game } from '../game/game';

// ... (Styled Components remain the same) ...
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const ActionCard = styled(Card)`
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
`;

const PlayerButton = styled(Button)`
  margin: ${theme.spacing.sm};
  ${props => props.selected && `
    background-color: ${theme.colors.accent};
    color: ${theme.colors.white};
  `}
`;

const CenterCardButton = styled(Button)`
  width: 80px;
  height: 120px;
  margin: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${props => props.selected && `
    background-color: ${theme.colors.accent};
    color: ${theme.colors.white};
  `}
`;

const ActionMessage = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  text-align: center;
  color: ${theme.colors.text};
  font-weight: bold;
  min-height: 1.2em;
`;

const SelectionArea = styled.div`
  margin: ${theme.spacing.md} 0;
  h4 {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const InstructionText = styled.p`
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;


interface NightActionProps {
  currentPlayer: Player;
  game: Game;
  onActionComplete: (args: any[]) => void;
}

export const NightAction: React.FC<NightActionProps> = ({ currentPlayer, game, onActionComplete }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [roleRevealed, setRoleRevealed] = useState<boolean>(false);
  const [actionStarted, setActionStarted] = useState<boolean>(false);

  // --- EFFECT TO RESET STATE WHEN PLAYER CHANGES ---
  useEffect(() => {
    console.log(`NightAction: Resetting state for player ${currentPlayer.name}`);
    setRoleRevealed(false);
    setActionStarted(false);
    setSelectedPlayers([]);
    setSelectedCenter([]);
    setMessage('');
    setIsProcessing(false);
    // The effect runs whenever currentPlayer.id changes
  }, [currentPlayer.id]);
  // ------------------------------------------------

  const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id);

  // --- Selection Handlers (Unchanged) ---
  const handlePlayerSelection = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // For roles that need only one player
      if (["Robber", "Seer", "Clone"].includes(currentPlayer.OriginalRole.roleName)) {
        setSelectedPlayers([playerId]);
      }
      // For Troublemaker who needs two players
      else if (currentPlayer.OriginalRole.roleName === "Troublemaker") {
        if (!selectedPlayers.includes(playerId)) { // Prevent selecting the same player twice
          if (selectedPlayers.length < 2) {
            setSelectedPlayers([...selectedPlayers, playerId]);
          } else {
            // Replace the first selected player if we already have 2
            setSelectedPlayers([selectedPlayers[1], playerId]);
          }
        }
      }
    }
  };

  const handleCenterCardSelection = (cardIndex: number) => {
    if (selectedCenter.includes(cardIndex)) {
      setSelectedCenter(selectedCenter.filter(index => index !== cardIndex));
    } else {
      // For Seer who can look at 2 center cards
      if (currentPlayer.OriginalRole.roleName === "Seer") {
        if (selectedCenter.length < 2) {
          setSelectedCenter([...selectedCenter, cardIndex]);
        } else {
          // Replace the first selected card if we already have 2
          setSelectedCenter([selectedCenter[1], cardIndex]);
        }
      }
      // For Drunk who can swap with 1 center card
      else if (currentPlayer.OriginalRole.roleName === "Drunk") {
        setSelectedCenter([cardIndex]);
      }
    }
  };

  // --- Action Completion Handler (Unchanged) ---
  const handleActionComplete = () => {
    if (!canCompleteAction()) {
      setMessage('Please make the required selection(s) to continue.');
      return;
    }

    setIsProcessing(true);
    setMessage('Recording action...');

    let args: any[] = [];

    try {
      switch (currentPlayer.OriginalRole.roleName) {
        case 'Werewolf':
        case 'Minion':
        case 'Mason':
        case 'Joker':
          args = [];
          break;

        case 'Seer':
          if (selectedCenter.length === 2) {
            args = [true, selectedCenter.sort((a, b) => a - b)];
          } else if (selectedPlayers.length === 1) {
            const playerIndex = game.players.findIndex(p => p.id === selectedPlayers[0]);
            if (playerIndex === -1) throw new Error('Selected player not found in game state.');
            args = [false, playerIndex];
          } else {
            throw new Error('Seer requires specific selection.');
          }
          break;

        case 'Robber':
        case 'Clone':
          if (selectedPlayers.length !== 1) {
            throw new Error(`${currentPlayer.OriginalRole.roleName} must select 1 player.`);
          }
          const playerIndexRobberClone = game.players.findIndex(p => p.id === selectedPlayers[0]);
          if (playerIndexRobberClone === -1) throw new Error('Selected player not found in game state.');
          args = [playerIndexRobberClone];
          break;

        case 'Troublemaker':
          if (selectedPlayers.length !== 2) {
            throw new Error('Troublemaker must select 2 players.');
          }
          const player1Index = game.players.findIndex(p => p.id === selectedPlayers[0]);
          const player2Index = game.players.findIndex(p => p.id === selectedPlayers[1]);
          if (player1Index === -1 || player2Index === -1) throw new Error('Selected player(s) not found in game state.');
          args = [player1Index, player2Index];
          break;

        case 'Drunk':
          if (selectedCenter.length !== 1) {
            throw new Error('Drunk must select 1 center card.');
          }
          args = [selectedCenter[0]];
          break;

        default:
          args = [];
          break;
      }

      setMessage('Action recorded.');

      setTimeout(() => {
        onActionComplete(args);
        setIsProcessing(false); // Set back to false after notifying parent
      }, 1000);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  // --- Validation for enabling the final action button (Unchanged) ---
  const canCompleteAction = () => {
    if (!actionStarted) return false; // Button is not visible or has different logic if action hasn't started

    switch (currentPlayer.OriginalRole.roleName) {
      case 'Werewolf':
      case 'Minion':
      case 'Mason':
      case 'Joker':
        return true; // These roles just click 'Continue'
      case 'Seer':
        return selectedCenter.length === 2 || selectedPlayers.length === 1;
      case 'Robber':
      case 'Clone':
        return selectedPlayers.length === 1;
      case 'Troublemaker':
        return selectedPlayers.length === 2;
      case 'Drunk':
        return selectedCenter.length === 1;
      default:
        return true;
    }
  };

  // --- Renders the selection UI based on the role (Unchanged logic, maybe slightly adjusted text) ---
  const renderActionUI = () => {
    if (!actionStarted) return null;

    switch (currentPlayer.OriginalRole.roleName) {
      case 'Werewolf':
      case 'Minion':
      case 'Mason':
        return <InstructionText>View relevant roles (game logic will show this information). Press continue.</InstructionText>;

      case 'Seer':
        return (
          <>
            <InstructionText>Choose to look at either 2 center cards or another player's card.</InstructionText>
            {/* ... selection areas ... */}
            <SelectionArea>
              <h4>Look at center cards:</h4>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {[0, 1, 2].map(index => (
                  <CenterCardButton
                    key={index}
                    selected={selectedCenter.includes(index)}
                    onClick={() => handleCenterCardSelection(index)}
                    disabled={isProcessing || (selectedPlayers.length > 0 && !selectedCenter.includes(index))}
                  >
                    Card {index + 1}
                  </CenterCardButton>
                ))}
              </div>
            </SelectionArea>

            <SelectionArea>
              <h4>OR look at another player's card:</h4>
              <div>
                {otherPlayers.map(player => (
                  <PlayerButton
                    key={player.id}
                    selected={selectedPlayers.includes(player.id)}
                    onClick={() => handlePlayerSelection(player.id)}
                    disabled={isProcessing || (selectedCenter.length > 0 && !selectedPlayers.includes(player.id))}
                  >
                    {player.name}
                  </PlayerButton>
                ))}
              </div>
            </SelectionArea>
          </>
        );

      case 'Robber':
        return (
          <>
            <InstructionText>Select another player to swap roles with.</InstructionText>
            <SelectionArea>
              {otherPlayers.map(player => (
                <PlayerButton
                  key={player.id}
                  selected={selectedPlayers.includes(player.id)}
                  onClick={() => handlePlayerSelection(player.id)}
                  disabled={isProcessing}
                >
                  {player.name}
                </PlayerButton>
              ))}
            </SelectionArea>
          </>
        );

      case 'Troublemaker':
        return (
          <>
            <InstructionText>Select two players to swap roles between them.</InstructionText>
            <SelectionArea>
              {otherPlayers.map(player => (
                <PlayerButton
                  key={player.id}
                  selected={selectedPlayers.includes(player.id)}
                  onClick={() => handlePlayerSelection(player.id)}
                  disabled={isProcessing}
                >
                  {player.name}
                </PlayerButton>
              ))}
            </SelectionArea>
          </>
        );

      case 'Drunk':
        return (
          <>
            <InstructionText>Select a center card to swap with.</InstructionText>
            <SelectionArea>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {[0, 1, 2].map(index => (
                  <CenterCardButton
                    key={index}
                    selected={selectedCenter.includes(index)}
                    onClick={() => handleCenterCardSelection(index)}
                    disabled={isProcessing}
                  >
                    Card {index + 1}
                  </CenterCardButton>
                ))}
              </div>
            </SelectionArea>
          </>
        );

      case 'Clone':
        return (
          <>
            <InstructionText>Select another player to copy their role.</InstructionText>
            <SelectionArea>
              {otherPlayers.map(player => (
                <PlayerButton
                  key={player.id}
                  selected={selectedPlayers.includes(player.id)}
                  onClick={() => handlePlayerSelection(player.id)}
                  disabled={isProcessing}
                >
                  {player.name}
                </PlayerButton>
              ))}
            </SelectionArea>
          </>
        );

      case 'Joker':
        return <InstructionText>You are the Joker. You don't have a night action. Press continue.</InstructionText>;

      default:
        return <InstructionText>No special night action for your role. Press continue.</InstructionText>;
    }
  };

  // --- Determine the text for the final action button (Unchanged) ---
  const getActionButtonText = () => {
    if (!actionStarted) return 'Perform Action';
    switch (currentPlayer.OriginalRole.roleName) {
      case 'Werewolf':
      case 'Minion':
      case 'Mason':
      case 'Joker':
        return 'Continue';
      case 'Robber':
        return 'Swap Roles';
      case 'Troublemaker':
        return 'Swap Their Roles';
      case 'Drunk':
        return 'Swap with Center';
      case 'Clone':
        return 'Clone Role';
      case 'Seer':
        return 'Confirm Selection';
      default:
        return 'Complete Action';
    }
  }


  return (
    <Container>
      <h2>Night Action</h2>
      <ActionCard>
        {/* Initial state: Only player name and Reveal button */}
        {!roleRevealed && (
          <>
            <h3>{currentPlayer.name}, it's your turn.</h3>
            <InstructionText>Pass the phone to {currentPlayer.name} and have them tap below.</InstructionText>
            <Button onClick={() => setRoleRevealed(true)} disabled={isProcessing}>
              Reveal My Role
            </Button>
          </>
        )}

        {/* State: Role is revealed, show role and button to start action */}
        {roleRevealed && !actionStarted && (
          <>
            <h3>Your Role: {currentPlayer.OriginalRole.roleName}</h3>
            <Button onClick={() => setActionStarted(true)} disabled={isProcessing}>
              {getActionButtonText()}
            </Button>
          </>
        )}

        {/* State: Action has started, show interaction UI or continue button */}
        {roleRevealed && actionStarted && (
          <>
            <h3>Your Role: {currentPlayer.OriginalRole.roleName}</h3>
            {renderActionUI()}

            <Button
              onClick={handleActionComplete}
              disabled={isProcessing || !canCompleteAction()}
            >
              {getActionButtonText()}
            </Button>
          </>
        )}

        <ActionMessage>{message}</ActionMessage>

      </ActionCard>
    </Container>
  );
};
