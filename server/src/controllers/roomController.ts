import { Request, Response } from 'express';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, language, theme } = req.body;
    const creatorId = req.user?.id || 'guest';

    const existing = await Room.findOne({ roomId });
    if (existing) {
      res.json({ success: true, room: existing });
      return;
    }

    const room = await Room.create({
      roomId,
      creatorId,
      language: language || 'javascript',
      theme: theme || 'vs-dark',
      collaborators: [],
      files: [],
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    logger.error(`Create room error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};