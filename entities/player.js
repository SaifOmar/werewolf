function GuardFunction(type) {
  if (typeof type === "function") {
    return true;
  }
  return false;
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
