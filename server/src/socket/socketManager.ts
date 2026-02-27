import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './events';
import logger from '../utils/logger';

// In-memory store for active rooms
const roomStates = new Map<string, {
  files: Map<string, string>;
  users: Map<string, { username: string; color: string }>;
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
          files: new Map([['main.js', '// Start coding here!\n']]),
          users: new Map(),
        });
      }

      const room = roomStates.get(roomId)!;
      const color = COLORS[room.users.size % COLORS.length];
      room.users.set(socket.id, { username, color });

      // Send current code state to new joiner
      const filesObj: Record<string, string> = {};
      room.files.forEach((content, name) => { filesObj[name] = content; });
      socket.emit(SOCKET_EVENTS.SYNC_CODE, { files: filesObj });

      // Broadcast updated user list
      const users = Array.from(room.users.entries()).map(([id, u]) => ({
        socketId: id, username: u.username, color: u.color,
      }));
      io.to(roomId).emit(SOCKET_EVENTS.USER_LIST, { users });

      // Notify others
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
      socket.to(roomId).emit(SOCKET_EVENTS.CURSOR_MOVE, { cursor, username, color, socketId: socket.id });
    });

    // ── FILE CREATE ──
    socket.on(SOCKET_EVENTS.FILE_CREATE, ({ roomId, filename }) => {
      const room = roomStates.get(roomId);
      if (room && !room.files.has(filename)) {
        room.files.set(filename, '');
      }
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

    // ── DISCONNECT ──
    socket.on('disconnect', () => {
      roomStates.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id)!;
          room.users.delete(socket.id);

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