import React, { useState } from 'react';
import { Copy, Download, Plus, Trash2, Check, AlertCircle, Clock, ArrowUpDown, Video } from 'lucide-react';

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

  const handleParsePasted = () => {
    if (!pasteInput.trim()) return;
    const lines = pasteInput.split('\n');
    const parsed: Chapter[] = [];

    lines.forEach(line => {
      const match = line.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/);
      if (match) {
        const timeStr = match[0];
        const sec = parseTimeToSeconds(timeStr);
        let title = line.replace(timeStr, '').replace(/^[-–—:\s]+/, '').trim();
        if (!title) title = 'Untitled Chapter';
        parsed.push({
          id: Math.random().toString(),
          timeStr,
          seconds: sec >= 0 ? sec : 0,
          title,
        });
      }
    });

    if (parsed.length > 0) {
      const hasZero = parsed.some(c => c.seconds === 0);
      if (!hasZero) {
        parsed.unshift({ id: Math.random().toString(), timeStr: '00:00', seconds: 0, title: 'Introduction' });
      }
      setChapters(parsed.sort((a, b) => a.seconds - b.seconds));
      setPasteInput('');
    }
  };

  const addChapter = () => {
    const lastSec = chapters.length > 0 ? chapters[chapters.length - 1].seconds + 60 : 0;
    const m = Math.floor(lastSec / 60);
    const s = lastSec % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    setChapters([
      ...chapters,
      { id: Date.now().toString(), timeStr, seconds: lastSec, title: 'New Chapter' },
    ]);
  };

  const updateChapter = (id: string, field: 'timeStr' | 'title', value: string) => {
    setChapters(chapters.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        if (field === 'timeStr') {
          const sec = parseTimeToSeconds(value);
          if (sec >= 0) updated.seconds = sec;
        }
        return updated;
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

  const startsWithZero = chapters.length > 0 && chapters[0].seconds === 0;
  const hasAtLeastThree = chapters.length >= 3;
  const isChronological = chapters.every((c, i) => i === 0 || c.seconds >= chapters[i - 1].seconds);

  return (
    <div className="space-y-6">
      {/* Platform Title Banner */}
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Creator Suite
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">YouTube Video Chapter Generator</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyChapters}
            className="px-3 py-1.5 rounded-[4px] bg-[#8A244B] hover:bg-[#721C3D] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Chapters'}</span>
          </button>
          <button
            onClick={downloadTxt}
            className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>
        </div>
      </div>

      {/* Professional 2-Column Split: Left Inputs, Right Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapter Rows & Quick Parser */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8A244B]" />
                <span>Chapter Timestamps ({chapters.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={sortChapters}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Sort</span>
                </button>
                <button
                  type="button"
                  onClick={addChapter}
                  className="px-2.5 py-1 text-xs font-bold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8A244B]" />
                  <span>Add Timestamp</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {chapters.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <span className="text-xs font-mono font-bold text-slate-400 w-6 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    value={c.timeStr}
                    onChange={(e) => updateChapter(c.id, 'timeStr', e.target.value)}
                    placeholder="00:00"
                    className="w-24 font-mono text-xs p-2 border border-slate-300 rounded-[4px] bg-white text-center font-bold text-[#8A244B] focus:border-[#8A244B]"
                  />
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => updateChapter(c.id, 'title', e.target.value)}
                    placeholder="Chapter title..."
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-[4px] bg-white font-medium focus:border-[#8A244B]"
                  />
                  <button
                    type="button"
                    onClick={() => deleteChapter(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-700 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Paste Transcript Box */}
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
              Bulk Paste from Script or Video Editor
            </h4>
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="00:00 Intro&#10;01:30 Architecture&#10;06:45 Code Walkthrough&#10;14:20 Wrap Up"
              rows={3}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-[4px] focus:outline-none focus:border-[#8A244B]"
            />
            <button
              type="button"
              onClick={handleParsePasted}
              disabled={!pasteInput.trim()}
              className="px-4 py-2 text-xs font-bold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] disabled:opacity-40 cursor-pointer"
            >
              Parse Timestamps
            </button>
          </div>
        </div>

        {/* Right Column: Live Output & Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {/* YouTube Requirements Card */}
          <div className="p-5 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
              YouTube Algorithm Checklist
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  startsWithZero ? 'bg-[#2E7D32]' : 'bg-[#D84315]'
                }`}>
                  {startsWithZero ? '✓' : '!'}
                </span>
                <span className={startsWithZero ? 'text-slate-800 font-semibold' : 'text-[#D84315] font-bold'}>
                  First timestamp starts at 00:00
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  hasAtLeastThree ? 'bg-[#2E7D32]' : 'bg-[#D84315]'
                }`}>
                  {hasAtLeastThree ? '✓' : '!'}
                </span>
                <span className={hasAtLeastThree ? 'text-slate-800 font-semibold' : 'text-[#D84315] font-bold'}>
                  At least 3 chapters present ({chapters.length}/3)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  isChronological ? 'bg-[#2E7D32]' : 'bg-[#D84315]'
                }`}>
                  {isChronological ? '✓' : '!'}
                </span>
                <span className={isChronological ? 'text-slate-800 font-semibold' : 'text-[#D84315] font-bold'}>
                  Timestamps listed chronologically
                </span>
              </div>
            </div>
          </div>

          {/* Formatted Output Box */}
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Formatted Description Output
              </span>
              <button
                type="button"
                onClick={copyChapters}
                className="text-xs font-bold text-[#8A244B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-[4px] overflow-x-auto whitespace-pre leading-relaxed select-all">
              {formattedOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
