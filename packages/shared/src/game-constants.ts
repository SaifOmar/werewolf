import { ROLE_REGISTRY } from "./role-registry.js";

export const MAX_PLAYERS = 12;
export const MIN_PLAYERS = 6;
export const NUMBER_OF_GROUND_ROLES = 3;

export const CLONE_ACTIVE_ROLES = ["seer", "robber", "troublemaker", "warlock"];

export const ROLE_NAMES = {
  WEREWOLF: ROLE_REGISTRY.werewolf.name,
  MINION: ROLE_REGISTRY.minion.name,
  CLONE: ROLE_REGISTRY.clone.name,
  SEER: ROLE_REGISTRY.seer.name,
  MASON: ROLE_REGISTRY.mason.name,
  ROBBER: ROLE_REGISTRY.robber.name,
  TROUBLEMAKER: ROLE_REGISTRY.troublemaker.name,
  DRUNK: ROLE_REGISTRY.drunk.name,
  INSOMNIAC: ROLE_REGISTRY.insomniac.name,
  JOKER: ROLE_REGISTRY.joker.name,
  WARLOCK: ROLE_REGISTRY.warlock.name,
  ORACLE: ROLE_REGISTRY.oracle.name,
} as const;

export const VALIDATION = {
  PLAYER_NAME_MIN_LENGTH: 2,
  PLAYER_NAME_MAX_LENGTH: 20,
  GAME_CODE_LENGTH: 6,
};

export const ERROR_MESSAGES = {
  GAME_NOT_FOUND: "Game not found",
  GAME_ALREADY_STARTED: "Game has already started",
  HOST_ONLY: "Only the host can perform this action",
  GAME_FULL: "Game is full",
  INVALID_PLAYER_NAME: "Invalid player name",
  PLAYER_NOT_FOUND: "Player not found",
  DUPLICATE_PLAYER_NAME: "A player with this name already exists",
  NOT_ENOUGH_PLAYERS: `Need at least ${MIN_PLAYERS} players to start`,
  INVALID_ACTION: "Invalid action for this role",
  NOT_YOUR_TURN: "It is not your turn",
  INVALID_PHASE: "Action not allowed in this phase",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again or contact support if the issue persists.",
};
