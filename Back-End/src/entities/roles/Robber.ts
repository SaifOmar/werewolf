import { Role } from "./Role";
import { ROLE_REGISTRY, Team } from "@werewolf/shared";
import { Game } from "../game";
import { Player } from "../Player";

export interface RobberAction {
  type: "robber";
  targetPlayer: Player;
}

export const createRobberAction = (targetPlayer: Player): RobberAction => ({
  type: "robber",
  targetPlayer,
});

export class Robber implements Role {
  public id: string;
  public name: string = ROLE_REGISTRY.robber.name;
  public team: Team = Team.Village;
  public description: string = ROLE_REGISTRY.robber.description;

  constructor() {
    this.id = Math.random().toString(36).substring(2, 10);
  }

  public performAction(): Function {
    return function (game: Game, player: Player, action: RobberAction) {
      if (action.type !== "robber") {
        throw new Error(`Invalid action for Robber. Expected 'robber', received '${action.type}'.`);
      }

      if (!action.targetPlayer) {
        throw new Error("Robber action requires a target player");
      }

      const targetPlayer = game.players.find((p) => p.id === action.targetPlayer.id);

      if (!targetPlayer) {
        throw new Error("Target player not found");
      }

      if (targetPlayer.id === player.id) {
        throw new Error("Robber cannot target themselves");
      }

      const temp = player.getRole();
      const stolenRole = targetPlayer.getRole();

      // The robber SAW the stolen card — it becomes their known role.
      player.setRole(stolenRole, true);
      // The victim receives the robber's old card silently.
      targetPlayer.setRole(temp);

      return {
        newRole: stolenRole.name,
        newTeam: stolenRole.team,
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.name,
        message: `سرقت دور ${targetPlayer.name} — بقت عندك ${stolenRole.name}`,
      };
    };
  }
}
