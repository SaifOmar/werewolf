import * as consts from "./consts.js";
import { Effect } from "./effect.js";
Effect;
export class Role {
  roleName;
  team;
  description;
  effect;

  constructor(roleName, team) {
    this.roleName = roleName;
    this.team = team;
  }
  DoEffect() {
    this.effect.DoEffect();
  }
}
export class RoleFactory {
  createdRoles = [];
  NumberOfRoles = 9;
  NumberOfGroundCards = 3;
  constructor() {}

  ShuffeleInPlace() {
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
      const effect = new Effect(r.effect.effectName, r.effect.action);
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
