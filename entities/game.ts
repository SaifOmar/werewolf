import Logger from "./manager";
import { Player } from "./player";
import {Action , SeerActionType} from "./actions";
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
    private readonly numberOfGroundRoles: number = 3;
    private _availableRoles: Role[];
    private maxNumberOfPlayers: number = 7;
    public groundRoles: Role[];
    public players: Player[];
    public phase: Phase;
    public code : string
    public numberOfWerewolf: number = 3;
    public numberOfMasons: number = 2;
    public logger: Logger;
    public actions: Action[];
    
    public constructor(logger:Logger) {
	this.logger = logger;
	this.actions = [];
	this.code = Math.random().toString(36).substring(2, 10);
	this._availableRoles= [];
	this.players = [];
	this.phase = Phase.Waiting;
	this._availableRoles = getRolesFromDB(this.numberOfWerewolf,this.numberOfMasons);
	this.logger.info(`available roles: ${this._availableRoles.map(r => r.name)}`);
	this.logger.info("Game created");
	}

    public playerJoin(name: string) {
	this.logger.info(`playerJoin ${name}`);
	if (this.players.length + 1 > this.maxNumberOfPlayers) {
	    this.logger.error(`Game is full please join another game`);
	    console.error(`Game is full please join another game`);
	    return;
	}
	if (this.players.find(p => p.name === name)) {
	    this.logger.error(`A player with this name (${name}) already joined please chose another name`);
	    console.error(`A player with this name (${name}) already joined please chose another name`);
	    return;
	}
	this.players.push(new Player(name));
    }
    public start() {
	this.assignRandomRoles();
	this.groundRoles= this._availableRoles.slice(0, this.numberOfGroundRoles);
	this.logger.info(`ground roles: ${this.groundRoles.map(r => r.name)}`);
	this.phase = Phase.Night;
	console.log("Game started");
	this.logger.info("Game started");
	this.logGame();
    }
    public getAvailableRoles(): Role[] {
	return this._availableRoles;
    }
    public finish() {
	this.logger.info("Game finished");
	//  NOTE: game finished is ok but I check on the game being witing or not how do you get the differnece between each of them
	this.logGame();
	this.phase = Phase.Finished;
	console.log("Game finished");
	this.players = [];
	this._availableRoles= [];
	// this.logGame();
    }
    public getNumberOfPlayers(): number {
	return this.players.length;
    }
    public logGame() {
	this.logger.info(`players: ${this.players.map(p => p.name)}`);
	this.logger.info(`current phase: ${this.phase}`);
	this.logger.info(`number of players: ${this.players.length}`);
	this.logger.info(`player ${this.players[0].name} role: ${this.players[0].getRole().name}`);
	this.logger.info(`player ${this.players[1].name} role: ${this.players[1].getRole().name}`);
	this.logger.info(`player ${this.players[2].name} role: ${this.players[2].getRole().name}`);
	this.logger.info(`player ${this.players[3].name} role: ${this.players[3].getRole().name}`);
	this.logger.info(`player ${this.players[4].name} role: ${this.players[4].getRole().name}`);
	this.logger.info(`player ${this.players[5].name} role: ${this.players[5].getRole().name}`);
	this.logger.info(`player ${this.players[6].name} role: ${this.players[6].getRole().name}`);
    
    }
   private assignRandomRoles() {
      let availableRoles = this._availableRoles;
	this.logger.info(`available roles: ${availableRoles.map(r => r.name)}`);
	// TODO: this should be avaialable roles  +3
	if (availableRoles.length  < this.players.length) {
		console.error("There is not enough roles to assign to all players");
	}
      for (let i = 0; i < this.players.length; i++) {
	const randomIndex = Math.floor(Math.random() * availableRoles.length);
	const role = availableRoles[randomIndex];
	this.players[i].AddRole(role) 
	availableRoles.splice(randomIndex, 1);
      }
    }

}

// HACK: We read from a db or something but wtf is this
export const getRolesFromDB = function (numberOfWerewolf: number = 3, numberOfMasons: number = 2): Role[] {
    // INFO:  for now I just return the 9 base roles
    let roles: Role[] = [];
    const roleNames = ["Werewolf","Mason" ,"Seer", "Drunk", "Troublemaker", "Robber", "Minion"];
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
		    role  = new RoleClasses[roleNames[1].toLowerCase()];
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

