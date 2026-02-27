import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, User, ArrowRight, Zap, Users, MessageSquare, Play } from 'lucide-react';
import { generateRoomId } from '../utils/helpers';

export default function LandingPage() {
  const [roomId, setRoomId]     = useState('');
  const [username, setUsername] = useState('');
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId.trim())   { setError('Please enter a Room ID'); return; }
    if (!username.trim()) { setError('Please enter your name'); return; }
    navigate(`/room/${roomId.trim()}`, { state: { username: username.trim() } });
  };

  const handleGenerate = () => {
    setRoomId(generateRoomId());
    setError('');
  };

  const inputStyle = {
    width: '100%', height: '48px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    paddingLeft: '40px', paddingRight: '16px',
    color: '#e2e8f0', fontSize: '14px',
    outline: 'none', transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  };

  const features = [
    { icon: <Zap size={28} className="text-white" />, color: 'from-indigo-500 to-purple-600',
      title: 'Real-time Sync', desc: 'Every keystroke synced instantly across all collaborators. No lag, no conflicts.' },
    { icon: <Users size={28} className="text-white" />, color: 'from-cyan-500 to-blue-600',
      title: 'Live Collaboration', desc: 'See live cursors, user presence, and edits from every teammate in real time.' },
    { icon: <MessageSquare size={28} className="text-white" />, color: 'from-green-500 to-emerald-600',
      title: 'Built-in Chat', desc: 'Communicate without leaving the editor. Discuss code right where you write it.' },
    { icon: <Play size={28} className="text-white" />, color: 'from-orange-500 to-red-600',
      title: 'Run Code Live', desc: 'Execute JavaScript, Python, Java, C++ and more directly in the browser.' },
    { icon: <Hash size={28} className="text-white" />, color: 'from-pink-500 to-rose-600',
      title: 'Instant Rooms', desc: 'No sign-up needed. Generate a room ID, share the link, start coding together.' },
    { icon: <Zap size={28} className="text-white" />, color: 'from-yellow-500 to-amber-600',
      title: 'Monaco Editor', desc: 'Powered by the same editor as VS Code. Full syntax highlighting and IntelliSense.' },
  ];

  return (
    <div className="min-h-screen overflow-auto" style={{
      background: 'linear-gradient(135deg, #0a0910 0%, #12101c 50%, #0d0b14 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Floating background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99,102,241,0.1)', animation: 'float 3s ease-in-out infinite' }} />
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(139,92,246,0.1)', animation: 'float 3s ease-in-out infinite', animationDelay: '-1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgba(59,130,246,0.08)', animation: 'float 3s ease-in-out infinite', animationDelay: '-2s' }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(129,140,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                       boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span className="text-xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Code Current
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Open Source'].map(link => (
              <a key={link} href="#features"
                className="text-sm font-medium transition-colors"
                style={{ color: '#9ca3af' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
              >{link}</a>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('join-card')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                     boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(30,27,46,0.6)', backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(129,140,248,0.2)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>
                  Now live — Real-time collaboration for everyone
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl font-extrabold leading-tight text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Code at the<br />
                <span style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Speed of Sync
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl leading-relaxed max-w-lg"
                style={{ color: '#9ca3af' }}
              >
                A browser-based collaborative IDE. Write code together in real time — with live cursors, instant chat, and one-click code execution.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('join-card')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                           boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  Start Coding Free
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 pt-2"
              >
                <div className="flex -space-x-3">
                  {['from-pink-400 to-rose-500','from-blue-400 to-cyan-500','from-green-400 to-emerald-500','from-yellow-400 to-orange-500'].map((g, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2`}
                      style={{ borderColor: '#0a0910' }} />
                  ))}
                </div>
                <div>
                  <div className="text-white font-semibold">No sign-up needed</div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>Just a name + room ID</div>
                </div>
              </motion.div>
            </div>

            {/* Right — fake code editor preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'linear-gradient(180deg, #1a1625 0%, #0d0b14 100%)',
                         border: '1px solid rgba(129,140,248,0.3)',
                         boxShadow: '0 25px 50px rgba(99,102,241,0.2)' }}>
                {/* Window bar */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: 'rgba(17,17,24,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
                    main.js
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontFamily: 'monospace' }}>
                    JavaScript
                  </span>
                </div>

                {/* Code */}
                <div className="p-6 text-sm leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <div className="flex">
                    <div className="pr-6 select-none text-right text-xs" style={{ color: '#374151', minWidth: '32px', lineHeight: '1.8' }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}>{n}</div>)}
                    </div>
                    <div style={{ lineHeight: '1.8' }}>
                      <div><span style={{ color: '#c084fc' }}>const</span> <span style={{ color: '#67e8f9' }}>room</span> <span style={{ color: '#e2e8f0' }}>=</span> <span style={{ color: '#a3e635' }}>'dev-session-42'</span><span style={{ color: '#e2e8f0' }}>;</span></div>
                      <div className="h-2" />
                      <div><span style={{ color: '#c084fc' }}>function</span> <span style={{ color: '#818cf8' }}>collaborate</span><span style={{ color: '#e2e8f0' }}>(users) {'{'}</span></div>
                      <div><span style={{ color: '#6b7280' }}>  // Real-time sync ✨</span></div>
                      <div><span style={{ color: '#c084fc' }}>  return</span> <span style={{ color: '#e2e8f0' }}>users</span></div>
                      <div><span style={{ color: '#e2e8f0' }}>    .map(u =&gt; socket</span></div>
                      <div><span style={{ color: '#e2e8f0' }}>    .emit(</span><span style={{ color: '#a3e635' }}>'code-change'</span><span style={{ color: '#e2e8f0' }}>, u))</span></div>
                      <div><span style={{ color: '#e2e8f0' }}>    .filter(Boolean);</span></div>
                      <div><span style={{ color: '#e2e8f0' }}>{'}'}</span></div>
                    </div>
                  </div>

                  {/* Live users indicator */}
                  <div className="mt-4 p-3 rounded-lg flex items-center gap-3"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div className="flex -space-x-2">
                      {[['#6366f1','A'], ['#10b981','B'], ['#f59e0b','C']].map(([color, letter]) => (
                        <div key={letter} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border"
                          style={{ background: color, borderColor: '#0d0b14' }}>{letter}</div>
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: '#818cf8' }}>
                      3 collaborators editing live
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                      <span className="text-xs" style={{ color: '#10b981' }}>synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Everything You Need to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Code Together</span>
            </h2>
            <p style={{ color: '#9ca3af' }} className="text-lg max-w-2xl mx-auto">
              Powerful features built for developer collaboration. No setup, no friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.5)' }}
                className="p-8 rounded-2xl transition-all duration-300 cursor-default"
                style={{ background: 'rgba(30,27,46,0.6)', backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(129,140,248,0.15)' }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p style={{ color: '#9ca3af' }} className="leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-12"
            style={{ background: 'rgba(30,27,46,0.6)', backdropFilter: 'blur(20px)',
                     border: '1px solid rgba(129,140,248,0.2)' }}>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { value: '0ms', label: 'Setup Time' },
                { value: '8+', label: 'Languages Supported' },
                { value: '∞', label: 'Collaborators per Room' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-5xl font-extrabold mb-2" style={{
                    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{s.value}</div>
                  <div style={{ color: '#9ca3af' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN CARD ── */}
      <section id="join-card" className="relative z-10 py-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Start Coding{' '}
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Right Now</span>
            </h2>
            <p style={{ color: '#9ca3af' }}>No sign-up. No credit card. Just code.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'rgba(30,27,46,0.7)', backdropFilter: 'blur(40px)',
              border: '1px solid rgba(129,140,248,0.2)',
              borderRadius: '20px', padding: '40px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-4 px-4 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171',
                         border: '1px solid rgba(239,68,68,0.2)' }}
              >{error}</motion.div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: '#94a3b8' }}>Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569' }} />
                <input type="text" placeholder="e.g. Alex" value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Room ID */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: '#94a3b8' }}>Room ID</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569' }} />
                <input type="text" placeholder="Enter or generate a room ID" value={roomId}
                  onChange={e => { setRoomId(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ x: 3 }} onClick={handleGenerate}
              className="flex items-center gap-1 text-xs mb-6"
              style={{ color: '#818cf8', background: 'none', border: 'none',
                       cursor: 'pointer', padding: 0 }}
            >
              <ArrowRight size={12} /> Generate a unique Room ID
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              className="w-full font-semibold text-white flex items-center justify-center gap-2"
              style={{
                height: '48px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '15px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              }}
            >
              Join Room <ArrowRight size={16} />
            </motion.button>

            <p className="text-center text-xs mt-4" style={{ color: '#374151' }}>
              Free forever · No account needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-12 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap size={14} color="white" fill="white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Code Current
            </span>
          </div>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            CODE, CHAT AND COLLABORATE. IT'S ALL IN SYNC.
          </p>
          <p className="text-sm" style={{ color: '#374151' }}>
            © 2026 Code Current. Open Source.
          </p>
        </div>
      </footer>
    </div>
  );
}