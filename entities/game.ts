import { Player } from "./player";
import { Role , Werewolf, Seer, RoleClasses } from "./role";

export const enum Phase {
    Waiting = "waiting",
    Initial = "initial",
    Night = "Night",
    Morning = "Morning",
    Day = "Day",
    Evening = "Evening",
    Finished = "Finished"
}


//WARNING: Just random phases
export class Game {
    private _playerNames : string[];
    private _availableRoles: Role[];
    private maxNumberOfPlayers: number = 7;
    public players: Player[];
    public phase: Phase;
    public code : string
    public numberOfWerewolf: number = 2;
    public numberOfMasons: number = 1;
    
    public constructor() {
	this.code = Math.random().toString(36).substring(2, 10);
	this._playerNames = [];
	this._availableRoles= [];
	this.players = [];
	this.phase = Phase.Waiting;
	this._availableRoles = getRolesFromDB(this.numberOfWerewolf,this.numberOfMasons, this.maxNumberOfPlayers);
	}
    public playerJoin(name: string) {
	if (this._playerNames.length + 1 > this.maxNumberOfPlayers) {
	    console.error(`Game is full please join another game`);
	    return;
	}
	if (this._playerNames.find(p => p === name)) {
	    console.error(`A player with this name (${name}) already joined please chose another name`);
	    return;
	}
	this._playerNames.push(name);
    }
    public start() {
	this.assignRandomRoles();
	this.phase = Phase.Night;
	console.log("Game started");
    }
    public finish() {
	//  NOTE: game finished is ok but I check on the game being witing or not how do you get the differnece between each of them
	this.phase = Phase.Finished;
	console.log("Game finished");
	this.players = [];
	this._availableRoles= [];
    }
    public getNumberOfPlayers(): number {
	return this._playerNames.length;
    }
   private assignRandomRoles() {
      let availableRoles = [...this._availableRoles];
      this.players = [];
      for (let i = 0; i < this._playerNames.length; i++) {
	if (availableRoles.length === 0) {
		console.error("There is not enough roles to assign to all players");
	}
	const randomIndex = Math.floor(Math.random() * availableRoles.length);
	const role = availableRoles[randomIndex];
	this.players.push(new Player(this._playerNames[i], role));
	availableRoles.splice(randomIndex, 1);
      }
    }

}

// HACK: We read from a db or something but wtf is this
export const getRolesFromDB = function (numberOfWerewolf: number = 2, numberOfMasons: number = 1, numPlayers): Role[] {
    // INFO:  for now I just return the 9 base roles
    let roles: Role[] = [];
    const roleNames = ["Werewolf", "Seer", "Drunk", "Troublemaker", "Robber", "Mason"];
    for (let i = 0; i < roleNames.length; i++) {
	let role:Role
	if (roleNames[i] === "Mason")  {
	    continue;
	}
	if (roleNames[i] === "Werewolf") {
	    for (let j = 0; j < numberOfWerewolf; j++) {
	    role  = new RoleClasses[roleNames[0].toLowerCase()];
	    roles.push(role);
		if (j < numberOfMasons) {
		    role  = new RoleClasses[roleNames[5].toLowerCase()];
		    roles.push(role);
		}
	    }
	    continue;
	}
	role  = new RoleClasses[roleNames[i].toLowerCase()];
	roles.push(role);
    }
    return roles;

}
const createTestingRoles = function() {
    let roles: Role[] = [];
    let role1 = new Werewolf();
    let role2 = new Seer();	
    roles.push(role1);
    roles.push(role2);
    return roles;
}

