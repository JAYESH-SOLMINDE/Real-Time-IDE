import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceUser {
  socketId: string;
  username: string;
  muted: boolean;
  speaking: boolean;
  videoEnabled: boolean;
  stream?: MediaStream;
}

interface VoicePanelProps {
  inVoice: boolean;
  muted: boolean;
  speaking: boolean;
  videoEnabled: boolean;
  voiceUsers: VoiceUser[];
  error: string;
  username: string;
  localVideo: React.RefObject<MediaStream | null>;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const AVATAR_COLORS = [
  '#6366f1','#3b82f6','#10b981',
  '#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899',
];

function SoundWave() {
  return (
    <div className="flex items-center gap-0.5" style={{ height: '14px' }}>
      {[1,2,3,4,5].map(i => (
        <motion.div key={i} className="rounded-full"
          style={{ width: '2.5px', background: '#10b981', minHeight: '2px' }}
          animate={{ height: ['2px', `${4 + i * 3}px`, '2px'] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function SpeakingRings() {
  return (
    <>
      {[1,2].map(i => (
        <motion.div key={i} className="absolute inset-0 rounded-full"
          style={{ border: '2px solid #10b981', opacity: 0 }}
          animate={{ scale: 1 + i * 0.4, opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ── Video tile for remote users ──
function RemoteVideo({ stream, username, muted, speaking, color }: {
  stream?: MediaStream;
  username: string;
  muted: boolean;
  speaking: boolean;
  color: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0;

  return (
    <div className="relative rounded-xl overflow-hidden"
      style={{
        background: '#0d0d14',
        border: speaking ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
        aspectRatio: '16/9',
      }}>
      {hasVideo ? (
        <video ref={videoRef} autoPlay playsInline muted={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ background: color }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
        {speaking && !muted && <SoundWave />}
        <span className="text-xs text-white font-medium">{username}</span>
        {muted && <span className="text-xs">🔇</span>}
      </div>
    </div>
  );
}

// ── Local video preview ──
function LocalVideo({ localVideo, username, muted, speaking, videoEnabled }: {
  localVideo: React.RefObject<MediaStream | null>;
  username: string;
  muted: boolean;
  speaking: boolean;
  videoEnabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localVideo.current && videoEnabled) {
      videoRef.current.srcObject = localVideo.current;
    }
  }, [localVideo, videoEnabled]);

  return (
    <div className="relative rounded-xl overflow-hidden"
      style={{
        background: '#0d0d14',
        border: speaking ? '2px solid #10b981' : '1px solid rgba(99,102,241,0.3)',
        aspectRatio: '16/9',
      }}>
      {videoEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ background: '#6366f1' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
        {speaking && !muted && <SoundWave />}
        <span className="text-xs text-white font-medium">{username}</span>
        <span className="text-xs px-1 rounded"
          style={{ background: 'rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '9px' }}>
          You
        </span>
        {muted && <span className="text-xs">🔇</span>}
        {!videoEnabled && <span className="text-xs">📵</span>}
      </div>
    </div>
  );
}

export default function VoicePanel({
  inVoice, muted, speaking, videoEnabled,
  voiceUsers, error, username, localVideo,
  onJoin, onLeave, onToggleMute, onToggleVideo,
}: VoicePanelProps) {
  const total = inVoice ? voiceUsers.length + 1 : 0;

  return (
    <div className="h-full flex flex-col" style={{ background: '#16162a' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🎙️</span>
          <span className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: '#94a3b8' }}>
            Voice & Video
          </span>
        </div>
        {inVoice && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-xs font-medium" style={{ color: '#10b981' }}>
              {total} live
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Error */}
        {error && (
          <div className="px-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── NOT JOINED ── */}
        {!inVoice && (
          <div className="text-center py-10 px-4">
            <motion.div animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-4">🎙️</motion.div>
            <p className="text-sm font-semibold text-white mb-1">Voice & Video Chat</p>
            <p className="text-xs mb-6" style={{ color: '#475569' }}>
              Talk and share your camera with teammates
            </p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onJoin}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)',
                       border: 'none', cursor: 'pointer',
                       boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
              🎙️ Join Voice & Video
            </motion.button>
          </div>
        )}

        {/* ── JOINED ── */}
        {inVoice && (
          <AnimatePresence>

            {/* Video grid */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider px-1"
                style={{ color: '#334155' }}>
                Participants — {total}
              </p>

              {/* Local video */}
              <LocalVideo
                localVideo={localVideo}
                username={username}
                muted={muted}
                speaking={speaking}
                videoEnabled={videoEnabled}
              />

              {/* Remote videos */}
              {voiceUsers.map((user, i) => (
                <motion.div key={user.socketId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}>
                  <RemoteVideo
                    stream={user.stream}
                    username={user.username}
                    muted={user.muted}
                    speaking={user.speaking}
                    color={AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}
                  />
                </motion.div>
              ))}
            </div>

            {/* ── Controls ── */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              {/* Mute */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onToggleMute}
                className="py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: muted
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.06)',
                  border: muted
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}>
                {muted ? '🎙️' : '🔇'}
                <span className="text-xs">{muted ? 'Unmute' : 'Mute'}</span>
              </motion.button>

              {/* Video toggle */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onToggleVideo}
                className="py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: videoEnabled
                    ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                    : 'rgba(255,255,255,0.06)',
                  border: videoEnabled
                    ? '1px solid rgba(59,130,246,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}>
                {videoEnabled ? '📹' : '📷'}
                <span className="text-xs">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
              </motion.button>
            </div>

            {/* Leave */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onLeave}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171',
                       border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
              📵 Leave
            </motion.button>

          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 flex-shrink-0 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: '#1e293b' }}>
          Peer-to-peer · WebRTC · Encrypted
        </p>
      </div>
    </div>
  );
}