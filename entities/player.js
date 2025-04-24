export class PlayerFactory {
      constructor() {}
      GeneratePlayers(numberOfPlayers, playerNames) {
            let playersArr = [];
            for (let index = 0; index < numberOfPlayers; index++) {
                  const p = new Player(playerNames[index], index);
                  playersArr.push(p);
            }
            return playersArr;
      }
}

export class Player {
      #role;
      #originalRole;
      #score = 0;
      doneAction = false;
      vote = null;
      isRevealed = false;
      constructor(name, id) {
            this.id = id;
            this.name = name;
      }
      GetRole() {
            return this.#role;
      }
      GetOriginalRole() {
            return this.#originalRole;
      }
      // only use for first time setting the role and for chanign always use change role
      SetRole(role) {
            this.#role = role;
            this.#originalRole = role;
      }
      // use for any role changes
      ChangeRole(role) {
            // classic salata error here
            const temp = this.#role;
            this.#role = role;
            return temp;
      }
      SetScore(score) {
            this.#score = score;
      }
      GetScore() {
            return this.#score;
      }
      // might be player id // will see
      SetVote(player) {
            this.vote = player;
      }
}
