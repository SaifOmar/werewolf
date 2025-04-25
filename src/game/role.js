import * as consts from "./consts.js";
import { Effect } from "./effect.js";
export class Role {
	roleName;
	team;
	description;
	effect;

	constructor(roleName, team) {
		this.roleName = roleName;
		this.team = team;
	}
}
// 2 m 2 ww , 5 vil
export class RoleFactory {
	createdRoles = [];
	NumberOfRoles = 9;
	DefaultNumberOfRoles = 9;
	NumberOfGroundCards = 3;
	AllowedNumberOfWerewolfs = 2;
	AllowedNumberOfMaisons = 2;
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
		this.NumberOfRoles = NumberOfPlayers + this.NumberOfGroundCards;
	}

	CreateRoles(numberOfPlayers) {
		this.SetNumberOfRoles(numberOfPlayers);
		const allRoles = consts.roles;
		allRoles.forEach((r) => {
			if (this.createdRoles.length >= this.NumberOfRoles) {
				return;
			}
			if (r.roleName == "Maison") {
				for (
					let i = 0;
					i < this.AllowedNumberOfMaisons - 1;
					i++
				) {
					const effect = new Effect(
						r.effect.effectName,
						r.effect.action,
					);
					const teamName = r.team;
					const teamType = consts.teams[teamName];
					const role = new Role(r.roleName, teamType);
					role.effect = effect;
					role.description = r.description;
					this.createdRoles.push(role);
					continue;
				}
			}
			if (r.roleName == "Werewolf") {
				for (
					let i = 0;
					i < this.AllowedNumberOfWerewolfs - 1;
					i++
				) {
					const effect = new Effect(
						r.effect.effectName,
						r.effect.action,
					);
					const teamName = r.team;
					const teamType = consts.teams[teamName];
					const role = new Role(r.roleName, teamType);
					role.effect = effect;
					role.description = r.description;
					this.createdRoles.push(role);
				}
			}
			const effect = new Effect(
				r.effect.effectName,
				r.effect.action,
			);
			const teamName = r.team;
			const teamType = consts.teams[teamName];
			const role = new Role(r.roleName, teamType);
			role.effect = effect;
			role.description = r.description;
			this.createdRoles.push(role);
		});

		return this.createdRoles;
	}
}
