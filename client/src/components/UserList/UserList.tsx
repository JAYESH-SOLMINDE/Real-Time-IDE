import { motion } from 'framer-motion';
interface User {
  socketId: string;
  username: string;
  color: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider"
        style={{ color: '#888' }}>
        Active Users ({users.length})
      </h3>

      <div className="space-y-3">
        {users.map((user, i) => (
          <motion.div
            key={user.socketId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: '#1e1e2e' }}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: user.color }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white">{user.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
                <span className="text-xs" style={{ color: '#888' }}>online</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-sm text-center mt-8" style={{ color: '#555' }}>
          No users yet...
        </p>
      )}
    </div>
  );
}