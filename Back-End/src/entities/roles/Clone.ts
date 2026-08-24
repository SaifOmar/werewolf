import { Role } from "./Role";
import { ROLE_REGISTRY, ROLE_NAMES, Team } from "@werewolf/shared";
import { Game } from "../game";
import { Player } from "../Player";
import { roleIdOf } from "./roleId";

const CLONE_FOLLOW_UP_ROLES = ["seer", "robber", "troublemaker", "warlock"];
const CLONE_AUTO_ACTION_ROLES = ["drunk", "joker"];
const CLONE_DELAYED_WAKE_ROLES = ["mason", "insomniac", "oracle"];

export interface CloneAction {
  type: "clone";
  targetPlayer: Player;
}

export const createCloneAction = (targetPlayer: Player): CloneAction => ({
  type: "clone",
  targetPlayer,
});

export class Clone implements Role {
  public id: string;
  public name: string = ROLE_REGISTRY.clone.name;
  public team: Team = Team.Village;
  public description: string = ROLE_REGISTRY.clone.description;

  constructor() {
    this.id = Math.random().toString(36).substring(2, 10);
  }

  public performAction(): Function {
    return function (game: Game, player: Player, action: CloneAction) {
      if (action.type !== "clone") {
        throw new Error(`Invalid action for Clone. Expected 'clone', received '${action.type}'.`);
      }

      if (!action.targetPlayer) {
        throw new Error("Clone action requires a target player");
      }

      if (action.targetPlayer.id === player.id) {
        throw new Error("Clone cannot target themselves");
      }

      const targetPlayer = game.getPlayerById(action.targetPlayer.id);
      const clonedRole = targetPlayer.getOriginalRole();
      const clonedRoleName = roleIdOf(clonedRole.name);

      // The clone looked at the target's card — they know what they became.
      // The target is copied, not swapped: nothing changes for them.
      player.setRole(clonedRole, true);
      (player as any)._wasClone = true;
      (player as any)._clonedRoleName = clonedRoleName;
      (player as any)._clonedRole = clonedRole;

      const needsSecondAction = CLONE_FOLLOW_UP_ROLES.includes(clonedRoleName);
      let autoResult: any = null;

      if (CLONE_AUTO_ACTION_ROLES.includes(clonedRoleName)) {
        autoResult = clonedRole.performAction()(game, player, { type: clonedRoleName });
      } else if (!needsSecondAction) {
        switch (clonedRoleName) {
          case "werewolf":
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت ${ROLE_NAMES.WEREWOLF}… انت في فريق الشر دلوقتي.`,
            };
            break;

          case "minion":
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت الـ${ROLE_NAMES.MINION}… انت في فريق الشر دلوقتي.`,
            };
            break;

          case "mason":
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت الـ${ROLE_NAMES.MASON}… هتصحى مع زملائك آخر الليل.`,
            };
            break;

          case "insomniac":
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت الـ${ROLE_NAMES.INSOMNIAC}… هتشيك على دورك آخر الليل.`,
            };
            break;

          case "oracle":
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت الـ${ROLE_NAMES.ORACLE}… هتيجيك رؤية آخر الليل.`,
            };
            break;

          default:
            autoResult = {
              message: `استنسخت ${targetPlayer.name} وبقيت ${clonedRole.name}.`,
            };
            break;
        }
      }

      let groundCards: Array<{ id: string; label: string }> | null = null;
      if (needsSecondAction && (clonedRoleName === "seer" || clonedRoleName === "warlock")) {
        groundCards = game.groundRoles.map((r, index) => ({
          id: r.id,
          label: `Ground Card ${index + 1}`,
        }));
      }

      let otherPlayers: Array<{ id: string; name: string }> | null = null;
      if (needsSecondAction && (clonedRoleName === "seer" || clonedRoleName === "robber" || clonedRoleName === "troublemaker" || clonedRoleName === "warlock")) {
        otherPlayers = game.players.filter((p) => p.id !== player.id).map((p) => ({ id: p.id, name: p.name }));
      }

      return {
        clonedRole: clonedRole.name,
        clonedRoleTeam: clonedRole.team,
        needsSecondAction,
        autoResult,
        groundCards,
        otherPlayers,
        delayedWake: CLONE_DELAYED_WAKE_ROLES.includes(clonedRoleName),
        message: needsSecondAction ? `استنسخت ${targetPlayer.name} وبقيت ${clonedRole.name}… اعمل حركته دلوقتي!` : autoResult?.message || `بقيت ${clonedRole.name}`,
      };
    };
  }
}
