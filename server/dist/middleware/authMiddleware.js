"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    try {
        const token = req.cookies?.token ||
            req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.protect = protect;
