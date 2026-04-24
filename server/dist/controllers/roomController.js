"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRooms = exports.transferOwnership = exports.deleteRoom = exports.removeMember = exports.changeRole = exports.getRoomMembers = exports.getRoom = exports.joinRoom = exports.createRoom = void 0;
const uuid_1 = require("uuid");
const Room_1 = __importDefault(require("../models/Room"));
const RoomMember_1 = __importDefault(require("../models/RoomMember"));
const logger_1 = __importDefault(require("../utils/logger"));
// ── Create Room ──
// POST /api/rooms
// Body: { name? }
// Auto-assigns the creator as "owner"
const createRoom = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }
        const roomId = (0, uuid_1.v4)().split('-').slice(0, 3).join('-');
        const { name } = req.body;
        const room = await Room_1.default.create({
            roomId,
            name: name || 'Untitled Room',
            creatorId: userId,
            files: [],
        });
        // Auto-assign owner
        await RoomMember_1.default.create({ userId, roomId, role: 'owner' });
        res.status(201).json({ success: true, room, role: 'owner' });
    }
    catch (error) {
        logger_1.default.error(`Create room error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createRoom = createRoom;
// ── Join Room ──
// POST /api/rooms/join
// Body: { roomId }
// Assigns "viewer" role if not already a member
const joinRoom = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }
        const { roomId } = req.body;
        if (!roomId) {
            res.status(400).json({ success: false, message: 'Room ID is required' });
            return;
        }
        const room = await Room_1.default.findOne({ roomId });
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        // Check if already a member
        let member = await RoomMember_1.default.findOne({ userId, roomId });
        if (!member) {
            member = await RoomMember_1.default.create({ userId, roomId, role: 'viewer' });
        }
        res.json({ success: true, room, role: member.role });
    }
    catch (error) {
        logger_1.default.error(`Join room error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.joinRoom = joinRoom;
// ── Get Room ──
// GET /api/rooms/:roomId
// Returns room + user's role + member list
const getRoom = async (req, res) => {
    try {
        const room = await Room_1.default.findOne({ roomId: req.params.roomId });
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const members = await RoomMember_1.default.find({ roomId: req.params.roomId }).populate('userId', 'username name email');
        const memberList = members.map(m => ({
            id: m.userId?._id || m.userId,
            username: m.userId?.username || 'Unknown',
            name: m.userId?.name || 'Unknown',
            role: m.role,
            joinedAt: m.joinedAt,
        }));
        res.json({ success: true, room, role: req.roomRole, members: memberList });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRoom = getRoom;
// ── Get Room Members ──
// GET /api/rooms/:roomId/members
const getRoomMembers = async (req, res) => {
    try {
        const members = await RoomMember_1.default.find({ roomId: req.params.roomId }).populate('userId', 'username name email');
        const memberList = members.map(m => ({
            id: m.userId?._id || m.userId,
            username: m.userId?.username || 'Unknown',
            name: m.userId?.name || 'Unknown',
            role: m.role,
            joinedAt: m.joinedAt,
        }));
        res.json({ success: true, members: memberList });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRoomMembers = getRoomMembers;
// ── Change Member Role ──
// PATCH /api/rooms/:roomId/role
// Body: { targetUserId, newRole }
// Owner only
const changeRole = async (req, res) => {
    try {
        const { targetUserId, newRole } = req.body;
        const roomId = req.params.roomId;
        if (!targetUserId || !newRole) {
            res.status(400).json({ success: false, message: 'targetUserId and newRole are required' });
            return;
        }
        if (!['editor', 'viewer'].includes(newRole)) {
            res.status(400).json({ success: false, message: 'Role must be editor or viewer' });
            return;
        }
        // Cannot change own role
        if (targetUserId === req.user?.id) {
            res.status(400).json({ success: false, message: 'Cannot change your own role' });
            return;
        }
        const member = await RoomMember_1.default.findOne({ userId: targetUserId, roomId });
        if (!member) {
            res.status(404).json({ success: false, message: 'User is not a member of this room' });
            return;
        }
        if (member.role === 'owner') {
            res.status(400).json({ success: false, message: 'Cannot change owner role directly — use transfer ownership' });
            return;
        }
        member.role = newRole;
        await member.save();
        res.json({ success: true, message: `Role changed to ${newRole}` });
    }
    catch (error) {
        logger_1.default.error(`Change role error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.changeRole = changeRole;
// ── Remove Member ──
// DELETE /api/rooms/:roomId/member
// Body: { targetUserId }
// Owner only
const removeMember = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const roomId = req.params.roomId;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'targetUserId is required' });
            return;
        }
        // Cannot remove yourself
        if (targetUserId === req.user?.id) {
            res.status(400).json({ success: false, message: 'Cannot remove yourself — use leave room' });
            return;
        }
        const member = await RoomMember_1.default.findOne({ userId: targetUserId, roomId });
        if (!member) {
            res.status(404).json({ success: false, message: 'User is not a member of this room' });
            return;
        }
        if (member.role === 'owner') {
            res.status(400).json({ success: false, message: 'Cannot remove the owner' });
            return;
        }
        await RoomMember_1.default.deleteOne({ userId: targetUserId, roomId });
        res.json({ success: true, message: 'Member removed' });
    }
    catch (error) {
        logger_1.default.error(`Remove member error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.removeMember = removeMember;
// ── Delete Room ──
// DELETE /api/rooms/:roomId
// Owner only
const deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        await Room_1.default.deleteOne({ roomId });
        await RoomMember_1.default.deleteMany({ roomId });
        res.json({ success: true, message: 'Room deleted' });
    }
    catch (error) {
        logger_1.default.error(`Delete room error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteRoom = deleteRoom;
// ── Transfer Ownership ──
// PATCH /api/rooms/:roomId/transfer
// Body: { targetUserId }
// Owner only — old owner becomes editor
const transferOwnership = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const roomId = req.params.roomId;
        const currentUserId = req.user?.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'targetUserId is required' });
            return;
        }
        if (targetUserId === currentUserId) {
            res.status(400).json({ success: false, message: 'You are already the owner' });
            return;
        }
        const newOwner = await RoomMember_1.default.findOne({ userId: targetUserId, roomId });
        if (!newOwner) {
            res.status(404).json({ success: false, message: 'Target user is not a member of this room' });
            return;
        }
        // Demote current owner to editor
        await RoomMember_1.default.updateOne({ userId: currentUserId, roomId }, { role: 'editor' });
        // Promote target to owner
        await RoomMember_1.default.updateOne({ userId: targetUserId, roomId }, { role: 'owner' });
        // Update room creator reference
        await Room_1.default.updateOne({ roomId }, { creatorId: targetUserId });
        res.json({ success: true, message: 'Ownership transferred' });
    }
    catch (error) {
        logger_1.default.error(`Transfer ownership error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.transferOwnership = transferOwnership;
// ── My Rooms ──
// GET /api/rooms/my-rooms
// Returns all rooms the user is a member of
const getMyRooms = async (req, res) => {
    try {
        const userId = req.user?.id;
        const memberships = await RoomMember_1.default.find({ userId });
        const roomIds = memberships.map(m => m.roomId);
        const rooms = await Room_1.default.find({ roomId: { $in: roomIds } }).sort({ createdAt: -1 });
        const result = rooms.map(room => {
            const membership = memberships.find(m => m.roomId === room.roomId);
            return {
                roomId: room.roomId,
                name: room.name,
                role: membership?.role || 'viewer',
                createdAt: room.createdAt,
            };
        });
        res.json({ success: true, rooms: result });
    }
    catch (error) {
        logger_1.default.error(`Get my rooms error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMyRooms = getMyRooms;
