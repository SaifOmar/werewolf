import { Phase, Team, ROLE_REGISTRY as R } from "@werewolf/shared";
import { Game } from "../../entities/game";
import { Player } from "../../entities/Player";
import {
  Werewolf,
  Seer,
  SeerActionType,
  createSeerAction,
  Minion,
  createMinionAction,
  Drunk,
  createDrunkAction,
  Robber,
  createRobberAction,
  Troublemaker,
  createTroublemakerAction,
  Mason,
  Joker,
  createJokerAction,
  Insomniac,
  createInsomniacAction,
  Clone,
  createCloneAction,
  createWerewolfAction,
} from "../../entities/roles";

// Mock logger for testing
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockIo = {
  sockets: {
    sockets: new Map(),
  },
};

describe("Game Night Phase Feature Tests", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(mockLogger as any, mockIo as any);
    game.phase = Phase.Night;
  });

  describe("Full Game Night Simulation", () => {
    it("should execute a complete night phase with all role actions in sequence", () => {
      // Setup: Create a game with all major role types
      const werewolfPlayer = new Player("Werewolf Player");
      const seerPlayer = new Player("Seer Player");
      const minionPlayer = new Player("Minion Player");
      const drunkenPlayer = new Player("Drunk Player");
      const robberPlayer = new Player("Robber Player");
      const troublemakerPlayer = new Player("Troublemaker Player");
      const masonPlayer = new Player("Mason Player");
      const insomniakPlayer = new Player("Insomniac Player");

      const werewolf = new Werewolf();
      const seer = new Seer();
      const minion = new Minion();
      const drunk = new Drunk();
      const robber = new Robber();
      const troublemaker = new Troublemaker();
      const mason = new Mason();
      const insomniac = new Insomniac();

      game.players = [
        werewolfPlayer,
        seerPlayer,
        minionPlayer,
        drunkenPlayer,
        robberPlayer,
        troublemakerPlayer,
        masonPlayer,
        insomniakPlayer,
      ];

      werewolfPlayer.AddRole(werewolf);
      seerPlayer.AddRole(seer);
      minionPlayer.AddRole(minion);
      drunkenPlayer.AddRole(drunk);
      robberPlayer.AddRole(robber);
      troublemakerPlayer.AddRole(troublemaker);
      masonPlayer.AddRole(mason);
      insomniakPlayer.AddRole(insomniac);

      const groundRoles = [new Joker(), new Mason(), new Werewolf()];
      game.groundRoles = groundRoles;

      // Execute night actions in typical order
      // 1. Werewolf action
      const werewolfAction = createWerewolfAction();
      const werewolfResult = werewolf.performAction()(game, werewolfPlayer, werewolfAction);
      expect(werewolfResult.message).toBeTruthy();

      // 2. Minion action
      const minionAction = createMinionAction();
      const minionResult = minion.performAction()(game, minionPlayer, minionAction);
      expect(minionResult.werewolves).toHaveLength(1);

      // 3. Seer action - look at a player
      const seerAction = createSeerAction.seePlayer(minionPlayer);
      const seerResult = seer.performAction()(game, seerPlayer, seerAction);
      expect(seerResult.role).toBe(R.minion.name);

      // 4. Mason action
      const masonAction = { type: "mason" };
      const masonResult = mason.performAction()(game, masonPlayer, masonAction);
      expect(masonResult.masons).toBeDefined();

      // 5. Robber action - steal from minion
      const robberAction = createRobberAction(minionPlayer);
      const robberResult = robber.performAction()(game, robberPlayer, robberAction);
      expect(robberResult.newRole).toBe(R.minion.name);
      expect(robberPlayer.getRole().name).toBe(R.minion.name);
      expect(minionPlayer.getRole().name).toBe(R.robber.name);

      // 6. Troublemaker action - swap minion and drunk (not themselves)
      const troublemakerAction = createTroublemakerAction(minionPlayer, drunkenPlayer);
      const troublemakerResult = troublemaker.performAction()(game, troublemakerPlayer, troublemakerAction);
      expect(troublemakerResult.player1Name).toBe("Minion Player");
      expect(troublemakerResult.player2Name).toBe("Drunk Player");
      // After swap: minion (who has Robber) and drunk swap
      // So minion now has Drunk, drunk now has Robber (from minion)
      expect(minionPlayer.getRole().name).toBe(R.drunk.name);
      expect(drunkenPlayer.getRole().name).toBe(R.robber.name);

      // 7. Drunk action - swap with ground
      const drunkerGroundRoleId = groundRoles[0].id;
      const drunkAction = createDrunkAction(drunkerGroundRoleId);
      const drunkResult = drunk.performAction()(game, drunkenPlayer, drunkAction);
      expect(drunkResult.success).toBe(true);
      expect(drunkenPlayer.getRole().name).toBe(R.joker.name); // took ground role

      // 8. Insomniac action - check current role
      const insomniackAction = createInsomniacAction();
      const insomniacResult = insomniac.performAction()(game, insomniakPlayer, insomniackAction);
      expect(insomniacResult.currentRole).toBe(R.insomniac.name);
      expect(insomniacResult.hasChanged).toBe(false);

      // All actions completed successfully
      expect(mockLogger.info).toBeDefined();
    });
  });

  describe("Clone in Game Night Phase", () => {
    it("should handle clone copying passive role (Werewolf)", () => {
      const clonePlayer = new Player(R.clone.name);
      const werewolfTarget = new Player("Werewolf Target");
      const anotherWerewolf = new Player("Another Werewolf");

      const clone = new Clone();
      const targetWerewolf = new Werewolf();
      const otherWerewolf = new Werewolf();

      game.players = [clonePlayer, werewolfTarget, anotherWerewolf];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      werewolfTarget.AddRole(targetWerewolf);
      anotherWerewolf.AddRole(otherWerewolf);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Werewolf
      const cloneAction = createCloneAction(werewolfTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.werewolf.name);
      expect(cloneResult.needsSecondAction).toBe(false); // Werewolf is passive
      expect(clonePlayer.getRole().name).toBe(R.werewolf.name);
      expect(cloneResult.autoResult.message).toContain(`بقيت ${R.werewolf.name}`);
    });

    it("should handle clone copying active role (Seer) and needing second action", () => {
      const clonePlayer = new Player(R.clone.name);
      const seerTarget = new Player("Seer Target");
      const vulnerablePlayer = new Player("Vulnerable");

      const clone = new Clone();
      const targetSeer = new Seer();

      game.players = [clonePlayer, seerTarget, vulnerablePlayer];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      seerTarget.AddRole(targetSeer);
      vulnerablePlayer.AddRole(new Minion());

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Seer
      const cloneAction = createCloneAction(seerTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.seer.name);
      expect(cloneResult.needsSecondAction).toBe(true); // Seer is active
      expect(clonePlayer.getRole().name).toBe(R.seer.name);
      expect(cloneResult.message).toContain(R.seer.name);
    });

    it("should handle clone copying Minion (passive role)", () => {
      const clonePlayer = new Player(R.clone.name);
      const minionTarget = new Player("Minion Target");
      const werewolfInGame = new Player(R.werewolf.name);

      const clone = new Clone();
      const targetMinion = new Minion();

      game.players = [clonePlayer, minionTarget, werewolfInGame];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      minionTarget.AddRole(targetMinion);
      werewolfInGame.AddRole(new Werewolf());

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Minion
      const cloneAction = createCloneAction(minionTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.minion.name);
      expect(cloneResult.needsSecondAction).toBe(false); // Minion is passive
      expect(clonePlayer.getRole().name).toBe(R.minion.name);
      expect(cloneResult.autoResult.message).toContain(R.minion.name);
    });

    it("should handle clone copying Drunk and swapping with ground card", () => {
      const clonePlayer = new Player(R.clone.name);
      const drunkTarget = new Player("Drunk Target");

      const clone = new Clone();
      const targetDrunk = new Drunk();
      const groundWerewolf = new Werewolf();

      game.players = [clonePlayer, drunkTarget];
      game.groundRoles = [groundWerewolf, new Mason(), new Joker()];

      clonePlayer.AddRole(clone);
      drunkTarget.AddRole(targetDrunk);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Drunk
      const cloneAction = createCloneAction(drunkTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.drunk.name);
      expect(cloneResult.needsSecondAction).toBe(false);
      expect(cloneResult.autoResult.success).toBe(true);
      expect(cloneResult.autoResult.targetGroundIndex).toBeGreaterThanOrEqual(0);
    });

    it("should handle clone copying Robber and swapping roles", () => {
      const clonePlayer = new Player(R.clone.name);
      const robberTarget = new Player("Robber Target");
      const victimPlayer = new Player("Victim");

      const clone = new Clone();
      const targetRobber = new Robber();
      const victimRole = new Seer();

      game.players = [clonePlayer, robberTarget, victimPlayer];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      robberTarget.AddRole(targetRobber);
      victimPlayer.AddRole(victimRole);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Robber
      const cloneAction = createCloneAction(robberTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.robber.name);
      expect(cloneResult.needsSecondAction).toBe(true); // Robber is active
      expect(clonePlayer.getRole().name).toBe(R.robber.name);
    });

    it("should handle clone copying Troublemaker and swapping two targets", () => {
      const clonePlayer = new Player(R.clone.name);
      const troublemakerTarget = new Player("Troublemaker Target");
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");

      const clone = new Clone();
      const targetTroublemaker = new Troublemaker();

      game.players = [clonePlayer, troublemakerTarget, player1, player2];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      troublemakerTarget.AddRole(targetTroublemaker);
      player1.AddRole(new Werewolf());
      player2.AddRole(new Seer());

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Troublemaker
      const cloneAction = createCloneAction(troublemakerTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.troublemaker.name);
      expect(cloneResult.needsSecondAction).toBe(true); // Troublemaker is active
      expect(clonePlayer.getRole().name).toBe(R.troublemaker.name);
    });

    it("should handle clone copying Insomniac (passive role)", () => {
      const clonePlayer = new Player(R.clone.name);
      const insomniacTarget = new Player("Insomniac Target");

      const clone = new Clone();
      const targetInsomniac = new Insomniac();

      game.players = [clonePlayer, insomniacTarget];
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      clonePlayer.AddRole(clone);
      insomniacTarget.AddRole(targetInsomniac);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Insomniac
      const cloneAction = createCloneAction(insomniacTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.insomniac.name);
      expect(cloneResult.needsSecondAction).toBe(false); // Insomniac is passive
      expect(clonePlayer.getRole().name).toBe(R.insomniac.name);
      expect(clonePlayer.getOriginalRole().name).toBe(R.clone.name);
      expect(cloneResult.autoResult.message).toContain(R.insomniac.name);
    });

    it("should handle clone copying Joker (passive role)", () => {
      const clonePlayer = new Player(R.clone.name);
      const jokerTarget = new Player("Joker Target");

      const clone = new Clone();
      const targetJoker = new Joker();
      const groundCard = new Werewolf();

      game.players = [clonePlayer, jokerTarget];
      game.groundRoles = [groundCard, new Mason(), new Drunk()];

      clonePlayer.AddRole(clone);
      jokerTarget.AddRole(targetJoker);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Joker
      const cloneAction = createCloneAction(jokerTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.joker.name);
      expect(cloneResult.needsSecondAction).toBe(false); // Joker is passive
      expect(clonePlayer.getRole().name).toBe(R.joker.name);
      expect(cloneResult.autoResult.groundRole).toBeTruthy();
      expect(cloneResult.autoResult.targetGroundIndex).toBeGreaterThanOrEqual(0);
    });

    it("should handle clone copying Mason and seeing other masons", () => {
      const clonePlayer = new Player(R.clone.name);
      const masonTarget = new Player("Mason Target");
      const otherMason = new Player("Other Mason");

      const clone = new Clone();
      const targetMason = new Mason();
      const anotherMason = new Mason();

      game.players = [clonePlayer, masonTarget, otherMason];
      game.groundRoles = [new Drunk(), new Joker(), new Werewolf()];

      clonePlayer.AddRole(clone);
      masonTarget.AddRole(targetMason);
      otherMason.AddRole(anotherMason);

      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      // Clone performs action to copy Mason
      const cloneAction = createCloneAction(masonTarget);
      const cloneResult = clone.performAction()(game, clonePlayer, cloneAction);

      expect(cloneResult.clonedRole).toBe(R.mason.name);
      expect(cloneResult.needsSecondAction).toBe(false); // Mason is passive
      expect(clonePlayer.getRole().name).toBe(R.mason.name);
      expect(cloneResult.delayedWake).toBe(true);
      expect(cloneResult.autoResult.message).toContain("هتصحى مع زملائك");
    });
  });

  describe("Complex Night Phase Scenarios", () => {
    it("should handle a night phase where roles are swapped multiple times", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const player4 = new Player("Player4");

      const robber = new Robber();
      const troublemaker = new Troublemaker();
      const role1 = new Werewolf();
      const role2 = new Seer();

      game.players = [player1, player2, player3, player4];
      player1.AddRole(robber);
      player2.AddRole(troublemaker);
      player3.AddRole(role1);
      player4.AddRole(role2);
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      // Robber steals from player3
      const robberAction = createRobberAction(player3);
      const robberResult = robber.performAction()(game, player1, robberAction);
      expect(player1.getRole().name).toBe(R.werewolf.name);
      expect(player3.getRole().name).toBe(R.robber.name);

      // Troublemaker swaps player3 and player4 (not including themselves)
      const troublemakerAction = createTroublemakerAction(player3, player4);
      const troublemakerResult = troublemaker.performAction()(game, player2, troublemakerAction);
      expect(player3.getRole().name).toBe(R.seer.name);
      expect(player4.getRole().name).toBe(R.robber.name);

      // Final state: role swaps happened correctly
      expect(player1.getRole().name).toBe(R.werewolf.name);
      expect(player2.getRole().name).toBe(R.troublemaker.name);
    });

    it("should handle seer examining before and after role swaps", () => {
      const seerPlayer = new Player(R.seer.name);
      const targetPlayer = new Player("Target");

      const seer = new Seer();
      const targetRole = new Minion();

      game.players = [seerPlayer, targetPlayer];
      seerPlayer.AddRole(seer);
      targetPlayer.AddRole(targetRole);
      game.groundRoles = [new Mason(), new Drunk(), new Joker()];

      // Seer examines target - sees Minion
      const seerAction1 = createSeerAction.seePlayer(targetPlayer);
      const result1 = seer.performAction()(game, seerPlayer, seerAction1);
      expect(result1.role).toBe(R.minion.name);

      // Simulate role change (robber steals)
      const robber = new Robber();
      const tempRole = seerPlayer.getRole();
      seerPlayer.setRole(targetPlayer.getRole());
      targetPlayer.setRole(tempRole);

      // Seer examines target again - now sees Seer
      const seerAction2 = createSeerAction.seePlayer(targetPlayer);
      const result2 = seer.performAction()(game, seerPlayer, seerAction2);
      expect(result2.role).toBe(R.seer.name);
    });

    it("should handle insomniac detecting role change after night actions", () => {
      const insomniakPlayer = new Player(R.insomniac.name);
      const drunkenPlayer = new Player(R.drunk.name);

      const insomniak = new Insomniac();
      const drunk = new Drunk();
      const groundRole = new Werewolf();

      game.players = [insomniakPlayer, drunkenPlayer];
      insomniakPlayer.AddRole(insomniak);
      drunkenPlayer.AddRole(drunk);
      game.groundRoles = [groundRole, new Mason(), new Joker()];

      // Before any actions - insomniac unchanged
      const insomniakActionBefore = createInsomniacAction();
      const resultBefore = insomniak.performAction()(game, insomniakPlayer, insomniakActionBefore);
      expect(resultBefore.hasChanged).toBe(false);
      expect(resultBefore.currentRole).toBe(R.insomniac.name);

      // Drunk swaps with ground (becomes Werewolf)
      const drunkAction = createDrunkAction(groundRole.id);
      drunk.performAction()(game, drunkenPlayer, drunkAction);

      // No change to insomniac's role, so still unchanged
      const insomniakActionAfter = createInsomniacAction();
      const resultAfter = insomniak.performAction()(game, insomniakPlayer, insomniakActionAfter);
      expect(resultAfter.hasChanged).toBe(false);
      expect(resultAfter.currentRole).toBe(R.insomniac.name);
    });
  });
});
