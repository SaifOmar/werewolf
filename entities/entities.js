import * as consts from "./consts.js";

function GuardFunction(type) {
  if (typeof type === "function") {
    return true;
  }
  return false;
}
// for sure js doesn't have fkin interfaces
//
export class RoleFactory {
  createdRoles = [];

  constructor(numberOfPlayers = 6) {
    this.numberOfPlayers = numberOfPlayers;
  }

  CreateRoles() {
    const allRoles = Object.values(consts.roles);
    allRoles.forEach((r) => {
      if (this.createdRoles.length >= this.numberOfPlayers) {
        return;
      }
      const effect = new Effect("testValue", "hello" + l);
      console.log(effect);
      const role = new Role(r, consts.teams.Vilans);
      role.effect = effect;
      role.description = "testtest";
      this.createdRoles.push(role);
    });
  }
}

export class Player {
  #role;
  #score = 0;
  constructor(role, name = "player") {
    this.name = name;
    this.#role = role;
  }
  GetRole() {
    return this.#role;
  }
  ChangeRole(role) {
    temp = role;
    this.#role = role;
    return temp;
  }
  SetScore(score) {
    this.#score = score;
  }
  GetScore() {
    return this.#score;
  }

  // I dont even know what is effect value for now

  DoEffect() {
    if (GuardFunction(this.#role.DoEffect)) {
      this.#role.DoEffect();
    }
  }
}

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

export class Effect {
  effectName;
  value;

  constructor(effectName, value = "testValue") {
    this.value = value;
    this.effectName = effectName;
  }

  // should print hello
  DoEffect() {
    console.log(this.value);
  }
}
