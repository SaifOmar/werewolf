import { Game } from "./game";
import { Player } from "./player";

export interface Role {
    name: string;
    description: string;
    performAction(): Function;
}

export class Werewolf implements Role {
    public name: string = "Werewolf";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return function(game: Game, player: Player, args: any) { 
	    return game.players.find(p => p.getRole().name.toLowerCase() === "werewolf" && p.name !== player.name);
	}
    }
}
export class Seer implements Role {
    public name: string = "Seer";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return function(game: Game, player: Player, args: any) { 
	    return game.players.find(p => args.player.name === p.name)!.getRole().name.toLowerCase();
	}
    }
}

export class Robber implements Role {
    public name: string = "Robber";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return function(game: Game, player: Player, args: any) { 
	    let selectedPlayer = game.players.find(p => args.player.name === p.name)!;
	    let temp = player.getRole();
	    player.setRole(selectedPlayer.getRole());
	    selectedPlayer.setRole(temp);
	    return player.getRole().name.toLowerCase();
	}
    }
}
export class Drunk implements Role {
    public name: string = "Drunk";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return
    }
}
export class Troublemaker implements Role {
    public name: string = "Troublemaker";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return
    }
}

export class Mason implements Role {
    public name: string = "Mason";
    public description: string = "The most evil creature in the game";
    public performAction() {
	return function(game: Game, player: Player, args: any) { 
	    return game.players.find(p => p.getRole().name.toLowerCase() === "mason" && p.name !== player.name);
	}
    }
}

export const RoleClasses = {
    werewolf: Werewolf,
    seer: Seer,
    drunk: Drunk,
    troublemaker: Troublemaker,
    robber: Robber,
    mason: Mason
};
