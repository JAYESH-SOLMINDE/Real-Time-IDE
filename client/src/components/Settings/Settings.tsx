interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  language: string;
}

interface SettingsProps {
  settings: EditorSettings;
  updateSettings: (s: Partial<EditorSettings>) => void;
}

const FONTS = ['JetBrains Mono', 'Fira Code', 'Space Mono', 'monospace'];
const THEMES = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'vs-light', label: 'VS Light' },
];
const LANGUAGES = [
  'javascript','typescript','python','java','cpp','c','go','rust','html','css','json',
];

export default function Settings({ settings, updateSettings }: SettingsProps) {
  const reset = () => updateSettings({
    fontSize: 16, fontFamily: 'JetBrains Mono', theme: 'vs-dark', language: 'javascript',
  });

  return (
    <div className="h-full p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider"
        style={{ color: '#888' }}>
        ⚙️ Settings
      </h3>

      <div className="space-y-5">
        {/* Font Family */}
        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={e => updateSettings({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: '#1e1e2e', border: '1px solid #3a3a4c' }}
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>
            Font Size: {settings.fontSize}px
          </label>
          <input
            type="range" min={10} max={28} value={settings.fontSize}
            onChange={e => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>Theme</label>
          <select
            value={settings.theme}
            onChange={e => updateSettings({ theme: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: '#1e1e2e', border: '1px solid #3a3a4c' }}
          >
            {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs mb-2" style={{ color: '#aaa' }}>Language</label>
          <select
            value={settings.language}
            onChange={e => updateSettings({ language: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: '#1e1e2e', border: '1px solid #3a3a4c' }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: '#2a2a3c', color: '#aaa', border: '1px solid #3a3a4c' }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}