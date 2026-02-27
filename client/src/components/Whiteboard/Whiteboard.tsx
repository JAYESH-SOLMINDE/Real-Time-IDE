import { useRef, useState, useEffect, useCallback } from 'react';

type Tool = 'pen' | 'brush' | 'fountain' | 'eraser' | 'line' | 'rect' | 'circle' | 'arrow' | 'text' | 'select';

interface Point { x: number; y: number; }

interface Stroke {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  text?: string;
  fontSize?: number;
}

const COLORS = [
  '#ffffff', '#f8fafc',
  '#f87171', '#fb923c', '#fbbf24', '#facc15',
  '#4ade80', '#34d399', '#22d3ee', '#60a5fa',
  '#818cf8', '#c084fc', '#f472b6', '#fb7185',
  '#000000', '#1e293b', '#334155', '#64748b',
];

const generateId = () => Math.random().toString(36).slice(2);

export default function Whiteboard() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const overlayRef     = useRef<HTMLCanvasElement>(null);
  const isDrawing      = useRef(false);
  const startPos       = useRef<Point>({ x: 0, y: 0 });
  const currentPoints  = useRef<Point[]>([]);
  const textInputRef   = useRef<HTMLInputElement>(null);

  const [tool, setTool]           = useState<Tool>('pen');
  const [color, setColor]         = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [opacity, setOpacity]     = useState(1);
  const [fontSize, setFontSize]   = useState(20);
  const [history, setHistory]     = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [strokes, setStrokes]     = useState<Stroke[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos]     = useState<Point>({ x: 0, y: 0 });
  const [textValue, setTextValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');

  // ── Redraw main canvas from strokes ──
  const redraw = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background with subtle grid
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dot grid
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < canvas.width; x += 30) {
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    strokeList.forEach(stroke => drawStroke(ctx, stroke));
  }, []);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.points.length) return;
    ctx.save();
    ctx.globalAlpha = stroke.opacity;

    if (stroke.tool === 'text' && stroke.text) {
      ctx.font = `${stroke.fontSize || 20}px Inter, sans-serif`;
      ctx.fillStyle = stroke.color;
      ctx.fillText(stroke.text, stroke.points[0].x, stroke.points[0].y);
      ctx.restore();
      return;
    }

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth   = stroke.width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    const pts = stroke.points;

    if (stroke.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    } else if (stroke.tool === 'rect') {
      const w = pts[pts.length - 1].x - pts[0].x;
      const h = pts[pts.length - 1].y - pts[0].y;
      ctx.strokeRect(pts[0].x, pts[0].y, w, h);
    } else if (stroke.tool === 'circle') {
      const rx = Math.abs(pts[pts.length - 1].x - pts[0].x) / 2;
      const ry = Math.abs(pts[pts.length - 1].y - pts[0].y) / 2;
      const cx = pts[0].x + (pts[pts.length - 1].x - pts[0].x) / 2;
      const cy = pts[0].y + (pts[pts.length - 1].y - pts[0].y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stroke.tool === 'arrow') {
      const from = pts[0];
      const to   = pts[pts.length - 1];
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const headLen = 20;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = stroke.color;
      ctx.fill();
    } else if (stroke.tool === 'brush') {
      // Soft brush with shadow
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur  = stroke.width * 2;
      ctx.lineWidth   = stroke.width * 2;
      ctx.beginPath();
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, stroke.width, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.stroke();
      }
    } else if (stroke.tool === 'fountain') {
      // Variable width fountain pen
      for (let i = 1; i < pts.length; i++) {
        const pressure = Math.min(i / 10, 1);
        ctx.lineWidth = stroke.width * (0.5 + pressure * 1.5);
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
    } else {
      // Default pen — smooth bezier
      ctx.beginPath();
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  useEffect(() => { redraw(strokes); }, [strokes, redraw]);

  // ── Get canvas position ──
  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top)  * scaleY,
    };
  };

  // ── Save to history ──
  const saveHistory = (newStrokes: Stroke[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newStrokes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex   = historyIndex - 1;
    const prevStrokes = history[newIndex];
    setHistoryIndex(newIndex);
    setStrokes(prevStrokes);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex   = historyIndex + 1;
    const nextStrokes = history[newIndex];
    setHistoryIndex(newIndex);
    setStrokes(nextStrokes);
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
      }
      if (e.key === 'Escape') { setShowTextInput(false); setTextValue(''); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [historyIndex, history]);

  // ── Start drawing ──
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);

    if (tool === 'text') {
      setTextPos(pos);
      setShowTextInput(true);
      setTextValue('');
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    isDrawing.current   = true;
    startPos.current    = pos;
    currentPoints.current = [pos];
  };

  // ── Drawing ──
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    currentPoints.current.push(pos);

    // Live preview on overlay canvas
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const previewStroke: Stroke = {
      id: 'preview',
      tool, color, width: lineWidth, opacity,
      points: ['line', 'rect', 'circle', 'arrow'].includes(tool)
        ? [startPos.current, pos]
        : [...currentPoints.current],
      fontSize,
    };
    drawStroke(ctx, previewStroke);
  };

  // ── Stop drawing ──
  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const overlay = overlayRef.current;
    if (overlay) overlay.getContext('2d')!.clearRect(0, 0, overlay.width, overlay.height);

    if (currentPoints.current.length === 0) return;

    const newStroke: Stroke = {
      id: generateId(),
      tool, color, width: lineWidth, opacity,
      points: [...currentPoints.current],
      fontSize,
    };

    const newStrokes = [...strokes, newStroke];
    setStrokes(newStrokes);
    saveHistory(newStrokes);
    currentPoints.current = [];
  };

  // ── Add text ──
  const addText = () => {
    if (!textValue.trim()) { setShowTextInput(false); return; }
    const newStroke: Stroke = {
      id: generateId(),
      tool: 'text', color, width: lineWidth, opacity,
      points: [textPos],
      text: textValue, fontSize,
    };
    const newStrokes = [...strokes, newStroke];
    setStrokes(newStrokes);
    saveHistory(newStrokes);
    setShowTextInput(false);
    setTextValue('');
  };

  const clearCanvas = () => {
    const newStrokes: Stroke[] = [];
    setStrokes(newStrokes);
    saveHistory(newStrokes);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current!;
    const url = canvas.toDataURL('image/png');
    const a   = document.createElement('a');
    a.href = url; a.download = 'whiteboard.png'; a.click();
  };

  // ── Toolbar button styles ──
  const toolBtn = (id: Tool, emoji: string, label: string) => (
    <button
      key={id}
      onClick={() => setTool(id)}
      title={label}
      style={{
        padding: '6px 10px',
        borderRadius: '8px',
        border: tool === id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
        background: tool === id ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
        color: tool === id ? '#818cf8' : '#94a3b8',
        cursor: 'pointer',
        fontSize: '13px',
        display: 'flex', alignItems: 'center', gap: '4px',
        whiteSpace: 'nowrap' as const,
      }}
    >
      <span>{emoji}</span>
      <span style={{ fontSize: '11px' }}>{label}</span>
    </button>
  );

  const getCursor = () => {
    if (tool === 'eraser') return 'cell';
    if (tool === 'text')   return 'text';
    if (tool === 'select') return 'default';
    return 'crosshair';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d0d1a' }}>

      {/* ── TOP TOOLBAR ── */}
      <div style={{
        flexShrink: 0,
        background: '#111120',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
      }}>

        {/* Drawing Tools */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {toolBtn('pen',      '✏️', 'Pen')}
          {toolBtn('brush',    '🖌️', 'Brush')}
          {toolBtn('fountain', '🖋️', 'Fountain')}
          {toolBtn('eraser',   '🧹', 'Eraser')}
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Shape Tools */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {toolBtn('line',   '╱',  'Line')}
          {toolBtn('rect',   '▭',  'Rectangle')}
          {toolBtn('circle', '○',  'Ellipse')}
          {toolBtn('arrow',  '→',  'Arrow')}
          {toolBtn('text',   'T',  'Text')}
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Color Palette */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? '2px solid #818cf8' : '2px solid transparent',
                outlineOffset: '2px',
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            />
          ))}
          {/* Custom color */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Custom color"
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              }}
            />
            {showColorPicker && (
              <div style={{
                position: 'absolute', top: '32px', left: 0, zIndex: 100,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px',
              }}>
                <input type="color" value={customColor}
                  onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); }}
                  style={{ width: '80px', height: '40px', cursor: 'pointer', border: 'none', background: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Stroke Width */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Size</span>
          <input type="range" min={1} max={30} value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            style={{ width: '80px', accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '20px' }}>{lineWidth}</span>
        </div>

        {/* Opacity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Opacity</span>
          <input type="range" min={0.1} max={1} step={0.05} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            style={{ width: '70px', accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '28px' }}>
            {Math.round(opacity * 100)}%
          </span>
        </div>

        {/* Font size (text tool only) */}
        {tool === 'text' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Font</span>
            <input type="range" min={12} max={72} value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ width: '70px', accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{fontSize}px</span>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {/* Undo */}
          <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Cmd+Z)"
            style={{
              padding: '6px 12px', borderRadius: '8px', cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: historyIndex <= 0 ? '#334155' : '#94a3b8', fontSize: '13px',
            }}>↩ Undo</button>

          {/* Redo */}
          <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Cmd+Shift+Z)"
            style={{
              padding: '6px 12px', borderRadius: '8px',
              cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: historyIndex >= history.length - 1 ? '#334155' : '#94a3b8', fontSize: '13px',
            }}>↪ Redo</button>

          {/* Clear */}
          <button onClick={clearCanvas} title="Clear all"
            style={{
              padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '13px',
            }}>🗑 Clear</button>

          {/* Save */}
          <button onClick={downloadCanvas} title="Download as PNG"
            style={{
              padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#818cf8', fontSize: '13px',
            }}>⬇ Save PNG</button>
        </div>
      </div>

      {/* ── CANVAS AREA ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Main canvas */}
        <canvas ref={canvasRef} width={2400} height={1600}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Overlay canvas for live preview */}
        <canvas ref={overlayRef} width={2400} height={1600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            cursor: getCursor(),
            touchAction: 'none',
          }}
        />

        {/* Text input overlay */}
        {showTextInput && (
          <div style={{
            position: 'absolute',
            left: `${(textPos.x / 2400) * 100}%`,
            top:  `${(textPos.y / 1600) * 100}%`,
            zIndex: 50,
          }}>
            <input
              ref={textInputRef}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addText();
                if (e.key === 'Escape') { setShowTextInput(false); setTextValue(''); }
              }}
              onBlur={addText}
              placeholder="Type here..."
              style={{
                background: 'rgba(30,30,50,0.85)',
                border: '1px dashed #6366f1',
                borderRadius: '4px',
                color: color,
                fontSize: `${fontSize * 0.6}px`,
                padding: '4px 8px',
                outline: 'none',
                minWidth: '120px',
                backdropFilter: 'blur(10px)',
              }}
            />
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Enter to confirm · Esc to cancel
            </div>
          </div>
        )}

        {/* Hint */}
        <div style={{
          position: 'absolute', bottom: '16px', right: '16px',
          fontSize: '12px', color: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}>
          🎨 Code Current Whiteboard · Cmd+Z to undo
        </div>

        {/* Current color indicator */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,0,0,0.4)', borderRadius: '8px',
          padding: '6px 10px', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: color, border: '2px solid rgba(255,255,255,0.2)',
          }} />
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
            {tool} · {lineWidth}px · {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}