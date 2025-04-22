import * as consts from "./consts.js";

function GuardFunction(type) {
  if (typeof type === "function") {
    return true;
  }
  return false;
}
// for sure js doesn't have fkin interfaces

export class Game {
  players = [];
  playerNames = [];
  playerFactory;
  roleFactory;
  constructor() {
    this.playerFactory = new PlayerFactory();
    this.roleFactory = new RoleFactory();
  }
  Debug() {
    for (let p of this.players) {
      console.log(p.GetRole());
      console.log(p.name);
    }
  }
  Start(numberOfplayers = 6) {
    this.SetNumberOfPlayers(numberOfplayers);
    this.players = this.playerFactory.GeneratePlayers(this.numberOfPlayers, this.playerNames);
    this.CreatePlayerRoles();
  }

  SetNumberOfPlayers(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
  }

  SetPlayerNames(playerNames){
    this.playerNames = playerNames;
    console.log(this.playerNames)
  }

  CreatePlayerRoles() {
    this.roleFactory.CreateRoles(this.numberOfPlayers);
    this.RandomlyAssignPlayerRoles();
  }
  RandomlyAssignPlayerRoles() {
    this.roleFactory.ShuffeleInPlace();
    for (let idx = 0; idx < this.players.length; idx++) {
      const player = this.players[idx];
      const role = this.roleFactory.createdRoles[idx];
      player.SetRole(role);
    }
  }
}

export class PlayerFactory {
  constructor() {}
  GeneratePlayers(numberOfPlayers, playerNames) {
    
    let playersArr = [];
    for (let index = 0; index < numberOfPlayers; index++) {
      const p = new Player(playerNames[index]);
      playersArr.push(p);
    }
    return playersArr;
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
      const teamType = consts.teams[teamName]
      const role = new Role(r.roleName, teamType);
      role.effect = effect;
      role.description = r.description;
      this.createdRoles.push(role);
    });
    return this.createdRoles;
  }
}

export class Player {
  #role;
  #score = 0;
  constructor(name) {
    this.name = name;
  }
  GetRole() {
    return this.#role;
  }
  SetRole(role) {
    this.#role = role;
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
  action;

  constructor(effectName, action) {
    this.effectName = effectName;
    this.action = action;
  }

  // should print hello
  DoEffect() {
    console.log(this.action);
  }
}
