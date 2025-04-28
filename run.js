import { Game } from "./src/game/game.js";

export const game = new Game();

const ps = ["hello", "ss", "fkldasjfkl", "sdghlasdgf", "dfhasld", "sassif"];

game.SetPlayerNames(ps);

game.Init();
game.Debug();

setTimeout(() => {
    game.AddMorePlayers(["a7a"]);
    // game.AddMorePlayers(["lag"]);
    game.Init()
    game.Debug()
    }, 5000);





// game.AddMorePlayers(["lalaland"]);

// console.log(game.playerVotes);

