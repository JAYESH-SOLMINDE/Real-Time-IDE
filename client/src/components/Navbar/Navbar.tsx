import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Crown, Edit3, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  roomId: string;
  username: string;
  isConnected: boolean;
  role?: string;
}

export default function Navbar({ roomId, username, isConnected, role }: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (!role) return null;
    const configs: Record<string, { icon: React.ReactNode; bg: string; color: string; border: string }> = {
      owner: { icon: <Crown size={10} />, bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
      editor: { icon: <Edit3 size={10} />, bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
      viewer: { icon: <Eye size={10} />, bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
    };
    const c = configs[role] || configs.viewer;
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {c.icon}
        <span className="capitalize">{role}</span>
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-between px-4 flex-shrink-0 z-50"
      style={{
        background: '#0d0d14',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: '48px',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <span style={{ fontSize: '13px' }}>⚡</span>
        </div>
        <h1
          className="text-sm font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span style={{ color: '#818cf8' }}>Code</span>
          <span className="text-white"> Current</span>
        </h1>
      </div>

      {/* ── Room ID ── */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#475569' }}>Room:</span>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={copyRoomId}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono"
          style={{
            background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
            color: copied ? '#10b981' : '#818cf8',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.2)'}`,
            cursor: 'pointer',
          }}
          title="Click to copy Room ID"
        >
          <span>{roomId}</span>
          <span>{copied ? '✅' : '📋'}</span>
        </motion.button>
        {copied && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs"
            style={{ color: '#10b981' }}
          >
            Copied!
          </motion.span>
        )}
      </div>

      {/* ── User + Role + Status ── */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {getRoleBadge()}

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={
              isConnected
                ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
                : { scale: 1 }
            }
            transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
            className="w-2 h-2 rounded-full"
            style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          />
          <span
            className="text-xs"
            style={{ color: isConnected ? '#10b981' : '#ef4444' }}
          >
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        {/* Username */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
            {username}
          </span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} title="Logout"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}