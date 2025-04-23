export class Effect {
	effectName;
	action;

	constructor(effectName, action) {
		this.effectName = effectName;
		this.action = action;
	}

	// Maps role names to their effect implementations
	actionStringToFunction(player, game, args) {
		// Using the player's role name to determine the action
		switch (player.GetRole().roleName) {
			case "Werewolf":
				// Werewolves can see other werewolves
				const otherWerewolves = game.players.filter(
					(p) =>
						p.GetRole().roleName === "Werewolf" &&
						p.id !== player.id,
				);
				return otherWerewolves;

			case "Mason":
				// Masons can see other masons
				const otherMasons = game.players.filter(
					(p) =>
						p.GetRole().roleName === "Mason" &&
						p.id !== player.id,
				);
				return otherMasons;

			case "Seer":
				if (args.chosenAction === "default") {
					// Look at one player's card
					const player2 = game.findPlayer(args.players[0]);
					return [player2.GetRole()];
				} else if (args.chosenAction === "secondary") {
					// Look at two cards in the center
					const g1 = game.getGroundRoleCard(
						args.groundCards[0],
					);
					const g2 = game.getGroundRoleCard(
						args.groundCards[1],
					);
					return [g1, g2];
				}
				return [];

			case "Robber":
				if (args.chosenAction === "default") {
					// Swap with another player and see new role
					const player2 = game.findPlayer(args.players[0]);
					const swap = player2.ChangeRole(player.GetRole());
					player.ChangeRole(swap);
					return [player2, player];
				}
				return [];

			case "TroubleMaker":
				if (args.chosenAction === "default") {
					// Swap two other players' roles
					const player1 = game.findPlayer(args.players[0]);
					const player2 = game.findPlayer(args.players[1]);
					const swap = player2.ChangeRole(
						player1.GetRole(),
					);
					player1.ChangeRole(swap);
					return [player2, player1];
				}
				return [];

			case "Drunk":
				if (args.chosenAction === "default") {
					// Swap with a card from the center (but don't see it)
					const card = game.getGroundRoleCard(
						args.groundCards[0],
					);
					player.ChangeRole(card);
					return [player];
				}
				return [];

			case "Minion":
				// Minions can see who the werewolves are
				const werewolves = game.players.filter(
					(p) => p.GetRole().roleName === "Werewolf",
				);
				return werewolves;

			case "Insomniac":
				// Sees own role after all night actions
				return [player.GetRole()];

			case "Doppelganger":
				if (args.chosenAction === "default") {
					// Copies another player's role and performs their night action
					const player2 = game.findPlayer(args.players[0]);
					const originalRole = player.GetRole();
					player.ChangeRole(player2.GetRole());
					// Recursive call to perform the copied role's action
					const result = this.actionStringToFunction(
						player,
						game,
						args.nextAction || {},
					);
					player.ChangeRole(originalRole); // Reset back for game records
					return result;
				}
				return [];

			default:
				// For roles without night actions or unimplemented roles
				return [];
		}
	}

	// Execute the effect with proper argument handling
	doEffect(player, game, args = {}) {
		// console.log(args, "debug args");
		// Check if the action matches this effect
		if (this.action !== player.GetRole().effect.action) {
			return {
				success: false,
				message: "Role mismatch",
				results: [],
			};
		}

		try {
			const results = this.actionStringToFunction(
				player,
				game,
				args,
			);

			return {
				success: true,
				message: `${player.GetRole().roleName} performed ${this.effectName}`,
				results,
			};
		} catch (error) {
			console.error(
				`Error executing ${this.effectName} for ${player.roleName}:`,
				error,
			);
			return {
				success: false,
				message: `Failed to execute ${this.effectName}`,
				error: error.message,
			};
		}
	}
}
