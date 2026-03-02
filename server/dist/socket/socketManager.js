"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const events_1 = require("./events");
const logger_1 = __importDefault(require("../utils/logger"));
const roomStates = new Map();
const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const initSocket = (io) => {
    io.on('connection', (socket) => {
        logger_1.default.info(`Socket connected: ${socket.id}`);
        // ── JOIN ROOM ──
        socket.on(events_1.SOCKET_EVENTS.JOIN_ROOM, ({ roomId, username }) => {
            socket.join(roomId);
            if (!roomStates.has(roomId)) {
                roomStates.set(roomId, {
                    files: new Map([['main.js', '// Welcome to Code Current!\n']]),
                    users: new Map(),
                });
            }
            const room = roomStates.get(roomId);
            const color = COLORS[room.users.size % COLORS.length];
            room.users.set(socket.id, { username, color });
            const filesObj = {};
            room.files.forEach((content, name) => { filesObj[name] = content; });
            socket.emit(events_1.SOCKET_EVENTS.SYNC_CODE, { files: filesObj });
            const users = Array.from(room.users.entries()).map(([id, u]) => ({
                socketId: id, username: u.username, color: u.color,
            }));
            io.to(roomId).emit(events_1.SOCKET_EVENTS.USER_LIST, { users });
            socket.to(roomId).emit(events_1.SOCKET_EVENTS.USER_JOINED, { username, color });
            logger_1.default.info(`${username} joined room ${roomId}`);
        });
        // ── CODE CHANGE ──
        socket.on(events_1.SOCKET_EVENTS.CODE_CHANGE, ({ roomId, filename, content }) => {
            const room = roomStates.get(roomId);
            if (room)
                room.files.set(filename, content);
            socket.to(roomId).emit(events_1.SOCKET_EVENTS.CODE_CHANGE, { filename, content });
        });
        // ── CURSOR MOVE ──
        socket.on(events_1.SOCKET_EVENTS.CURSOR_MOVE, ({ roomId, cursor, username, color }) => {
            socket.to(roomId).emit(events_1.SOCKET_EVENTS.CURSOR_MOVE, { cursor, username, color, socketId: socket.id });
        });
        // ── FILE CREATE ──
        socket.on(events_1.SOCKET_EVENTS.FILE_CREATE, ({ roomId, filename }) => {
            const room = roomStates.get(roomId);
            if (room && !room.files.has(filename))
                room.files.set(filename, '');
            io.to(roomId).emit(events_1.SOCKET_EVENTS.FILE_CREATE, { filename });
        });
        // ── FILE DELETE ──
        socket.on(events_1.SOCKET_EVENTS.FILE_DELETE, ({ roomId, filename }) => {
            const room = roomStates.get(roomId);
            if (room)
                room.files.delete(filename);
            io.to(roomId).emit(events_1.SOCKET_EVENTS.FILE_DELETE, { filename });
        });
        // ── FILE RENAME ──
        socket.on(events_1.SOCKET_EVENTS.FILE_RENAME, ({ roomId, oldName, newName }) => {
            const room = roomStates.get(roomId);
            if (room && room.files.has(oldName)) {
                const content = room.files.get(oldName);
                room.files.delete(oldName);
                room.files.set(newName, content);
            }
            io.to(roomId).emit(events_1.SOCKET_EVENTS.FILE_RENAME, { oldName, newName });
        });
        // ── CHAT MESSAGE ──
        socket.on(events_1.SOCKET_EVENTS.CHAT_MESSAGE, ({ roomId, message, username, timestamp }) => {
            io.to(roomId).emit(events_1.SOCKET_EVENTS.CHAT_MESSAGE, { message, username, timestamp });
        });
        // ═══════════════════════════════════════
        // ── VOICE & VIDEO EVENTS ──
        // ═══════════════════════════════════════
        // ── VOICE JOIN ──
        socket.on('voice-join', ({ roomId, username }) => {
            const room = roomStates.get(roomId);
            if (!room)
                return;
            const user = room.users.get(socket.id);
            if (user)
                user.inVoice = true;
            const voiceSocketIds = [];
            room.users.forEach((u, sid) => {
                if (sid !== socket.id && u.inVoice)
                    voiceSocketIds.push(sid);
            });
            socket.emit('voice-user-list', { socketIds: voiceSocketIds });
            socket.to(roomId).emit('voice-join', { socketId: socket.id, username });
            logger_1.default.info(`${username} joined voice in room ${roomId}`);
        });
        // ── VOICE LEAVE ──
        socket.on('voice-leave', ({ roomId }) => {
            const room = roomStates.get(roomId);
            if (room) {
                const user = room.users.get(socket.id);
                if (user)
                    user.inVoice = false;
            }
            socket.to(roomId).emit('voice-leave', { socketId: socket.id });
        });
        // ── WebRTC SIGNALING ──
        socket.on('voice-offer', ({ to, offer }) => {
            io.to(to).emit('voice-offer', { from: socket.id, offer });
        });
        socket.on('voice-answer', ({ to, answer }) => {
            io.to(to).emit('voice-answer', { from: socket.id, answer });
        });
        socket.on('voice-ice', ({ to, candidate }) => {
            io.to(to).emit('voice-ice', { from: socket.id, candidate });
        });
        // ── MUTE ──
        socket.on('voice-mute', ({ roomId, muted }) => {
            socket.to(roomId).emit('voice-mute', { socketId: socket.id, muted });
        });
        // ── SPEAKING DETECTION ──
        socket.on('voice-speaking', ({ roomId, speaking }) => {
            socket.to(roomId).emit('voice-speaking', { socketId: socket.id, speaking });
        });
        // ── VIDEO TOGGLE ──
        socket.on('voice-video', ({ roomId, videoEnabled }) => {
            socket.to(roomId).emit('voice-video', { socketId: socket.id, videoEnabled });
        });
        // ═══════════════════════════════════════
        // ── DISCONNECT ──
        socket.on('disconnect', () => {
            logger_1.default.info(`Socket disconnected: ${socket.id}`);
            roomStates.forEach((room, roomId) => {
                if (room.users.has(socket.id)) {
                    const user = room.users.get(socket.id);
                    room.users.delete(socket.id);
                    if (user.inVoice) {
                        io.to(roomId).emit('voice-leave', { socketId: socket.id });
                    }
                    const users = Array.from(room.users.entries()).map(([id, u]) => ({
                        socketId: id, username: u.username, color: u.color,
                    }));
                    io.to(roomId).emit(events_1.SOCKET_EVENTS.USER_LIST, { users });
                    io.to(roomId).emit(events_1.SOCKET_EVENTS.USER_LEFT, { username: user.username });
                    logger_1.default.info(`${user.username} left room ${roomId}`);
                }
            });
        });
    });
};
exports.initSocket = initSocket;
