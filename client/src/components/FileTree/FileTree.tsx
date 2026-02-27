import { useState } from 'react';
import { motion } from 'framer-motion';
import { Socket } from 'socket.io-client';

interface FileTreeProps {
  files: Record<string, string>;
  activeFile: string;
  setActiveFile: (name: string) => void;
  socket: Socket | null;
  roomId: string;
  onFileCreate: (name: string) => void;
  onFileDelete: (name: string) => void;
  onFileRename: (oldName: string, newName: string) => void;
}

export default function FileTree({
  files, activeFile, setActiveFile,
  socket, roomId, onFileCreate, onFileDelete, onFileRename
}: FileTreeProps) {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    onFileCreate(newFileName.trim());
    socket?.emit('file-create', { roomId, filename: newFileName.trim() });
    setNewFileName('');
    setIsCreating(false);
  };

  const handleDelete = (filename: string) => {
    if (Object.keys(files).length <= 1) return;
    onFileDelete(filename);
    socket?.emit('file-delete', { roomId, filename });
  };

  const handleRename = (oldName: string) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setRenamingFile(null);
      return;
    }
    onFileRename(oldName, renameValue.trim());
    socket?.emit('file-rename', { roomId, oldName, newName: renameValue.trim() });
    setRenamingFile(null);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop();
    const icons: Record<string, string> = {
      js: '🟨', ts: '🔷', tsx: '⚛️', jsx: '⚛️',
      py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
      go: '🐹', rs: '🦀', html: '🌐', css: '🎨',
      json: '📋', md: '📝',
    };
    return icons[ext || ''] || '📄';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #3a3a4c' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: '#888' }}>
          📁 Files
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="text-lg hover:opacity-80 transition-all"
          title="New File"
          style={{ color: '#6366f1' }}
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* New file input */}
        {isCreating && (
          <div className="mb-2 px-2">
            <input
              autoFocus
              type="text"
              placeholder="filename.js"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              onBlur={() => { if (!newFileName.trim()) setIsCreating(false); }}
              className="w-full px-2 py-1 rounded text-sm text-white outline-none font-mono"
              style={{ background: '#1e1e2e', border: '1px solid #6366f1' }}
            />
            <p className="text-xs mt-1" style={{ color: '#555' }}>
              Enter to create, Esc to cancel
            </p>
          </div>
        )}

        {/* File list */}
        {Object.keys(files).map((filename) => (
          <motion.div
            key={filename}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 cursor-pointer transition-all"
            style={{
              background: activeFile === filename ? '#2d2a5e' : 'transparent',
              border: activeFile === filename ? '1px solid #6366f1' : '1px solid transparent',
            }}
            onClick={() => setActiveFile(filename)}
          >
            <span className="text-sm">{getFileIcon(filename)}</span>

            {renamingFile === filename ? (
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename(filename);
                  if (e.key === 'Escape') setRenamingFile(null);
                }}
                onBlur={() => handleRename(filename)}
                onClick={e => e.stopPropagation()}
                className="flex-1 px-1 text-sm text-white outline-none font-mono rounded"
                style={{ background: '#1e1e2e', border: '1px solid #6366f1' }}
              />
            ) : (
              <span className="flex-1 text-sm font-mono truncate"
                style={{ color: activeFile === filename ? '#fff' : '#ccc' }}>
                {filename}
              </span>
            )}

            {/* Action buttons - show on hover */}
            {renamingFile !== filename && (
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setRenamingFile(filename);
                    setRenameValue(filename);
                  }}
                  className="text-xs px-1 hover:opacity-80"
                  style={{ color: '#888' }}
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(filename);
                  }}
                  className="text-xs px-1 hover:opacity-80"
                  style={{ color: '#ef4444' }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}