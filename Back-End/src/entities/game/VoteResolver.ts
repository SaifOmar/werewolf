import { Team, ROLE_NAMES } from "@werewolf/shared";
import type { PlayerId, Vote } from "@werewolf/shared";
import { Player } from "../Player";
import { Logger } from "../../utils/Logger";
import { roleIdOf } from "../roles/roleId";

export class VoteResolver {
  constructor(private logger: Logger) {}

  getVoteResults(votes: Vote[]): Map<string, number> {
    let mapVotes = new Map<string, number>();

    for (let i = 0; i < votes.length; i++) {
      let vote = votes[i];
      if (mapVotes.has(vote.vote)) {
        mapVotes.set(vote.vote, mapVotes.get(vote.vote) + 1);
      } else {
        mapVotes.set(vote.vote, 1);
      }
    }

    return mapVotes;
  }

  calculateResults(mapVotes: Map<PlayerId, number>, players: Player[]): { winners: string; isDraw: boolean; eliminatedPlayerId: string | null; winningTeam: Team } {
    const getPlayerById = (id: string): Player => {
      const player = players.find((p) => p.id === id);
      if (!player) throw new Error(`Player with id ${id} not found`);
      return player;
    };

    const maxVotes = Math.max(...Array.from(mapVotes.values()));
    const topVoted = Array.from(mapVotes.entries()).filter(([_, count]) => count === maxVotes);

    let winners: Team;

    // Draw — no elimination
    if (topVoted.length > 1) {
      const tiedPlayerIds = topVoted.map(([id]) => id).filter((id) => id !== "noWerewolf");
      const allWerewolves =
        tiedPlayerIds.length > 0 &&
        tiedPlayerIds.every((id) => {
          const player = getPlayerById(id);
          return roleIdOf(player.getRole().name) === "werewolf";
        });

      if (allWerewolves) {
        winners = Team.Village;
      } else {
        const jokerTied = tiedPlayerIds.some((id) => {
          const player = getPlayerById(id);
          return player.getRole().team === Team.Neutral;
        });

        if (jokerTied) {
          winners = Team.Neutral;
        } else {
          winners = Team.Villain;
        }
      }

      return { winners, isDraw: true, eliminatedPlayerId: null, winningTeam: winners };
    }

    // Single top-voted target
    const voted = topVoted[0][0];

    if (voted === "noWerewolf") {
      for (const player of players) {
        if (roleIdOf(player.getRole().name) === "werewolf") {
          winners = Team.Villain;
          return { winners, isDraw: false, eliminatedPlayerId: null, winningTeam: winners };
        }
      }
      winners = Team.Village;
      return { winners, isDraw: false, eliminatedPlayerId: null, winningTeam: winners };
    }

    const votedPlayerRole = getPlayerById(voted).getRole();

    if (votedPlayerRole.team === Team.Neutral) {
      winners = Team.Neutral;
    } else if (roleIdOf(votedPlayerRole.name) === "minion") {
      winners = Team.Villain;
    } else if (votedPlayerRole.team === Team.Villain) {
      winners = Team.Village;
    } else {
      winners = Team.Villain;
    }

    return { winners, isDraw: false, eliminatedPlayerId: voted, winningTeam: winners };
  }

  buildActionHistory(players: Player[]): Array<{ playerId: string; role: string; playerName: string; description: string }> {
    // Wake order, derived from the shared registry so renames can't break it
    const roleOrder = [
      ROLE_NAMES.WEREWOLF,
      ROLE_NAMES.MINION,
      ROLE_NAMES.CLONE,
      ROLE_NAMES.SEER,
      ROLE_NAMES.MASON,
      ROLE_NAMES.ROBBER,
      ROLE_NAMES.TROUBLEMAKER,
      ROLE_NAMES.DRUNK,
      ROLE_NAMES.WARLOCK,
      ROLE_NAMES.INSOMNIAC,
      ROLE_NAMES.JOKER,
      ROLE_NAMES.ORACLE,
    ];
    const actionHistory: Array<{ playerId: string; role: string; playerName: string; description: string }> = [];
    for (const roleName of roleOrder) {
      const playersWithRole = players.filter((p) => p.getOriginalRole().name === roleName);

      for (const player of playersWithRole) {
        const result = (player as any).lastActionResult;
        if (!result) continue;

        actionHistory.push({
          playerId: player.id,
          role: roleName,
          playerName: player.name,
          description: result.message || "Performed their action",
        });
      }
    }

    return actionHistory;
  }
}
