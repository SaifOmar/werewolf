import { Phase, ROLE_REGISTRY as R } from "@werewolf/shared";
import { Game } from "../../entities/game";
import { BuildGameSnapshot } from "../../entities/game/Game";
import { Player } from "../../entities/Player";
import {
  Robber,
  createRobberAction,
  Drunk,
  createDrunkAction,
  Warlock,
  createWarlockAction,
  Troublemaker,
  createTroublemakerAction,
  Clone,
  createCloneAction,
  Insomniac,
  createInsomniacAction,
  Mason,
  Seer,
  Werewolf,
  Minion,
} from "../../entities/roles";

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockIo = {
  sockets: { sockets: new Map() },
};

/**
 * Secrecy regression tests: a player's snapshot must only ever reflect
 * what THEY legitimately know about their own card. Silent swaps
 * (robber victims, drunk/warlock/troublemaker targets) must not leak.
 */
describe("Known-role secrecy", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(mockLogger as any, mockIo as any);
    game.phase = Phase.Night;
    game.players = [];
  });

  const privRoleOf = (p: Player) =>
    BuildGameSnapshot(game, p.id).playerPrivateData!.currentRole;

  it("robber sees the stolen card but the victim stays ignorant", () => {
    const robberPlayer = new Player("Robber");
    const victim = new Player("Victim");
    game.players = [robberPlayer, victim];
    robberPlayer.AddRole(new Robber());
    victim.AddRole(new Seer());

    const result = new Robber().performAction()(
      game,
      robberPlayer,
      createRobberAction(victim),
    );

    // Real state swapped
    expect(robberPlayer.getRole().name).toBe(R.seer.name);
    expect(victim.getRole().name).toBe(R.robber.name);
    expect(result.newRole).toBe(R.seer.name);

    // Snapshots show knowledge, not truth
    expect(privRoleOf(robberPlayer)).toBe(R.seer.name); // robber saw it
    expect(privRoleOf(victim)).toBe(R.seer.name);       // victim still believes their old card
  });

  it("robber stealing from a werewolf does not flip the victim's visible team", () => {
    const robberPlayer = new Player("Robber");
    const victim = new Player("Victim");
    game.players = [robberPlayer, victim];
    robberPlayer.AddRole(new Robber());
    victim.AddRole(new Werewolf());

    new Robber().performAction()(game, robberPlayer, createRobberAction(victim));

    // Truth: victim now really holds the robber's old (village) card
    expect(victim.getRole().name).toBe(R.robber.name);
    expect(victim.getRole().team).toBe("village");
    // But their snapshot must keep showing the werewolf belief — no team flip leak
    const victimPriv = BuildGameSnapshot(game, victim.id).playerPrivateData!;
    expect(victimPriv.currentRole).toBe(R.werewolf.name);
    expect(victimPriv.roleTeam).toBe("villain");
  });

  it("drunk swaps blindly and never learns the new card", () => {
    const drunkPlayer = new Player("Drunk");
    game.players = [drunkPlayer];
    drunkPlayer.AddRole(new Drunk());
    game.groundRoles = [new Seer(), new Mason(), new Minion()];

    new Drunk().performAction()(game, drunkPlayer, createDrunkAction(game.groundRoles[0].id));

    expect(drunkPlayer.getRole().name).not.toBe(R.drunk.name); // real card changed
    expect(privRoleOf(drunkPlayer)).toBe(R.drunk.name);        // belief frozen
    expect(game.groundRoles.map((r) => r.name)).toContain(R.drunk.name);
  });

  it("warlock target silently receives a ground card", () => {
    const warlockPlayer = new Player("Warlock");
    const target = new Player("Target");
    game.players = [warlockPlayer, target];
    warlockPlayer.AddRole(new Warlock());
    target.AddRole(new Mason());
    game.groundRoles = [new Minion()];

    new Warlock().performAction()(game, warlockPlayer, createWarlockAction({ id: target.id }));

    expect(target.getRole().name).toBe(R.minion.name);   // real change
    expect(privRoleOf(target)).toBe(R.mason.name);       // target blind
    expect(privRoleOf(warlockPlayer)).toBe(R.warlock.name); // warlock blind too
  });

  it("troublemaker swap leaves both victims ignorant", () => {
    const tm = new Player("TM");
    const p1 = new Player("P1");
    const p2 = new Player("P2");
    game.players = [tm, p1, p2];
    tm.AddRole(new Troublemaker());
    p1.AddRole(new Seer());
    p2.AddRole(new Mason());

    new Troublemaker().performAction()(game, tm, {
      type: "troublemaker",
      player1: p1,
      player2: p2,
    });

    expect(p1.getRole().name).toBe(R.mason.name); // real swap happened
    expect(p2.getRole().name).toBe(R.seer.name);
    expect(privRoleOf(p1)).toBe(R.seer.name);     // beliefs untouched
    expect(privRoleOf(p2)).toBe(R.mason.name);
  });

  it("clone knows the copied card; the copied player is unaffected", () => {
    const clonePlayer = new Player("Clone");
    const target = new Player("Target");
    game.players = [clonePlayer, target];
    clonePlayer.AddRole(new Clone());
    target.AddRole(new Werewolf());

    new Clone().performAction()(game, clonePlayer, createCloneAction(target as any));

    expect(clonePlayer.getRole().name).toBe(R.werewolf.name); // copy took effect
    expect(target.getRole().name).toBe(R.werewolf.name);       // target keeps theirs
    expect(privRoleOf(clonePlayer)).toBe(R.werewolf.name);     // clone saw it
    expect(privRoleOf(target)).toBe(R.werewolf.name);          // unchanged anyway
  });

  it("insomniac learns the truth — even after being robbed earlier in the night", () => {
    const insomniacPlayer = new Player("Insomniac");
    const robberPlayer = new Player("Robber");
    game.players = [insomniacPlayer, robberPlayer];
    insomniacPlayer.AddRole(new Insomniac());
    robberPlayer.AddRole(new Robber());

    // Earlier that night: robber stole from the insomniac
    new Robber().performAction()(game, robberPlayer, createRobberAction(insomniacPlayer));
    expect(privRoleOf(insomniacPlayer)).toBe(R.insomniac.name); // still blind pre-check

    // Insomniac checks at dawn
    const result = new Insomniac().performAction()(game, insomniacPlayer, createInsomniacAction());

    expect(result.hasChanged).toBe(true);
    expect(result.currentRole).toBe(R.robber.name);
    expect(privRoleOf(insomniacPlayer)).toBe(R.robber.name); // now they know
  });

  it("double-hit victim (robbed then troublemaker-swapped) never learns", () => {
    const tm = new Player("TM");
    const robberPlayer = new Player("Robber");
    const victim = new Player("Victim");
    const other = new Player("Other");
    game.players = [tm, robberPlayer, victim, other];
    tm.AddRole(new Troublemaker());
    robberPlayer.AddRole(new Robber());
    victim.AddRole(new Mason());
    other.AddRole(new Minion());

    new Robber().performAction()(game, robberPlayer, createRobberAction(victim));
    new Troublemaker().performAction()(game, tm, {
      type: "troublemaker",
      player1: victim,
      player2: other,
    });

    // Victim's real card changed twice, yet belief stayed on the original
    expect(privRoleOf(victim)).toBe(R.mason.name);
  });
});
