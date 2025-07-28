import { Manager } from '../src/entities/manager';

test('Manager test', function () {
      const manager = new Manager();
      expect(manager.games.length).toBe(0);
      expect(manager.logger).toBeDefined();
      const game = manager.createGame();
      expect(game).toBeDefined();
      expect(game.code).toBeDefined();
      expect(manager.games.length).toBe(1);
      manager.joinGame(game.code, 'testUser');
      expect(game.players.length).toBe(1);
      manager.deleteGame(game);
      expect(manager.games.length).toBe(0);
});
