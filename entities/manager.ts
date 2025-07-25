import { Game, Phase } from "./game";
//A manager class that douples as a cache layer for running games
export class Manager {
    public games: Game[];
    public constructor() {
	this.games = [];
    }
    public createGame(): Game {
	let game = new Game();
	this.games.push(game);
	return game;
    }
    public joinGame(code : string, name: string): Game | null {
	if (!name || name.length === 0 || typeof name !== "string") {
	    console.error("Invalid name: " , name);
	    return null;
	}
	let game = this.games.find(game => game.code === code);
	if (game) {
	    if (game.phase!==Phase.Waiting) {
		console.error("this game has already started");
		return null;
	    } 
	    game.playerJoin(name)
	    return game;
	} else {
	    return null;
	}
    }
    private deleteGame(game: Game):void {
	this.games = this.games.filter(g => g !== game);
    }
    private deleteGameByCode(code: string):void {
	this.games = this.games.filter(g => g.code !== code);
    }
    private deleteFinishedGames():void {
	let finished = this.games.filter(g => g.phase=== Phase.Finished);
	finished.forEach(game => this.deleteGame(game));
    }
}
