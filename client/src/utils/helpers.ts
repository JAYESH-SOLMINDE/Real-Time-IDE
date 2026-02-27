import { v4 as uuidv4 } from 'uuid';

export const generateRoomId = (): string => {
  return uuidv4().split('-').slice(0, 3).join('-');
};

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
  };
  return map[ext || ''] || 'javascript';
};

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};