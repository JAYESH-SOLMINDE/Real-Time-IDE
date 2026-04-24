import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger';

const signToken = (id: string, username: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign({ id, username }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, name, email, passwordHash });

    const token = signToken(user.id, user.username);

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email },
    });
  } catch (error) {
    logger.error(`Register error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = signToken(user.id, user.username);

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email },
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      user: { id: user.id, username: user.username, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};