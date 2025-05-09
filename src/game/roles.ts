/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Game } from "./game";
import { Player } from "./player";

export interface IRole {
	roleName: string;
	team: string;
	doAction(player: Player, game: Game, args: any[]): any;
}

class Role implements IRole {
	public roleName: string;
	public team: string;

	public constructor() {
		this.roleName = "BaseRole";
		this.team = "Villagers";
	}

	doAction(player: Player, game: Game, args: any[]): void {
		console.log("Base role action");
		throw new Error("Method not implemented.");
	}
}

class WereWolfRole extends Role {
	public constructor() {
		super();
		this.roleName = "Werewolf";
		this.team = "Werewolfs";
	}

	public doAction(player: Player, game: Game, args: any[]): Player[] {
		const WereWolfs: Player[] = [];
		for (const p of game.players) {
			if (player == p) {
				continue;
			}
			if (p.OriginalRole.roleName == "Werewolf") {
				WereWolfs.push(p);
			}
		}
		game.nightActionLog.push(`${player.name} saw the other werewolves`);
		return WereWolfs;
	}
}

class MinionRole extends Role {
	public constructor() {
		super();
		this.roleName = "Minion";
		this.team = "Werewolfs";
	}

	public doAction(player: Player, game: Game, args: any[]): Player[] {
		const WereWolfs: Player[] = [];
		for (const p of game.players) {
			if (p.OriginalRole.roleName == "Werewolf") {
				WereWolfs.push(p);
			}
		}
		game.nightActionLog.push(`${player.name} saw all werewolves`);
		return WereWolfs;
	}
}

class MasonRole extends Role {
	public constructor() {
		super();
		this.roleName = "Mason";
	}

	public doAction(player: Player, game: Game, args: any[]): Player[] {
		const masons: Player[] = [];
		for (const p of game.players) {
			if (player == p) {
				continue;
			}
			if (p.OriginalRole.roleName == "Mason") {
				masons.push(p);
			}
		}
		game.nightActionLog.push(`${player.name} saw the other masons`);
		return masons;
	}
}

class SeerRole extends Role {
	public constructor() {
		super();
		this.roleName = "Seer";
	}

	public doAction(player: Player, game: Game, args: any[]): any {
		const lookAtCenter = args[0] as boolean;

		if (lookAtCenter) {
			const centerIndices = args[1] as number[];
			const centerCards: IRole[] = [];

			for (const index of centerIndices) {
				if (index >= 0 && index < game.centerCards.length) {
					centerCards.push(game.centerCards[index]);
				}
			}

			game.nightActionLog.push(`${player.name} looked at center cards`);
			return centerCards;
		} else {
			const targetPlayerIndex = args[1] as number;
			if (targetPlayerIndex >= 0 && targetPlayerIndex < game.players.length) {
				const targetPlayer = game.players[targetPlayerIndex];
				game.nightActionLog.push(`${player.name} looked at ${targetPlayer.name}'s role`);
				return targetPlayer.CurrentRole;
			}
		}

		return null;
	}
}

class RobberRole extends Role {
	public constructor() {
		super();
		this.roleName = "Robber";
	}

	public doAction(player: Player, game: Game, args: any[]): IRole {
		// args[0] is the index of the player to rob
		const targetPlayerIndex = args[0] as number;

		if (targetPlayerIndex >= 0 && targetPlayerIndex < game.players.length) {
			const targetPlayer = game.players[targetPlayerIndex];

			// Swap roles
			const originalRole = player.CurrentRole;
			player.CurrentRole = targetPlayer.CurrentRole;
			targetPlayer.CurrentRole = originalRole;

			game.nightActionLog.push(`${player.name} swapped roles with ${targetPlayer.name}`);
			return player.CurrentRole; // Return the new role
		}

		return player.CurrentRole;
	}
}

class DrunkRole extends Role {
	public constructor() {
		super();
		this.roleName = "Drunk";
	}

	public doAction(player: Player, game: Game, args: any[]): IRole {
		const centerCardIndex = args[0] as number;

		if (centerCardIndex >= 0 && centerCardIndex < game.centerCards.length) {
			const centerRole = game.centerCards[centerCardIndex];
			game.centerCards[centerCardIndex] = player.CurrentRole;
			player.CurrentRole = centerRole;

			game.nightActionLog.push(`${player.name} swapped with a center card but doesn't know which role`);
			return { roleName: "Unknown", team: "Unknown" } as IRole;
		}

		return player.CurrentRole;
	}
}

class TroubleMakerRole extends Role {
	public constructor() {
		super();
		this.roleName = "Troublemaker";
	}

	public doAction(player: Player, game: Game, args: any[]): void {
		const player1Index = args[0] as number;
		const player2Index = args[1] as number;

		if (player1Index >= 0 && player1Index < game.players.length &&
			player2Index >= 0 && player2Index < game.players.length &&
			player1Index !== player2Index) {
			const player1 = game.players[player1Index];
			const player2 = game.players[player2Index];

			const tempRole = player1.CurrentRole;
			player1.CurrentRole = player2.CurrentRole;
			player2.CurrentRole = tempRole;

			game.nightActionLog.push(`${player.name} swapped roles between ${player1.name} and ${player2.name}`);
		}
	}
}

class CloneRole extends Role {
	public constructor() {
		super();
		this.roleName = "Clone";
	}

	public doAction(player: Player, game: Game, args: any[]): IRole {
		const targetPlayerIndex = args[0] as number;

		if (targetPlayerIndex >= 0 && targetPlayerIndex < game.players.length) {
			const targetPlayer = game.players[targetPlayerIndex];

			const clonedRole = targetPlayer.OriginalRole;
			player.CurrentRole = clonedRole;

			game.nightActionLog.push(`${player.name} cloned ${targetPlayer.name}'s role`);


			return clonedRole;
		}

		return player.CurrentRole;
	}
}

class JokerRole extends Role {
	public constructor() {
		super();
		this.roleName = "Joker";
	}

	public doAction(player: Player, game: Game, args: any[]): void {
		game.nightActionLog.push(`${player.name} did nothing during the night`);
	}
}

export class RoleFactory {
	public static rolesDb: string[] = ['werewolf', 'werewolf', 'minion', 'mason', 'seer', 'robber', 'drunk', 'troublemaker', 'mason', 'clone', 'joker'];
	public static CreateRoles(totalRolesNeeded: number): IRole[] {
		const roles: IRole[] = [];
		let count = 0;
		for (const role of RoleFactory.rolesDb) {
			if (count >= totalRolesNeeded) {
				break;
			}
			switch (role) {
				case 'werewolf':
					roles.push(new WereWolfRole());
					break;
				case 'minion':
					roles.push(new MinionRole());
					break;
				case 'mason':
					roles.push(new MasonRole());
					break;
				case 'seer':
					roles.push(new SeerRole());
					break;
				case 'robber':
					roles.push(new RobberRole());
					break;
				case 'drunk':
					roles.push(new DrunkRole());
					break;
				case 'troublemaker':
					roles.push(new TroubleMakerRole());
					break;
				case 'clone':
					roles.push(new CloneRole());
					break;
				case 'joker':
					roles.push(new JokerRole());
					break;
				default:
					roles.push(new Role());
					break;
			}
			count++;
		}
		return roles;
	}

}

