import { Request, Response } from 'express';
import { manager } from '../server/server';
const homeView = (req: Request, res: Response) => {
      res.send('hello to the fucking world');
};
type Message = {
      message: string;
      data?: object;
};

const createNewGameRoom = (req: Request, res: Response) => {
      const game = manager.createGame();
      if (game === undefined || game.code === undefined) {
            throw new Error(`An error occured while creating a game`);
      }
      const message: Message = {
            message: 'Game created',
            data: { code: game.code },
      };
      res.status(200).send(message);
};

const getGameRoomByCode = (req: Request, res: Response) => {
      const code = req.params.code;
      if (code === undefined) {
            res.status(400).send('Code is required');
            return;
      }
      if (typeof code !== 'string') {
            res.status(400).send('Code must be a string');
            return;
      }
      const game = manager.getGameByCode(code);
      if (game === null) {
            res.status(404).send('Game not found');
            return;
      }
      const message: Message = {
            message: 'Game found',
            // INFO: I don't know what I should be sending here yet
            data: { game: game },
      };
      res.status(200).send(message);
};

const playerJoinGame = (req: Request, res: Response) => {
      const code = req.params.code;
      if (req.method !== 'POST') {
            res.status(405).send('Method not allowed');
            return;
      }
      if (req.body.name === undefined) {
            res.status(400).send('Name is required');
            return;
      }
      if (req.body.name.length > 20) {
            res.status(400).send('Name must be less than 20 characters');
            return;
      }
      if (req.body.name === '') {
            res.status(400).send('Name cannot be empty');
            return;
      }
      if (typeof req.body.name !== 'string') {
            res.status(400).send('Name must be a string');
            return;
      }
      const game = manager.getGameByCode(code);

      if (game === null) {
            res.status(404).send('Game not found');
            return;
      }
      if (manager.canJoinGame(req.body.code)) {
            res.status(400).send('This game has already started');
            return;
      }
      game.playerJoin(req.body.name);
      const message: Message = {
            message: 'Player joined',
            data: { game: game },
      };
      res.status(200).send(message);
};

export { createNewGameRoom, getGameRoomByCode, homeView, playerJoinGame };
