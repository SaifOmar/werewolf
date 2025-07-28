import { Router } from 'express';
import { createNewGameRoom, getGameRoomByCode, homeView, playerJoinGame } from '../views/homeView';

const router = Router();

router.get('/', homeView);
router.post('/games/create', createNewGameRoom);
router.get('/games/:code', getGameRoomByCode);
router.post('/games/:code/join', playerJoinGame);
export default router;
