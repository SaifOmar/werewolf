# Digital One Night Ultimate Werewolf

A digital implementation of the popular deduction party game "One Night Ultimate Werewolf" built with TypeScript and React.

## 🐺 About the Game

One Night Ultimate Werewolf is a fast-paced, hidden role game where players need to deduce who the werewolves are in just one night and one day phase. Unlike traditional Werewolf/Mafia games that eliminate players, everyone stays in until the very end, with roles that can change throughout the night.

### Features

- **Digital adaptation** of the popular tabletop game
- **Single-device play** for in-person game sessions
- **Complete role set** including Werewolf, Seer, Robber, Troublemaker, and more
- **Automated night phase** with guided role actions
- **Timer** for the discussion phase
- **Voting system** with automatic winner calculation

## 🎮 How to Play

### Game Setup

1. Enter player names (6-14 players supported)
2. Each player is secretly assigned a role
3. Three additional role cards are placed in the center

### Game Flow

1. **Role Reveal**: Each player views their initial role secretly
2. **Night Phase**: Players take turns performing their role's night action
3. **Action Results**: Players see the results of their night actions
4. **Discussion**: Players have 6 minutes to discuss and deduce roles
5. **Voting**: All players vote on who they think is a Werewolf
6. **Game Over**: Winners are determined based on voting results

### Winning Conditions

- **Villagers** win if at least one Werewolf is eliminated
- **Werewolves** win if no Werewolves are eliminated
- **Joker** wins if they are eliminated (regardless of other outcomes)

## 🎭 Roles

### Werewolf Team
- **Werewolf**: Wakes up with other Werewolves to identify teammates
- **Minion**: Sees who the Werewolves are without them knowing the Minion's identity

### Villager Team
- **Villager**: Has no special night action
- **Seer**: Can look at one player's card or two center cards
- **Robber**: Swaps cards with another player and sees their new role
- **Troublemaker**: Swaps two other players' cards without looking at them
- **Mason**: Wakes up to see who the other Masons are
- **Drunk**: Swaps their card with a center card without seeing it
- **Clone**: Sees and takes on the ability of another role

### Independent
- **Joker**: Wins if they are voted to be eliminated

## 💻 Technical Details

This game is built with:
- TypeScript for type safety
- React for the UI components
- CSS for styling



## 🔮 Future Enhancements

- Support for online multiplayer
- Additional roles from expansions
- Audio narration
- Custom role configurations
- Game history and statistics

