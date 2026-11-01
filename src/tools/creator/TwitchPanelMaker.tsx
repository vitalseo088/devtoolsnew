import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Eye, Palette, Check, Sparkles, Bot, Loader2, RefreshCw } from 'lucide-react';

interface TwitchPanel {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export const TwitchPanelMaker: React.FC = () => {
  const [panels, setPanels] = useState<TwitchPanel[]>([
    { id: '1', title: 'ABOUT ME', subtitle: 'Variety streamer · Code & Chill', bgColor: '#111F35', textColor: '#FFFFFF', accentColor: '#8A244B' },
    { id: '2', title: 'SCHEDULE', subtitle: 'Mon / Wed / Fri · 7PM EST', bgColor: '#111F35', textColor: '#FFFFFF', accentColor: '#8A244B' },
    { id: '3', title: 'DISCORD', subtitle: 'Join the community server', bgColor: '#111F35', textColor: '#FFFFFF', accentColor: '#8A244B' },
    { id: '4', title: 'DONATE', subtitle: 'Support the daily live streams', bgColor: '#111F35', textColor: '#FFFFFF', accentColor: '#8A244B' },
  ]);
  const [activePanelId, setActivePanelId] = useState<string>('1');
  const [panelHeight, setPanelHeight] = useState<number>(100);
  const [channelTheme, setChannelTheme] = useState<string>('Cyberpunk Neon / Tech & Gaming');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePanel = panels.find(p => p.id === activePanelId) || panels[0];

  const drawPanel = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activePanel) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 320;
    const h = panelHeight;
    canvas.width = w;
    canvas.height = h;

    // Background fill
    ctx.fillStyle = activePanel.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle header gradient overlay
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, activePanel.accentColor);
    grad.addColorStop(1, activePanel.bgColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, 6); // top accent stripe

    // Bottom accent line
    ctx.fillStyle = activePanel.accentColor;
    ctx.fillRect(0, h - 3, w, 3);

    // Decorative geometric corner
    ctx.fillStyle = activePanel.accentColor;
    ctx.beginPath();
    ctx.moveTo(w - 20, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, 20);
    ctx.closePath();
    ctx.fill();

    // Title Text
    ctx.fillStyle = activePanel.textColor;
    ctx.font = 'bold 22px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText(activePanel.title.toUpperCase(), w / 2, h / 2 - (activePanel.subtitle ? 4 : -6));

    // Subtitle Text
    if (activePanel.subtitle) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px Manrope, sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(activePanel.subtitle, w / 2, h / 2 + 18);
    }
  };

  useEffect(() => {
    drawPanel();
  }, [activePanel, panelHeight]);

  const updateActive = (field: keyof TwitchPanel, val: string) => {
    setPanels(panels.map(p => p.id === activePanelId ? { ...p, [field]: val } : p));
  };

  const addPanel = () => {
    const newId = Date.now().toString();
    const newP: TwitchPanel = {
      id: newId,
      title: 'RULES',
      subtitle: 'Be respectful · No spam',
      bgColor: activePanel.bgColor || '#111F35',
      textColor: activePanel.textColor || '#FFFFFF',
      accentColor: activePanel.accentColor || '#8A244B',
    };
    setPanels([...panels, newP]);
    setActivePanelId(newId);
  };

  const deletePanel = (id: string) => {
    if (panels.length <= 1) return;
    const remaining = panels.filter(p => p.id !== id);
    setPanels(remaining);
    setActivePanelId(remaining[0].id);
  };

  const applyPalette = (bg: string, accent: string, text: string) => {
    setPanels(panels.map(p => ({
      ...p,
      bgColor: bg,
      accentColor: accent,
      textColor: text,
    })));
  };

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Suggest 4 cohesive Twitch channel panels (title, subtitle, and hex color scheme) for a streamer with theme: "${channelTheme}".
Titles like ABOUT, SCHEDULE, GEAR, SOCIALS, DISCORD, RULES, SPECS.
Colors must be dark mode friendly.

Return JSON array in format:
[
  {
    "title": "ABOUT ME",
    "subtitle": "Short punchy description",
    "bgColor": "#111F35",
    "accentColor": "#8A244B",
    "textColor": "#FFFFFF"
  }
]`;

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: 'Respond only with a valid JSON array.' }),
      });
      const data = await res.json();
      if (data.text) {
        const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item: any, i: number) => ({
            id: Date.now().toString() + i,
            title: item.title || 'PANEL',
            subtitle: item.subtitle || '',
            bgColor: item.bgColor || '#111F35',
            accentColor: item.accentColor || '#8A244B',
            textColor: item.textColor || '#FFFFFF',
          }));
          setPanels(formatted);
          setActivePanelId(formatted[0].id);
        }
      }
    } catch {
      // Keep existing
    } finally {
      setIsAiLoading(false);
    }
  };

  const downloadCurrentPanel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `twitch-panel-${activePanel.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* AI Theme Suggestion Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-[#8A244B]" />
          <span>AI Panel Theme &amp; Color Generator</span>
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={channelTheme}
            onChange={(e) => setChannelTheme(e.target.value)}
            placeholder="e.g. Cyberpunk Neon, Retro Vaporwave, Minimal Dark, Cozy Coffee"
            className="flex-1 p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-medium"
          />
          <button
            onClick={generateWithAi}
            disabled={isAiLoading}
            className="px-4 py-2 text-xs font-semibold bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{isAiLoading ? 'Designing...' : 'AI Generate Theme (Gemini)'}</span>
          </button>
        </div>

        {/* Quick Color Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          <button
            onClick={() => applyPalette('#111F35', '#8A244B', '#FFFFFF')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[4px] text-[11px] font-bold cursor-pointer"
          >
            Dev27 Classic (Maroon &amp; Navy)
          </button>
          <button
            onClick={() => applyPalette('#0B0F19', '#06B6D4', '#FFFFFF')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[4px] text-[11px] font-bold cursor-pointer"
          >
            Cyber Cyan
          </button>
          <button
            onClick={() => applyPalette('#141E15', '#22C55E', '#F0FDF4')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[4px] text-[11px] font-bold cursor-pointer"
          >
            Emerald Tactical
          </button>
          <button
            onClick={() => applyPalette('#1F1429', '#E879F9', '#FAF5FF')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[4px] text-[11px] font-bold cursor-pointer"
          >
            Vaporwave Neon
          </button>
        </div>
      </div>

      {/* Panel Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white card-dev27 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {panels.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePanelId(p.id)}
              className={`px-3 py-1.5 font-bold rounded-[4px] transition-colors cursor-pointer ${
                activePanelId === p.id
                  ? 'bg-[#8A244B] text-white'
                  : 'bg-[#F2EFE7] text-[#111F35] hover:bg-slate-200'
              }`}
            >
              {p.title}
            </button>
          ))}
          <button
            onClick={addPanel}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] cursor-pointer"
            title="Add New Panel"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={downloadCurrentPanel}
          className="px-3 py-1.5 font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download Panel (320px PNG)
        </button>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Settings Column */}
        <div className="p-4 bg-white card-dev27 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
            <span>Edit Panel Content</span>
            {panels.length > 1 && (
              <button
                onClick={() => deletePanel(activePanelId)}
                className="text-red-600 hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Panel Title (Header):</label>
              <input
                type="text"
                value={activePanel.title}
                onChange={(e) => updateActive('title', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Subtitle / Bio text:</label>
              <input
                type="text"
                value={activePanel.subtitle}
                onChange={(e) => updateActive('subtitle', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-slate-600 block mb-1">Background:</label>
                <input
                  type="color"
                  value={activePanel.bgColor}
                  onChange={(e) => updateActive('bgColor', e.target.value)}
                  className="w-full h-8 p-0.5 border border-slate-300 rounded-[4px] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Accent Strip:</label>
                <input
                  type="color"
                  value={activePanel.accentColor}
                  onChange={(e) => updateActive('accentColor', e.target.value)}
                  className="w-full h-8 p-0.5 border border-slate-300 rounded-[4px] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Text Color:</label>
                <input
                  type="color"
                  value={activePanel.textColor}
                  onChange={(e) => updateActive('textColor', e.target.value)}
                  className="w-full h-8 p-0.5 border border-slate-300 rounded-[4px] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="text-slate-600 block mb-1">Height (standard 100px / 140px):</label>
              <select
                value={panelHeight}
                onChange={(e) => setPanelHeight(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={80}>Compact (80px)</option>
                <option value={100}>Standard (100px)</option>
                <option value={140}>Tall / Detailed (140px)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={drawPanel}
                className="w-full py-2 px-3 text-xs font-bold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Apply Panel Style</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="p-4 bg-white card-dev27 flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-bold text-slate-700 block w-full pb-2 border-b border-slate-100">
            Twitch Standard Preview (320px Width)
          </span>

          <div className="p-6 bg-slate-100 border border-slate-200 rounded-[4px] flex items-center justify-center w-full">
            <canvas ref={canvasRef} className="shadow-md rounded-[2px]" />
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Standard 320px width matches official Twitch channel 'About' panels.
          </p>
        </div>
      </div>
    </div>
  );
};
