"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const signToken = (id, username) => {
    const secret = process.env.JWT_SECRET || 'secret';
    return jsonwebtoken_1.default.sign({ id, username }, secret, { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        if (!username || !name || !email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const existing = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await User_1.default.create({ username, name, email, passwordHash });
        const token = signToken(user.id, user.username);
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        });
    }
    catch (error) {
        logger_1.default.error(`Register error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
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
    }
    catch (error) {
        logger_1.default.error(`Login error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.json({ success: true, message: 'Logged out' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMe = getMe;
