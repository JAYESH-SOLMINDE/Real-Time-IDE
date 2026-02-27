import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Socket } from 'socket.io-client';
interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}
import { formatTime } from '../../utils/helpers';

interface ChatProps {
  socket: Socket | null;
  roomId: string;
  username: string;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
}

export default function Chat({ socket, roomId, username, messages, addMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    const msg: ChatMessage = {
      username,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat-message', { roomId, ...msg });
    addMessage(msg);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold px-4 py-3 uppercase tracking-wider flex-shrink-0"
        style={{ color: '#888', borderBottom: '1px solid #3a3a4c' }}>
        💬 Live Chat
      </h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: '#555' }}>
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>
                {msg.username === username ? 'You' : msg.username}
              </span>
              <span className="text-xs" style={{ color: '#555' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg text-sm text-white inline-block max-w-full break-words"
              style={{
                background: msg.username === username ? '#2d2a5e' : '#2a2a3c',
                border: `1px solid ${msg.username === username ? '#6366f1' : '#3a3a4c'}`,
              }}>
              {msg.message}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid #3a3a4c' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none placeholder-gray-600"
          style={{ background: '#1e1e2e', border: '1px solid #3a3a4c' }}
        />
        <button
          onClick={sendMessage}
          className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: '#6366f1' }}
        >
          →
        </button>
      </div>
    </div>
  );
}