import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useSocket } from '../context/SocketContext';
import { getLanguageFromFilename } from '../utils/helpers';

import Navbar from '../components/Navbar/Navbar';
import FileTree from '../components/FileTree/FileTree';
import Editor from '../components/Editor/Editor';
import Chat from '../components/Chat/Chat';
import UserList from '../components/UserList/UserList';
import RunPanel from '../components/RunPanel/RunPanel';
import Settings from '../components/Settings/Settings';
import Whiteboard from '../components/Whiteboard/Whiteboard';

interface User { socketId: string; username: string; color: string; }
interface ChatMessage { username: string; message: string; timestamp: string; }
interface EditorSettings { fontSize: number; fontFamily: string; theme: string; language: string; }

type Panel = 'files' | 'chat' | 'users' | 'run' | 'whiteboard' | 'settings' | null;

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const username = (location.state as any)?.username;

  useEffect(() => {
    if (!username) navigate('/');
  }, [username, navigate]);

  const [activePanel, setActivePanel] = useState<Panel>('files');
  const [files, setFiles] = useState<Record<string, string>>({ 'main.js': '// Start coding!\n' });
  const [activeFile, setActiveFile] = useState('main.js');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 16, fontFamily: 'JetBrains Mono', theme: 'vs-dark', language: 'javascript',
  });

  useEffect(() => {
    if (!socket || !roomId || !username) return;
    socket.emit('join-room', { roomId, username });

    socket.on('sync-code', ({ files: syncedFiles }: { files: Record<string, string> }) => {
      setFiles(syncedFiles);
      const firstFile = Object.keys(syncedFiles)[0];
      if (firstFile) {
        setActiveFile(firstFile);
        setSettings(prev => ({ ...prev, language: getLanguageFromFilename(firstFile) }));
      }
    });

    socket.on('user-list', ({ users: updatedUsers }: { users: User[] }) => {
      setUsers(updatedUsers);
    });

    socket.on('user-joined', ({ username: joinedUser }: { username: string }) => {
      toast.success(`${joinedUser} joined the room!`);
    });

    socket.on('user-left', ({ username: leftUser }: { username: string }) => {
      toast(`${leftUser} left the room`, { icon: '👋' });
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      if (msg.username !== username) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('file-create', ({ filename }: { filename: string }) => {
      setFiles(prev => ({ ...prev, [filename]: '' }));
      toast.success(`File created: ${filename}`);
    });

    socket.on('file-delete', ({ filename }: { filename: string }) => {
      setFiles(prev => {
        const next = { ...prev };
        delete next[filename];
        return next;
      });
    });

    socket.on('file-rename', ({ oldName, newName }: { oldName: string; newName: string }) => {
      setFiles(prev => {
        const next = { ...prev };
        next[newName] = next[oldName];
        delete next[oldName];
        return next;
      });
    });

    return () => {
      socket.off('sync-code');
      socket.off('user-list');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('chat-message');
      socket.off('file-create');
      socket.off('file-delete');
      socket.off('file-rename');
    };
  }, [socket, roomId, username]);

  const handleFileChange = useCallback((filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  }, []);

  const handleFileCreate = (name: string) => {
    setFiles(prev => ({ ...prev, [name]: '' }));
    setActiveFile(name);
    setSettings(prev => ({ ...prev, language: getLanguageFromFilename(name) }));
    toast.success(`Created ${name}`);
  };

  const handleFileDelete = (name: string) => {
    setFiles(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    const remaining = Object.keys(files).filter(f => f !== name);
    if (remaining.length > 0) setActiveFile(remaining[0]);
    toast(`Deleted ${name}`, { icon: '🗑️' });
  };

  const handleFileRename = (oldName: string, newName: string) => {
    setFiles(prev => {
      const next = { ...prev };
      next[newName] = next[oldName];
      delete next[oldName];
      return next;
    });
    if (activeFile === oldName) setActiveFile(newName);
    toast.success(`Renamed to ${newName}`);
  };

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const SIDEBAR_ICONS = [
    { id: 'files',      icon: '📁', label: 'Files' },
    { id: 'chat',       icon: '💬', label: 'Chat' },
    { id: 'users',      icon: '👥', label: 'Users' },
    { id: 'run',        icon: '▶️',  label: 'Run' },
    { id: 'whiteboard', icon: '🎨', label: 'Whiteboard' },
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ] as const;

  // Whiteboard gets full screen, others get 300px panel
  const isWhiteboard = activePanel === 'whiteboard';

  if (!username) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden"
      style={{ background: '#1e1e2e' }}>

      <Navbar roomId={roomId!} username={username} isConnected={isConnected} />

      <div className="flex flex-1 overflow-hidden">

        {/* Icon Sidebar */}
        <div className="flex flex-col items-center py-4 gap-2 flex-shrink-0"
          style={{ width: '60px', background: '#1a1a2e', borderRight: '1px solid #3a3a4c' }}>
          {SIDEBAR_ICONS.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => togglePanel(id as Panel)}
              title={label}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:opacity-100"
              style={{
                background: activePanel === id ? '#2d2a5e' : 'transparent',
                border: activePanel === id ? '1px solid #6366f1' : '1px solid transparent',
                opacity: activePanel === id ? 1 : 0.5,
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Whiteboard takes over full area */}
        {isWhiteboard ? (
          <div className="flex-1 overflow-hidden">
            <Whiteboard />
          </div>
        ) : (
          <>
            {/* Sliding Panel */}
            <AnimatePresence>
              {activePanel && (
                <motion.div
                  key={activePanel}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 overflow-hidden"
                  style={{ borderRight: '1px solid #3a3a4c', background: '#2a2a3c' }}
                >
                  <div style={{ width: '300px', height: '100%' }}>
                    {activePanel === 'files' && (
                      <FileTree
                        files={files}
                        activeFile={activeFile}
                        setActiveFile={(name) => {
                          setActiveFile(name);
                          setSettings(prev => ({ ...prev, language: getLanguageFromFilename(name) }));
                        }}
                        socket={socket}
                        roomId={roomId!}
                        onFileCreate={handleFileCreate}
                        onFileDelete={handleFileDelete}
                        onFileRename={handleFileRename}
                      />
                    )}
                    {activePanel === 'chat' && (
                      <Chat
                        socket={socket}
                        roomId={roomId!}
                        username={username}
                        messages={messages}
                        addMessage={(msg) => setMessages(prev => [...prev, msg])}
                      />
                    )}
                    {activePanel === 'users' && <UserList users={users} />}
                    {activePanel === 'run' && (
                      <RunPanel
                        code={files[activeFile] || ''}
                        language={settings.language}
                      />
                    )}
                    {activePanel === 'settings' && (
                      <Settings
                        settings={settings}
                        updateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex overflow-x-auto flex-shrink-0"
                style={{ background: '#1a1a2e', borderBottom: '1px solid #3a3a4c', minHeight: '36px' }}>
                {Object.keys(files).map(filename => (
                  <button
                    key={filename}
                    onClick={() => {
                      setActiveFile(filename);
                      setSettings(prev => ({ ...prev, language: getLanguageFromFilename(filename) }));
                    }}
                    className="px-4 py-2 text-xs font-mono whitespace-nowrap transition-all hover:opacity-100 flex-shrink-0"
                    style={{
                      background: activeFile === filename ? '#1e1e2e' : 'transparent',
                      color: activeFile === filename ? '#fff' : '#888',
                      borderRight: '1px solid #3a3a4c',
                      borderBottom: activeFile === filename ? '2px solid #6366f1' : '2px solid transparent',
                    }}
                  >
                    {filename}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-hidden">
                <Editor
                  key={activeFile}
                  filename={activeFile}
                  content={files[activeFile] || ''}
                  settings={settings}
                  socket={socket}
                  roomId={roomId!}
                  username={username}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}