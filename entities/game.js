// for sure js doesn't have fkin interfaces

import { PlayerFactory } from "./player.js";
import { RoleFactory } from "./role.js";

// why can I do this ?
const phases = {
	1: "nigth",
	2: "day",
	3: "voting",
	4: "finished",
	next(phase) {
		if (phase > 3) {
			return phases[4];
		}
		return phases[phase + 1];
	},
};

export class Game {
	players = [];
	groundCards = [];
	playersVoted = [];
	phase = phases[1];
	winners = "";
	playerNames = [];
	playerFactory;
	roleFactory;
	constructor() {
		this.playerFactory = new PlayerFactory();
		this.roleFactory = new RoleFactory();
	}
	Init(numberOfplayers = 6) {
		this.SetNumberOfPlayers(numberOfplayers);
		this.players = this.playerFactory.GeneratePlayers(
			this.numberOfPlayers,
			this.playerNames,
		);
		this.CreatePlayerRoles();
	}
	SetNumberOfPlayers(numberOfPlayers) {
		this.numberOfPlayers = numberOfPlayers;
	}

	SetPlayerNames(playerNames) {
		this.playerNames = playerNames;
		console.log(this.playerNames);
	}

	CreatePlayerRoles() {
		this.roleFactory.CreateRoles(this.numberOfPlayers);
		this.RandomlyAssignRoleCards();
	}
	StartVoting() {
		//
	}
	Vote(voter, voted) {}

	StartGame() {
		this.phase = phases[1];
	}

	FinishGame(winners) {
		// do other related game finishing logic
		this.winners = winners;
	}
	RandomlyAssignRoleCards() {
		this.groundCards = [];

		const allRoles = this.roleFactory.createdRoles || [];
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
}
