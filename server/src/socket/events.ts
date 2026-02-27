export const SOCKET_EVENTS = {
  // Room events
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  USER_LIST: 'user-list',

  // Code events
  CODE_CHANGE: 'code-change',
  SYNC_CODE: 'sync-code',

  // Cursor events
  CURSOR_MOVE: 'cursor-move',

  // File events
  FILE_CREATE: 'file-create',
  FILE_DELETE: 'file-delete',
  FILE_RENAME: 'file-rename',

  // Chat events
  CHAT_MESSAGE: 'chat-message',

  // Notification events
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
} as const;