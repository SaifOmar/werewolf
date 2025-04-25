import { Game } from "./src/game/game.js";

export const game = new Game();

const ps = ["hello", "ss", "fkldasjfkl", "sdghlasdgf", "dfhasld", "sassif"];

game.SetPlayerNames(ps);
game.Init();

game.AddMorePlayers(["a7a"]);
game.AddMorePlayers(["lag"]);
game.AddMorePlayers(["lalaland"]);

game.Init();

// game.Debug();
// console.log(game.playerVotes);
