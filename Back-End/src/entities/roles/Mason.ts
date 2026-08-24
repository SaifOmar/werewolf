import { Role } from "./Role";
import { ROLE_REGISTRY, ROLE_NAMES, Team } from "@werewolf/shared";
import { Game } from "../game";
import { Player } from "../Player";
import { roleIdOf } from "./roleId";

export interface MasonAction {
  type: "mason";
}

export const createMasonAction = (): MasonAction => ({
  type: "mason",
});

export class Mason implements Role {
  public id: string;
  public name: string = ROLE_REGISTRY.mason.name;
  public team: Team = Team.Village;
  public description: string = ROLE_REGISTRY.mason.description;

  constructor() {
    this.id = Math.random().toString(36).substring(2, 10);
  }

  public performAction(): Function {
    return function (game: Game, player: Player, action: MasonAction) {
      if (action.type !== "mason") {
        throw new Error(`Invalid action for Mason. Expected 'mason', received '${action.type}'.`);
      }

      const otherMasons = game.players.filter((p) => {
        if (p.id === player.id) return false;
        const isOriginalMason = roleIdOf(p.getOriginalRole().name) === "mason";
        const isCloneMason = (p as any)._wasClone === true && (p as any)._clonedRoleName === "mason";
        return isOriginalMason || isCloneMason;
      });

      return {
        masons: otherMasons.map((m) => ({ id: m.id, name: m.name })),
        message: otherMasons.length > 0 ? `إخوتك في الدور (${ROLE_NAMES.MASON}): ${otherMasons.map((m) => m.name).join("، ")}` : `انت الـ${ROLE_NAMES.MASON} الوحيد`,
      };
    };
  }
}
