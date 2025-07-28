import { Action } from './actions';
import Logger from './manager';
import { Player } from './player';
import { Role, RoleClasses, Team } from './role';

import { EventEmitter } from 'events';
//WARNING: Just random phases
export const enum Phase {
      Waiting = 'waiting',
      Initial = 'initial',
      Night = 'night',
      Day = 'day',
      Voting = 'voting',
      Finished = 'finished',
}

export enum TimerOption {
      TenMinutes = 10,
      SixMinutes = 6,
      FourMinutes = 4,
}

export type Vote = {
      // ids
      voter: string;
      vote: string;
};

export class Game extends EventEmitter {
      public groundRoles: Role[];
      public players: Player[];
      public phase: Phase;
      public code: string;
      public numberOfWerewolf: number = 3;
      public numberOfMasons: number = 2;
      public logger: Logger;
      public actions: Action[];
      public logsEnabled: boolean = false;
      public votes: Vote[];
      public currentTimerSec: number;
      public timer: TimerOption = TimerOption.SixMinutes;
      public winners: Team;
      private maxNumberOfPlayers: number = 7;
      private _availableRoles: Role[];
      private readonly numberOfGroundRoles: number = 3;

      public constructor(logger: Logger) {
            super();
            this.logger = logger;
            this.actions = [];
            this.votes = [];
            this.code = Math.random().toString(36).substring(2, 10);
            this._availableRoles = [];
            this.players = [];
            this.phase = Phase.Waiting;
            this.currentTimerSec = this.timer * 60;
            // HACK: should implement this well when the server structre is there
            this._availableRoles = getRolesFromDB(this.numberOfWerewolf, this.numberOfMasons);
            this.logger.info(`available roles: ${this._availableRoles.map((r) => r.name)}`);
            this.logger.info('Game created');
      }

      public playerJoin(name: string): void {
            this.logger.info(`playerJoin ${name}`);
            if (this.players.length + 1 > this.maxNumberOfPlayers) {
                  // how should I do this?
                  this.logger.error(`Game is full please join another game`);
                  console.error(`Game is full please join another game`);
                  return;
            }
            if (this.players.find((p) => p.name === name)) {
                  throw new Error(`A player with this name (${name}) already joined please chose another name`);
            }
            this.players.push(new Player(name));
            this.emit('playerJoin', name);
      }
      public start(): void {
            this.assignRandomRoles();
            this.groundRoles = this._availableRoles.slice(0, this.numberOfGroundRoles);
            this.logger.log(`ground roles: ${this.groundRoles.map((r) => r.name)}`);
            this.phase = Phase.Night;
            this.logger.log('Game started');
            this.logGame();
            this.emit('gameStarted');
      }
      public startDay(): Promise<void> {
            this.phase = Phase.Day;
            console.log('Game state is now day');
            let totalSeconds = this.timer * 60;
            totalSeconds = 3;
            this.emit('dayStarted');
            return new Promise((resolve) => {
                  const interval = setInterval(() => {
                        this.emit('timerTick', totalSeconds);
                        if (totalSeconds <= 0) {
                              this.currentTimerSec = 0;
                              this.emit('timerFinished');
                              clearInterval(interval);
                              resolve();
                        }
                        totalSeconds--;
                  }, 1000);
            });
      }
      public startVoting(): void {
            this.phase = Phase.Voting;
            this.emit('votingStarted');
            this.logger.log('Game state is now voting');
      }
      public getVoteResults(): Vote[] {
            let votes = this.votes;
            let mapVotes = new Map();
            for (let i = 0; i < votes.length; i++) {
                  let vote = votes[i];
                  if (mapVotes.has(vote.vote)) {
                        mapVotes.set(vote.vote, mapVotes.get(vote.vote) + 1);
                  } else {
                        mapVotes.set(vote.vote, 1);
                  }
                  vote.voter = this.getPlayerById(vote.voter).name;
                  vote.vote = this.getPlayerById(vote.vote).name;
            }
            this.emit('votesCalculated', mapVotes);
            return votes;
      }
      public calculateResults(mapVotes: Map<string, number>): string {
            let prev = 0;
            let voted = '';
            mapVotes.forEach((value, key) => {
                  if (prev < value) {
                        prev = value;
                        voted = key;
                  }
            });
            voted = this.getPlayerById(voted).getRole().team;
            if (voted === 'werewolf') {
                  this.winners = Team.Heroes;
            } else {
                  this.winners = Team.Villains;
            }
            this.emit('winnersCalculated', this.winners);
            return this.winners;
      }

      public finish(): void {
            this.logger.info('Game finished');
            this.phase = Phase.Finished;
            this.emit('gameFinished');
            console.log('Game finished');
            this.logGame();
      }
      public restart(): void {
            this.emit('gameRestarted');
            this.logger.info('Game restarted');
            this.logGame();
            this.phase = Phase.Waiting;
            console.log('Game restarted, game state is now waiting');
      }
      public getNumberOfPlayers(): number {
            return this.players.length;
      }
      public getPlayerById(id: string): Player {
            const player = this.players.find((p) => p.id === id);
            if (player !== undefined) {
                  return player;
            }
            throw new Error(`Player with id ${id} not found`);
      }
      public getAvailableRoles(): Role[] {
            return this._availableRoles;
      }
      private logGame(): void {
            if (!this.logsEnabled) return;
            this.logger.log(`players: ${this.players.map((p) => p.name)}`);
            this.logger.log(`current phase: ${this.phase}`);
            this.logger.log(`number of players: ${this.players.length}`);
            for (let i = 0; i < this.players.length; i++) {
                  this.logger.log(`player ${this.players[i].name} role: ${this.players[i].getRole().name}`);
            }
      }
      private assignRandomRoles(): void {
            let availableRoles = this._availableRoles;
            this.logger.info(`available roles: ${availableRoles.map((r) => r.name)}`);
            if (availableRoles.length < this.players.length + 3) {
                  console.error('There is not enough roles to assign to all players');
            }
            for (let i = 0; i < this.players.length; i++) {
                  const randomIndex = Math.floor(Math.random() * availableRoles.length);
                  const role = availableRoles[randomIndex];
                  this.players[i].AddRole(role);
                  availableRoles.splice(randomIndex, 1);
            }
      }
}

// HACK: We read from a db or something but wtf is this
export const getRolesFromDB = function (numberOfWerewolf: number = 3, numberOfMasons: number = 2): Role[] {
      let roles: Role[] = [];
      const roleNames = ['Werewolf', 'Mason', 'Seer', 'Drunk', 'Troublemaker', 'Robber', 'Minion'];
      for (let i = 0; i < roleNames.length; i++) {
            let role: Role;
            if (roleNames[i] === 'Mason') {
                  continue;
            }
            if (roleNames[i] === 'Werewolf') {
                  for (let j = 0; j < numberOfWerewolf; j++) {
                        role = new RoleClasses[roleNames[0].toLowerCase()]();
                        roles.push(role);
                        if (j < numberOfMasons) {
                              role = new RoleClasses[roleNames[1].toLowerCase()]();
                              roles.push(role);
                        }
                  }
                  continue;
            }
            role = new RoleClasses[roleNames[i].toLowerCase()]();
            roles.push(role);
      }
      return roles;
};
