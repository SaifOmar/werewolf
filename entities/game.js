// for sure js doesn't have fkin interfaces

import { PlayerFactory } from "./player.js";
import { RoleFactory } from "./role.js";

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
    this.players = this.playerFactory.GeneratePlayers(
      this.numberOfPlayers,
      this.playerNames,
    );
    this.CreatePlayerRoles();
  }

  SetNumberOfPlayers(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
  }

  SetPlayerNames(playerNames) {
    this.playerNames = playerNames;
    console.log(this.playerNames);
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
