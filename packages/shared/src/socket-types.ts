import type { PlayerId, Settings, UpdateGamePayload } from "./game-types.js";

export interface JoinGameData {
  gameCode: string;
  playerName: string;
}

export interface RejoinGameData {
  gameCode: string;
  playerId: string;
  playerName: string;
}

export interface ClientToServerEvents {
  updateGameSnapShot: (snapShot: UpdateGamePayload) => void;
  joinGame: (data: JoinGameData) => void;
  rejoinGame: (data: RejoinGameData) => void;
  leaveGame: (data: { gameCode: string; playerId: PlayerId }) => void;
  startGame: (data: { gameCode: string; playerId: PlayerId }) => void;
  confirmRoleReveal: (data: { gameCode: string; playerId: PlayerId }) => void;
  performAction: (data: { gameCode: string; playerId: PlayerId; action: any }) => void;
  vote: (data: { gameCode: string; playerId: PlayerId; votedPlayerId: PlayerId }) => void;
  restartGame: (data: { gameCode: string; playerId: PlayerId }) => void;
  skipToVote: (data: { gameCode: string; playerId: PlayerId }) => void;
  playerReady: (data: { gameCode: string; playerId: PlayerId; ready: boolean }) => void;
  kickPlayer: (data: { gameCode: string; hostId: PlayerId; kickedPlayerId: PlayerId }) => void;
  assignHost: (data: { gameCode: string; playerId: PlayerId; newHostId: PlayerId }) => void;
  settingsUpdate: (data: { gameCode: string; playerId: PlayerId; settings: Settings }) => void;
  pingMeasure: (data: { gameCode: string; playerId: string }) => void;
  reportPing: (data: { gameCode: string; playerId: string; ping: number }) => void;
  forceVotes: (data: { gameCode: string; playerId: string }) => void;
  changeName: (data: { gameCode: string; playerId: string; newName: string }) => void;

  // TODO: revaemp
  voiceJoin: (data: { gameCode: string; playerId: PlayerId }) => void;
  voiceOffer: (data: { to: PlayerId; offer: any }) => void;
  voiceAnswer: (data: { to: PlayerId; answer: any }) => void;
  voiceIce: (data: { to: PlayerId; candidate: any }) => void;
  voiceLeave: (data: { playerId: PlayerId }) => void;
}

export interface ServerToClientEvents {
  updateGameSnapShot: (snapShot: UpdateGamePayload) => void;
  error: (data: { message: string }) => void;
  kicked: (data: { message: string }) => void;
  hostTransferred: (data: { message: string }) => void;

  // TODO: revaemp
  voiceNewPeer: (data: { playerId: PlayerId }) => void;
  voiceOffer: (data: { from: PlayerId; offer: any }) => void;
  voiceAnswer: (data: { from: PlayerId; answer: any }) => void;
  voiceIce: (data: { from: PlayerId; candidate: any }) => void;
  voiceLeave: (data: { playerId: PlayerId }) => void;
  voiceExistingPeers: (data: { players: PlayerId[] }) => void;
}
