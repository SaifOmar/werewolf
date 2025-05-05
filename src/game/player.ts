import { IRole } from "./roles";

export class Player {
	public id: number;
	public name: string;
	public OriginalRole: IRole;
	public CurrentRole: IRole;
	public isAlive: boolean;
	public voteTarget: Player | null;

	constructor(name: string, role: IRole, id: number) {
		this.id = id;
		this.name = name;
		this.OriginalRole = role;
		this.CurrentRole = role;
		this.isAlive = true;
		this.voteTarget = null;
	}

	public vote(target: Player): void {
		this.voteTarget = target;
	}
}

// 	public doAction(game: Game, args: any[]): void {
// 		this.CurrentRole.doAction(this, game, args);
// 	}
