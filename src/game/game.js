// for sure js doesn't have fkin interfaces

import { PlayerFactory } from "./player.js";
import { RoleFactory } from "./role.js";

export class Game {
	phases = [
		"initial",
		"role_reveal",
		"night",
		"day_discussion",
		"voting",
		"results",
		"finished",
	];
	players = [];
	groundCards = [];
	playersVoted = [];
	phase = 0;
	winners = "";
	playerNames = [];
	playerFactory;
	roleFactory;
	numberOfPlayers;
	constructor() {
		this.playerFactory = new PlayerFactory();
		this.roleFactory = new RoleFactory();
	}
	// this resets game stats (if playing mulitble games) creates players, assigns roles and starts night pahse
	Init(numberOfPlayers = 6) {
		this.players = [];
		this.groundCards = [];
		this.playersVoted = [];
		this.phase = 0;
		this.winners = "";
		this.numberOfPlayers = numberOfPlayers;
		this.players = this.playerFactory.GeneratePlayers(
			this.numberOfPlayers,
			this.playerNames,
		);
		this.CreatePlayerRoles();
		this.phase = "role_reveal";
	}
	GetCurrentPhase() {
		return this.phases[this.phase];
	}
	AdvacdPhase() {
		this.phase += 1;
	}
	SetPlayerNames(playerNames) {
		this.playerNames = playerNames;
	}
	CreatePlayerRoles() {
		this.roleFactory.CreateRoles(this.numberOfPlayers);
		this.RandomlyAssignRoleCards();
	}
	// starts voting phase
	StartVoting() {
		// if (this.phase !== "vote") {
		//       throw new Error(`Trying to vote in ${this.phase} phase`);
		// }
	}
	// dont need if we need this now
	Vote(voter, voted) {}

	// starts day // need to know the day will go
	StartGame() {
		// if (this.phase !== "day") {
		//       throw new Error(
		//             `Phase should be day instead have ${this.phase}`,
		//       );
		// }
	}
	FinishGame(winners) {
		this.winners = winners;

		for (const p of this.players) {
			p.isRevealed = true;
		}
		if (this.phase === "finished") {
			for (const p of this.players) {
				p.isRevealed = true;
			}
		} else {
			throw new Error(
				`Phase should be finished instead have ${this.phase}`,
			);
		}
	}
	// assigns both player cards and ground cards
	RandomlyAssignRoleCards() {
		this.groundCards = [];

		const allRoles = this.roleFactory.createdRoles || [];
		console.log(allRoles.length, this.players.length);
		if (allRoles.length < this.players.length) {
			throw new Error("Not enough roles for all players");
		}

		this.roleFactory.Shuffle();
		const map = new Map();
		for (let idx = 0; idx < this.players.length; idx++) {
			const player = this.players[idx];
			const role = allRoles[idx];
			player.SetRole(role);
			map.set(role, true);
		}

		for (let idx = 0; idx < allRoles.length; idx++) {
			const role = allRoles[idx];
			if (!map.has(role)) {
				this.groundCards.push(role);
			}
		}
	}
	getGroundRoleCard(index) {
		if (index < 0 || index >= this.groundCards.length) {
			throw new Error(
				`Invalid ground card index: ${index}. Available range: 0-${this.groundCards.length - 1}`,
			);
		}

		return this.groundCards[index];
	}
	findPlayer(playerId) {
		const player = this.players.find(
			(player) => player.id === playerId,
		);

		if (player) {
			return player;
		}

		throw new Error(`Player with ID ${playerId} not found`);

		// return null;
	}

	// this will be used to automatically change the phase

	Debug() {
		console.log("=== GAME DEBUG START ===");
		console.log(`Players: ${this.players.length}`);

		for (let p of this.players) {
			console.log(
				`\nPlayer: ${p.name} (Role: ${p.GetRole().roleName})`,
			);

			const args = this.createDebugArgs(p);

			try {
				const results = p
					.GetRole()
					.effect.doEffect(p, this, args);
				console.log(
					`Effect results: ${JSON.stringify(results, null, 2)}`,
				);
			} catch (error) {
				console.error(
					`Error executing effect for ${p.name}: ${error.message}`,
				);
			}
		}

		console.log("\n=== GROUND CARDS ===");
		for (let i = 0; i < this.groundCards.length; i++) {
			console.log(
				`Card ${i}: ${this.groundCards[i].roleName}, there are this many cards on the ground ${this.groundCards.length} , and there are ${this.players.length} players, and these are all the roles ${this.roleFactory.createdRoles.length}`,
			);

			// console.log(`Card hi ${i}: ${this.roleFactory.createdRoles}`);
		}

		console.log("\n=== GAME DEBUG END ===");
	}

	// Helper method to create appropriate test args for each role
	createDebugArgs(player) {
		switch (player.GetRole().roleName) {
			case "Seer":
				const otherPlayers = this.players.filter(
					(p) => p !== player,
				);
				if (otherPlayers.length > 0) {
					return {
						chosenAction: "default",
						players: [otherPlayers[0].id],
					};
				}
				// If no other players, look at ground cards
				return {
					chosenAction: "secondary",
					groundCards: [
						0,
						this.groundCards.length > 1 ? 1 : 0,
					],
				};

			case "Robber":
				// For Robber, try to swap with another player
				const targetPlayer = this.players.find(
					(p) => p !== player,
				);
				return {
					chosenAction: "default",
					players: targetPlayer ? [targetPlayer.id] : [],
				};

			case "TroubleMaker":
				// For Troublemaker, find two other players to swap
				const availablePlayers = this.players.filter(
					(p) => p !== player,
				);
				return {
					chosenAction: "default",
					players:
						availablePlayers.length >= 2
							? [
									availablePlayers[0].id,
									availablePlayers[1].id,
								]
							: [],
				};

			case "Drunk":
				// For Drunk, swap with a random ground card
				return {
					chosenAction: "default",
					groundCards: [
						Math.floor(
							Math.random() *
								this.groundCards.length,
						),
					],
				};

			default:
				// For other roles, use default action
				return {
					chosenAction: "default",
					players: [],
					groundCards: [],
				};
		}
	}
}
