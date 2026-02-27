import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './events';
import logger from '../utils/logger';

const roomStates = new Map<string, {
  files: Map<string, string>;
  users: Map<string, { username: string; color: string; inVoice?: boolean }>;
}>();

const COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export const initSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // ── JOIN ROOM ──
    socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, username }) => {
      socket.join(roomId);

      if (!roomStates.has(roomId)) {
        roomStates.set(roomId, {
          files: new Map([['main.js', '// Welcome to Code Current!\n']]),
          users: new Map(),
        });
      }

      const room  = roomStates.get(roomId)!;
      const color = COLORS[room.users.size % COLORS.length];
      room.users.set(socket.id, { username, color });

      const filesObj: Record<string, string> = {};
      room.files.forEach((content, name) => { filesObj[name] = content; });
      socket.emit(SOCKET_EVENTS.SYNC_CODE, { files: filesObj });

      const users = Array.from(room.users.entries()).map(([id, u]) => ({
        socketId: id, username: u.username, color: u.color,
      }));
      io.to(roomId).emit(SOCKET_EVENTS.USER_LIST, { users });
      socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, { username, color });
      logger.info(`${username} joined room ${roomId}`);
    });

    // ── CODE CHANGE ──
    socket.on(SOCKET_EVENTS.CODE_CHANGE, ({ roomId, filename, content }) => {
      const room = roomStates.get(roomId);
      if (room) room.files.set(filename, content);
      socket.to(roomId).emit(SOCKET_EVENTS.CODE_CHANGE, { filename, content });
    });

    // ── CURSOR MOVE ──
    socket.on(SOCKET_EVENTS.CURSOR_MOVE, ({ roomId, cursor, username, color }) => {
      socket.to(roomId).emit(SOCKET_EVENTS.CURSOR_MOVE, {
        cursor, username, color, socketId: socket.id,
      });
    });

    // ── FILE CREATE ──
    socket.on(SOCKET_EVENTS.FILE_CREATE, ({ roomId, filename }) => {
      const room = roomStates.get(roomId);
      if (room && !room.files.has(filename)) room.files.set(filename, '');
      io.to(roomId).emit(SOCKET_EVENTS.FILE_CREATE, { filename });
    });

    // ── FILE DELETE ──
    socket.on(SOCKET_EVENTS.FILE_DELETE, ({ roomId, filename }) => {
      const room = roomStates.get(roomId);
      if (room) room.files.delete(filename);
      io.to(roomId).emit(SOCKET_EVENTS.FILE_DELETE, { filename });
    });

    // ── FILE RENAME ──
    socket.on(SOCKET_EVENTS.FILE_RENAME, ({ roomId, oldName, newName }) => {
      const room = roomStates.get(roomId);
      if (room && room.files.has(oldName)) {
        const content = room.files.get(oldName)!;
        room.files.delete(oldName);
        room.files.set(newName, content);
      }
      io.to(roomId).emit(SOCKET_EVENTS.FILE_RENAME, { oldName, newName });
    });

    // ── CHAT MESSAGE ──
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, ({ roomId, message, username, timestamp }) => {
      io.to(roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, { message, username, timestamp });
    });

    // ────────────────────────────────────────
    // ── VOICE EVENTS ──
    // ────────────────────────────────────────

    // ── VOICE JOIN ──
    socket.on('voice-join', ({ roomId, username }) => {
      const room = roomStates.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (user) user.inVoice = true;

      // Tell the joiner which other sockets are already in voice
      const voiceSocketIds: string[] = [];
      room.users.forEach((u, sid) => {
        if (sid !== socket.id && u.inVoice) {
          voiceSocketIds.push(sid);
        }
      });

      socket.emit('voice-user-list', { socketIds: voiceSocketIds });
      socket.to(roomId).emit('voice-join', { socketId: socket.id, username });
      logger.info(`${username} joined voice in room ${roomId}`);
    });

    // ── VOICE LEAVE ──
    socket.on('voice-leave', ({ roomId }) => {
      const room = roomStates.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        if (user) user.inVoice = false;
      }
      socket.to(roomId).emit('voice-leave', { socketId: socket.id });
    });

    // ── VOICE SIGNALING ──
    socket.on('voice-offer', ({ to, offer }) => {
      io.to(to).emit('voice-offer', { from: socket.id, offer });
    });

    socket.on('voice-answer', ({ to, answer }) => {
      io.to(to).emit('voice-answer', { from: socket.id, answer });
    });

    socket.on('voice-ice', ({ to, candidate }) => {
      io.to(to).emit('voice-ice', { from: socket.id, candidate });
    });

    // ── VOICE MUTE ──
    socket.on('voice-mute', ({ roomId, muted }) => {
      socket.to(roomId).emit('voice-mute', { socketId: socket.id, muted });
    });

    // ── VOICE SPEAKING (who is talking) ──
    socket.on('voice-speaking', ({ roomId, speaking }) => {
      socket.to(roomId).emit('voice-speaking', { socketId: socket.id, speaking });
    });

    // ────────────────────────────────────────

    // ── DISCONNECT ──
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      roomStates.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id)!;
          room.users.delete(socket.id);

          // Also notify voice disconnect
          if (user.inVoice) {
            io.to(roomId).emit('voice-leave', { socketId: socket.id });
          }

          const users = Array.from(room.users.entries()).map(([id, u]) => ({
            socketId: id, username: u.username, color: u.color,
          }));
          io.to(roomId).emit(SOCKET_EVENTS.USER_LIST, { users });
          io.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, { username: user.username });
          logger.info(`${user.username} left room ${roomId}`);
        }
      });
    });
  });
};