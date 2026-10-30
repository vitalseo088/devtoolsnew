import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, SkipForward, Copy, Check, Lock, Unlock, Download } from 'lucide-react';

interface Props {
  type: 'online-timer' | 'pomodoro' | 'work-break' | 'color-palette';
}

export const TimersAndPalette: React.FC<Props> = ({ type }) => {
  // Web Audio chime generator
  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  };

  // 4.13 Online Timer
  const [timerDuration, setTimerDuration] = useState<number>(300); // 5 min
  const [timerRemaining, setTimerRemaining] = useState<number>(300);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('Focus Session');
  const timerTargetTimeRef = useRef<number | null>(null);

  // 4.14 Pomodoro
  const [pomoWorkMin, setPomoWorkMin] = useState<number>(25);
  const [pomoShortMin, setPomoShortMin] = useState<number>(5);
  const [pomoLongMin, setPomoLongMin] = useState<number>(15);
  const [pomoMode, setPomoMode] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [pomoRemaining, setPomoRemaining] = useState<number>(25 * 60);
  const [pomoActive, setPomoActive] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const pomoTargetTimeRef = useRef<number | null>(null);

  // 4.15 Work Break
  const [breakCycleMode, setBreakCycleMode] = useState<'20-20-20' | '50-10'>('20-20-20');
  const [breakTimerSec, setBreakTimerSec] = useState<number>(20 * 60);
  const [breakIsActive, setBreakIsActive] = useState<boolean>(false);
  const [breakPhase, setBreakPhase] = useState<'work' | 'rest'>('work');
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // 4.17 Color Palette
  const [baseHex, setBaseHex] = useState<string>('#8A244B');
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#8A244B', '#A6335F', '#5E1430', '#D84315', '#F2EFE7'
  ]);
  const [lockedColors, setLockedColors] = useState<Record<number, boolean>>({});
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Online timer loop using Date.now()
  useEffect(() => {
    let anim: any;
    if (timerActive) {
      if (!timerTargetTimeRef.current) {
        timerTargetTimeRef.current = Date.now() + timerRemaining * 1000;
      }
      const tick = () => {
        if (!timerTargetTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((timerTargetTimeRef.current - now) / 1000));
        setTimerRemaining(diff);
        if (diff <= 0) {
          setTimerActive(false);
          timerTargetTimeRef.current = null;
          playAlertChime();
        } else {
          anim = setTimeout(tick, 200);
        }
      };
      tick();
    } else {
      timerTargetTimeRef.current = null;
    }
    return () => clearTimeout(anim);
  }, [timerActive]);

  // Pomodoro timer loop
  useEffect(() => {
    let anim: any;
    if (pomoActive) {
      if (!pomoTargetTimeRef.current) {
        pomoTargetTimeRef.current = Date.now() + pomoRemaining * 1000;
      }
      const tick = () => {
        if (!pomoTargetTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((pomoTargetTimeRef.current - now) / 1000));
        setPomoRemaining(diff);
        if (diff <= 0) {
          playAlertChime();
          pomoTargetTimeRef.current = null;
          // Switch phase
          if (pomoMode === 'work') {
            const nextCount = completedSessions + 1;
            setCompletedSessions(nextCount);
            if (nextCount % 4 === 0) {
              setPomoMode('long-break');
              setPomoRemaining(pomoLongMin * 60);
            } else {
              setPomoMode('short-break');
              setPomoRemaining(pomoShortMin * 60);
            }
          } else {
            setPomoMode('work');
            setPomoRemaining(pomoWorkMin * 60);
          }
        } else {
          anim = setTimeout(tick, 200);
        }
      };
      tick();
    } else {
      pomoTargetTimeRef.current = null;
    }
    return () => clearTimeout(anim);
  }, [pomoActive, pomoMode, completedSessions, pomoWorkMin, pomoShortMin, pomoLongMin]);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Color Palette Helpers
  const hexToHsl = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const generateHarmonies = (mode = 'complementary') => {
    const [h, s, l] = hexToHsl(baseHex);
    let newColors: string[] = [];

    if (mode === 'complementary') {
      newColors = [
        baseHex,
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 180) % 360, Math.max(10, s - 20), Math.min(90, l + 20)),
        hslToHex(h, s, Math.min(92, l + 30)),
        hslToHex(h, s, Math.max(15, l - 25)),
      ];
    } else if (mode === 'triadic') {
      newColors = [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex((h + 120) % 360, s, Math.min(90, l + 20)),
        hslToHex((h + 240) % 360, s, Math.max(15, l - 20)),
      ];
    } else if (mode === 'analogous') {
      newColors = [
        hslToHex((h - 40 + 360) % 360, s, l),
        hslToHex((h - 20 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 20) % 360, s, l),
        hslToHex((h + 40) % 360, s, l),
      ];
    } else {
      // Monochromatic
      newColors = [
        hslToHex(h, s, Math.max(10, l - 35)),
        hslToHex(h, s, Math.max(20, l - 15)),
        baseHex,
        hslToHex(h, Math.max(20, s - 10), Math.min(85, l + 15)),
        hslToHex(h, Math.max(10, s - 25), Math.min(95, l + 30)),
      ];
    }

    setPaletteColors(paletteColors.map((curr, idx) => lockedColors[idx] ? curr : (newColors[idx] || curr)));
  };

  // WCAG Contrast calculation
  const getLuminance = (hex: string): number => {
    const clean = hex.replace('#', '');
    const rgb = [
      parseInt(clean.substring(0, 2), 16) / 255,
      parseInt(clean.substring(2, 4), 16) / 255,
      parseInt(clean.substring(4, 6), 16) / 255,
    ].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const getContrastRatio = (c1: string, c2: string): number => {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const exportCssVars = () => {
    const css = `:root {\n` + paletteColors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + `\n}`;
    navigator.clipboard.writeText(css);
    setCopiedColor('css');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const titles = {
    'online-timer': 'Accurate Multi-Preset Online Countdown Timer',
    'pomodoro': 'Pomodoro Focus & Break Interval Timer',
    'work-break': 'Work-Break & 20-20-20 Eye Strain Timer',
    'color-palette': 'Color Palette Generator & WCAG Contrast Checker',
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[type]}
        </span>

        {type === 'online-timer' && (
          <div className="space-y-4 text-center">
            <input
              type="text"
              value={timerLabel}
              onChange={(e) => setTimerLabel(e.target.value)}
              className="text-xs font-semibold text-slate-500 text-center border-b border-slate-200 pb-1 bg-transparent focus:outline-none"
            />
            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-[#8A244B] tracking-tight">
              {formatTime(timerRemaining)}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`px-4 py-2 font-semibold text-xs rounded-[4px] flex items-center gap-1.5 ${
                  timerActive ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-[#8A244B] hover:bg-[#721C3D] text-white'
                }`}
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timerActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerRemaining(timerDuration);
                }}
                className="px-3 py-2 font-medium text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium mr-1">Presets:</span>
              {[
                { label: '1m', sec: 60 },
                { label: '5m', sec: 300 },
                { label: '10m', sec: 600 },
                { label: '15m', sec: 900 },
                { label: '25m', sec: 1500 },
                { label: '45m', sec: 2700 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setTimerDuration(p.sec);
                    setTimerRemaining(p.sec);
                    setTimerActive(false);
                  }}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:bg-[#F2EFE7] text-slate-700 rounded-[4px]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'pomodoro' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-[4px] font-bold ${pomoMode === 'work' ? 'bg-[#8A244B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                Focus Work (25m)
              </span>
              <span className={`px-2.5 py-1 rounded-[4px] font-bold ${pomoMode === 'short-break' ? 'bg-[#2E7D32] text-white' : 'bg-slate-100 text-slate-600'}`}>
                Short Break (5m)
              </span>
              <span className={`px-2.5 py-1 rounded-[4px] font-bold ${pomoMode === 'long-break' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Long Break (15m)
              </span>
            </div>

            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-[#8A244B]">
              {formatTime(pomoRemaining)}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPomoActive(!pomoActive)}
                className="px-4 py-2 font-semibold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
              >
                {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {pomoActive ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={() => {
                  setPomoActive(false);
                  setPomoRemaining(pomoWorkMin * 60);
                  setPomoMode('work');
                }}
                className="px-3 py-2 font-medium text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Completed Focus Sessions: <strong className="text-slate-900 font-mono text-sm">{completedSessions}</strong> (Total Focus: {completedSessions * pomoWorkMin} min)
            </div>
          </div>
        )}

        {type === 'work-break' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => {
                  setBreakCycleMode('20-20-20');
                  setBreakTimerSec(20 * 60);
                  setBreakIsActive(false);
                }}
                className={`px-3 py-1 font-bold rounded-[4px] ${breakCycleMode === '20-20-20' ? 'bg-[#8A244B] text-white' : 'bg-slate-100'}`}
              >
                20-20-20 Eye Strain Rule (20m work / 20s rest)
              </button>
              <button
                onClick={() => {
                  setBreakCycleMode('50-10');
                  setBreakTimerSec(50 * 60);
                  setBreakIsActive(false);
                }}
                className={`px-3 py-1 font-bold rounded-[4px] ${breakCycleMode === '50-10' ? 'bg-[#8A244B] text-white' : 'bg-slate-100'}`}
              >
                50-10 Productivity Cycle
              </button>
            </div>

            <div className="font-mono text-5xl font-extrabold text-[#8A244B]">
              {formatTime(breakTimerSec)}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setBreakIsActive(!breakIsActive)}
                className="px-4 py-2 font-semibold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
              >
                {breakIsActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {breakIsActive ? 'Pause' : 'Start Cycle'}
              </button>
            </div>
          </div>
        )}

        {type === 'color-palette' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">Base Color:</span>
                <input
                  type="color"
                  value={baseHex}
                  onChange={(e) => setBaseHex(e.target.value.toUpperCase())}
                  className="w-8 h-8 p-0.5 border border-slate-300 rounded-[4px] cursor-pointer"
                />
                <input
                  type="text"
                  value={baseHex}
                  onChange={(e) => setBaseHex(e.target.value.toUpperCase())}
                  className="w-24 p-1.5 border border-slate-300 rounded-[4px] font-mono font-bold text-center"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['complementary', 'analogous', 'triadic', 'monochromatic'].map((hMode) => (
                  <button
                    key={hMode}
                    onClick={() => generateHarmonies(hMode)}
                    className="px-2.5 py-1 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] capitalize font-medium"
                  >
                    {hMode}
                  </button>
                ))}
                <button
                  onClick={exportCssVars}
                  className="px-2.5 py-1 bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] font-semibold"
                >
                  {copiedColor === 'css' ? 'Copied CSS!' : 'Copy CSS Variables'}
                </button>
              </div>
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {paletteColors.map((hex, idx) => {
                const contrastOnWhite = getContrastRatio(hex, '#FFFFFF').toFixed(1);
                const isPassAA = Number(contrastOnWhite) >= 4.5;
                const isLocked = lockedColors[idx];

                return (
                  <div key={idx} className="card-dev27 overflow-hidden bg-white">
                    <div
                      className="h-24 w-full flex items-start justify-end p-2 cursor-pointer transition-opacity hover:opacity-95"
                      style={{ backgroundColor: hex }}
                      onClick={() => copyHex(hex)}
                      title="Click to copy hex"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLockedColors({ ...lockedColors, [idx]: !isLocked });
                        }}
                        className="p-1 bg-black/40 hover:bg-black/60 text-white rounded-[4px]"
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
                      </button>
                    </div>

                    <div className="p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                        <span>{hex}</span>
                        <button
                          onClick={() => copyHex(hex)}
                          className="text-[11px] text-[#8A244B] hover:underline"
                        >
                          {copiedColor === hex ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>WCAG vs White:</span>
                        <span className={`font-bold ${isPassAA ? 'text-green-700' : 'text-slate-500'}`}>
                          {contrastOnWhite}:1 {isPassAA ? '✓ AA' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
