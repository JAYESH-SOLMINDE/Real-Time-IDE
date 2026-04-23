import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Room from '../models/Room';
import RoomMember from '../models/RoomMember';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// ── Create Room ──
// POST /api/rooms
// Body: { name? }
// Auto-assigns the creator as "owner"
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Not authorized' }); return; }

    const roomId = uuidv4().split('-').slice(0, 3).join('-');
    const { name } = req.body;

    const room = await Room.create({
      roomId,
      name: name || 'Untitled Room',
      creatorId: userId,
      files: [],
    });

    // Auto-assign owner
    await RoomMember.create({ userId, roomId, role: 'owner' });

    res.status(201).json({ success: true, room, role: 'owner' });
  } catch (error) {
    logger.error(`Create room error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Join Room ──
// POST /api/rooms/join
// Body: { roomId }
// Assigns "viewer" role if not already a member
export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Not authorized' }); return; }

    const { roomId } = req.body;
    if (!roomId) { res.status(400).json({ success: false, message: 'Room ID is required' }); return; }

    const room = await Room.findOne({ roomId });
    if (!room) { res.status(404).json({ success: false, message: 'Room not found' }); return; }

    // Check if already a member
    let member = await RoomMember.findOne({ userId, roomId });
    if (!member) {
      member = await RoomMember.create({ userId, roomId, role: 'viewer' });
    }

    res.json({ success: true, room, role: member.role });
  } catch (error) {
    logger.error(`Join room error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Get Room ──
// GET /api/rooms/:roomId
// Returns room + user's role + member list
export const getRoom = async (req: AuthRequest & { roomRole?: string }, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) { res.status(404).json({ success: false, message: 'Room not found' }); return; }

    const members = await RoomMember.find({ roomId: req.params.roomId }).populate('userId', 'username name email');
    const memberList = members.map(m => ({
      id: (m.userId as any)?._id || m.userId,
      username: (m.userId as any)?.username || 'Unknown',
      name: (m.userId as any)?.name || 'Unknown',
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json({ success: true, room, role: req.roomRole, members: memberList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Get Room Members ──
// GET /api/rooms/:roomId/members
export const getRoomMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const members = await RoomMember.find({ roomId: req.params.roomId }).populate('userId', 'username name email');
    const memberList = members.map(m => ({
      id: (m.userId as any)?._id || m.userId,
      username: (m.userId as any)?.username || 'Unknown',
      name: (m.userId as any)?.name || 'Unknown',
      role: m.role,
      joinedAt: m.joinedAt,
    }));
    res.json({ success: true, members: memberList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Change Member Role ──
// PATCH /api/rooms/:roomId/role
// Body: { targetUserId, newRole }
// Owner only
export const changeRole = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const member = await RoomMember.findOne({ userId: targetUserId, roomId });
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
  } catch (error) {
    logger.error(`Change role error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Remove Member ──
// DELETE /api/rooms/:roomId/member
// Body: { targetUserId }
// Owner only
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const member = await RoomMember.findOne({ userId: targetUserId, roomId });
    if (!member) {
      res.status(404).json({ success: false, message: 'User is not a member of this room' });
      return;
    }

    if (member.role === 'owner') {
      res.status(400).json({ success: false, message: 'Cannot remove the owner' });
      return;
    }

    await RoomMember.deleteOne({ userId: targetUserId, roomId });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    logger.error(`Remove member error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Delete Room ──
// DELETE /api/rooms/:roomId
// Owner only
export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roomId = req.params.roomId;
    await Room.deleteOne({ roomId });
    await RoomMember.deleteMany({ roomId });
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    logger.error(`Delete room error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Transfer Ownership ──
// PATCH /api/rooms/:roomId/transfer
// Body: { targetUserId }
// Owner only — old owner becomes editor
export const transferOwnership = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const newOwner = await RoomMember.findOne({ userId: targetUserId, roomId });
    if (!newOwner) {
      res.status(404).json({ success: false, message: 'Target user is not a member of this room' });
      return;
    }

    // Demote current owner to editor
    await RoomMember.updateOne({ userId: currentUserId, roomId }, { role: 'editor' });
    // Promote target to owner
    await RoomMember.updateOne({ userId: targetUserId, roomId }, { role: 'owner' });
    // Update room creator reference
    await Room.updateOne({ roomId }, { creatorId: targetUserId });

    res.json({ success: true, message: 'Ownership transferred' });
  } catch (error) {
    logger.error(`Transfer ownership error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── My Rooms ──
// GET /api/rooms/my-rooms
// Returns all rooms the user is a member of
export const getMyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const memberships = await RoomMember.find({ userId });

    const roomIds = memberships.map(m => m.roomId);
    const rooms = await Room.find({ roomId: { $in: roomIds } }).sort({ createdAt: -1 });

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
  } catch (error) {
    logger.error(`Get my rooms error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};