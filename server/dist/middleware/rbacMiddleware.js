"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoomMember = exports.requireRoomRole = void 0;
const RoomMember_1 = __importDefault(require("../models/RoomMember"));
/**
 * Middleware that checks if the authenticated user has one of the
 * required roles in the room specified by req.params.roomId.
 * Attaches `req.roomRole` for downstream use.
 */
const requireRoomRole = (...roles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const roomId = req.params.roomId;
            if (!userId || !roomId) {
                res.status(400).json({ success: false, message: 'Missing user or room ID' });
                return;
            }
            const member = await RoomMember_1.default.findOne({ userId, roomId });
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
        }
        catch {
            res.status(500).json({ success: false, message: 'Server error checking permissions' });
        }
    };
};
exports.requireRoomRole = requireRoomRole;
/**
 * Lightweight middleware that just checks room membership (any role).
 * Attaches `req.roomRole`.
 */
const requireRoomMember = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const roomId = req.params.roomId;
        if (!userId || !roomId) {
            res.status(400).json({ success: false, message: 'Missing user or room ID' });
            return;
        }
        const member = await RoomMember_1.default.findOne({ userId, roomId });
        if (!member) {
            res.status(403).json({ success: false, message: 'You are not a member of this room' });
            return;
        }
        req.roomRole = member.role;
        next();
    }
    catch {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.requireRoomMember = requireRoomMember;
