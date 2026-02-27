import { useState } from 'react';
import axios from 'axios';

interface RunPanelProps {
  code: string;
  language: string;
}

export default function RunPanel({ code, language }: RunPanelProps) {
  const [output, setOutput] = useState('');
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  const runCode = async () => {
    setRunning(true);
    setOutput('⏳ Running...');
    setExecTime(null);

    try {
      const res = await axios.post('http://localhost:3001/api/execute', {
        code,
        language,
        stdin,
      }, { timeout: 15000 });

      setOutput(res.data.output || '(no output)');
      setExecTime(res.data.elapsed || null);
    } catch (err: any) {
      console.error('Execute error:', err);
      setOutput('❌ Could not run code. Make sure the server is running.');
    } finally {
      setRunning(false);
    }
  };

  const SUPPORTED = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go'];
  const isSupported = SUPPORTED.includes(language);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #3a3a4c' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: '#888' }}>
          ▶ Run Panel
        </h3>
        {execTime && (
          <span className="text-xs" style={{ color: '#10b981' }}>
            ✓ {execTime}ms
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isSupported && (
          <div className="px-3 py-2 rounded-lg text-xs"
            style={{ background: '#3f2a1a', color: '#f59e0b', border: '1px solid #7f4a20' }}>
            ⚠️ Language "{language}" may not be supported for execution.
          </div>
        )}

        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>
            Standard Input (stdin)
          </label>
          <textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Optional input for your program..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none placeholder-gray-600 font-mono"
            style={{ background: '#1e1e2e', border: '1px solid #3a3a4c' }}
          />
        </div>

        <button
          onClick={runCode}
          disabled={running}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50"
          style={{
            background: running ? '#3a3a4c' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
          }}
        >
          {running ? '⏳ Running...' : '▶ Run Code'}
        </button>

        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>
            Output
          </label>
          <pre
            className="w-full px-3 py-3 rounded-lg text-sm font-mono overflow-x-auto"
            style={{
              background: '#0d0d1a',
              border: '1px solid #3a3a4c',
              color: output.startsWith('❌') ? '#f87171' : '#10b981',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '120px',
            }}
          >
            {output || '// Output will appear here...'}
          </pre>
        </div>

        <p className="text-xs" style={{ color: '#555' }}>
          Supports: JavaScript, Python, TypeScript, Java, C++, C, Go
        </p>
      </div>
    </div>
  );
}