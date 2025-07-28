import { Game, Phase } from '../src/entities/game';
import Logger from '../src/entities/manager';
test('Game creation test', function () {
      const logger = Logger.getInstance();
      const game = new Game(logger);
      expect(game.code).toBeDefined();
      expect(game.players.length).toBe(0);
});
test('Game join test', function () {
      const logger = Logger.getInstance();
      const game = new Game(logger);
      expect(game.players.length).toBe(0);
      game.playerJoin('testUser');
      expect(game.players.length).toBe(1);
});

// TODO: game leave with test
// test('Game leave test', function () {});

test('Game start test', function () {
      const logger = Logger.getInstance();
      const game = new Game(logger);
      const playerJoinMock = jest.fn();
      const gameStartedMock = jest.fn();

      game.on('playerJoin', playerJoinMock);
      for (let i = 0; i < 7; i++) {
            game.playerJoin(`testUser${i}`);
      }

      expect(playerJoinMock).toHaveBeenCalledTimes(7);
      expect(game.players.length).toBe(7);
      game.on('gameStarted', gameStartedMock);
      game.start();
      expect(game.phase).toBe(Phase.Night);
      expect(gameStartedMock).toHaveBeenCalledTimes(1);
});

test.concurrent(
      'Game start day test',
      async function () {
            jest.useFakeTimers();
            const logger = Logger.getInstance();
            const game = new Game(logger);
            const playerJoinMock = jest.fn();
            const gameStartedMock = jest.fn();
            const dayStartedMock = jest.fn();
            const timerArray: number[] = [];
            const tickMock = jest.fn();
            const timerFinishedMock = jest.fn();
            game.on('playerJoin', playerJoinMock);
            for (let i = 0; i < 7; i++) {
                  game.playerJoin(`testUser${i}`);
            }
            expect(playerJoinMock).toHaveBeenCalledTimes(7);
            expect(game.players.length).toBe(7);
            game.on('gameStarted', gameStartedMock);
            game.on('dayStarted', dayStartedMock);
            game.on('timerTick', (timer: number) => {
                  timerArray.push(timer);
                  tickMock();
            });
            game.on('timerFinished', timerFinishedMock);
            game.start();
            expect(game.phase).toBe(Phase.Night);
            expect(gameStartedMock).toHaveBeenCalledTimes(1);
            game.startDay();
            expect(dayStartedMock).toHaveBeenCalledTimes(1);
            jest.advanceTimersByTime(3000);
            expect(tickMock).toHaveBeenCalledTimes(3);
            expect(timerArray).toEqual([3, 2, 1]);
            console.log(timerArray);
            expect(game.phase).toBe(Phase.Day);
            jest.useRealTimers();
      },
      10000,
);
