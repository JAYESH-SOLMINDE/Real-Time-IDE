import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import RoomMember from '../models/RoomMember';

/**
 * Middleware that checks if the authenticated user has one of the
 * required roles in the room specified by req.params.roomId.
 * Attaches `req.roomRole` for downstream use.
 */
export const requireRoomRole = (...roles: string[]) => {
  return async (req: AuthRequest & { roomRole?: string }, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const roomId = req.params.roomId;

      if (!userId || !roomId) {
        res.status(400).json({ success: false, message: 'Missing user or room ID' });
        return;
      }

      const member = await RoomMember.findOne({ userId, roomId });
      if (!member) {
        res.status(403).json({ success: false, message: 'You are not a member of this room' });
        return;
      }

      if (!roles.includes(member.role)) {
        res.status(403).json({ success: false, message: 'Access denied — insufficient permissions' });
        return;
      }

      req.roomRole = member.role;
      next();
    } catch {
      res.status(500).json({ success: false, message: 'Server error checking permissions' });
    }
  };
};

/**
 * Lightweight middleware that just checks room membership (any role).
 * Attaches `req.roomRole`.
 */
export const requireRoomMember = async (
  req: AuthRequest & { roomRole?: string },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const roomId = req.params.roomId;

    if (!userId || !roomId) {
      res.status(400).json({ success: false, message: 'Missing user or room ID' });
      return;
    }

    const member = await RoomMember.findOne({ userId, roomId });
    if (!member) {
      res.status(403).json({ success: false, message: 'You are not a member of this room' });
      return;
    }

    req.roomRole = member.role;
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};