import { Action } from './actions';
import { Game, Phase } from './game';
import { Role } from './role';

export class Player {
      private role: Role;
      private originalRole: Role;
      public name: string;
      public id: string;
      public constructor(name: string) {
            this.name = name;
            this.id = Math.random().toString(36).substring(2, 5);
      }
      // public setName(name: string): void {
      //     this.name = name;
      // }
      public getOriginalRole(): Role {
            return this.originalRole;
      }
      public AddRole(role: Role): void {
            this.originalRole = role;
            this.role = role;
      }
      public getRole(): Role {
            return this.role;
      }
      public setRole(role: Role): void {
            this.role = role;
      }
      public performAction(game: Game, action: Action) {
            if (game.phase !== Phase.PerfomActions) {
                  throw new Error('Game is not in perfom actions phase');
            }
            return this.role.performAction()(game, this, action);
      }
      public toString(): string {
            return this.name;
      }
      public vote(game: Game, vote: string) {
            return game.votes.push({ voter: this.id, vote: vote });
      }
}
