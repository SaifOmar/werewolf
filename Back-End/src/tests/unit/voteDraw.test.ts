import { Phase, ROLE_REGISTRY as R } from "@werewolf/shared";
import { Game } from "../../entities/game";
import { BuildGameSnapshot } from "../../entities/game/Game";
import { Player } from "../../entities/Player";
import {
  Werewolf,
  Seer,
  Mason,
  Joker,
  Troublemaker,
  Robber,
  Minion,
} from "../../entities/roles";

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

const mockIo = { sockets: { sockets: new Map() } };

/**
 * Draw (tie) handling: the snapshot must report exactly what the vote
 * resolver decided — a tie eliminates NOBODY and must never surface a
 * phantom eliminated player.
 */
describe("Vote draw reporting", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(mockLogger as any, mockIo as any);
    game.phase = Phase.Vote;
    game.players = [];
    game.groundRoles = [];
  });

  function setup(specs: Array<[string, any]>) {
    const players = specs.map(([n]) => new Player(n));
    game.players = players;
    players.forEach((p, i) => p.AddRole(new specs[i][1]()));
    return players;
  }

  it("two-way tie between village members → draw, nobody eliminated, wolves win", () => {
    const [a, b, c] = setup([["A", Seer], ["B", Mason], ["W", Werewolf]]);
    game.playerVote(a.id, b.id);
    game.playerVote(b.id, a.id);
    game.playerVote(c.id, "noWerewolf");

    expect(game.phase).toBe(Phase.EndGame);
    expect(game.finalIsDraw).toBe(true);

    const snap = BuildGameSnapshot(game, c.id);
    expect(snap.isDraw).toBe(true);
    expect(snap.eliminatedPlayerId).toBeNull();
    expect(snap.winners).toBe("villain"); // non-wolf tie → villains win
  });

  it("clear majority eliminates that player and reports them", () => {
    const [a, b, c] = setup([["A", Mason], ["W", Werewolf], ["S", Seer]]);
    // A and C vote out the werewolf; B votes for A
    game.playerVote(a.id, b.id);
    game.playerVote(c.id, b.id);
    game.playerVote(b.id, a.id);

    expect(game.finalIsDraw).toBe(false);
    expect(game.eliminatedPlayerId).toBe(b.id);

    const snap = BuildGameSnapshot(game, c.id);
    expect(snap.isDraw).toBe(false);
    expect(snap.eliminatedPlayerId).toBe(b.id);
    expect(snap.winners).toBe("village"); // wolf voted out → village wins
  });

  it("joker in a tie → neutral wins, nobody eliminated", () => {
    const [j, s, w] = setup([["J", Joker], ["S", Seer], ["W", Werewolf]]);
    game.playerVote(j.id, s.id);
    game.playerVote(s.id, j.id);
    game.playerVote(w.id, "noWerewolf");

    expect(game.finalIsDraw).toBe(true);
    const snap = BuildGameSnapshot(game, w.id);
    expect(snap.isDraw).toBe(true);
    expect(snap.eliminatedPlayerId).toBeNull();
    expect(snap.winners).toBe("neutral");
  });

  it("regression: tied snapshot can no longer claim an elimination", () => {
    // Mirrors the live-sim finding: a 2-2-1-1 tie previously produced a
    // phantom eliminated player because snapshots re-derived results.
    const [a, b, c, d, e, f] = setup([
      ["A", Troublemaker],
      ["B", Robber],
      ["C", Minion],
      ["D", Mason],
      ["E", Seer],
      ["F", Werewolf],
    ]);
    void f;
    game.votes = [
      { voter: a.id, vote: d.id },
      { voter: b.id, vote: e.id },
      { voter: c.id, vote: d.id },
      { voter: d.id, vote: e.id },
      { voter: e.id, vote: a.id },
      { voter: f.id, vote: a.id },
    ];
    game.finish();

    const snap = BuildGameSnapshot(game, a.id);
    // invariant: isDraw and eliminated must agree with each other
    expect(!!snap.eliminatedPlayerId).toBe(!snap.isDraw);
    if (game.finalIsDraw) {
      expect(snap.isDraw).toBe(true);
      expect(snap.eliminatedPlayerId).toBeNull();
    }
  });
});
