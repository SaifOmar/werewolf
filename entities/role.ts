import { Action, SeerActionType } from './actions';
import { Game } from './game';
import { Player } from './player';

export enum Team {
      Villains = 'werewolf',
      Heroes = 'villagers',
}
export interface Role {
      id: string;
      name: string;
      team: Team;
      description: string;
      performAction(): Function;
}

export class Werewolf implements Role {
      public name: string = 'Werewolf';
      public team: Team = Team.Villains;
      public description: string = 'The most evil creature in the game';
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'werewolf') {
                        throw new Error(`Invalid action for Robber. Expected 'robber', received '${action.type}'.`);
                  }
                  return game.players.filter((p) => p.getRole().name.toLowerCase() === 'werewolf' && p.name !== player.name);
            };
      }
}

export class Seer implements Role {
      public name: string = 'Seer';
      public team: Team = Team.Heroes;
      public description: string = 'The most evil creature in the game';
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== SeerActionType.SeeGroundRoles && action.type !== SeerActionType.SeePlayerRole) {
                        throw new Error(`Invalid action for Seer. Expected 'seer_player_role' or 'seer_ground_roles', received '${action.type}'.`);
                  }
                  if (action.type === SeerActionType.SeeGroundRoles) {
                        const grounRoles1 = game.groundRoles.find((r) => r === action.groundRole1)!.name.toLowerCase();
                        const grounRoles2 = game.groundRoles.find((r) => r === action.groundRole2)!.name.toLowerCase();
                        return [grounRoles1, grounRoles2];
                  } else if (action.type === SeerActionType.SeePlayerRole) {
                        return game.players
                              .find((p) => action.targetPlayer!.name === p.name)!
                              .getRole()
                              .name.toLowerCase();
                  }
            };
      }
}

export class Robber implements Role {
      public name: string = 'Robber';
      public description: string = 'The most evil creature in the game';
      public team: Team = Team.Heroes;
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'robber') {
                        throw new Error(`Invalid action for Robber. Expected 'robber', received '${action.type}'.`);
                  }
                  let selectedPlayer = game.players.find((p) => p.name === action.targetPlayer!.name)!;
                  let temp = player.getRole();
                  player.setRole(selectedPlayer.getRole());
                  selectedPlayer.setRole(temp);
                  return player.getRole().name.toLowerCase();
            };
      }
}
export class Drunk implements Role {
      public name: string = 'Drunk';
      public team: Team = Team.Heroes;
      public description: string = 'The most evil creature in the game';
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'drunk') {
                        throw new Error(`Invalid action for Drunk. Expected 'drunk', received '${action.type}'.`);
                  }
                  let groundRole = game.groundRoles.find((r) => r.id === action.targetRoleId)!;
                  let temp = player.getRole();
                  player.setRole(groundRole);
                  groundRole = temp;
                  return player.getRole().name.toLowerCase();
            };
      }
}
export class Troublemaker implements Role {
      public name: string = 'Troublemaker';
      public description: string = 'The most evil creature in the game';
      public team: Team = Team.Heroes;
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'troublemaker') {
                        throw new Error(`Invalid action for Troublemaker. Expected 'troublemaker', received '${action.type}'.`);
                  }
                  const player1 = game.players.find((p) => p.name === action.player1.name)!;
                  const player2 = game.players.find((p) => p.name === action.player2.name)!;
                  let temp = player1.getRole();
                  player1.setRole(player2.getRole());
                  player2.setRole(temp);
                  return [player1, player2];
            };
      }
}

export class Mason implements Role {
      public name: string = 'Mason';
      public description: string = 'The most evil creature in the game';
      public team: Team = Team.Heroes;
      public id: string;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'mason') {
                        throw new Error(`Invalid action for Mason. Expected 'Mason', received '${action.type}'.`);
                  }
                  return game.players.filter((p) => p.getRole().name.toLowerCase() === 'mason' && p.name !== player.name);
            };
      }
}

export class Minion implements Role {
      public name: string = 'Minion';
      public description: string = 'The most evil creature in the game';
      public id: string;
      public team: Team = Team.Villains;
      public constructor() {
            this.id = Math.random().toString(36).substring(2, 10);
      }
      public performAction() {
            return function (game: Game, player: Player, action: Action) {
                  if (action.type !== 'minion') {
                        throw new Error(`Invalid action for Minion. Expected 'minion', received '${action.type}'.`);
                  }
                  return game.players.filter((p) => p.getRole().name.toLowerCase() === 'werewolf');
            };
      }
}

export const RoleClasses = {
      werewolf: Werewolf,
      mason: Mason,
      seer: Seer,
      robber: Robber,
      troublemaker: Troublemaker,
      drunk: Drunk,
      minion: Minion,
};
