"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = exports.createRoom = void 0;
const Room_1 = __importDefault(require("../models/Room"));
const logger_1 = __importDefault(require("../utils/logger"));
const createRoom = async (req, res) => {
    try {
        const { roomId, language, theme } = req.body;
        const creatorId = req.user?.id || 'guest';
        const existing = await Room_1.default.findOne({ roomId });
        if (existing) {
            res.json({ success: true, room: existing });
            return;
        }
        const room = await Room_1.default.create({
            roomId,
            creatorId,
            language: language || 'javascript',
            theme: theme || 'vs-dark',
            collaborators: [],
            files: [],
        });
        res.status(201).json({ success: true, room });
    }
    catch (error) {
        logger_1.default.error(`Create room error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createRoom = createRoom;
const getRoom = async (req, res) => {
    try {
        const room = await Room_1.default.findOne({ roomId: req.params.roomId });
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        res.json({ success: true, room });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRoom = getRoom;
