import { Role } from "./role";
import { Game } from "./game";
import { Action } from "./actions";

export class Player {
    private role : Role
    private originalRole : Role
    public  name: string;
    public constructor(name: string) {
        this.name = name;
	}
    // public setName(name: string): void {
    //     this.name = name;
    // } 
    public getOriginalRole(): Role {
	return this.originalRole;
    }
    public AddRole(role: Role): void{
	this.originalRole = role;
        this.role = role;
    }
    public getRole(): Role {
        return this.role;
    }
    public setRole(role: Role) :void{
        this.role = role;
    }
    public performAction(game: Game, action: Action) {
        return this.role.performAction()(game, this, action);
    }
}
