import { Game } from "./entities/game.js";

export const game = new Game();

let n = 6;
const ps = ["hello", "ss", "fkldasjfkl", "sdghlasdgf", "dfhasld", "sassif"];
game.SetPlayerNames(ps);
game.Init();

game.Debug();
