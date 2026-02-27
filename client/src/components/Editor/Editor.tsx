import { useEffect, useRef, useCallback, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Socket } from 'socket.io-client';
import axios from 'axios';

interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  language: string;
}

interface EditorProps {
  filename: string;
  content: string;
  settings: EditorSettings;
  socket: Socket | null;
  roomId: string;
  username: string;
  onChange: (filename: string, content: string) => void;
}

export default function Editor({
  filename, content, settings, socket, roomId, username, onChange
}: EditorProps) {
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteChange = useRef(false);

  const [suggestion, setSuggestion]     = useState('');
  const [aiLoading, setAiLoading]       = useState(false);
  const [showSuggest, setShowSuggest]   = useState(false);

  // ── Listen for remote code changes ──
  useEffect(() => {
    if (!socket) return;
    const handleCodeChange = ({ filename: f, content: c }: { filename: string; content: string }) => {
      if (f === filename) {
        isRemoteChange.current = true;
        onChange(f, c);
      }
    };
    socket.on('code-change', handleCodeChange);
    return () => { socket.off('code-change', handleCodeChange); };
  }, [socket, filename, onChange]);

  // ── Fetch AI suggestion from Groq ──
  const fetchAISuggestion = useCallback(async (currentCode: string) => {
    if (!currentCode.trim() || currentCode.trim().length < 10) return;
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/ai/suggest', {
        code: currentCode,
        language: settings.language,
        filename,
      }, { timeout: 15000 });

      if (res.data.suggestion && res.data.suggestion.trim()) {
        setSuggestion(res.data.suggestion);
        setShowSuggest(true);
      } else {
        setSuggestion('');
        setShowSuggest(false);
      }
    } catch {
      setShowSuggest(false);
    } finally {
      setAiLoading(false);
    }
  }, [settings.language, filename]);

  // ── Accept suggestion ──
  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    const newContent = content + '\n' + suggestion;
    onChange(filename, newContent);
    socket?.emit('code-change', { roomId, filename, content: newContent });
    setSuggestion('');
    setShowSuggest(false);
  }, [suggestion, content, filename, onChange, socket, roomId]);

  // ── Handle editor typing ──
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    const newContent = value || '';
    onChange(filename, newContent);

    // Sync to other users (300ms debounce)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket?.emit('code-change', { roomId, filename, content: newContent });
    }, 300);

    // Ask AI (1500ms debounce — fires after you stop typing)
    setSuggestion('');
    setShowSuggest(false);
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(() => {
      fetchAISuggestion(newContent);
    }, 1500);
  }, [filename, roomId, socket, onChange, fetchAISuggestion]);

  const handleCursorChange = useCallback((e: any) => {
    socket?.emit('cursor-move', {
      roomId, username,
      cursor: e.position,
      color: '#6366f1',
    });
  }, [socket, roomId, username]);

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0f0f17' }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-1 flex-shrink-0"
        style={{ background: '#1a1a2e', borderBottom: '1px solid #3a3a4c', height: '36px' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: '#818cf8' }}>{filename}</span>
          <span className="text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            {settings.language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {aiLoading && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span style={{ fontSize: '10px', color: '#818cf8' }}>⟳</span>
              <span className="text-xs" style={{ color: '#818cf8' }}>AI thinking...</span>
            </div>
          )}
          <button onClick={downloadFile}
            className="text-xs px-3 py-1 rounded hover:opacity-80 transition-all"
            style={{ background: '#2a2a3c', color: '#aaa', border: '1px solid #3a3a4c' }}>
            ⬇ Download
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={settings.language}
          theme={settings.theme}
          value={content}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editor.onDidChangeCursorPosition(handleCursorChange);
          }}
          options={{
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 16 },
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* ── AI Suggestion Panel ── */}
      {showSuggest && suggestion && (
        <div className="flex-shrink-0"
          style={{
            background: 'rgba(10,10,20,0.97)',
            borderTop: '1px solid rgba(99,102,241,0.35)',
          }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>
                AI Suggestion
              </span>
              <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                Groq / Llama 3
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={acceptSuggestion}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer' }}>
                ✓ Accept (Tab)
              </button>
              <button
                onClick={() => { setShowSuggest(false); setSuggestion(''); }}
                className="px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#666', border: 'none', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          </div>

          {/* The suggested code */}
          <pre className="px-4 py-3 text-xs overflow-x-auto"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6ee7b7',
              lineHeight: 1.7,
              maxHeight: '140px',
              overflowY: 'auto',
              margin: 0,
            }}>
            {suggestion}
          </pre>
        </div>
      )}
    </div>
  );
}
