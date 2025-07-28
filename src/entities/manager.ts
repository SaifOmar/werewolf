import fs from 'fs';
import path from 'path';
import { cwd } from 'process';
import { Game, Phase } from './game';
//A manager class that douples as a cache layer for running games
export class Manager {
      public games: Game[];
      public logger: Logger;
      public constructor() {
            this.games = [];
            this.logger = Logger.getInstance();
      }
      public createGame(): Game {
            let game = new Game(this.logger);
            this.games.push(game);
            return game;
      }
      public joinGame(code: string, name: string): Game | null {
            if (!name || name.length === 0 || typeof name !== 'string') {
                  console.error('Invalid name: ', name);
                  return null;
            }
            let game = this.games.find((game) => game.code === code);
            if (game) {
                  if (game.phase !== Phase.Waiting) {
                        console.error('this game has already started');
                        return null;
                  }
                  game.playerJoin(name);
                  return game;
            } else {
                  return null;
            }
      }

      public deleteGame(game: Game): void {
            this.games = this.games.filter((g) => g !== game);
      }
      private deleteGameByCode(code: string): void {
            this.games = this.games.filter((g) => g.code !== code);
      }
      private deleteFinishedGames(): void {
            let finished = this.games.filter((g) => g.phase === Phase.Finished);
            finished.forEach((game) => this.deleteGame(game));
      }
}

class Logger {
      private readonly filePath: string;
      private file: fs.WriteStream;
      public static instance: Logger;

      constructor() {
            const __dirname = cwd();
            this.filePath = __dirname + '/logs/game.log';
            this.file = this.createFile();
      }
      public static getInstance(): Logger {
            if (!Logger.instance) {
                  Logger.instance = new Logger();
            }
            return Logger.instance;
      }

      public static close(): void {
            if (Logger.instance) {
                  Logger.instance.file.close();
            }
      }
      private createFile(): fs.WriteStream {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
            }
            return fs.createWriteStream(this.filePath, { flags: 'a' });
      }
      public info(message: string): void {
            this.file.write(this.format(message, 'INFO'));
      }
      public debug(message: string): void {
            this.file.write(this.format(message, 'DEBUG'));
      }
      public log(message: string): void {
            this.file.write(this.format(message, 'LOG'));
            console.log(message);
      }
      private format(message: string, level: string): string {
            return `${new Date().toISOString()} ${level}: ${message}\n`;
      }
      public error(message: string): void {
            this.file.write(this.format(message, 'ERROR'));
      }

      public json(message: string, data: any): void {
            this.file.write(this.format(`${message}: ${JSON.stringify(data, null, 2)}`, 'DATA'));
      }
      public logToConsole(message: string): void {
            console.log(message);
      }
}
export default Logger;
