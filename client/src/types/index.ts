export interface User {
  socketId: string;
  username: string;
  color: string;
}

export interface FileTab {
  name: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  language: string;
}

export interface RoomContextType {
  roomId: string;
  username: string;
  users: User[];
  files: Record<string, string>;
  activeFile: string;
  messages: ChatMessage[];
  settings: EditorSettings;
  setActiveFile: (name: string) => void;
  setFiles: (files: Record<string, string>) => void;
  setUsers: (users: User[]) => void;
  addMessage: (msg: ChatMessage) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
}
