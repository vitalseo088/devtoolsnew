import React, { useState } from 'react';
import { Copy, Download, Plus, Trash2, Check, AlertCircle, Clock, ArrowUpDown } from 'lucide-react';

interface Chapter {
  id: string;
  timeStr: string;
  seconds: number;
  title: string;
}

export const YouTubeChapterGenerator: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', timeStr: '00:00', seconds: 0, title: 'Introduction & Overview' },
    { id: '2', timeStr: '01:45', seconds: 105, title: 'Core Architectural Concepts' },
    { id: '3', timeStr: '05:30', seconds: 330, title: 'Live Coding Implementation' },
    { id: '4', timeStr: '11:15', seconds: 675, title: 'Benchmarking & Performance' },
    { id: '5', timeStr: '16:00', seconds: 960, title: 'Final Summary & Next Steps' },
  ]);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Time string parser (mm:ss or hh:mm:ss)
  const parseTimeToSeconds = (str: string): number => {
    const parts = str.trim().split(':').map(Number);
    if (parts.some(isNaN)) return -1;
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return -1;
  };

  const secondsToTimeStr = (totalSec: number): string => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parse pasted timestamps / transcript
  const handleParsePasted = () => {
    if (!pasteInput.trim()) return;
    const lines = pasteInput.split('\n');
    const parsed: Chapter[] = [];

    lines.forEach(line => {
      // Regex looking for 00:00 or 0:00 or 01:23:45
      const match = line.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/);
      if (match) {
        const timeStr = match[0];
        const sec = parseTimeToSeconds(timeStr);
        let title = line.replace(timeStr, '').replace(/^[-–—:\s]+/, '').trim();
        if (!title) title = 'Untitled Chapter';
        parsed.push({
          id: Math.random().toString(),
          timeStr,
          seconds: sec,
          title,
        });
      }
    });

    if (parsed.length > 0) {
      // Sort chronologically
      parsed.sort((a, b) => a.seconds - b.seconds);
      setChapters(parsed);
      setPasteInput('');
    }
  };

  // YouTube validation checks
  const validationWarnings: string[] = [];
  if (chapters.length > 0) {
    if (chapters[0].seconds !== 0) {
      validationWarnings.push('First chapter must start at 00:00 (YouTube requirement).');
    }
    if (chapters.length < 3) {
      validationWarnings.push('YouTube requires at least 3 chapters in a video.');
    }
    for (let i = 0; i < chapters.length - 1; i++) {
      if (chapters[i + 1].seconds <= chapters[i].seconds) {
        validationWarnings.push(`Chapter "${chapters[i + 1].title}" must be strictly after "${chapters[i].title}".`);
      } else if (chapters[i + 1].seconds - chapters[i].seconds < 10) {
        validationWarnings.push(`Chapter "${chapters[i + 1].title}" is less than 10 seconds after previous chapter.`);
      }
    }
  }

  const addChapter = () => {
    const lastSec = chapters.length > 0 ? chapters[chapters.length - 1].seconds + 60 : 0;
    setChapters([
      ...chapters,
      {
        id: Math.random().toString(),
        timeStr: secondsToTimeStr(lastSec),
        seconds: lastSec,
        title: 'New Chapter',
      },
    ]);
  };

  const updateChapter = (id: string, field: 'timeStr' | 'title', val: string) => {
    setChapters(chapters.map(c => {
      if (c.id === id) {
        if (field === 'timeStr') {
          const sec = parseTimeToSeconds(val);
          return { ...c, timeStr: val, seconds: sec !== -1 ? sec : c.seconds };
        }
        return { ...c, [field]: val };
      }
      return c;
    }));
  };

  const deleteChapter = (id: string) => {
    setChapters(chapters.filter(c => c.id !== id));
  };

  const sortChapters = () => {
    const sorted = [...chapters].sort((a, b) => a.seconds - b.seconds);
    setChapters(sorted);
  };

  const formattedOutput = chapters.map(c => `${c.timeStr} - ${c.title}`).join('\n');

  const copyChapters = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([formattedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-chapters-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Quick Paste Transcript / Raw Timestamps */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Paste Raw Timestamps or Transcript
        </span>
        <textarea
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder={`Paste lines containing timestamps, for example:\n00:00 Welcome\n02:30 Setting up Vite\n08:15 Deploying online`}
          rows={3}
          className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-[4px] focus:outline-none"
        />
        <div className="flex justify-between items-center">
          <button
            onClick={handleParsePasted}
            disabled={!pasteInput.trim()}
            className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] disabled:opacity-40"
          >
            Extract &amp; Populate Chapters
          </button>
          <button
            onClick={addChapter}
            className="px-3 py-1.5 text-xs font-medium bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-[#8A244B]" />
            Add Row
          </button>
        </div>
      </div>

      {/* Warnings Banner */}
      {validationWarnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>YouTube Chapter Requirements Notice:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
            {validationWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Chapters Editor Table */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8A244B]" />
            <span className="text-xs font-bold text-slate-800">Video Chapters ({chapters.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={sortChapters}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              Sort Chronologically
            </button>
            <button
              onClick={copyChapters}
              className="px-2.5 py-1 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
              Copy All
            </button>
            <button
              onClick={downloadTxt}
              className="px-2.5 py-1 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download .TXT
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {chapters.map((c, idx) => (
            <div key={c.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-[4px]">
              <span className="text-[11px] font-mono text-slate-400 w-6 text-center">{idx + 1}</span>
              <input
                type="text"
                value={c.timeStr}
                onChange={(e) => updateChapter(c.id, 'timeStr', e.target.value)}
                placeholder="00:00"
                className="w-20 font-mono text-xs p-1.5 border border-slate-300 rounded-[4px] bg-white text-center focus:border-[#8A244B]"
              />
              <input
                type="text"
                value={c.title}
                onChange={(e) => updateChapter(c.id, 'title', e.target.value)}
                placeholder="Chapter title..."
                className="flex-1 text-xs p-1.5 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
              />
              <button
                onClick={() => deleteChapter(c.id)}
                className="p-1.5 text-slate-400 hover:text-red-700 rounded-[4px]"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
