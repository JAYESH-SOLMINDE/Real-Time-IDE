import { motion, AnimatePresence } from 'framer-motion';

interface VoiceUser {
  socketId: string;
  username: string;
  muted: boolean;
  speaking: boolean;
}

interface VoicePanelProps {
  inVoice: boolean;
  muted: boolean;
  speaking: boolean;
  voiceUsers: VoiceUser[];
  error: string;
  username: string;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
}

const AVATAR_COLORS = [
  '#6366f1', '#3b82f6', '#10b981',
  '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899',
];

// ── Animated sound wave bars (shows when speaking) ──
function SoundWave() {
  return (
    <div className="flex items-center gap-0.5" style={{ height: '16px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: '3px', background: '#10b981', minHeight: '3px' }}
          animate={{ height: ['3px', `${6 + i * 3}px`, '3px'] }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Pulsing rings around avatar when speaking ──
function SpeakingRings({ color }: { color: string }) {
  return (
    <>
      {[1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}`, opacity: 0 }}
          animate={{ scale: 1 + i * 0.4, opacity: [0.6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
}

// ── Single user card ──
function UserCard({
  letter,
  name,
  muted,
  speaking,
  isMe,
  color,
}: {
  letter: string;
  name: string;
  muted: boolean;
  speaking: boolean;
  isMe?: boolean;
  color: string;
}) {
  const isTalking = speaking && !muted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        background: isTalking
          ? 'rgba(16,185,129,0.08)'
          : isMe
          ? 'rgba(99,102,241,0.08)'
          : 'rgba(255,255,255,0.03)',
        border: isTalking
          ? '1px solid rgba(16,185,129,0.35)'
          : isMe
          ? '1px solid rgba(99,102,241,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0" style={{ width: '40px', height: '40px' }}>
        {/* Speaking rings */}
        {isTalking && <SpeakingRings color="#10b981" />}

        {/* Avatar circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white relative z-10"
          style={{ background: color }}
        >
          {letter}
        </div>

        {/* Status badge bottom-right */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-20"
          style={{
            background: '#0d0d14',
            border: `2px solid ${muted ? '#ef4444' : isTalking ? '#10b981' : '#334155'}`,
            fontSize: '8px',
          }}
        >
          {muted ? '🔇' : isTalking ? '🎙' : ''}
        </div>
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          {isMe && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                fontSize: '10px',
              }}
            >
              You
            </span>
          )}
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 mt-0.5">
          {muted ? (
            <span className="text-xs" style={{ color: '#ef4444' }}>
              Muted
            </span>
          ) : isTalking ? (
            <div className="flex items-center gap-1.5">
              <SoundWave />
              <span className="text-xs font-medium" style={{ color: '#10b981' }}>
                Speaking
              </span>
            </div>
          ) : (
            <span className="text-xs" style={{ color: '#475569' }}>
              Connected
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VoicePanel({
  inVoice,
  muted,
  speaking,
  voiceUsers,
  error,
  username,
  onJoin,
  onLeave,
  onToggleMute,
}: VoicePanelProps) {
  const totalInVoice = inVoice ? voiceUsers.length + 1 : 0;

  return (
    <div className="h-full flex flex-col" style={{ background: '#16162a' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎙️</span>
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: '#94a3b8' }}
          >
            Voice Chat
          </span>
        </div>

        {/* Live badge */}
        {inVoice && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#10b981' }}
            />
            <span className="text-xs font-medium" style={{ color: '#10b981' }}>
              {totalInVoice} live
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* ── NOT IN VOICE ── */}
        {!inVoice && (
          <div className="text-center py-10 px-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-4"
            >
              🎙️
            </motion.div>
            <p className="text-sm font-semibold text-white mb-1">
              Join Voice Chat
            </p>
            <p className="text-xs mb-6" style={{ color: '#475569' }}>
              Talk with your team while you code together
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onJoin}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              🎙️ Join Voice
            </motion.button>
          </div>
        )}

        {/* ── IN VOICE — participant list ── */}
        {inVoice && (
          <>
            {/* Section label */}
            <p
              className="text-xs uppercase tracking-wider px-1 pb-1"
              style={{ color: '#334155' }}
            >
              Participants — {totalInVoice}
            </p>

            <AnimatePresence>
              {/* Me */}
              <UserCard
                key="me"
                letter={username.charAt(0).toUpperCase()}
                name={username}
                muted={muted}
                speaking={speaking}
                isMe
                color={AVATAR_COLORS[0]}
              />

              {/* Others */}
              {voiceUsers.map((user, i) => (
                <UserCard
                  key={user.socketId}
                  letter={user.username.charAt(0).toUpperCase()}
                  name={user.username}
                  muted={user.muted}
                  speaking={user.speaking}
                  color={AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}
                />
              ))}
            </AnimatePresence>

            {/* ── Controls ── */}
            <div className="pt-3 space-y-2">
              {/* Mute toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onToggleMute}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: muted
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.06)',
                  border: muted
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  boxShadow: muted ? '0 4px 15px rgba(99,102,241,0.25)' : 'none',
                }}
              >
                {muted ? '🎙️ Unmute' : '🔇 Mute'}
              </motion.button>

              {/* Leave */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLeave}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer',
                }}
              >
                📵 Leave Voice
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-2 flex-shrink-0 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="text-xs" style={{ color: '#1e293b' }}>
          Peer-to-peer · WebRTC · No servers
        </p>
      </div>
    </div>
  );
}