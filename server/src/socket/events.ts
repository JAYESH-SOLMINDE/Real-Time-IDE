export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  USER_LIST: 'user-list',
  CODE_CHANGE: 'code-change',
  SYNC_CODE: 'sync-code',
  CURSOR_MOVE: 'cursor-move',
  FILE_CREATE: 'file-create',
  FILE_DELETE: 'file-delete',
  FILE_RENAME: 'file-rename',
  CHAT_MESSAGE: 'chat-message',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',

  // Voice events
  VOICE_JOIN: 'voice-join',
  VOICE_LEAVE: 'voice-leave',
  VOICE_OFFER: 'voice-offer',
  VOICE_ANSWER: 'voice-answer',
  VOICE_ICE: 'voice-ice',
  VOICE_USER_LIST: 'voice-user-list',
  VOICE_MUTE: 'voice-mute',
} as const;