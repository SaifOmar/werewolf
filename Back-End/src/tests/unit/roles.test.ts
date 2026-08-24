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
  Warlock,
  createWarlockAction,
  Oracle,
  createOracleAction,
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

describe("Role Tests", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(mockLogger as any, mockIo as any);
    game.phase = Phase.Night;
    // Don't pre-populate players - tests will add them as needed
    game.players = [];
  });

  describe(R.werewolf.name, () => {
    it("should see other werewolves when not alone", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const werewolf1 = new Werewolf();
      const werewolf2 = new Werewolf();
      const seer = new Seer();

      game.players = [player1, player2, player3];
      player1.AddRole(werewolf1);
      player2.AddRole(werewolf2);
      player3.AddRole(seer);

      game.groundRoles = [new Minion(), new Mason(), new Drunk()];

      const action = createWerewolfAction();
      const result = werewolf1.performAction()(game, player1, action);

      expect(result.isAlone).toBe(false);
      expect(result.werewolves).toHaveLength(1);
      expect(result.werewolves[0].name).toBe("Player2");
    });

    it("should see a ground card when alone", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const werewolf = new Werewolf();
      const minion = new Minion();
      const mason = new Mason();

      game.players = [player1, player2, player3];
      player1.AddRole(werewolf);
      player2.AddRole(minion);
      player3.AddRole(mason);

      game.groundRoles = [new Drunk(), new Seer(), new Robber()];

      const action = createWerewolfAction();
      const result = werewolf.performAction()(game, player1, action);

      expect(result.isAlone).toBe(true);
      expect([R.drunk.name, R.seer.name, R.robber.name]).toContain(result.groundCard);
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const werewolf = new Werewolf();

      game.players = [player1];
      player1.AddRole(werewolf);

      const invalidAction = { type: "invalid" };
      expect(() => {
        werewolf.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Werewolf");
    });
  });

  describe(R.seer.name, () => {
    it("should see a player's role", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const seer = new Seer();
      const targetRole = new Werewolf();

      game.players = [player1, player2];
      player1.AddRole(seer);
      player2.AddRole(targetRole);
      game.groundRoles = [new Minion(), new Mason()];

      const action = createSeerAction.seePlayer(player2);
      const result = seer.performAction()(game, player1, action);

      expect(result.targetPlayerId).toBe(player2.id);
      expect(result.playerName).toBe("Player2");
      expect(result.role).toBe(R.werewolf.name);
      expect(result.message).toContain("Player2");
    });

    it("should see two ground cards", () => {
      const player1 = new Player("Player1");
      const seer = new Seer();
      const groundRole1 = new Minion();
      const groundRole2 = new Mason();

      game.players = [player1];
      player1.AddRole(seer);
      game.groundRoles = [groundRole1, groundRole2, new Drunk()];

      const action = createSeerAction.seeGround(groundRole1, groundRole2);
      const result = seer.performAction()(game, player1, action);

      expect(result.groundRole1Id).toBe(groundRole1.id);
      expect(result.groundRole1).toBe(R.minion.name);
      expect(result.groundRole2Id).toBe(groundRole2.id);
      expect(result.groundRole2).toBe(R.mason.name);
    });

    it("should throw on invalid action type", () => {
      const player1 = new Player("Player1");
      const seer = new Seer();

      game.players = [player1];
      player1.AddRole(seer);

      const invalidAction = { type: "invalid" };
      expect(() => {
        seer.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Seer");
    });
  });

  describe(R.minion.name, () => {
    it("should see all werewolves in play", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const player4 = new Player("Player4");
      const minion = new Minion();
      const werewolf1 = new Werewolf();
      const werewolf2 = new Werewolf();
      const seer = new Seer();

      game.players = [player1, player2, player3, player4];
      player1.AddRole(minion);
      player2.AddRole(werewolf1);
      player3.AddRole(werewolf2);
      player4.AddRole(seer);
      game.groundRoles = [new Mason(), new Drunk()];

      const action = createMinionAction();
      const result = minion.performAction()(game, player1, action);

      expect(result.werewolves).toHaveLength(2);
      expect(result.message).toContain("Player2");
      expect(result.message).toContain("Player3");
    });

    it("should handle no werewolves in play", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const player4 = new Player("Player4");
      const minion = new Minion();
      const seer = new Seer();
      const mason = new Mason();
      const drunk = new Drunk();

      game.players = [player1, player2, player3, player4];
      player1.AddRole(minion);
      player2.AddRole(seer);
      player3.AddRole(mason);
      player4.AddRole(drunk);
      game.groundRoles = [new Werewolf(), new Robber()];

      const action = createMinionAction();
      const result = minion.performAction()(game, player1, action);

      expect(result.werewolves).toHaveLength(0);
      expect(result.message).toContain("كلهم على الأرض");
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const minion = new Minion();

      game.players = [player1];
      player1.AddRole(minion);

      const invalidAction = { type: "invalid" };
      expect(() => {
        minion.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Minion");
    });
  });

  describe(R.drunk.name, () => {
    it("should swap role with ground card", () => {
      const player1 = new Player("Player1");
      const drunk = new Drunk();
      const groundRole = new Werewolf();
      const otherGround = new Mason();

      game.players = [player1];
      player1.AddRole(drunk);
      game.groundRoles = [groundRole, otherGround, new Minion()];

      const action = createDrunkAction(groundRole.id);
      const result = drunk.performAction()(game, player1, action);

      expect(result.success).toBe(true);
      expect(result.targetRoleId).toBe(groundRole.id);
      expect(result.targetGroundIndex).toBe(0);
      expect(player1.getRole().name).toBe(R.werewolf.name);
      expect(game.groundRoles[0].name).toBe(R.drunk.name);
    });

    it("should swap with a random ground card when no target is supplied", () => {
      const player1 = new Player("Player1");
      const drunk = new Drunk();

      game.players = [player1];
      player1.AddRole(drunk);
      game.groundRoles = [new Werewolf(), new Mason(), new Minion()];

      const result = drunk.performAction()(game, player1, { type: "drunk" });

      expect(result.success).toBe(true);
      expect(result.targetRoleId).toBeTruthy();
      expect(result.targetGroundIndex).toBeGreaterThanOrEqual(0);
      expect(result.targetGroundIndex).toBeLessThan(3);
      expect(game.groundRoles[result.targetGroundIndex].name).toBe(R.drunk.name);
      expect(player1.getRole().name).not.toBe(R.drunk.name);
    });

    it("should throw on invalid ground role id", () => {
      const player1 = new Player("Player1");
      const drunk = new Drunk();

      game.players = [player1];
      player1.AddRole(drunk);
      game.groundRoles = [new Werewolf(), new Mason()];

      const action = createDrunkAction("invalid-id");
      expect(() => {
        drunk.performAction()(game, player1, action);
      }).toThrow("Ground role not found");
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const drunk = new Drunk();

      game.players = [player1];
      player1.AddRole(drunk);

      const invalidAction = { type: "invalid" };
      expect(() => {
        drunk.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Drunk");
    });
  });

  describe(R.robber.name, () => {
    it("should swap role with target player", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const robber = new Robber();
      const targetRole = new Werewolf();

      game.players = [player1, player2];
      player1.AddRole(robber);
      player2.AddRole(targetRole);
      game.groundRoles = [new Mason(), new Drunk()];

      const action = createRobberAction(player2);
      const result = robber.performAction()(game, player1, action);

      expect(result.newRole).toBe(R.werewolf.name);
      expect(player1.getRole().name).toBe(R.werewolf.name);
      expect(player2.getRole().name).toBe(R.robber.name);
    });

    it("should steal a clone's current copied role, not the clone card", () => {
      const robberPlayer = new Player(R.robber.name);
      const clonePlayer = new Player(R.clone.name);
      const seerPlayer = new Player(R.seer.name);
      const robber = new Robber();
      const clone = new Clone();
      const seer = new Seer();

      game.players = [robberPlayer, clonePlayer, seerPlayer];
      robberPlayer.AddRole(robber);
      clonePlayer.AddRole(clone);
      seerPlayer.AddRole(seer);
      game.groundRoles = [new Mason(), new Drunk(), new Minion()];

      clone.performAction()(game, clonePlayer, createCloneAction(seerPlayer));

      const result = robber.performAction()(game, robberPlayer, createRobberAction(clonePlayer));

      expect(result.newRole).toBe(R.seer.name);
      expect(robberPlayer.getRole().name).toBe(R.seer.name);
      expect(clonePlayer.getRole().name).toBe(R.robber.name);
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const robber = new Robber();

      game.players = [player1];
      player1.AddRole(robber);

      const invalidAction = { type: "invalid" };
      expect(() => {
        robber.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Robber");
    });
  });

  describe(R.troublemaker.name, () => {
    it("should swap roles of two target players", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const troublemaker = new Troublemaker();
      const role1 = new Werewolf();
      const role2 = new Seer();

      game.players = [player1, player2, player3];
      player1.AddRole(troublemaker);
      player2.AddRole(role1);
      player3.AddRole(role2);
      game.groundRoles = [new Mason(), new Drunk()];

      const action = createTroublemakerAction(player2, player3);
      const result = troublemaker.performAction()(game, player1, action);

      expect(result.player1Id).toBe(player2.id);
      expect(result.player1Name).toBe("Player2");
      expect(result.player2Id).toBe(player3.id);
      expect(result.player2Name).toBe("Player3");
      expect(player2.getRole().name).toBe(R.seer.name);
      expect(player3.getRole().name).toBe(R.werewolf.name);
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const troublemaker = new Troublemaker();

      game.players = [player1];
      player1.AddRole(troublemaker);

      const invalidAction = { type: "invalid" };
      expect(() => {
        troublemaker.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Troublemaker");
    });
  });

  describe(R.mason.name, () => {
    it("should see other masons", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const mason1 = new Mason();
      const mason2 = new Mason();
      const werewolf = new Werewolf();

      game.players = [player1, player2, player3];
      player1.AddRole(mason1);
      player2.AddRole(mason2);
      player3.AddRole(werewolf);
      game.groundRoles = [new Drunk(), new Minion()];

      const action = { type: "mason" };
      const result = mason1.performAction()(game, player1, action);

      expect(result.masons).toHaveLength(1);
      expect(result.masons[0].name).toBe("Player2");
    });

    it("should handle being the only mason", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const mason = new Mason();
      const werewolf = new Werewolf();
      const seer = new Seer();

      game.players = [player1, player2, player3];
      player1.AddRole(mason);
      player2.AddRole(werewolf);
      player3.AddRole(seer);
      game.groundRoles = [new Drunk(), new Minion()];

      const action = { type: "mason" };
      const result = mason.performAction()(game, player1, action);

      expect(result.masons).toHaveLength(0);
      expect(result.message).toContain(`${R.mason.name} الوحيد`);
    });

    it("should see a clone who copied Mason as a fellow Mason", () => {
      const masonPlayer = new Player(R.mason.name);
      const clonePlayer = new Player(R.clone.name);
      const targetMasonPlayer = new Player("Target Mason");
      const mason = new Mason();
      const clone = new Clone();

      game.players = [masonPlayer, clonePlayer, targetMasonPlayer];
      masonPlayer.AddRole(mason);
      clonePlayer.AddRole(clone);
      targetMasonPlayer.AddRole(new Mason());
      game.groundRoles = [new Drunk(), new Minion(), new Werewolf()];
      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      clone.performAction()(game, clonePlayer, createCloneAction(targetMasonPlayer));

      const result = mason.performAction()(game, masonPlayer, { type: "mason" });

      expect(result.masons.map((m: { name: string }) => m.name)).toContain(R.clone.name);
      expect(result.masons.map((m: { name: string }) => m.name)).toContain("Target Mason");
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const mason = new Mason();

      game.players = [player1];
      player1.AddRole(mason);

      const invalidAction = { type: "invalid" };
      expect(() => {
        mason.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Mason");
    });
  });

  describe(R.joker.name, () => {
    it("should look at a ground card", () => {
      const player1 = new Player("Player1");
      const joker = new Joker();
      const groundRole = new Werewolf();

      game.players = [player1];
      player1.AddRole(joker);
      game.groundRoles = [groundRole, new Mason(), new Drunk()];

      const action = createJokerAction(groundRole.id);
      const result = joker.performAction()(game, player1, action);

      expect(result.targetRoleId).toBe(groundRole.id);
      expect(result.targetGroundIndex).toBe(0);
      expect(result.groundRole).toBe(R.werewolf.name);
      expect(result.message).toContain(R.werewolf.name);
    });

    it("should look at a random ground card when no target is supplied", () => {
      const player1 = new Player("Player1");
      const joker = new Joker();

      game.players = [player1];
      player1.AddRole(joker);
      game.groundRoles = [new Werewolf(), new Mason(), new Drunk()];

      const result = joker.performAction()(game, player1, { type: "joker" });

      expect(result.targetRoleId).toBeTruthy();
      expect(result.targetGroundIndex).toBeGreaterThanOrEqual(0);
      expect(result.targetGroundIndex).toBeLessThan(3);
      expect([R.werewolf.name, R.mason.name, R.drunk.name]).toContain(result.groundRole);
    });

    it("should throw on invalid ground role id", () => {
      const player1 = new Player("Player1");
      const joker = new Joker();

      game.players = [player1];
      player1.AddRole(joker);
      game.groundRoles = [new Werewolf(), new Mason()];

      const action = createJokerAction("invalid-id");
      expect(() => {
        joker.performAction()(game, player1, action);
      }).toThrow("Ground role not found");
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const joker = new Joker();

      game.players = [player1];
      player1.AddRole(joker);

      const invalidAction = { type: "invalid" };
      expect(() => {
        joker.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Joker");
    });
  });

  describe(R.insomniac.name, () => {
    it("should return current role", () => {
      const player1 = new Player("Player1");
      const insomniac = new Insomniac();

      game.players = [player1];
      player1.AddRole(insomniac);
      game.groundRoles = [new Mason(), new Drunk()];

      const action = createInsomniacAction();
      const result = insomniac.performAction()(game, player1, action);

      expect(result.currentRole).toBe(R.insomniac.name);
      expect(result.originalRole).toBe(R.insomniac.name);
      expect(result.hasChanged).toBe(false);
    });

    it("should detect role change", () => {
      const player1 = new Player("Player1");
      const insomniac = new Insomniac();
      const werewolf = new Werewolf();

      game.players = [player1];
      player1.AddRole(insomniac);
      game.groundRoles = [werewolf, new Mason()];

      // Simulate a role swap
      player1.setRole(werewolf);

      const action = createInsomniacAction();
      const result = insomniac.performAction()(game, player1, action);

      expect(result.currentRole).toBe(R.werewolf.name);
      expect(result.originalRole).toBe(R.insomniac.name);
      expect(result.hasChanged).toBe(true);
    });

    it("should throw on invalid action", () => {
      const player1 = new Player("Player1");
      const insomniac = new Insomniac();

      game.players = [player1];
      player1.AddRole(insomniac);

      const invalidAction = { type: "invalid" };
      expect(() => {
        insomniac.performAction()(game, player1, invalidAction);
      }).toThrow("Invalid action for Insomniac");
    });
  });

  describe(R.warlock.name, () => {
    it("should swap a target player's role with a random ground card and report the exact target", () => {
      const player1 = new Player("Player1");
      const player2 = new Player("Player2");
      const player3 = new Player("Player3");
      const warlock = new Warlock();
      const targetRole = new Werewolf();
      const selectedGroundRole = new Seer();

      game.players = [player1, player2, player3];
      player1.AddRole(warlock);
      player2.AddRole(targetRole);
      player3.AddRole(new Mason());
      game.groundRoles = [new Drunk(), selectedGroundRole, new Minion()];

      const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.4);
      const result = warlock.performAction()(game, player1, createWarlockAction(player2));
      randomSpy.mockRestore();

      expect(result.targetPlayerId).toBe(player2.id);
      expect(result.targetName).toBe("Player2");
      expect(result.targetRoleId).toBe(selectedGroundRole.id);
      expect(result.targetGroundIndex).toBe(1);
      expect(player2.getRole().name).toBe(R.seer.name);
      expect(game.groundRoles[1].name).toBe(R.werewolf.name);
    });

    it("should throw when targeting themselves", () => {
      const player1 = new Player("Player1");
      const warlock = new Warlock();

      game.players = [player1];
      player1.AddRole(warlock);
      game.groundRoles = [new Drunk(), new Seer(), new Minion()];

      expect(() => {
        warlock.performAction()(game, player1, createWarlockAction(player1));
      }).toThrow("Warlock cannot target themselves");
    });
  });

  describe(R.oracle.name, () => {
    it("should receive a message from a random previous player action result", () => {
      const oraclePlayer = new Player(R.oracle.name);
      const robberPlayer = new Player(R.robber.name);
      const oracle = new Oracle();

      game.players = [oraclePlayer, robberPlayer];
      oraclePlayer.AddRole(oracle);
      robberPlayer.AddRole(new Robber());
      robberPlayer.lastActionResult = { newRole: R.werewolf.name, message: "Robber stole a role" };

      const result = oracle.performAction()(game, oraclePlayer, createOracleAction());

      expect(result.hasVision).toBe(true);
      expect(result.sourceRole).toBe(R.robber.name);
      expect(result.vision).toBe(`الـ${R.robber.name} سرق دور وبقى ${R.werewolf.name}.`);
      expect(result.message).toBe(result.vision);
    });

    it("should return a silent message when no previous action results exist", () => {
      const oraclePlayer = new Player(R.oracle.name);
      const oracle = new Oracle();

      game.players = [oraclePlayer];
      oraclePlayer.AddRole(oracle);

      const result = oracle.performAction()(game, oraclePlayer, createOracleAction());

      expect(result.hasVision).toBe(false);
      expect(result.message).toContain("الأرواح ساكتة");
    });
  });

  describe(R.clone.name, () => {
    // Helper function to setup clone test
    const setupCloneTest = (targetRole: any, otherRoles: any[] = []) => {
      const clonePlayer = new Player("Cloner");
      const targetPlayer = new Player("Target");
      const clone = new Clone();

      const players = [clonePlayer, targetPlayer, ...otherRoles.map((_, i) => new Player(`Player${i + 3}`))];
      game.players = players;
      clonePlayer.AddRole(clone);
      targetPlayer.AddRole(targetRole);

      otherRoles.forEach((role, i) => {
        players[i + 2].AddRole(role);
      });

      game.groundRoles = [new Mason(), new Drunk(), new Minion()];
      game.getPlayerById = (id: string) => game.players.find((p) => p.id === id);

      return { clonePlayer, targetPlayer, clone };
    };

    describe("Passive Roles", () => {
      it("should clone Werewolf", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Werewolf());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.werewolf.name);
        expect(result.needsSecondAction).toBe(false);
        expect(clonePlayer.getRole().name).toBe(R.werewolf.name);
        expect(result.message).toContain(`بقيت ${R.werewolf.name}`);
      });

      it("should clone Minion", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Minion());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.minion.name);
        expect(result.needsSecondAction).toBe(false);
        expect(clonePlayer.getRole().name).toBe(R.minion.name);
        expect(result.message).toContain(R.minion.name);
      });

      it("should clone Mason and see other masons", () => {
        const mason1 = new Mason();
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(mason1);

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.mason.name);
        expect(result.needsSecondAction).toBe(false);
        expect(clonePlayer.getRole().name).toBe(R.mason.name);
        expect(result.delayedWake).toBe(true);
        expect(result.autoResult.message).toContain("هتصحى مع زملائك");
        expect(result.message).toContain(R.mason.name);
      });

      it("should clone Insomniac", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Insomniac());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.insomniac.name);
        expect(result.needsSecondAction).toBe(false);
        expect(clonePlayer.getRole().name).toBe(R.insomniac.name);
        expect(clonePlayer.getOriginalRole().name).toBe(R.clone.name);
        expect((clonePlayer as any)._clonedRoleName).toBe("insomniac");
        expect(result.message).toContain(R.insomniac.name);
      });

      it("should clone Joker", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Joker());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.joker.name);
        expect(result.needsSecondAction).toBe(false);
        expect(clonePlayer.getRole().name).toBe(R.joker.name);
        expect(result.autoResult.groundRole).toBeTruthy();
        expect(result.autoResult.targetGroundIndex).toBeGreaterThanOrEqual(0);
      });
    });

    describe("Active Roles", () => {
      it("should clone Seer and indicate second action needed", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Seer());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.seer.name);
        expect(result.needsSecondAction).toBe(true);
        expect(clonePlayer.getRole().name).toBe(R.seer.name);
        expect(result.groundCards).toBeDefined();
        expect(result.otherPlayers).toBeDefined();
        expect(result.message).toContain("اعمل حركته دلوقتي");
      });

      it("should clone Robber and indicate second action needed", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Robber());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.robber.name);
        expect(result.needsSecondAction).toBe(true);
        expect(clonePlayer.getRole().name).toBe(R.robber.name);
        expect(result.otherPlayers).toBeDefined();
        expect(result.message).toContain("اعمل حركته دلوقتي");
      });

      it("should clone Troublemaker and indicate second action needed", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Troublemaker());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.troublemaker.name);
        expect(result.needsSecondAction).toBe(true);
        expect(clonePlayer.getRole().name).toBe(R.troublemaker.name);
        expect(result.otherPlayers).toBeDefined();
        expect(result.message).toContain("اعمل حركته دلوقتي");
      });

      it("should clone Drunk and immediately swap with a random ground card", () => {
        const { clonePlayer, targetPlayer, clone } = setupCloneTest(new Drunk());

        const action = createCloneAction(targetPlayer);
        const result = clone.performAction()(game, clonePlayer, action);

        expect(result.clonedRole).toBe(R.drunk.name);
        expect(result.needsSecondAction).toBe(false);
        expect(result.autoResult.success).toBe(true);
        expect(result.autoResult.targetGroundIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it("should throw when cloning themselves", () => {
      const { clonePlayer, clone } = setupCloneTest(new Werewolf());

      const action = createCloneAction(clonePlayer);
      expect(() => {
        clone.performAction()(game, clonePlayer, action);
      }).toThrow("Clone cannot target themselves");
    });

    it("should throw on invalid action", () => {
      const { clonePlayer, clone } = setupCloneTest(new Werewolf());

      const invalidAction = { type: "invalid" };
      expect(() => {
        clone.performAction()(game, clonePlayer, invalidAction);
      }).toThrow("Invalid action for Clone");
    });
  });

  describe("Role Properties", () => {
    it("should have correct team assignments", () => {
      const werewolf = new Werewolf();
      const minion = new Minion();
      const seer = new Seer();
      const mason = new Mason();
      const drunk = new Drunk();
      const insomniac = new Insomniac();

      expect(werewolf.team).toBe(Team.Villain);
      expect(minion.team).toBe(Team.Villain);
      expect(seer.team).toBe(Team.Village);
      expect(mason.team).toBe(Team.Village);
      expect(drunk.team).toBe(Team.Village);
      expect(insomniac.team).toBe(Team.Village);
    });

    it("should have unique ids", () => {
      const werewolf1 = new Werewolf();
      const werewolf2 = new Werewolf();

      expect(werewolf1.id).not.toBe(werewolf2.id);
    });

    it("should have descriptions", () => {
      const werewolf = new Werewolf();
      const seer = new Seer();
      const minion = new Minion();

      expect(werewolf.description).toBeTruthy();
      expect(seer.description).toBeTruthy();
      expect(minion.description).toBeTruthy();
    });

    it("should have correct names", () => {
      const roles = [
        new Werewolf(),
        new Seer(),
        new Minion(),
        new Mason(),
        new Drunk(),
        new Robber(),
        new Troublemaker(),
        new Joker(),
        new Insomniac(),
        new Clone(),
      ];

      const expectedNames = [
        R.werewolf.name,
        R.seer.name,
        R.minion.name,
        R.mason.name,
        R.drunk.name,
        R.robber.name,
        R.troublemaker.name,
        R.joker.name,
        R.insomniac.name,
        R.clone.name,
      ];

      roles.forEach((role, index) => {
        expect(role.name).toBe(expectedNames[index]);
      });
    });
  });
});
