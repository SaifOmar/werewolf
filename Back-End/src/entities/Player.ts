import { Role } from "./roles";
import { Phase } from "@werewolf/shared";
import { Game } from "./game";
import { randomUUID } from "crypto";
export class Player {
  name: string;
  id: string;
  lastActionResult: Record<string, unknown> | null = null;
  private role: Role;
  private originalRole: Role;
  /** What this player legitimately knows about their own card. */
  private knownRole: Role | null = null;

  constructor(name: string) {
    this.name = name;
    this.id = randomUUID();
  }
  getOriginalRole(): Role {
    return this.originalRole;
  }
  AddRole(role: Role): void {
    this.originalRole = role;
    this.role = role;
    this.knownRole = role;
  }
  getRole(): Role {
    return this.role;
  }
  /**
   * Swap the player's card. The card only becomes part of the player's
   * own knowledge (and thus visible in their snapshot) when THEY saw it —
   * e.g. a robber viewing their steal, or an insomniac checking at dawn.
   * Blind swaps (drunk/warlock/troublemaker victims) keep belief frozen.
   */
  setRole(role: Role, knownToSelf = false): void {
    this.role = role;
    if (knownToSelf) {
      this.knownRole = role;
    }
  }
  getKnownRole(): Role {
    return this.knownRole ?? this.role;
  }
  toString(): string {
    return this.name;
  }

  reset() {
    this.role = null;
    this.originalRole = null;
    this.knownRole = null;
  }

  performOriginalAction(game: Game, action?: any) {
    if (game.phase !== Phase.Role && game.phase !== Phase.Night) {
      throw new Error("Cannot perform action in this phase");
    }
    return this.originalRole.performAction()(game, this, action);
  }
}
