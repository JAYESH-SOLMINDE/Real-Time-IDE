"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const roomController_1 = require("../controllers/roomController");
const router = (0, express_1.Router)();
// All room routes require authentication
router.use(authMiddleware_1.protect);
// Room CRUD
router.post('/', roomController_1.createRoom);
router.post('/join', roomController_1.joinRoom);
router.get('/my-rooms', roomController_1.getMyRooms);
// Room-specific routes (require membership)
router.get('/:roomId', rbacMiddleware_1.requireRoomMember, roomController_1.getRoom);
router.get('/:roomId/members', rbacMiddleware_1.requireRoomMember, roomController_1.getRoomMembers);
// Owner-only actions
router.patch('/:roomId/role', (0, rbacMiddleware_1.requireRoomRole)('owner'), roomController_1.changeRole);
router.delete('/:roomId/member', (0, rbacMiddleware_1.requireRoomRole)('owner'), roomController_1.removeMember);
router.delete('/:roomId', (0, rbacMiddleware_1.requireRoomRole)('owner'), roomController_1.deleteRoom);
router.patch('/:roomId/transfer', (0, rbacMiddleware_1.requireRoomRole)('owner'), roomController_1.transferOwnership);
exports.default = router;
