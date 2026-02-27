import { createContext, useContext, useState, ReactNode } from 'react';
import { User, ChatMessage, EditorSettings, RoomContextType } from '../types';

const defaultSettings: EditorSettings = {
  fontSize: 16,
  fontFamily: 'JetBrains Mono',
  theme: 'vs-dark',
  language: 'javascript',
};

const RoomContext = createContext<RoomContextType>({} as RoomContextType);

export const RoomProvider = ({
  children,
  roomId,
  username,
}: {
  children: ReactNode;
  roomId: string;
  username: string;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({ 'main.js': '// Start coding!\n' });
  const [activeFile, setActiveFile] = useState('main.js');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <RoomContext.Provider value={{
      roomId, username, users, files, activeFile, messages, settings,
      setActiveFile, setFiles, setUsers, addMessage, updateSettings,
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);