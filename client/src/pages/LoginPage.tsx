import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    paddingLeft: '42px',
    paddingRight: '42px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #0a0910 0%, #12101c 50%, #0d0b14 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99,102,241,0.08)', animation: 'float 3s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(139,92,246,0.08)', animation: 'float 3s ease-in-out infinite', animationDelay: '-1s' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(129,140,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 25px rgba(99,102,241,0.4)' }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Code Current
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30,27,46,0.7)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
            Sign in to continue to your dashboard
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 px-4 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >{error}</motion.div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full font-semibold text-white flex items-center justify-center gap-2"
              style={{
                height: '48px', borderRadius: '10px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px',
                background: loading ? '#3a3a4c' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#374151' }}>
          © 2026 Code Current — Code, Chat, Collaborate.
        </p>
      </motion.div>
    </div>
  );
}
