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
	#score = 0;
	constructor(name, id) {
		this.id = id;
		this.name = name;
	}
	GetRole() {
		return this.#role;
	}
	SetRole(role) {
		this.#role = role;
	}
	ChangeRole(role) {
		const temp = role;
		this.#role = role;
		return temp;
	}
	SetScore(score) {
		this.#score = score;
	}
	GetScore() {
		return this.#score;
	}
}
