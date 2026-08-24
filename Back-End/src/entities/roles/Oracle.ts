import { Role } from "./Role";
import { ROLE_REGISTRY, ROLE_NAMES, Team } from "@werewolf/shared";
import { Game } from "../game";
import { Player } from "../Player";
import { roleIdOf } from "./roleId";

export interface OracleAction {
  type: "oracle";
}

export const createOracleAction = (): OracleAction => ({
  type: "oracle",
});

export class Oracle implements Role {
  public id: string;
  public name: string = ROLE_REGISTRY.oracle.name;
  public team: Team = Team.Village;
  public description: string = ROLE_REGISTRY.oracle.description;

  constructor() {
    this.id = Math.random().toString(36).substring(2, 10);
  }

  public performAction(): Function {
    return function (game: Game, player: Player, action: OracleAction) {
      if (action.type !== "oracle") {
        throw new Error(`Invalid action for Oracle. Expected 'oracle', received '${action.type}'.`);
      }

      // Collect action results from all other players who have acted
      const otherResults: Array<{ role: string; result: Record<string, unknown> }> = [];

      for (const p of game.players) {
        if (p.id === player.id) continue;

        const result = (p as unknown as { lastActionResult?: Record<string, unknown> }).lastActionResult;
        if (!result) continue;

        const roleName = p.getOriginalRole().name;
        otherResults.push({ role: roleName, result });
      }

      // No results available — fallback
      if (otherResults.length === 0) {
        return {
          hasVision: false,
          message: "الأرواح ساكتة… مفيش رؤيات لليلة دي.",
        };
      }

      // Pick a random result
      const picked = otherResults[Math.floor(Math.random() * otherResults.length)];
      const visionMessage = buildVisionMessage(picked.role, picked.result);

      return {
        hasVision: true,
        sourceRole: picked.role,
        vision: visionMessage,
        message: visionMessage,
      };
    };
  }
}

/**
 * Builds a role-only vision message from an action result.
 * The Oracle sees role names, NOT player names.
 */
function buildVisionMessage(roleName: string, result: Record<string, unknown>): string {
  const r = roleIdOf(roleName);

  switch (r) {
    case "werewolf": {
      if (result.isAlone === true && typeof result.groundCard === "string") {
        return `${ROLE_NAMES.WEREWOLF} شاف ${result.groundCard} على الأرض.`;
      }
      const wolves = result.werewolves as Array<{ name: string }> | undefined;
      if (Array.isArray(wolves) && wolves.length > 0) {
        const names = wolves.map((w) => w.name).join(", ");
        return `${ROLE_NAMES.WEREWOLF} شاف إن شلته هي: ${names}.`;
      }
      return `${ROLE_NAMES.WEREWOLF} عمل حركته.`;
    }

    case "minion": {
      const wolves = result.werewolves as Array<{ name: string }> | undefined;
      if (Array.isArray(wolves) && wolves.length > 0) {
        const names = wolves.map((w) => w.name).join(", ");
        return `الـ${ROLE_NAMES.MINION} شاف إن الحرامية هم: ${names}.`;
      }
      return `الـ${ROLE_NAMES.MINION} ملقاش حد.`;
    }

    case "seer": {
      if (result.actionType === "player" && typeof result.role === "string") {
        return `${ROLE_NAMES.SEER} شافت ${result.role}.`;
      }
      if (result.actionType === "ground" && typeof result.groundRole1 === "string" && typeof result.groundRole2 === "string") {
        return `${ROLE_NAMES.SEER} شافت ${result.groundRole1} و${result.groundRole2} على الأرض.`;
      }
      return `${ROLE_NAMES.SEER} عملت حركتها.`;
    }

    case "clone": {
      if (typeof result.clonedRole === "string") {
        return `الـ${ROLE_NAMES.CLONE} استنسخ دور ${result.clonedRole}.`;
      }
      return `الـ${ROLE_NAMES.CLONE} عمل حركته.`;
    }

    case "mason": {
      const masons = result.masons as Array<{ name: string }> | undefined;
      if (Array.isArray(masons) && masons.length > 0) {
        const names = masons.map((m) => m.name).join(", ");
        return `الـ${ROLE_NAMES.MASON} شاف زملاءه: ${names}.`;
      }
      return `الـ${ROLE_NAMES.MASON} لوحدو.`;
    }

    case "robber": {
      if (typeof result.newRole === "string") {
        return `الـ${ROLE_NAMES.ROBBER} سرق دور وبقى ${result.newRole}.`;
      }
      return `الـ${ROLE_NAMES.ROBBER} عمل حركته.`;
    }

    case "troublemaker": {
      if (typeof result.player1Name === "string" && typeof result.player2Name === "string") {
        return `الـ${ROLE_NAMES.TROUBLEMAKER} بدلت بين ${result.player1Name} و${result.player2Name}.`;
      }
      return `الـ${ROLE_NAMES.TROUBLEMAKER} بدلت لاعبين.`;
    }

    case "drunk":
      return `الـ${ROLE_NAMES.DRUNK} بدل دوره بكارت أرض.`;

    case "insomniac": {
      if (result.hasChanged === true && typeof result.currentRole === "string") {
        return `دور الـ${ROLE_NAMES.INSOMNIAC} اتبادل بقى ${result.currentRole}.`;
      }
      return `دور الـ${ROLE_NAMES.INSOMNIAC} ماتبادلش.`;
    }

    case "joker": {
      if (typeof result.groundRole === "string") {
        return `الـ${ROLE_NAMES.JOKER} شاف ${result.groundRole} على الأرض.`;
      }
      return `الـ${ROLE_NAMES.JOKER} عمل حركته.`;
    }

    case "warlock": {
      if (typeof result.targetName === "string") {
        return `${ROLE_NAMES.WARLOCK} بدل دور ${result.targetName} بكارت أرض.`;
      }
      return `${ROLE_NAMES.WARLOCK} بدل دور لاعب بكارت أرض.`;
    }

    default:
      return `${roleName} عمل حركته.`;
  }
}
