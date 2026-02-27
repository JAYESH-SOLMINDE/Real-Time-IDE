import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#1e1e2e' }}>
      <h1 className="text-8xl font-bold mb-4" style={{ color: '#6366f1' }}>404</h1>
      <p className="text-xl text-white mb-8">Page not found</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-lg text-white font-semibold"
        style={{ background: '#6366f1' }}
      >
        Go Home
      </button>
    </div>
  );
}