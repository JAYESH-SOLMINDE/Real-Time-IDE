import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getLanguageFromFilename } from '../utils/helpers';
import { useVoice } from '../hooks/useVoice';

import Navbar from '../components/Navbar/Navbar';
import FileTree from '../components/FileTree/FileTree';
import Editor from '../components/Editor/Editor';
import Chat from '../components/Chat/Chat';
import UserList from '../components/UserList/UserList';
import RunPanel from '../components/RunPanel/RunPanel';
import Settings from '../components/Settings/Settings';
import Whiteboard from '../components/Whiteboard/Whiteboard';
import VoicePanel from '../components/Voice/VoicePanel';
import ManageRoom from '../components/ManageRoom/ManageRoom';

const API = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

interface User { socketId: string; username: string; color: string; }
interface ChatMessage { username: string; message: string; timestamp: string; }
interface EditorSettings { fontSize: number; fontFamily: string; theme: string; language: string; }

type Panel = 'files' | 'chat' | 'users' | 'run' | 'whiteboard' | 'voice' | 'settings' | 'manage' | null;

export default function RoomPage() {
  const { roomId }  = useParams<{ roomId: string }>();
  const location    = useLocation();
  const navigate    = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user: authUser } = useAuth();

  const username = (location.state as any)?.username as string | undefined || authUser?.name || authUser?.username;

  // Role from backend
  const [roomRole, setRoomRole] = useState<string>('viewer');
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!username) navigate('/');
  }, [username, navigate]);

  // Fetch user's role in this room
  const fetchRole = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await axios.get(`${API}/api/rooms/${roomId}`);
      if (res.data.success) {
        setRoomRole(res.data.role || 'viewer');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('You are not a member of this room');
        navigate('/dashboard');
      }
    } finally {
      setRoleLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  const isViewer = roomRole === 'viewer';
  const isOwner = roomRole === 'owner';

  const SIDEBAR_ITEMS = [
    { id: 'files',      emoji: '📁', label: 'Files' },
    { id: 'chat',       emoji: '💬', label: 'Chat' },
    { id: 'users',      emoji: '👥', label: 'Users' },
    { id: 'run',        emoji: '▶️',  label: 'Run Code' },
    { id: 'whiteboard', emoji: '🎨', label: 'Whiteboard' },
    { id: 'voice',      emoji: '🎙️', label: 'Voice & Video' },
    { id: 'settings',   emoji: '⚙️', label: 'Settings' },
    ...(isOwner ? [{ id: 'manage', emoji: '👑', label: 'Manage Room' }] : []),
  ] as const;

  const [activePanel, setActivePanel] = useState<Panel>('files');
  const [files, setFiles]             = useState<Record<string, string>>({ 'main.js': '// Welcome to Code Current!\n// Start typing to get AI suggestions...\n' });
  const [activeFile, setActiveFile]   = useState('main.js');
  const [users, setUsers]             = useState<User[]>([]);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [settings, setSettings]       = useState<EditorSettings>({
    fontSize: 16, fontFamily: 'JetBrains Mono', theme: 'vs-dark', language: 'javascript',
  });

  // ── Voice + Video ──
  const {
    inVoice, muted, speaking, videoEnabled,
    voiceUsers, error: voiceError, localVideo,
    joinVoice, leaveVoice, toggleMute, toggleVideo,
  } = useVoice(socket, roomId || '', username || '');

  // ── Socket Events ──
  useEffect(() => {
    if (!socket || !roomId || !username) return;

    socket.emit('join-room', { roomId, username });

    socket.on('sync-code', ({ files: syncedFiles }: { files: Record<string, string> }) => {
      setFiles(syncedFiles);
      const first = Object.keys(syncedFiles)[0];
      if (first) {
        setActiveFile(first);
        setSettings(prev => ({ ...prev, language: getLanguageFromFilename(first) }));
      }
    });

    socket.on('user-list', ({ users: updatedUsers }: { users: User[] }) => {
      setUsers(updatedUsers);
    });

    socket.on('user-joined', ({ username: who }: { username: string }) => {
      toast.success(`${who} joined the room!`, { icon: '👋' });
    });

    socket.on('user-left', ({ username: who }: { username: string }) => {
      toast(`${who} left the room`, { icon: '🚪' });
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      if (msg.username !== username) setMessages(prev => [...prev, msg]);
    });

    socket.on('file-create', ({ filename }: { filename: string }) => {
      setFiles(prev => ({ ...prev, [filename]: '' }));
      toast.success(`File created: ${filename}`);
    });

    socket.on('file-delete', ({ filename }: { filename: string }) => {
      setFiles(prev => { const next = { ...prev }; delete next[filename]; return next; });
    });

    socket.on('file-rename', ({ oldName, newName }: { oldName: string; newName: string }) => {
      setFiles(prev => {
        const next = { ...prev };
        next[newName] = next[oldName] || '';
        delete next[oldName];
        return next;
      });
      if (activeFile === oldName) setActiveFile(newName);
    });

    // ── RBAC Real-time Events ──

    // When any member's role is changed by the owner
    socket.on('role-changed', ({ targetUserId, newRole, changedBy }: { targetUserId: string; newRole: string; changedBy: string }) => {
      // If this event is about ME, update my role instantly
      if (targetUserId === authUser?.id) {
        setRoomRole(newRole);
        if (newRole === 'viewer') {
          toast('Your role was changed to Viewer (read-only)', { icon: '👁️' });
        } else if (newRole === 'editor') {
          toast.success('Your role was changed to Editor — you can now edit!', { icon: '✏️' });
        } else if (newRole === 'owner') {
          toast.success('You are now the Owner of this room!', { icon: '👑' });
        }
      } else if (changedBy !== authUser?.id) {
        // Someone else's role changed (and I didn't do it)
        toast(`A member's role was updated`, { icon: '🔄' });
      }
    });

    // When a member is removed from the room
    socket.on('member-removed', ({ targetUserId }: { targetUserId: string }) => {
      if (targetUserId === authUser?.id) {
        toast.error('You have been removed from this room');
        navigate('/dashboard');
      }
    });

    // When the room is deleted
    socket.on('room-deleted', () => {
      toast.error('This room has been deleted by the owner');
      navigate('/dashboard');
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
      socket.off('role-changed');
      socket.off('member-removed');
      socket.off('room-deleted');
    };
  }, [socket, roomId, username, authUser?.id, navigate]);

  const handleFileChange = useCallback((filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  }, []);

  const handleFileSelect = (name: string) => {
    setActiveFile(name);
    setSettings(prev => ({ ...prev, language: getLanguageFromFilename(name) }));
  };

  const handleFileCreate = (name: string) => {
    setFiles(prev => ({ ...prev, [name]: '' }));
    setActiveFile(name);
    setSettings(prev => ({ ...prev, language: getLanguageFromFilename(name) }));
    toast.success(`Created ${name}`);
  };

  const handleFileDelete = (name: string) => {
    setFiles(prev => { const next = { ...prev }; delete next[name]; return next; });
    const remaining = Object.keys(files).filter(f => f !== name);
    setActiveFile(remaining[0] || '');
    toast(`Deleted ${name}`, { icon: '🗑️' });
  };

  const handleFileRename = (oldName: string, newName: string) => {
    setFiles(prev => {
      const next = { ...prev };
      next[newName] = next[oldName] || '';
      delete next[oldName];
      return next;
    });
    if (activeFile === oldName) setActiveFile(newName);
    toast.success(`Renamed to ${newName}`);
  };

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  if (!username) return null;

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0d0d14', color: '#818cf8', fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="text-3xl mb-3">⚡</div>
          <p className="text-sm">Loading room...</p>
        </div>
      </div>
    );
  }

  const isWhiteboard = activePanel === 'whiteboard';

  return (
    <div className="flex flex-col h-screen overflow-hidden"
      style={{ background: '#0d0d14', fontFamily: 'Inter, sans-serif' }}>

      <Navbar roomId={roomId!} username={username} isConnected={isConnected} role={roomRole} />

      {/* ── Viewer Banner ── */}
      {isViewer && (
        <div className="flex items-center justify-center px-4 py-1.5 flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>
            👁️ You are a Viewer — read-only access
          </span>
        </div>
      )}

      {/* ── Voice/Video Top Bar ── */}
      <AnimatePresence>
        {inVoice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 flex items-center justify-between px-4 py-2 overflow-hidden"
            style={{ background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#10b981' }}
              />
              <span className="text-xs font-medium" style={{ color: '#10b981' }}>
                {videoEnabled ? '📹' : '🎙️'} Voice{videoEnabled ? ' & Video' : ''} — {voiceUsers.length + 1} connected
              </span>
              <div className="flex items-center gap-1">
                {voiceUsers.map(u => (
                  <div key={u.socketId}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: u.speaking && !u.muted ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${u.speaking && !u.muted ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: '#94a3b8',
                    }}>
                    {u.speaking && !u.muted ? '🎙️' : u.muted ? '🔇' : u.videoEnabled ? '📹' : '•'}
                    <span>{u.username}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: muted ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  color: muted ? '#818cf8' : '#94a3b8',
                  border: muted ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}>
                {muted ? '🎙️ Unmute' : '🔇 Mute'}
              </button>
              <button onClick={toggleVideo}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: videoEnabled ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  color: videoEnabled ? '#60a5fa' : '#94a3b8',
                  border: videoEnabled ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}>
                {videoEnabled ? '📹 Stop Video' : '📷 Start Video'}
              </button>
              <button onClick={leaveVoice}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171',
                         border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                📵 Leave
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Icon Sidebar ── */}
        <div className="flex flex-col items-center py-3 gap-1 flex-shrink-0"
          style={{ width: '56px', background: '#111120', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          {SIDEBAR_ITEMS.map(({ id, emoji, label }) => {
            const isVoice  = id === 'voice';
            const isActive = activePanel === id;
            const showDot  = isVoice && inVoice;

            return (
              <button key={id} onClick={() => togglePanel(id as Panel)} title={label}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                style={{
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  opacity: isActive ? 1 : 0.45,
                  cursor: 'pointer',
                }}>
                {emoji}
                {showDot && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ background: videoEnabled ? '#3b82f6' : '#10b981', border: '1.5px solid #111120' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Whiteboard full screen ── */}
        {isWhiteboard ? (
          <div className="flex-1 overflow-hidden"><Whiteboard /></div>
        ) : (
          <>
            {/* ── Sliding Panel ── */}
            <AnimatePresence>
              {activePanel && (
                <motion.div
                  key={activePanel}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: activePanel === 'voice' ? 320 : activePanel === 'manage' ? 340 : 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-shrink-0 overflow-hidden"
                  style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: '#16162a' }}
                >
                  <div style={{ width: activePanel === 'voice' ? '320px' : activePanel === 'manage' ? '340px' : '300px', height: '100%' }}>

                    {activePanel === 'files' && (
                      <FileTree
                        files={files} activeFile={activeFile}
                        setActiveFile={handleFileSelect}
                        socket={socket} roomId={roomId!}
                        onFileCreate={handleFileCreate}
                        onFileDelete={handleFileDelete}
                        onFileRename={handleFileRename}
                      />
                    )}

                    {activePanel === 'chat' && (
                      <Chat socket={socket} roomId={roomId!} username={username}
                        messages={messages}
                        addMessage={(msg) => setMessages(prev => [...prev, msg])}
                      />
                    )}

                    {activePanel === 'users' && <UserList users={users} />}

                    {activePanel === 'run' && (
                      <RunPanel code={files[activeFile] || ''} language={settings.language} />
                    )}

                    {activePanel === 'voice' && (
                      <VoicePanel
                        inVoice={inVoice}
                        muted={muted}
                        speaking={speaking}
                        videoEnabled={videoEnabled}
                        voiceUsers={voiceUsers}
                        error={voiceError}
                        username={username}
                        localVideo={localVideo}
                        onJoin={joinVoice}
                        onLeave={leaveVoice}
                        onToggleMute={toggleMute}
                        onToggleVideo={toggleVideo}
                      />
                    )}

                    {activePanel === 'settings' && (
                      <Settings settings={settings}
                        updateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))} />
                    )}

                    {activePanel === 'manage' && isOwner && (
                      <ManageRoom
                        roomId={roomId!}
                        currentUserId={authUser?.id || ''}
                        currentRole={roomRole}
                        socket={socket}
                        onRoomDeleted={() => navigate('/dashboard')}
                        onRoleChanged={fetchRole}
                      />
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Editor Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab Bar */}
              <div className="flex overflow-x-auto flex-shrink-0"
                style={{ background: '#111120', borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '38px' }}>
                {Object.keys(files).map(filename => {
                  const isActive = activeFile === filename;
                  return (
                    <button key={filename} onClick={() => handleFileSelect(filename)}
                      className="px-4 py-2 text-xs font-mono whitespace-nowrap flex-shrink-0"
                      style={{
                        background: isActive ? '#0d0d14' : 'transparent',
                        color: isActive ? '#e2e8f0' : '#4a5568',
                        borderRight: '1px solid rgba(255,255,255,0.04)',
                        borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                        cursor: 'pointer',
                      }}>
                      {filename}
                    </button>
                  );
                })}
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                {activeFile ? (
                  <Editor key={activeFile} filename={activeFile}
                    content={files[activeFile] || ''} settings={settings}
                    socket={isViewer ? null : socket} roomId={roomId!} username={username}
                    onChange={isViewer ? () => {} : handleFileChange}
                    readOnly={isViewer}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center" style={{ color: '#2d3748' }}>
                    <div className="text-center">
                      <div className="text-5xl mb-3">📄</div>
                      <p className="text-sm">No file selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}