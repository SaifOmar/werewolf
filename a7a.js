import * as consts from "./entities/consts.js";
import { RoleFactory } from "./entities/entities.js";
import { Player } from "./entities/entities.js";
let roleFactory = new RoleFactory();

let p = [];

function Start() {
  roleFactory.CreateRoles();
  for (let role of roleFactory.createdRoles) {
    let player = new Player(role);
    p.push(player);
  }
}

function Do() {
  for (let pw of p) {
    pw.DoEffect();
  }
}

Start();
Do();
