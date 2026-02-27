import { Router } from 'express';
import { createRoom, getRoom } from '../controllers/roomController';

const router = Router();

router.post('/', createRoom);
router.get('/:roomId', getRoom);

export default router;