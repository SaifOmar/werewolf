// import { Game } from "./entities/game";
import { getRolesFromDB } from "./entities/game";
import { Manager} from "./entities/manager";


const manager = new Manager();
let game = manager.createGame();
game.playerJoin("Saif");
game.playerJoin("Mohamed");
game.playerJoin("Merna");
game.start();
console.log("players: ",game.players);
console.log("current phase: ",game.phase);
console.log("number of players: ",game.getNumberOfPlayers());
console.log("player 1 role: ",game.players[0].getRole().name);
console.log("player 2 role: ",game.players[1].getRole().name);
console.log("player 3 role: ",game.players[2].getRole().name);
console.log("game code: ", game.code);


// getRolesFromDB().forEach(r => console.log(r.name));

