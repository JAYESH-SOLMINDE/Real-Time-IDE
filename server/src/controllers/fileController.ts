import { Request, Response } from 'express';
import File from '../models/File';
import { AuthRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';

export const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await File.find({ roomId: req.params.roomId });
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const saveFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, path, content, roomId } = req.body;
    const ownerId = req.user?.id || 'guest';

    const file = await File.findOneAndUpdate(
      { name, roomId },
      { name, path, content, roomId, ownerId },
      { upsert: true, new: true }
    );

    res.json({ success: true, file });
  } catch (error) {
    logger.error(`Save file error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    await File.findByIdAndDelete(req.params.fileId);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};