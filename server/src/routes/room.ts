import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireRoomRole, requireRoomMember } from '../middleware/rbacMiddleware';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomMembers,
  changeRole,
  removeMember,
  deleteRoom,
  transferOwnership,
  getMyRooms,
} from '../controllers/roomController';

const router = Router();

// All room routes require authentication
router.use(protect);

// Room CRUD
router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/my-rooms', getMyRooms);

// Room-specific routes (require membership)
router.get('/:roomId', requireRoomMember, getRoom);
router.get('/:roomId/members', requireRoomMember, getRoomMembers);

// Owner-only actions
router.patch('/:roomId/role', requireRoomRole('owner'), changeRole);
router.delete('/:roomId/member', requireRoomRole('owner'), removeMember);
router.delete('/:roomId', requireRoomRole('owner'), deleteRoom);
router.patch('/:roomId/transfer', requireRoomRole('owner'), transferOwnership);

export default router;