// game_example.ts
import { Game, GamePhase } from "./game";
import { Player } from "./player";

// Example of game usage
function runGameExample() {
  console.log("Starting One Night Ultimate Werewolf Game");

  // Create a new game with 5 players
  const game = new Game();

  // Set up the game with player names
  const playerNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Saif"];
  game.setup(playerNames);

  console.log("Game setup complete. Players:");
  game.players.forEach(player => {
    console.log(`${player.name}: ${player.OriginalRole.roleName} (Team: ${player.OriginalRole.team})`);
  });

  console.log("\nCenter Cards:");
  game.centerCards.forEach((role, index) => {
    console.log(`Card ${index + 1}: ${role.roleName}`);
  });

  // Start night phase
  console.log("\nStarting Night Phase");
  game.startNight();

  // Simulate night actions for each player
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    console.log(`${player.name}'s turn (${player.OriginalRole.roleName})`);

    // Example action args for different roles
    let actionArgs: any[] = [];

    switch (player.OriginalRole.roleName) {
      case "Werewolf":
      case "Minion":
      case "Mason":
      case "Joker":
        // These roles don't need additional args
        actionArgs = [];
        break;

      case "Seer":
        // Look at another player's card
        actionArgs = [false, (i + 1) % game.players.length];
        break;

      case "Robber":
        // Rob another player
        actionArgs = [(i + 1) % game.players.length];
        break;

      case "Troublemaker":
        // Swap two other players
        actionArgs = [(i + 1) % game.players.length, (i + 2) % game.players.length];
        break;

      case "Drunk":
        // Swap with center card
        actionArgs = [Math.floor(Math.random() * game.centerCards.length)];
        break;

      case "Clone":
        // Clone another player
        actionArgs = [(i + 1) % game.players.length];
        break;
    }

    // Perform the night action
    const actionResult = player.OriginalRole.doAction(player, game, actionArgs);

    // Log relevant information based on role
    if (player.OriginalRole.roleName === "Werewolf" || player.OriginalRole.roleName === "Minion") {
      console.log(`  Saw werewolves: ${(actionResult as Player[]).map(p => p.name).join(", ") || "None"}`);
    } else if (player.OriginalRole.roleName === "Mason") {
      console.log(`  Saw other masons: ${(actionResult as Player[]).map(p => p.name).join(", ") || "None"}`);
    } else if (player.OriginalRole.roleName === "Seer" && actionArgs[0] === false) {
      console.log(`  Saw ${game.players[actionArgs[1]].name}'s role: ${(actionResult as any)?.roleName || "Unknown"}`);
    } else if (player.OriginalRole.roleName === "Robber") {
      console.log(`  Stole role from ${game.players[actionArgs[0]].name}, new role: ${player.CurrentRole.roleName}`);
    }

    // Move to next player
    game.currentPlayerIndex++;

    // Check if night phase is complete
    if (game.currentPlayerIndex >= game.players.length) {
      game.phase = GamePhase.Discussion;
    }
  }

  // Log night actions
  console.log("\nNight action log:");
  game.nightActionLog.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });

  // Start discussion phase
  console.log("\nStarting Discussion Phase");
  game.startDiscussion();
  console.log("Players discuss for 5 minutes...");

  // Start voting phase
  console.log("\nStarting Voting Phase");
  game.startVoting();

  // Simulate voting
  for (const player of game.players) {
    // Each player votes for a random other player
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * game.players.length);
    } while (game.players[targetIndex] === player);

    player.vote(game.players[targetIndex]);
    console.log(`${player.name} voted for ${game.players[targetIndex].name}`);
  }

  // Tally votes
  const eliminated = game.countVotes();
  console.log("\nVoting Results:");
  if (eliminated.length === 0) {
    console.log("No one was eliminated.");
  } else {
    console.log(`Eliminated players: ${eliminated.map(p => p.name).join(", ")}`);
  }

  // Determine winners
  const winningTeam = game.determineWinners();
  console.log(`\nWinning team: ${winningTeam}`);

  // Final state
  console.log("\nFinal Roles:");
  game.players.forEach(player => {
    console.log(`${player.name}: Started as ${player.OriginalRole.roleName}, ended as ${player.CurrentRole.roleName} (${player.isAlive ? "Alive" : "Dead"})`);
  });

  console.log("\nFinal Center Cards:");
  game.centerCards.forEach((centerCard, i) => {
    console.log(`${i}: ${centerCard.roleName}`);
  });
}

// Run the example
runGameExample();
