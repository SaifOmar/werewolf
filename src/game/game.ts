/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player } from "./player";
import { IRole, RoleFactory } from "./roles";

export enum GamePhase {
	Setup,
	RoleReveal,
	Night,
	ActionResult,
	Discussion,
	Voting,
	GameOver
}

export class Game {
	public static readonly MIN_PLAYERS = 6;
	public static readonly MAX_PLAYERS = 14;
	public static readonly DISCUSSION_TIME = 360;
	public static readonly CENTER_CARDS = 3;

	public players: Player[];
	public centerCards: IRole[];
	public phase: GamePhase;
	public currentPlayerIndex: number;
	public nightActionLog: string[];
	public playerCount: number;
	public playerNames: string[];
	public pendingActions: { playerIndex: number; actionArgs: any[] }[];
	public discussionTimeRemaining: number;
	public timerActive: boolean;
	public nightResults: Map<number, any>;

	constructor() {
		this.playerCount = 0;
		this.playerNames = [];
		this.players = [];
		this.centerCards = [];
		this.phase = GamePhase.Setup;
		this.currentPlayerIndex = 0;
		this.nightActionLog = [];
		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = false;
		this.pendingActions = [];
		this.nightResults = new Map();
	}


	public validatePlayerCount(count: number): boolean {
		return count >= Game.MIN_PLAYERS && count <= Game.MAX_PLAYERS;
	}

	public setup(playerNames: string[]): void {
		if (!this.validatePlayerCount(playerNames.length)) {
			throw new Error(`Player count must be between ${Game.MIN_PLAYERS} and ${Game.MAX_PLAYERS}`);
		}

		this.playerNames = playerNames;
		this.players = [];
		this.centerCards = [];
		this.phase = GamePhase.Setup;
		this.currentPlayerIndex = 0;
		this.nightActionLog = [];
		this.playerCount = playerNames.length;
		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = false;
		this.pendingActions = [];
		this.nightResults = new Map();


		const totalRolesNeeded = this.playerCount + Game.CENTER_CARDS;
		const allRoles: IRole[] = RoleFactory.CreateRoles(totalRolesNeeded);
		this.shuffleArray(allRoles);
		this.assignRoles(allRoles);

		console.log("Game Setup Complete. Players:", this.players.map(p => p.name + ":" + p.OriginalRole.roleName), "Center:", this.centerCards.map(c => c.roleName));
	}

	public startDiscussion(): void {
		this.phase = GamePhase.Discussion;
		this.discussionTimeRemaining = Game.DISCUSSION_TIME;
		this.timerActive = true;
		console.log("Discussion Phase Started.");
	}

	public updateTimer(): boolean {
		if (this.timerActive && this.discussionTimeRemaining > 0) {
			this.discussionTimeRemaining--;
			return true;
		}
		if (this.discussionTimeRemaining <= 0) {
			this.timerActive = false;
			return false;
		}
		return true;
	}

	private assignRoles(allRoles: IRole[]): void {
		for (let i = 0; i < this.playerCount; i++) {
			const player = new Player(this.playerNames[i], allRoles[i], i + 1);
			player.CurrentRole = allRoles[i];
			this.players.push(player);
		}

		for (let i = this.playerCount; i < this.playerCount + 3; i++) {
			this.centerCards.push(allRoles[i]);
		}
	}

	public startRoleReveal(): void {
		this.phase = GamePhase.RoleReveal;
		this.currentPlayerIndex = 0;
	}
	public startNight(): void {
		this.phase = GamePhase.Night;
		this.currentPlayerIndex = 0;
		this.nightActionLog = [];
		this.pendingActions = [];
		this.nightResults = new Map();

		const nightOrder: string[] = [
			"Werewolf", "Minion", "Mason", "Seer", "Robber",
			"Troublemaker", "Drunk", "Clone",];
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


		this.pendingActions.push({ playerIndex: player.id - 1, actionArgs });
	}

	public stopTimer(): void {
		this.timerActive = false;
	}

	public performNightAction(player: Player, actionArgs: any[]): void {
		const actionLog = `${player.name} (${player.OriginalRole.roleName}) selected their night action.`;
		this.nightActionLog.push(actionLog);

		if (!this.pendingActions) {
			this.pendingActions = [];
		}
		const playerIndex = player.id - 1;
		this.pendingActions.push({ playerIndex, actionArgs });
		console.log(this.pendingActions);

		this.currentPlayerIndex++;

		if (this.currentPlayerIndex >= this.players.length) {
			this.executeNightActions();
		}
	}

	public executeNightActions(): void {
		console.log("Executing Night Actions...");

		const nightOrder: string[] = [
			"Werewolf", "Minion", "Mason", "Seer", "Robber",
			"Troublemaker", "Drunk", "Clone", // Joker has no action
		];

		this.pendingActions.sort((a, b) => {
			const playerA = this.players[a.playerIndex];
			const playerB = this.players[b.playerIndex];
			const roleAIndex = nightOrder.indexOf(playerA.OriginalRole.roleName);
			const roleBIndex = nightOrder.indexOf(playerB.OriginalRole.roleName);
			const finalRoleAIndex = roleAIndex === -1 ? nightOrder.length : roleAIndex;
			const finalRoleBIndex = roleBIndex === -1 ? nightOrder.length : roleBIndex;
			return finalRoleAIndex - finalRoleBIndex;
		});

		this.nightResults = new Map();
		const executionLog: string[] = [];

		for (const { playerIndex, actionArgs } of this.pendingActions) {
			const player = this.players[playerIndex];
			let resultData: any = null;

			if (player.OriginalRole) {
				try {
					resultData = player.OriginalRole.doAction(player, this, actionArgs);
				} catch (e) {
					console.error(`Error executing action for ${player.name} (${player.OriginalRole.roleName}):`, e);
					executionLog.push(`${player.name}'s action failed: ${e.message}`);
				}
			} else {
				executionLog.push(`${player.name} (${player.OriginalRole.roleName}) had no executable action.`);
			}
			switch (player.OriginalRole.roleName) {
				case 'Seer':
					if (resultData) this.nightResults.set(player.id, resultData);
					executionLog.push(`${player.name} (Seer) looked.`);
					break;
				case 'Robber':
					{
						const targetPlayerRobber = this.players[actionArgs[0]];
						this.nightResults.set(player.id, { type: 'robber', newRole: player.CurrentRole, targetName: targetPlayerRobber.name });
						executionLog.push(`${player.name} (Robber) swapped with ${targetPlayerRobber.name}.`);
						break;
					}
				case 'Troublemaker':
					{
						const p1 = this.players[actionArgs[0]];
						const p2 = this.players[actionArgs[1]];
						this.nightResults.set(player.id, { type: 'troublemaker', targetName1: p1.name, targetName2: p2.name });
						executionLog.push(`${player.name} (Troublemaker) swapped ${p1.name} and ${p2.name}.`);
						break;
					}
				case 'Drunk':
					this.nightResults.set(player.id, { type: 'drunk', centerIndex: actionArgs[0] });
					executionLog.push(`${player.name} (Drunk) swapped with center card ${actionArgs[0] + 1}.`);
					break;
				case 'Clone':
					const clonedPlayer = this.players[actionArgs[0]];
					this.nightResults.set(player.id, { type: 'clone', clonedRole: player.CurrentRole, targetName: clonedPlayer.name });
					executionLog.push(`${player.name} (Clone) cloned ${clonedPlayer.name}.`);
					break;
				case 'Werewolf':
				case 'Minion':
				case 'Mason':
					executionLog.push(`${player.name} (${player.OriginalRole.roleName}) saw teammates/werewolves.`);
					break;
				default:
					executionLog.push(`${player.name} (${player.OriginalRole.roleName}) had no night action.`);
					break;
			}
		}

		this.nightActionLog = this.nightActionLog.concat(executionLog);
		this.pendingActions = [];
		this.phase = GamePhase.ActionResult;
		console.log("Night Actions Executed. Transitioning to Action Result phase.");
		console.log("Final Player Roles (after actions):", this.players.map(p => p.name + ":" + p.CurrentRole.roleName));
		console.log("Final Center Roles:", this.centerCards.map(c => c.roleName));
	}

	public countVotes(): Player[] {
		const voteCounts = new Map<Player, number>();
		this.players.forEach(p => voteCounts.set(p, 0));

		for (const player of this.players) {
			if (player.voteTarget) {
				const currentCount = voteCounts.get(player.voteTarget) || 0;
				voteCounts.set(player.voteTarget, currentCount + 1);
			}
		}
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


		console.log("Vote Counts:", Array.from(voteCounts.entries()).map(([p, count]) => `${p.name}: ${count}`));
		console.log("Most Voted Players:", mostVotedPlayers.map(p => p.name));

		for (const player of mostVotedPlayers) {
			player.isAlive = false;
		}

		this.phase = GamePhase.GameOver;
		return mostVotedPlayers;
	}

	public processVote(votingPlayerIndex: number, targetPlayerIndex: number): void {
		const votingPlayer = this.players[votingPlayerIndex];
		const targetPlayer = this.players[targetPlayerIndex];
		votingPlayer.voteTarget = targetPlayer;
		console.log(`${votingPlayer.name} voted for ${targetPlayer.name}`);
	}
	public startVoting(): void {
		this.phase = GamePhase.Voting;
		for (const player of this.players) {
			player.voteTarget = null;
		}
		console.log("Voting Phase Started.");
	}


	public determineWinners(): string {
		const currentWerewolves = this.players.filter(p => p.CurrentRole.team === "Werewolfs");
		const currentJokers = this.players.filter(p => p.CurrentRole.roleName === "Joker");
		const playersWhoDied = this.players.filter(p => !p.isAlive);
		const werewolvesWhoDied = playersWhoDied.filter(p => p.CurrentRole.team === "Werewolfs");
		const tannersWhoDied = playersWhoDied.filter(p => p.CurrentRole.roleName === "Tanner");
		const villagersWhoDied = playersWhoDied.filter(p => p.CurrentRole.team === "Villagers");


		console.log("Players who died:", playersWhoDied.map(p => `${p.name} (${p.CurrentRole.roleName})`));

		const werewolfCountAfterActions = currentWerewolves.length;

		if (tannersWhoDied.length > 0) {
			return "Tanner(s)";
		}

		if (werewolvesWhoDied.length > 0) {
			return "Villagers";
		} else {
			if (werewolfCountAfterActions > 0) {
				return "Werewolfs";
			} else {
				if (villagersWhoDied.length === 0) {
					return "Villagers";
				} else {
					return "Nobody";
				}
			}
		}
	}

	private shuffleArray<T>(array: T[]): void {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	public swapRoles(player1: Player, player2: Player): void {
		console.log(`Swapping roles between ${player1.name} and ${player2.name}`);
		const tempRole = player1.CurrentRole;
		player1.CurrentRole = player2.CurrentRole;
		player2.CurrentRole = tempRole;
	}


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
