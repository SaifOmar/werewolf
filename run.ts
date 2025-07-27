import * as actions from './entities/actions';
import { Game } from './entities/game';
import { Manager } from './entities/manager';

const manager = new Manager();
let game = manager.createGame();
game.playerJoin('Saif');
game.playerJoin('Mohamed');
game.playerJoin('Merna');
game.playerJoin('Sahar');
game.playerJoin('Ahmed');
game.playerJoin('Salah');
game.playerJoin('Omar');
game.start();
game.on('timerTick', (totalSeconds) => {
      manager.logger.log(`timerTick ${totalSeconds}`);
});
game.on('votingStarted', () => {
      vote(game, manager.logger);
      game.getVoteResults().forEach((res) => {
            manager.logger.log(`voter: ${res.voter} voted: ${res.vote}`);
      });
});
game.on('votesCalculated', (mapVotes) => {
      const res = game.calculateResults(mapVotes);
      manager.logger.log(res);
});
game.startDay().then(function () {
      game.startVoting();
});
const groundRolesId = game.groundRoles.map((r) => r.id);
// handle loggin to the logger here

function vote(game: Game, logger: any) {
      game.players.forEach((p) => {
            p.vote(game, game.players[Math.floor(Math.random() * game.players.length)].id);
      });
}
function performActionsInOrder(game: Game, logger: any) {
      // order of actions 1. werewolf , 2. mason, 3. seer, 4.robber,5. troublemaker, 6.drunk
      const werewolfs = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'werewolf');
      werewolfs.forEach((w) => {
            const action = actions.createAction.werewolf();
            const res = w.performAction(game, action);
            logger.log(`Werewolf ${w.name} performed action`);
            logger.log(res.map((r) => r.name));
      });
      const minion = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'minion');
      minion.forEach((m) => {
            const action = actions.createAction.minion();
            const res = m.performAction(game, action);
            logger.log(`Minion ${m.name} performed action`);
            logger.log(res.map((r) => r.name));
      });

      const masons = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'mason');
      masons.forEach((m) => {
            const action = actions.createAction.mason();
            const res = m.performAction(game, action);
            logger.log(`Mason ${m.name} performed action`);
            logger.log(res.map((r) => r.name));
      });

      const seers = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'seer');
      seers.forEach((s) => {
            const action = actions.createAction.seerSeePlayer(game.players.find((p) => p.name.toLowerCase() === 'saif')!);
            const res = s.performAction(game, action);
            logger.log(`Seer ${s.name} looked at Saif`);
            logger.log(res);
      });

      const robbers = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'robber');
      robbers.forEach((r) => {
            const action = actions.createAction.robber(game.players.find((p) => p.name.toLowerCase() === 'mohamed')!);
            console.log('Calling performAction with:', {
                  playerName: r.name,
                  originalRole: r.getOriginalRole().name,
                  currentRole: r.getRole().name,
                  actionType: action.type,
            });
            const res = r.performAction(game, action);
            logger.log(`Robber ${r.name} robbed Mohamed`);
            logger.log(res);
      });

      const troublemakers = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'troublemaker');
      troublemakers.forEach((t) => {
            const action = actions.createAction.troublemaker(
                  game.players.find((p) => p.name.toLowerCase() === 'merna')!,
                  game.players.find((p) => p.name.toLowerCase() === 'sahar')!,
            );
            const res = t.performAction(game, action);
            logger.log(`Troublemaker ${t.name} swapped Merna and Sahar`);
            logger.log(res);
      });

      const drunks = game.players.filter((p) => p.getOriginalRole().name.toLowerCase() === 'drunk');
      drunks.forEach((d) => {
            const action = actions.createAction.drunk(groundRolesId[0]);
            const res = d.performAction(game, action);
            logger.log(`Drunk ${d.name} swapped with ground role: ${groundRolesId[0]}`);
            logger.log(res);
      });
}
performActionsInOrder(game, manager.logger);
const MESSAGE = '###########################';
manager.logger.info(MESSAGE);
game.finish();
