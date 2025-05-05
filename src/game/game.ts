import { Player } from "./player";
import { IRole, RoleFactory } from "./roles"; // Assuming roles.ts has an IRole interface

export enum GamePhase {
	Setup,
	RoleReveal,
	Night,
	ActionResult, // Keep ActionResult phase
	Discussion,
	Voting,
	GameOver
}
export class Game {
	public static readonly MIN_PLAYERS = 6;
	public static readonly MAX_PLAYERS = 14;
	public static readonly DISCUSSION_TIME = 360; // 6 minutes in seconds
	public static readonly CENTER_CARDS = 3;

	public players: Player[];
	public centerCards: IRole[];
	public phase: GamePhase;
	public currentPlayerIndex: number; // Used for Role Reveal, Night, and ActionResult phases
	public nightActionLog: string[];
	public playerCount: number;
	public playerNames: string[];
	public pendingActions: { playerIndex: number; actionArgs: any[] }[];
	public discussionTimeRemaining: number;
	public timerActive: boolean;

	// Add a temporary place to store results visible only during ActionResult phase
	// Using a Map keyed by player ID seems robust
	public nightResults: Map<number, any>;


	constructor() {
		this.players = [];
		this.centerCards = [];
		this.phase = GamePhase.Setup;
		this.currentPlayerIndex = 0;
		this.nightActionLog = [];
		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = false;
		this.pendingActions = []; // Initialize pendingActions
		this.nightResults = new Map(); // Initialize nightResults
	}

	public validatePlayerCount(count: number): boolean {
		return count >= Game.MIN_PLAYERS && count <= Game.MAX_PLAYERS;
	}

	public setup(playerNames: string[]): void { // Changed return type to void as App.tsx manages phase
		if (!this.validatePlayerCount(playerNames.length)) {
			throw new Error(`Player count must be between ${Game.MIN_PLAYERS} and ${Game.MAX_PLAYERS}`);
		}

		this.playerNames = playerNames;
		this.players = [];
		this.centerCards = [];
		this.phase = GamePhase.Setup; // App.tsx will move to RoleReveal
		this.currentPlayerIndex = 0;
		this.nightActionLog = [];
		this.playerCount = playerNames.length;
		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = false;
		this.pendingActions = [];
		this.nightResults = new Map();


		const totalRolesNeeded = this.playerCount + Game.CENTER_CARDS;
		const allRoles: IRole[] = RoleFactory.CreateRoles(totalRolesNeeded); // Ensure RoleFactory exists and works
		this.shuffleArray(allRoles);
		this.assignRoles(allRoles);

		console.log("Game Setup Complete. Players:", this.players.map(p => p.name + ":" + p.OriginalRole.roleName), "Center:", this.centerCards.map(c => c.roleName));

		// App.tsx will call startRoleReveal after setup
	}


	public startDiscussion(): void {
		this.phase = GamePhase.Discussion;
		// Sort players back to their original order for discussion? Or keep night order?
		// The original App.tsx code sorted players for discussion. Let's keep that for now.
		// You'd need to store the original order index on the Player object if you sort the main players array.
		// Or, App.tsx can maintain the original list and pass it to Voting etc.
		// Let's assume the main `this.players` array should *not* be permanently sorted by night order.
		// So, we should reset the players array back to its original index order here if it was sorted for night.
		// ALTERNATIVE: Don't sort `this.players` in `startNight`. Let `executeNightActions` sort the `pendingActions` only. This is safer.
		// Let's update `startNight` to *not* sort `this.players`.
		// If players array wasn't sorted, no need to sort back.
		// Ensure App.tsx iterates through players using the original `game.players` order during NightAction and ActionResult.

		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = true;
		console.log("Discussion Phase Started.");
	}

	// public startDiscussion(): void {
	// 	this.phase = GamePhase.Discussion;
	// 	this.players.sort((a, b) => a.name.localeCompare(b.name));
	// 	this.discussionTimeRemaining = Game.DISCUSSION_TIME;
	// 	this.timerActive = true;
	// }

	public updateTimer(): boolean {
		if (this.timerActive && this.discussionTimeRemaining > 0) {
			this.discussionTimeRemaining--;
			return true;
		}
		if (this.discussionTimeRemaining <= 0) {
			this.timerActive = false;
			return false; // Timer finished
		}
		return true; // Timer still running
	}

	private assignRoles(allRoles: IRole[]): void {
		for (let i = 0; i < this.playerCount; i++) {
			// OriginalRole is the starting role, CurrentRole can change
			const player = new Player(this.playerNames[i], allRoles[i], i + 1);
			player.CurrentRole = allRoles[i]; // Initially CurrentRole is the same as OriginalRole
			this.players.push(player);
		}

		for (let i = this.playerCount; i < this.playerCount + 3; i++) {
			this.centerCards.push(allRoles[i]);
		}
	}

	public startRoleReveal(): void {
		this.phase = GamePhase.RoleReveal;
		this.currentPlayerIndex = 0;
		// App.tsx manages player index for this phase
	}
	public startNight(): void {
		this.phase = GamePhase.Night;
		this.currentPlayerIndex = 0; // Start with the first player for night actions
		this.nightActionLog = [];
		this.pendingActions = []; // Clear pending actions from previous games
		this.nightResults = new Map(); // Clear results

		// Sort players based on the standard night action order
		const nightOrder: string[] = [
			"Werewolf", "Minion", "Mason", "Seer", "Robber",
			"Troublemaker", "Drunk", "Clone", // Joker usually has no action/order
		];
		this.players.sort((a, b) => {
			const roleAIndex = nightOrder.indexOf(a.OriginalRole.roleName);
			const roleBIndex = nightOrder.indexOf(b.OriginalRole.roleName);
			return roleAIndex - roleBIndex;
		});
		console.log("Night Phase Started.");
	}

	public recordNightAction(playerIndex: number, actionArgs: any[]): void {
		const player = this.players[playerIndex];
		const actionLog = `${player.name} (${player.OriginalRole.roleName}) selected their night action input.`;
		this.nightActionLog.push(actionLog);
		console.log(actionLog, "Args:", actionArgs);


		// Store the action with the player's *original* index
		this.pendingActions.push({ playerIndex: player.id - 1, actionArgs }); // Use player ID - 1 for 0-based index
	}

	public stopTimer(): void {
		this.timerActive = false;
	}

	public performNightAction(player: Player, actionArgs: any[]): void {
		// Save the action for later execution
		const actionLog = `${player.name} (${player.OriginalRole.roleName}) selected their night action.`;
		this.nightActionLog.push(actionLog);

		// Save the action for execution after all players have selected
		if (!this.pendingActions) {
			this.pendingActions = [];
		}
		const playerIndex = player.id - 1;
		this.pendingActions.push({ playerIndex, actionArgs });

		this.currentPlayerIndex++;

		if (this.currentPlayerIndex >= this.players.length) {
			this.executeNightActions();
		}
	}

	public executeNightActions(): void {
		console.log("Executing Night Actions...");

		// Sort actions by role order for execution
		const nightOrder: string[] = [
			"Werewolf", "Minion", "Mason", "Seer", "Robber",
			"Troublemaker", "Drunk", "Clone", // Joker has no action
		];

		this.pendingActions.sort((a, b) => {
			const playerA = this.players[a.playerIndex];
			const playerB = this.players[b.playerIndex];
			const roleAIndex = nightOrder.indexOf(playerA.OriginalRole.roleName);
			const roleBIndex = nightOrder.indexOf(playerB.OriginalRole.roleName);
			// Handle roles not in the list (like Joker) - they go last
			const finalRoleAIndex = roleAIndex === -1 ? nightOrder.length : roleAIndex;
			const finalRoleBIndex = roleBIndex === -1 ? nightOrder.length : roleBIndex;
			return finalRoleAIndex - finalRoleBIndex;
		});

		this.nightResults = new Map(); // Clear previous results
		const executionLog: string[] = []; // Log the *results* of actions

		// Execute actions in sorted order
		for (const { playerIndex, actionArgs } of this.pendingActions) {
			const player = this.players[playerIndex];
			let resultData: any = null;

			// The doAction method should modify the game state (swap roles, etc.)
			// Some doAction methods might also return data about what happened (e.g., Seer)
			if (player.OriginalRole && typeof player.OriginalRole.doAction === 'function') {
				try {
					resultData = player.OriginalRole.doAction(player, this, actionArgs);
				} catch (e) {
					console.error(`Error executing action for ${player.name} (${player.OriginalRole.roleName}):`, e);
					executionLog.push(`${player.name}'s action failed: ${e.message}`);
				}
			} else {
				// This case should ideally not happen if roles are correctly implemented
				executionLog.push(`${player.name} (${player.OriginalRole.roleName}) had no executable action.`);
			}


			// Store results relevant for the player to see during ActionResult
			// The format of resultData depends on the doAction implementation for each role
			switch (player.OriginalRole.roleName) {
				case 'Seer':
					// Assuming doAction returns { type: 'player', role: {...} } or { type: 'center', roles: [...] }
					if (resultData) this.nightResults.set(player.id, resultData);
					executionLog.push(`${player.name} (Seer) looked.`);
					break;
				case 'Robber':
					// The swap already happened in doAction. Player's CurrentRole is now the new one.
					// actionArgs[0] was the target player index (0-based)
					const targetPlayerRobber = this.players[actionArgs[0]];
					this.nightResults.set(player.id, { type: 'robber', newRole: player.CurrentRole, targetName: targetPlayerRobber.name });
					executionLog.push(`${player.name} (Robber) swapped with ${targetPlayerRobber.name}.`);
					break;
				case 'Troublemaker':
					// actionArgs are [player1Index, player2Index] (0-based)
					const p1 = this.players[actionArgs[0]];
					const p2 = this.players[actionArgs[1]];
					this.nightResults.set(player.id, { type: 'troublemaker', targetName1: p1.name, targetName2: p2.name });
					executionLog.push(`${player.name} (Troublemaker) swapped ${p1.name} and ${p2.name}.`);
					break;
				case 'Drunk':
					// The swap already happened. Player's CurrentRole is now the center card.
					// actionArgs[0] was the center card index (0-based)
					this.nightResults.set(player.id, { type: 'drunk', centerIndex: actionArgs[0] });
					executionLog.push(`${player.name} (Drunk) swapped with center card ${actionArgs[0] + 1}.`);
					break;
				case 'Clone':
					// actionArgs[0] was the target player index (0-based)
					const clonedPlayer = this.players[actionArgs[0]];
					this.nightResults.set(player.id, { type: 'clone', clonedRole: player.CurrentRole, targetName: clonedPlayer.name });
					executionLog.push(`${player.name} (Clone) cloned ${clonedPlayer.name}.`);
					break;
				case 'Werewolf':
				case 'Minion':
				case 'Mason':
					// These roles just see info (handled by ActionResultDisplay lookup)
					executionLog.push(`${player.name} (${player.OriginalRole.roleName}) saw teammates/werewolves.`);
					break;
				default:
					// Joker, Tanner, etc. - no action performed
					executionLog.push(`${player.name} (${player.OriginalRole.roleName}) had no night action.`);
					break;
			}
		}

		this.nightActionLog = this.nightActionLog.concat(executionLog); // Add execution results to the log
		this.pendingActions = []; // Clear the queue
		this.phase = GamePhase.ActionResult; // Transition to the result phase
		console.log("Night Actions Executed. Transitioning to Action Result phase.");
		console.log("Final Player Roles (after actions):", this.players.map(p => p.name + ":" + p.CurrentRole.roleName));
		console.log("Final Center Roles:", this.centerCards.map(c => c.roleName));
	}

	public tallyVotes(): Player[] {
		// Count votes for each player
		const voteCounts = new Map<Player, number>();
		this.players.forEach(p => voteCounts.set(p, 0)); // Initialize all players with 0 votes


		for (const player of this.players) {
			if (player.voteTarget) {
				const currentCount = voteCounts.get(player.voteTarget) || 0;
				voteCounts.set(player.voteTarget, currentCount + 1);
			}
		}

		// Find the player(s) with most votes
		let maxVotes = 0;
		let mostVotedPlayers: Player[] = [];

		voteCounts.forEach((votes, player) => {
			if (votes > maxVotes) {
				maxVotes = votes;
				mostVotedPlayers = [player];
			} else if (votes === maxVotes) {
				mostVotedPlayers.push(player);
			}
		});

		// Important: In One Night, players with the MOST votes are eliminated.
		// Handle ties: If there's a tie for the most votes, ALL tied players are eliminated.

		console.log("Vote Counts:", Array.from(voteCounts.entries()).map(([p, count]) => `${p.name}: ${count}`));
		console.log("Most Voted Players:", mostVotedPlayers.map(p => p.name));

		// Mark voted players as eliminated
		for (const player of mostVotedPlayers) {
			player.isAlive = false; // Assuming isAlive exists on Player
		}

		this.phase = GamePhase.GameOver; // Transition to game over
		return mostVotedPlayers; // Return the list of eliminated players
	}

	public processVote(votingPlayerIndex: number, targetPlayerIndex: number): void {
		const votingPlayer = this.players[votingPlayerIndex];
		const targetPlayer = this.players[targetPlayerIndex];
		votingPlayer.voteTarget = targetPlayer;
		console.log(`${votingPlayer.name} voted for ${targetPlayer.name}`);
		// App.tsx will manage moving to the next voter
	}
	public startVoting(): void {
		this.phase = GamePhase.Voting;
		// Reset votes
		for (const player of this.players) {
			player.voteTarget = null; // Assuming voteTarget is a Player or null
		}
		console.log("Voting Phase Started.");
	}


	public determineWinners(): string {
		// Re-evaluate roles based on their *CurrentRole* after night actions
		const currentWerewolves = this.players.filter(p => p.CurrentRole.team === "Werewolfs");
		const currentTanners = this.players.filter(p => p.CurrentRole.roleName === "Tanner");
		const playersWhoDied = this.players.filter(p => !p.isAlive);
		const werewolvesWhoDied = playersWhoDied.filter(p => p.CurrentRole.team === "Werewolfs");
		const tannersWhoDied = playersWhoDied.filter(p => p.CurrentRole.roleName === "Tanner");
		const villagersWhoDied = playersWhoDied.filter(p => p.CurrentRole.team === "Villagers");


		console.log("Players who died:", playersWhoDied.map(p => `${p.name} (${p.CurrentRole.roleName})`));

		// Winning Conditions:
		// 1. Villagers win if at least one Werewolf died AND no Villagers died.
		// 2. Werewolves win if no Werewolves died AND at least one Villager died. OR if no one died at all.
		// 3. Tanner wins if they died (regardless of who else died).
		// 4. If there are no Werewolves in play (due to setup), Villagers win if no Villager dies.

		// Remove this line as it's not used
		const werewolfCountAfterActions = currentWerewolves.length;

		// Check Tanner win first
		if (tannersWhoDied.length > 0) {
			return "Tanner(s)";
		}

		// Check Villager win
		// Villagers win if a werewolf died OR if no werewolves exist and no villagers died
		if (werewolvesWhoDied.length > 0) {
			// A werewolf died
			return "Villagers";
		} else {
			// No werewolves died.
			if (werewolfCountAfterActions > 0) {
				// Werewolves still exist and didn't die.
				// Werewolves win unless a Tanner died (already checked)
				return "Werewolfs";
			} else {
				// No werewolves exist (either never were any, or they were cloned etc. into non-werewolves)
				// and no werewolves died (because none exist).
				// Villagers win if no villager died.
				if (villagersWhoDied.length === 0) {
					return "Villagers";
				} else {
					// Villager died and no werewolf died, but no werewolf exists. This is a weird state.
					// According to rules, if no Werewolves are in play at the end, Villagers win UNLESS a Villager is killed.
					// If a Villager is killed and no Werewolf exists, it's typically a Villager loss.
					// Let's rule it as 'Nobody' or 'Werewolfs' (as the anti-villager team). Let's go with Nobody wins.
					return "Nobody"; // Or maybe Werewolfs technically win against Villagers? Rules vary. Let's stick to standard One Night: Villagers only win if a WW dies OR no WWs AND no Villagers die.
				}
			}
		}

		// Fallback - should be covered by the above logic
		return "Tie or Undetermined"; // Should not be reached
	}

	private shuffleArray<T>(array: T[]): void {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	// Helper for roles to use if needed (Robber, Troublemaker)
	public swapRoles(player1: Player, player2: Player): void {
		console.log(`Swapping roles between ${player1.name} and ${player2.name}`);
		const tempRole = player1.CurrentRole;
		player1.CurrentRole = player2.CurrentRole;
		player2.CurrentRole = tempRole;
	}

	// public swapRoles(player1: Player, player2: Player): void {
	// 	const tempRole = player1.CurrentRole;
	// 	player1.CurrentRole = player2.CurrentRole;
	// 	player2.CurrentRole = tempRole;
	//
	// 	this.nightActionLog.push(`Swapped roles between ${player1.name} and ${player2.name} `);
	// }

	public lookAtCenterCards(indices: number[]): (IRole | undefined)[] {
		console.log(`Seer is looking at center cards ${indices.map(i => i + 1).join(', ')}`);
		return indices.map(index => {
			if (index >= 0 && index < this.centerCards.length) {
				return this.centerCards[index];
			}
			console.warn(`Seer tried to look at invalid center index: ${index}`);
			return undefined;
		});
	}
	public lookAtPlayer(targetPlayerIndex: number): IRole | undefined {
		if (targetPlayerIndex >= 0 && targetPlayerIndex < this.players.length) {
			console.log(`Seer is looking at ${this.players[targetPlayerIndex].name}`);
			return this.players[targetPlayerIndex].CurrentRole;
		}
		console.warn(`Seer tried to look at invalid player index: ${targetPlayerIndex}`);
		return undefined;
	}
	public swapWithCenter(player: Player, centerIndex: number): void {
		if (centerIndex >= 0 && centerIndex < this.centerCards.length) {
			console.log(`${player.name} swapping with center card ${centerIndex + 1}`);
			const tempRole = player.CurrentRole;
			player.CurrentRole = this.centerCards[centerIndex];
			this.centerCards[centerIndex] = tempRole;
		} else {
			console.warn(`Drunk tried to swap with invalid center index: ${centerIndex}`);
		}
	}
}
