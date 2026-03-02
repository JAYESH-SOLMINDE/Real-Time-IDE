"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.saveFile = exports.getFiles = void 0;
const File_1 = __importDefault(require("../models/File"));
const logger_1 = __importDefault(require("../utils/logger"));
const getFiles = async (req, res) => {
    try {
        const files = await File_1.default.find({ roomId: req.params.roomId });
        res.json({ success: true, files });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFiles = getFiles;
const saveFile = async (req, res) => {
    try {
        const { name, path, content, roomId } = req.body;
        const ownerId = req.user?.id || 'guest';
        const file = await File_1.default.findOneAndUpdate({ name, roomId }, { name, path, content, roomId, ownerId }, { upsert: true, new: true });
        res.json({ success: true, file });
    }
    catch (error) {
        logger_1.default.error(`Save file error: ${error}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.saveFile = saveFile;
const deleteFile = async (req, res) => {
    try {
        await File_1.default.findByIdAndDelete(req.params.fileId);
        res.json({ success: true, message: 'File deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteFile = deleteFile;
