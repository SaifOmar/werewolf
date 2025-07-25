import { Role } from "./role";
import { Game } from "./game";

export class Player {
    public readonly name: string;
    private role : Role
    public constructor(name: string, role: Role) {
		this.name = name;
		this.role = role;
	}
    public getRole(): Role {
        return this.role;
    }
    public setRole(role: Role) {
        this.role = role;
    }
    public performAction(game: Game, args: any) {
        return this.role.performAction()(game, this, args);
    }
}
