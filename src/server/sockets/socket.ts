import { Server } from 'socket.io';
import { Action } from '../../entities/actions';
import { manager, server } from '../server';

const io = new Server(server);

io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('joinGame', (code: string, playerName: string) => {
            socket.data.code = code;
            socket.data.name = playerName;
            socket.join(code);
            socket.emit('playerJoin', code, playerName);
            io.to(code).emit('playerListUpdate', manager.getGameByCode(code)!.players);
      });
      socket.on('leaveGame', (code: string, playerName: string) => {
            socket.data.code = code;
            socket.data.name = playerName;
            socket.leave(code);
            io.to(code).emit('playerListUpdate', manager.getGameByCode(code)!.players);
      });
      socket.on('startGame', () => {
            const game = manager.getGameByCode(socket.data.code);
            if (game === null) {
                  throw new Error(`Game not found`);
            }
            game.on('gameStarted', () => {
                  // TODO:  still need to figure out what to send to clients
                  io.to(game.code).emit('gameStarted', game);
            });
            game.start();
      });
      socket.on('playerSeeRole', (playerId: string) => {
            const game = manager.getGameByCode(socket.data.code)!;
            game.playerSeenRole(playerId);
            if (game.eventNames().includes('perfomActionsStarted')) {
                  io.to(game.code).emit('perfomActionsStarted', game);
            }
      });
      socket.on('playerPerformAction', (playerId: string, action: Action) => {
            const game = manager.getGameByCode(socket.data.code)!;
            const player = game.getPlayerById(playerId);
            const result = player.performAction(game, action);
            game.playerPerformAction(player);
            socket.emit('playerPerformActionConfirmed', result);
            io.to(game.code).emit('playerPerformedAction', player.name);
            manager.log(game.playersPerformedActions);
            manager.log(result);
            if (game.eventNames().includes('dayStarted')) {
                  io.to(game.code).emit('dayStarted', game);
                  game.on('timerTick', (totalSeconds) => {
                        io.to(game.code).emit('timerTick', totalSeconds);
                  });
                  game.on('timerFinished', () => {
                        io.to(game.code).emit('timerFinished', game);
                        game.startVoting();
                  });
                  game.on('votingStarted', () => {
                        io.to(game.code).emit('votingStarted', game);
                  });
            }
      });

      socket.on('playerVote', (playerId: string, vote: string) => {
            const game = manager.getGameByCode(socket.data.code)!;
            const player = game.getPlayerById(playerId);
            game.playerVote(player, vote);
            socket.emit('playerVoteConfirmed');
            game.on('gameFinished', (results) => {
                  io.to(game.code).emit('gameFinished', results);
            });
            // io.to(game.code).emit('playerVote', player.name, vote);
      });

      // TODO: add a ticker every(some amount of time) to check if the player is connected or not
      socket.on('disconnect', (playerName: string) => {
            io.to(socket.data.code).emit('playerDiconnect', playerName);
      });
      socket.on('disconnect', () => {
            console.log('user disconnected');
      });
});

io.on('error', (err) => {
      console.log('error', err);
});

export default io;
