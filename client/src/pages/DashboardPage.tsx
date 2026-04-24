import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Hash, ArrowRight, Zap, LogOut, Clock, Crown, Edit3, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

interface RoomInfo {
  roomId: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [myRooms, setMyRooms] = useState<RoomInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMyRooms = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/rooms/my-rooms`);
      if (res.data.success) setMyRooms(res.data.rooms);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchMyRooms(); }, [fetchMyRooms]);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/rooms`, { name: roomName.trim() || 'Untitled Room' });
      if (res.data.success) {
        navigate(`/room/${res.data.room.roomId}`, { state: { username: user?.name || user?.username } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) { setError('Please enter a Room ID'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/rooms/join`, { roomId: joinRoomId.trim() });
      if (res.data.success) {
        navigate(`/room/${joinRoomId.trim()}`, { state: { username: user?.name || user?.username } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={12} />;
      case 'editor': return <Edit3 size={12} />;
      default: return <Eye size={12} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'editor': return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' };
    }
  };

  const inputStyle = {
    width: '100%', height: '48px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    paddingLeft: '42px', paddingRight: '16px',
    color: '#e2e8f0', fontSize: '14px',
    outline: 'none', transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0a0910 0%, #12101c 50%, #0d0b14 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99,102,241,0.06)' }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(139,92,246,0.06)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(129,140,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Code Current
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{user?.name || user?.username}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back, <span style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{user?.name || user?.username}</span>
          </h1>
          <p style={{ color: '#9ca3af' }}>Create a new room or join an existing one to start collaborating.</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(30,27,46,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(129,140,248,0.15)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Plus size={20} color="white" />
              </div>
              <h3 className="text-lg font-bold text-white">Create Room</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              Start a new coding session. You'll be the room owner.
            </p>
            <div className="mb-4">
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type="text" placeholder="Room name (optional)" value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom} disabled={loading}
              className="w-full font-semibold text-white flex items-center justify-center gap-2"
              style={{
                height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
              }}>
              <Plus size={16} /> Create Room
            </motion.button>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(30,27,46,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(129,140,248,0.15)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                <ArrowRight size={20} color="white" />
              </div>
              <h3 className="text-lg font-bold text-white">Join Room</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              Enter a Room ID to join an existing session.
            </p>
            <div className="mb-4">
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type="text" placeholder="Enter Room ID" value={joinRoomId}
                  onChange={e => { setJoinRoomId(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom} disabled={loading}
              className="w-full font-semibold text-white flex items-center justify-center gap-2"
              style={{
                height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              }}>
              <ArrowRight size={16} /> Join Room
            </motion.button>
          </motion.div>
        </div>

        {/* My Rooms */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            My Rooms
          </h2>

          {myRooms.length === 0 ? (
            <div className="p-8 rounded-2xl text-center"
              style={{ background: 'rgba(30,27,46,0.4)', border: '1px solid rgba(129,140,248,0.1)' }}>
              <div className="text-4xl mb-3">🏠</div>
              <p className="text-sm" style={{ color: '#6b7280' }}>No rooms yet. Create or join one to get started!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {myRooms.map((room, i) => {
                  const rc = getRoleColor(room.role);
                  return (
                    <motion.div
                      key={room.roomId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3, borderColor: 'rgba(99,102,241,0.4)' }}
                      onClick={() => navigate(`/room/${room.roomId}`, { state: { username: user?.name || user?.username } })}
                      className="p-5 rounded-xl cursor-pointer transition-all"
                      style={{ background: 'rgba(30,27,46,0.6)', border: '1px solid rgba(129,140,248,0.1)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white truncate">{room.name}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                          {getRoleIcon(room.role)}
                          <span className="capitalize">{room.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                        <Hash size={12} />
                        <span className="font-mono">{room.roomId}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#4b5563' }}>
                        <Clock size={10} />
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
