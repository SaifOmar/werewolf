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
	// playersVoted = [];
	phase = 0;
	winners = "";
	playerNames = [];
	timerStatus = null;
	playerFactory;
	roleFactory;
	numberOfPlayers = 6;
	currentPlayerTurnIndex = 0;
	TIMER = 10;
	currentNightRoleIndex = -1;
	actionResult = null;
	constructor() {
		this.playerFactory = new PlayerFactory();
		this.roleFactory = new RoleFactory();
	}
	// this resets game stats (if playing mulitble games) creates players, assigns roles and starts role_reveal pahse
	Init() {
		this.players = [];
		this.groundCards = [];
		this.playerVotes = new Map();
		this.phase = 0;
		this.winners = "";
		this.currentPlayerTurnIndex = null;
		this.currentNightRoleIndex = -1;
		this.actionResult = null;
		this.players = this.playerFactory.GeneratePlayers(
			this.numberOfPlayers,
			this.playerNames,
		);
		this.CreatePlayerRoles();
		this.initVotesMap();
		return this.StartRoleRevealPhase();
	}
	// set the phase to role_reveal and return the first player role data
	StartRoleRevealPhase() {
		this.AdvancePhase();
		return this.GetPlayerNextRoleData();
	}
	StartNightPhase() {
		this.AdvancePhase();
		this.SortPlayersWithNightActions();
		this.PerformNextNightAction();
	}
	PerformNextNightAction(args = null) {
		if (this.currentNightRoleIndex > this.players.length) {
			return this.StartDayPhase();
		}
		const p = this.players[this.currentNightRoleIndex];
		this.currentNightRoleIndex++;
		return p.GetOriginalRole().effect.doEffect(p, this, args);
	}
	StartDayPhase() {
		this.AdvancePhase();
		this.StartTimer();
	}

	StartTimer(timerValue = 10) {
		this.TIMER = timerValue;
		this.timerStatus = "Started";
		this.timerId = setInterval(() => {
			this.TIMER--;
			if (this.TIMER <= 0) {
				clearInterval(this.timerId);
				this.timerStatus = "Stopped";
				this.StartVotePhase();
			}
		}, 1000);
	}
	EndDayPhase() {
		clearInterval(this.timerId);
		this.timerStatus = "Stopped";
	}
	initVotesMap() {
		for (const p of this.players) {
			this.playerVotes.set(p.id, 0);
		}
		console.log(this.playerVotes);
	}
	// need a way to go over all players to take their votes and apply them
	StartVotePhase() {
		this.AdvancePhase();
		return this.playerVotes;
	}
	DetermineWinners() {
		let maxVotes = 0;
		let votedPlayerId = null;
		for (const [id, votes] of this.playerVotes) {
			if (votes > maxVotes) {
				maxVotes = votes;
				votedPlayerId = id;
			}
		}
		console.log("Werewolves alive:", werewolvesAlive);
		console.log("Villagers alive:", villagersAlive);
		
		const votedPlayer = this.findPlayer(votedPlayerId);
		if (votedPlayer.GetRole().team === "Villians") {
			return "Villagers";
		}
		return "Werewolves";


	}
	CastVotes(votedId) {
		let currentVotes = this.playerVotes.get(votedId) || 0;
		this.playerVotes.set(votedId, currentVotes + 1);
	}
	ShowResults() {
		this.AdvancePhase();
	}
	SortPlayersWithNightActions() {
		/// loop over all players with the role in order
		// if the player is the same role as the role put him into the array
		// at the end set the players array to be the new array

		const roles = [
			"Werewolf",
			"Minion",
			"Masion",
			"Seer",
			"Robber",
			"TroubleMaker",
			"Drunk",
		];

		let tempArr = [];

		for (const role of roles) {
			const players = this.players.filter(
				(p) => p.GetRole().roleName == role,
			);
			tempArr.push(...players);
		}

		this.players = tempArr;
	}
	GetPlayerNextRoleData() {
		if (this.currentPlayerTurnIndex == null) {
			this.currentPlayerTurnIndex = 0;
			return this.players[this.currentPlayerTurnIndex];
		}
		if (this.currentPlayerTurnIndex == this.players.length - 1) {
			return this.StartNightPhase();
		}
		this.currentPlayerTurnIndex++;
		return this.players[this.currentPlayerTurnIndex];
	}

	// takes an array or player names
	AddMorePlayers(morePlayersArray) {
		try {
			for (const p of morePlayersArray) {
				this.numberOfPlayers++;
				let player = this.playerFactory.AddPlayer(p);
				this.playerNames.push(p);
				console.log(
					`a player was added ${player.name}, this is the current number of players ${this.numberOfPlayers}`,
				);
			}
		} catch (error) {
			throw new Error(`Couldn't add player\\s, ${error}`);
		}
	}
	GetCurrentPhase() {
		return this.phases[this.phase];
	}
	AdvancePhase() {
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
	// StartVoting() {
	// 	// if (this.phase !== "vote") {
	// 	//       throw new Error(`Trying to vote in ${this.phase} phase`);
	// 	// }
	// }

	// it takes the voted player id and adds one vote to his name, to be later checked which player has the most votes to determine which team wins

	// starts day // need to know the day will go

	//
	FinishGame() {
		this.AdvancePhase();
		for (const p of this.players) {
			p.isRevealed = true;
		}
		this.winners = this.DetermineWinners();
		console.log("Game winners determined:", this.winners); // Add this debug line
		return this.winners;
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

	setGroundCard(index, role) {
        this.groundCards[index] = role;
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
		for(const p of this.players){
			console.log(`this is player: ${p.name}, his original role is ${p.GetOriginalRole().roleName} and his new role is ${p.GetRole().roleName}`)
		}
		
		console.log("\n=== GROUND CARDS ===");
		for (let i = 0; i < this.groundCards.length; i++) {
			console.log(
				`Card ${i}: ${this.groundCards[i].roleName}, there are this many cards on the ground ${this.groundCards.length} , and there are ${this.players.length} players, and these are all the roles ${this.roleFactory.createdRoles.length}`,
			);
			console.log(`ground cards: ${this.groundCards.length} and ${this.roleFactory.createdRoles.length}`)
			console.log(this.roleFactory.NumberOfRoles);
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
