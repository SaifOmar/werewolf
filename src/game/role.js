import * as consts from "./consts.js";
import { Effect } from "./effect.js";
export class Role {
	roleName;
	team;
	description;
	effect;

	constructor(roleName, team, description , effect) {
		this.roleName = roleName;
		this.team = team;
		this.description = description;
		this.effect = effect;
	}
}
// 2 m 2 ww , 5 vil
export class RoleFactory {
	createdRoles = [];
	NumberOfRoles = 9;
	DefaultNumberOfRoles = 9;
	#NumberOfGroundCards = 3;
	AllowedNumberOfWerewolfs = 2;
	AllowedNumberOfMaisons = 2;
	MaxNumberOfWerewolves = 3;
	constructor() {}
	Shuffle() {
		for (let i = this.createdRoles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.createdRoles[i], this.createdRoles[j]] = [
				this.createdRoles[j],
				this.createdRoles[i],
			];
		}
	}

	SetNumberOfRoles(NumberOfPlayers) {
		this.NumberOfRoles = NumberOfPlayers + this.#NumberOfGroundCards;
	}

	CreateRoles(numberOfPlayers) {
		this.createdRoles = [];
		const keyRoles = ["Drunk","TroubleMaker","Robber","Seer","Minion","Maison","Maison","Werewolf","Werewolf","Werewolf", "Clone", "Insomniac", "Joker", "MysticWolf", "Witch", "DreamWolf", "Sentinel"];
		this.SetNumberOfRoles(numberOfPlayers);
		const allRoles = consts.roles;
		
		for(let i = 0; i < this.NumberOfRoles; i++){
			let roleData = allRoles.find(e => e.roleName === keyRoles[i]);
			let myeffect = roleData.effect
			const team = consts.teams[roleData.team];
			const effect = new Effect(myeffect.effectName, myeffect.action)
			const role = new Role(roleData.roleName,team, roleData.description, effect)
			this.createdRoles.push(role);
		}
		
		return this.createdRoles;
	}
}