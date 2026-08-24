import {
  SOCKET_EVENTS,
  Phase,
  Team,
  TimerOption,
  DEFAULT_TIMER,
  NUMBER_OF_GROUND_ROLES,
  MIN_PLAYERS,
  MAX_PLAYERS,
  ERROR_MESSAGES,
} from "@werewolf/shared";
import type {
  PlayerId,
  Settings,
  Vote,
  UpdateGamePayload,
  PlayerPrivateData,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@werewolf/shared";
import { PlayerSocket } from "../../types/socket.types";
import { Role } from "../roles";
import { Player } from "../Player";
import { Logger } from "../../utils/Logger";
import { NightPhaseManager } from "./NightPhaseManager";
import { VoteResolver } from "./VoteResolver";
import { RoleAssigner } from "./RoleAssigner";
import { Server, Socket } from "socket.io";

// NOTE: always emit at the end of any method if you change game state
export class Game {
  players: Player[] = [];
  readyPlayers: Map<PlayerId, boolean> = new Map();
  startedAt: number | null = null;
  allPlayersReady: boolean = false;
  groundRoles: Role[] = [];
  prettyVotes: Vote[] = [];
  code: string;
  votes: Vote[] = [];
  winners: Team;

  timer: TimerOption = DEFAULT_TIMER;
  timerInterval: NodeJS.Timeout;
  phase: Phase = Phase.Waiting;
  numberOfGroundRoles: number = NUMBER_OF_GROUND_ROLES;
  numberOfWerewolf: number;
  numberOfMasons: number;
  numberOfEvents: number = 0;
  confirmedPlayerRoleReveal: PlayerId[] = [];
  confirmedPlayerPerformActions: PlayerId[] = [];
  minimumPlayers: number = MIN_PLAYERS;
  maxPlayers: number = MAX_PLAYERS;
  roleQueue: string[] = [];
  roleQueueIndex = 0;
  currentGameRolesMap: Map<string, number> = new Map();
  currentTimerSec: number;
  host: PlayerId;
  currentActiveRole: string = "";
  currentActiveRoleStartedAt: number | null = null;
  endedAt: number | null = null;
  lastActivityAt: number = Date.now();
  actionHistory: Array<{
    playerId: string;
    role: string;
    playerName: string;
    description: string;
  }> = [];
  gamePings: Record<string, number> = {};
  gamePingTimestamps: Record<string, number> = {};
  io: Server<ClientToServerEvents, ServerToClientEvents>;
  nightTimeRemaining: number = 0;
  connectedPlayers: Set<PlayerId> = new Set();
  hostTransferTimeout: NodeJS.Timeout | null = null;
  roleRevealTimeout: NodeJS.Timeout | null = null;
  roleRevealEndsAt: number | null = null;
  /** Final verdict stored at finish() so snapshots never re-derive it. */
  finalIsDraw: boolean = false;
  eliminatedPlayerId: PlayerId | null = null;

  readonly disconnectGraceSeconds = 10;
  private availableRoles: Role[] = [];
  private nightManager: NightPhaseManager;
  private voteResolver: VoteResolver;
  private roleAssigner: RoleAssigner;

  constructor(
    private logger: Logger,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
  ) {
    this.code = this.generateCode();
    this.io = io;

    this.roleAssigner = new RoleAssigner(logger);
    this.voteResolver = new VoteResolver(logger);
    this.nightManager = new NightPhaseManager(this);

    this.availableRoles = this.roleAssigner.createRoles();
    this.roleQueue = this.roleAssigner.createRoleQueue();

    this.numberOfWerewolf = 0; // Set by RoleAssigner internally
    this.numberOfMasons = 0;

    this.logger.info(
      `available roles: ${this.availableRoles.map((r) => r.name)}`,
    );
    this.logger.info("Game created");
  }

  // ── Player Management ─────────────────────────────────────────────

  playerJoin(name: string, socket: Socket): void {
    if (this.phase !== Phase.Waiting) {
      throw new Error("Cannot join a game that has already started");
    }
    if (this.players.length >= this.maxPlayers) {
      throw new Error(`Game is full, max players is ${this.maxPlayers}`);
    }

    let player = this.players.find((p) => p.name === name);
    if (player) {
      if (this.connectedPlayers.has(player.id)) {
        throw new Error(
          `A player with this name (${name}) already joined please chose another name`,
        );
      }
    } else {
      player = new Player(name);
      this.players.push(player);
      this.readyPlayers.set(player.id, false);
      if (this.players.length === 1) {
        this.logger.info(`host is ${player.name}`);
        this.host = player.id;
      }
    }
    socket.join(this.code); // WARNING: this should be a promise if we ever want to use adapters like redis
    (socket as PlayerSocket).playerId = player.id;
    this.connectPlayer(player.id);

    this.emit();
  }

  playerReady(playerId: PlayerId, ready?: boolean) {
    // explicit value wins; fall back to toggle for legacy callers
    const next = ready ?? !(this.readyPlayers.get(playerId) ?? false);
    this.readyPlayers.set(playerId, next);
    if (this.arePlayersReady()) {
      this.allPlayersReady = true;
    }

    this.emit();
  }

  updateSettings(settings: Settings): void {
    this.timer = settings.timer;

    this.emit();
  }

  assignHost(requesterId: PlayerId, newHostId: PlayerId): void {
    if (requesterId !== this.host) {
      throw new Error(ERROR_MESSAGES.HOST_ONLY);
    }
    const newHost = this.players.find((p) => p.id === newHostId);
    if (!newHost) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_FOUND);
    }
    this.host = newHost.id;
    console.log(`👑 Host assigned to ${newHost.name} (${this.host})`);
    this.emit();
  }

  kickPlayer(kickedPlayerId: PlayerId): Player | undefined {
    const player = this.players.find((p) => p.id === kickedPlayerId);
    if (!player) return undefined;

    this.players = this.players.filter((p) => p.id !== kickedPlayerId);
    this.readyPlayers.delete(kickedPlayerId);


    // huh again ? how can a host be even kicked ?
    if (this.host === kickedPlayerId && this.players.length > 0) {
      if (this.hostTransferTimeout) {
        clearTimeout(this.hostTransferTimeout);
        this.hostTransferTimeout = null;
      }
      let newHost = this.players.find((p) =>
        this.connectedPlayers.has(p.id),
      );
      newHost = newHost ?? this.players[0];
      this.host = newHost.id;
      console.log(`Host transferred to ${newHost.name} (${this.host})`);
    }

    this.emit();

    // NOTE : we always need to emit before we disconnect
    this.io.sockets.sockets.forEach((socket: PlayerSocket) => {
      if (socket.playerId === kickedPlayerId) {
        socket.emit(SOCKET_EVENTS.SERVER.KICKED, {
          message: "اتشيلت من اللعبة",
        });
        socket.disconnect(true);
      }
    });

    return player;
  }

  connectPlayer(playerId: PlayerId): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    this.connectedPlayers.add(playerId);

    if (this.hostTransferTimeout && this.host === playerId) {
      clearTimeout(this.hostTransferTimeout);
      this.hostTransferTimeout = null;
      this.logger.info(`Host ${player.name} reconnected, transfer cancelled`);
    }

    this.emit();
  }

  // WARN: this code looks fishy, but it works
  disconnectPlayer(playerId: PlayerId): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    this.connectedPlayers.delete(playerId);
    this.logger.info(`Player ${player.name} disconnected`);

    if (this.host === playerId && this.connectedPlayers.size > 0) {
      if (this.hostTransferTimeout) {
        clearTimeout(this.hostTransferTimeout);
      }
      this.hostTransferTimeout = setTimeout(() => {
        if (this.host !== playerId) {
          this.hostTransferTimeout = null;
          return;
        }
        const firstConnected = this.players.find((p) =>
          this.connectedPlayers.has(p.id),
        );
        if (firstConnected) {
          const oldHost = this.players.find((p) => p.id === playerId);
          this.host = firstConnected.id;
          this.logger.info(
            `Host transferred to ${firstConnected.name} (disconnect timeout)`,
          );

          this.io.sockets.sockets.forEach((socket: PlayerSocket) => {
            if (socket.playerId === firstConnected.id) {
              const oldName = oldHost?.name ?? "The previous host";
              socket.emit(SOCKET_EVENTS.SERVER.HOST_TRANSFERRED, {
                message: `${oldName} خرج… انت المضيف دلوقتي!`,
              });
            }
          });
        }
        this.hostTransferTimeout = null;
        this.emit();
      }, this.disconnectGraceSeconds * 1000);

      this.logger.info(
        `Host ${player.name} disconnected, waiting ${this.disconnectGraceSeconds}s for reconnect`,
      );
    }

    this.emit();
  }

  getPlayerById(id: string): Player {
    const player = this.players.find((p) => p.id === id);
    if (player !== undefined) {
      return player;
    }

    this.logger.log(`Player with id ${id} not found`);
    throw new Error(`Player with id ${id} not found`);
  }

  // ── Game Lifecycle ────────────────────────────────────────────────

  start(): void {
    if (this.players.length < this.minimumPlayers) {
      throw new Error(`Need at least ${this.minimumPlayers} players to start`);
    }

    if (!this.allPlayersReady) {
      for (const player of this.players) {
        if (!this.readyPlayers.get(player.id)) {
          console.log(`not ready ${player.name}`);
        }
      }
      throw new Error("Not all players are ready");
    }

    this.currentGameRolesMap = new Map<string, number>();
    this.roleAssigner.assignRandomRoles(
      this.players,
      this.availableRoles,
      this.currentGameRolesMap,
    );

    for (let i = this.availableRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableRoles[i], this.availableRoles[j]] = [
        this.availableRoles[j],
        this.availableRoles[i],
      ];
    }
    this.groundRoles = this.availableRoles.slice(0, this.numberOfGroundRoles);

    this.roleQueue = this.roleAssigner.buildActiveRoleQueue(
      this.players,
      this.groundRoles,
      this.nightManager.getRoleTimers(),
    );
    this.roleQueueIndex = 0;

    this.phase = Phase.Role;
    this.roleRevealEndsAt = Date.now() + 30000;
    this.roleRevealTimeout = setTimeout(() => {
      this.startNight();
    }, 30000);
    this.emit();
  }

  confirmPlayerRoleReveal(playerId: PlayerId): void {
    if (this.confirmedPlayerRoleReveal.includes(playerId)) {
      throw new Error(`Player ${playerId} has already confirmed their role`);
    }
    this.getPlayerById(playerId);

    this.confirmedPlayerRoleReveal.push(playerId);

    if (this.confirmedPlayerRoleReveal.length === this.players.length) {
      if (this.roleRevealTimeout) {
        clearTimeout(this.roleRevealTimeout);
        this.roleRevealTimeout = null;
      }
      this.startNight();
    }

    this.emit();
  }

  // ── Night Phase (delegated to NightPhaseManager) ──────────────────

  startNight(): void {
    this.phase = Phase.Night;

    this.nightManager.startNight();
  }

  playerPerformAction(playerId: PlayerId): void {
    if (this.confirmedPlayerPerformActions.includes(playerId)) {
      throw new Error(`Player ${playerId} has already performed their action`);
    }
    const player = this.getPlayerById(playerId);
    const roleName = player.getOriginalRole().name;
    this.confirmedPlayerPerformActions.push(playerId);

    const remaining = (this.currentGameRolesMap.get(roleName) || 1) - 1;
    this.currentGameRolesMap.set(roleName, remaining);

    console.log(
      `✅ ${player.name} (${roleName}) performed action. Remaining for ${roleName}: ${remaining}`,
    );

    this.emit();
  }

  nextAction(): any {
    // non-destructive: keep roleQueue intact so snapshots show the full
    // night order and activeRoleIndex stays in sync
    const nextRoleAction = this.roleQueue[this.roleQueueIndex];
    this.roleQueueIndex++;
    if (nextRoleAction === undefined) {
      return;
    }
    const rolePlayersOrg = this.players.filter(
      (p) => p.getOriginalRole().name === nextRoleAction,
    );
    const rolePlayers = this.players.filter(
      (p) => p.getRole().name === nextRoleAction,
    );
    this.logger.info(
      `next action: ${nextRoleAction}, role players ${rolePlayers.map((p) => p.name)}, original role players ${rolePlayersOrg.map((p) => p.name)}`,
    );
    return nextRoleAction;
  }

  startPerformActions(): void {
    this.phase = Phase.Night;
    this.emit();
  }

  get roleQueueWithTimer(): { roleName: string; seconds: number }[] {
    return this.nightManager.roleQueueWithTimer;
  }

  // ── Day / Discussion ──────────────────────────────────────────────

  startDay() {
    this.phase = Phase.Discussion;
    this.startedAt = Date.now();
    // public night recap — everyone sees what every role did
    this.actionHistory = this.voteResolver.buildActionHistory(this.players);
    const totalSeconds = this.timer * 60;
    // const totalSeconds = 10; // for testing 
    this.currentTimerSec = totalSeconds;

    this.emit()

    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startedAt!) / 1000);
      this.currentTimerSec = totalSeconds - elapsed;

      if (this.currentTimerSec <= 0) {
        this.currentTimerSec = 0;
        clearInterval(this.timerInterval);
        this.startVoting();
      }
    }, 1000);
  }

  skipToVote(playerId: PlayerId): void {
    if (playerId !== this.host) {
      throw new Error("Only the host can skip to vote");
    }
    if (this.phase !== Phase.Discussion) {
      throw new Error("Cannot skip to vote when not in discussion phase");
    }
    this.startVoting();
  }

  // ── Voting (delegated to VoteResolver for calculation) ────────────

  startVoting(): void {
    if (this.phase === Phase.Vote) return;
    this.phase = Phase.Vote;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.logger.log("Game state is now voting");
    this.emit();
  }

  playerVote(player: PlayerId, vote: PlayerId): void {
    if (this.votes.find((v) => v.voter === player)) {
      throw new Error("Player has already voted");
    }
    this.votes.push({ voter: player, vote: vote });
    this.emit();
    if (vote === "noWerewolf") {
      this.logger.log(
        `Voter: ${this.getPlayerById(player).name} has voted for No Werewolf`,
      );
    } else {
      this.logger.log(
        `Voter: ${this.getPlayerById(player).name} has voted for ${this.getPlayerById(vote).name} and his role is ${this.getPlayerById(vote).getRole().name}`,
      );
    }
    if (this.votes.length === this.players.length) {
      this.finish();
    }
  }

  forceVotes(hostId: PlayerId): void {
    if (hostId !== this.host) {
      throw new Error("Only the host can force votes");
    }
    if (this.phase !== Phase.Vote) return;

    const playersWhoVoted = new Set(this.votes.map((v) => v.voter));
    const playersWhoHaventVoted = this.players.filter(
      (p) => !playersWhoVoted.has(p.id),
    );

    if (playersWhoHaventVoted.length === 0) return;

    for (const player of playersWhoHaventVoted) {
      const otherPlayers = this.players.filter((p) => p.id !== player.id);
      const options = [...otherPlayers.map((p) => p.id), "noWerewolf"];
      const randomVote = options[Math.floor(Math.random() * options.length)];

      this.votes.push({ voter: player.id, vote: randomVote });
      this.logger.log(
        `Force vote: ${player.name} randomly voted for ${randomVote === "noWerewolf" ? "No Werewolf" : this.getPlayerById(randomVote).name}`,
      );
    }

    this.finish();
  }

  finish(): void {
    this.logger.info("Game Ended");
    this.phase = Phase.EndGame;

    this.actionHistory = this.voteResolver.buildActionHistory(this.players);

    const votes = this.voteResolver.getVoteResults(this.votes);
    this.prettyVotes = this.votes;

    // Store the resolver's full verdict — including draws — so snapshots
    // report exactly what was decided instead of re-deriving it.
    const result = this.voteResolver.calculateResults(votes, this.players);
    this.winners = result.winningTeam;
    this.finalIsDraw = result.isDraw;
    this.eliminatedPlayerId = result.eliminatedPlayerId;

    this.endedAt = Date.now();
    this.emit();
  }

  // ── Restart / Destroy ─────────────────────────────────────────────

  restart(): void {
    for (const player of this.players) {
      player.reset();
      player.lastActionResult = null;
      // HUH ? where does this come from ? wtf ? 
      // // NOTE : look into this
      (player as any)._wasClone = undefined;
      (player as any)._clonedRoleName = undefined;
      (player as any)._clonedRole = undefined;
      (player as any)._cloneAwaitingSecondAction = undefined;
      (player as any)._cloneFirstResult = undefined;
    }

    this.startedAt = null;
    this.allPlayersReady = false;
    this.groundRoles = [];
    this.prettyVotes = [];

    for (const playerId of this.readyPlayers.keys()) {
      this.readyPlayers.set(playerId, false);
    }

    this.votes = [];
    this.winners = null;
    this.phase = Phase.Waiting;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.roleRevealTimeout) {
      clearTimeout(this.roleRevealTimeout);
      this.roleRevealTimeout = null;
    }
    this.roleRevealEndsAt = null;
    this.confirmedPlayerRoleReveal = [];
    this.confirmedPlayerPerformActions = [];
    this.currentTimerSec = 0;

    this.availableRoles = this.roleAssigner.createRoles();
    this.roleQueue = this.roleAssigner.createRoleQueue();
    this.roleQueueIndex = 0;
    this.currentActiveRole = "";
    this.lastActivityAt = Date.now();

    this.endedAt = null;

    this.actionHistory = [];
    this.gamePings = {};
    this.gamePingTimestamps = {};

    this.nightManager.clearTimers();

    this.logger.info(
      `available roles: ${this.availableRoles.map((r) => r.name)}`,
    );
    this.logger.info("Game restarted");
    this.emit();
  }

  destroy(): void {
    clearInterval(this.timerInterval);
    this.nightManager.clearTimers();
    this.players = [];
  }

  // ── Internal Helpers ──────────────────────────────────────────────

  private generateCode(): string {
    return (this.code = Math.random().toString(36).substring(2, 8));
  }

  private arePlayersReady(): boolean {
    if (this.readyPlayers.size !== this.players.length) {
      return false;
    }
    for (const player of this.players) {
      const ready = this.readyPlayers.get(player.id);
      if (ready === undefined || ready === false) {
        return false;
      }
      if (!ready) {
        return false;
      }
    }
    return true;
  }

  // TODO : can this be optimized? // maybe a map of sockets to players?
  emit() {
    this.io.sockets.sockets.forEach((socket: PlayerSocket) => {
      if (socket.rooms.has(this.code)) {
        socket.emit(
          SOCKET_EVENTS.SERVER.UPDATE_GAME_SNAPSHOT,
          BuildGameSnapshot(this, socket.playerId),
        );
      }
    });
  }
}

function activeRoleIndex(game: Game): number | null {
  if (!game.currentActiveRole) return null;
  const i = game.roleQueue.indexOf(game.currentActiveRole);
  return i >= 0 ? i : null;
}

export function BuildGameSnapshot(
  game: Game,
  requestingPlayerId?: PlayerId,
): UpdateGamePayload {
  const isEndGame = game.phase === Phase.EndGame;

  return {
    code: game.code,
    phase: game.phase,
    hostId: game.host,
    players: game.players.map((p) => ({
      id: p.id,
      name: p.name,
      isReady: game.readyPlayers.get(p.id) ?? false,
      hasConfirmedRole: game.confirmedPlayerRoleReveal.includes(p.id),
      hasVoted: game.votes.some((v) => v.voter === p.id),
      isHost: p.id === game.host,
      ping: game.gamePings?.[p.id] ?? 0,
      isConnected: game.connectedPlayers.has(p.id), //
    })),
    groundCards: game.groundRoles.map((r, i) => ({
      id: r.id,
      label: `Ground Card ${i + 1}`,
    })),
    roleQueue: game.roleQueueWithTimer,
    currentActiveRole: game.currentActiveRole || null,
    currentActiveRoleIndex: activeRoleIndex(game),
    currentActiveRoleStartedAt: game.currentActiveRoleStartedAt,
    nightTimeRemaining: game.nightTimeRemaining,
    timer: {
      timerSeconds: game.timer != null ? game.timer * 60 : null,
      currentTimerSec: game.currentTimerSec ?? null,
      startedAt: game.startedAt ?? null,
    },
    winners: game.winners ?? null,
    isDraw: isEndGame ? game.finalIsDraw : false,
    eliminatedPlayerId: isEndGame ? game.eliminatedPlayerId : null,
    resultsVotes: isEndGame
      ? game.prettyVotes.map((v) => ({
        voter: game.players.find((p) => p.id === v.voter)?.name ?? v.voter,
        vote:
          v.vote === "noWerewolf"
            ? "No Werewolf"
            : (game.players.find((p) => p.id === v.vote)?.name ?? v.vote),
      }))
      : null,
    resultsPlayerRoles: isEndGame
      ? game.players.map((p) => ({
        playerId: p.id,
        name: p.name,
        role: p.getRole().name,
      }))
      : null,
    actionHistory:
      isEndGame
        ? game.actionHistory
        : game.phase === Phase.Discussion
          ? game.actionHistory.filter((a) => a.playerId === requestingPlayerId)
          : null,
    playerPrivateData: requestingPlayerId
      ? buildPlayerPrivateData(game, requestingPlayerId)
      : null,
    yourPlayerId: requestingPlayerId ?? null,
    roleRevealEndsAt: game.roleRevealEndsAt,
  };
}

function buildPlayerPrivateData(
  game: Game,
  playerId: PlayerId,
): PlayerPrivateData | null {
  let player: ReturnType<typeof game.getPlayerById>;
  try {
    player = game.getPlayerById(playerId);
  } catch {
    return null;
  }

  // Serve what this player legitimately knows about their own card,
  // never the live truth — silent swaps (robber/drunk/warlock/troublemaker
  // victims) must not leak through snapshots. Full truth is revealed
  // publicly at endgame via resultsPlayerRoles.
  const knownRole = player.getKnownRole();
  const originalRole = player.getOriginalRole();
  const voteEntry = game.votes.find((v) => v.voter === playerId);

  return {
    currentRole: knownRole?.name ?? null,
    originalRole: originalRole?.name ?? null,
    roleTeam: knownRole?.team ?? null,
    roleDescription: knownRole?.description ?? null,
    hasConfirmedRole: game.confirmedPlayerRoleReveal.includes(playerId),
    hasPerformedAction: game.confirmedPlayerPerformActions.includes(playerId),
    hasVoted: !!voteEntry,
    votedForId: voteEntry?.vote ?? null,
    lastActionResult: player.lastActionResult ?? null,
  };
}
