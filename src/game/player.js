export class PlayerFactory {
	playersArr = [];
	constructor() {}
	GeneratePlayers(numberOfPlayers, playerNames) {
		this.playersArr = [];
		for (let index = 0; index < numberOfPlayers; index++) {
			const p = new Player(playerNames[index], index);
			this.playersArr.push(p);
		}
		return this.playersArr;
	}
	AddPlayer(playerName) {
		const index = this.playersArr.length;
		const p = new Player(playerName, index);
		this.playersArr.push[p];
		// console.log(this.playersArr);
		return p;
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
