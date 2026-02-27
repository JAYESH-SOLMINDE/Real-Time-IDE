import { motion } from 'framer-motion';

interface NavbarProps {
  roomId: string;
  username: string;
  isConnected: boolean;
}

export default function Navbar({ roomId, username, isConnected }: NavbarProps) {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 z-50"
      style={{ background: '#1a1a2e', borderBottom: '1px solid #3a3a4c', height: '48px' }}>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">
          <span style={{ color: '#6366f1' }}>Co</span>
          <span className="text-white">de </span>
          <span style={{ color: '#3b82f6' }}>Current</span>
        </h1>
      </div>

      {/* Room ID */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#888' }}>Room:</span>
        <button
          onClick={copyRoomId}
          className="px-3 py-1 rounded text-xs font-mono hover:opacity-80 transition-all"
          style={{ background: '#2a2a3c', color: '#6366f1', border: '1px solid #3a3a4c' }}
          title="Click to copy"
        >
          {roomId} 📋
        </button>
      </div>

      {/* User + Status */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
          className="w-2 h-2 rounded-full"
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
        />
        <span className="text-sm" style={{ color: '#ccc' }}>{username}</span>
      </div>
    </div>
  );
}