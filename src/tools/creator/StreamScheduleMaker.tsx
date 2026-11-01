import React, { useState } from 'react';
import { Download, Plus, Trash2, Calendar, Clock, Copy, Check, AlertCircle, Bot, Loader2, Sparkles } from 'lucide-react';

interface StreamSlot {
  id: string;
  day: string;
  startTime: string; // "19:00"
  endTime: string;   // "22:00"
  platform: string;
  category: string;
  notes: string;
  isSpecialEvent: boolean;
}

export const StreamScheduleMaker: React.FC = () => {
  const [streamerNiche, setStreamerNiche] = useState<string>('Full-Stack Web Dev & Indie Gaming');
  const [targetPlatform, setTargetPlatform] = useState<string>('Twitch & YouTube');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(12);
  const [slots, setSlots] = useState<StreamSlot[]>([
    { id: '1', day: 'Monday', startTime: '19:00', endTime: '22:00', platform: 'Twitch', category: 'Software Architecture & Live Coding', notes: 'Building web tools', isSpecialEvent: false },
    { id: '2', day: 'Wednesday', startTime: '19:00', endTime: '22:30', platform: 'Twitch', category: 'Indie Game Exploration', notes: 'Community game night', isSpecialEvent: false },
    { id: '3', day: 'Friday', startTime: '20:00', endTime: '23:30', platform: 'Twitch & YouTube', category: 'Speedrunning & Community Q&A', notes: 'Weekend kickoff party', isSpecialEvent: true },
  ]);
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [format24h, setFormat24h] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: Date.now().toString(),
        day: 'Tuesday',
        startTime: '18:00',
        endTime: '21:00',
        platform: targetPlatform.split('&')[0].trim() || 'Twitch',
        category: 'Live Q&A / Just Chatting',
        notes: '',
        isSpecialEvent: false,
      },
    ]);
  };

  const updateSlot = (id: string, field: keyof StreamSlot, val: any) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const deleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  // Generate intelligent algorithmic schedule
  const generateAlgorithmicSchedule = () => {
    const primary = targetPlatform.split('&')[0].trim() || 'Twitch';
    const presets: StreamSlot[] = [
      { id: '1', day: 'Tuesday', startTime: '18:30', endTime: '21:30', platform: primary, category: `${streamerNiche} Deep Dive`, notes: 'Main weekly broadcast', isSpecialEvent: false },
      { id: '2', day: 'Thursday', startTime: '19:00', endTime: '22:00', platform: primary, category: `${streamerNiche} Workshops & Reviews`, notes: 'Interactive community session', isSpecialEvent: false },
      { id: '3', day: 'Saturday', startTime: '14:00', endTime: '18:00', platform: targetPlatform, category: 'Community Marathon & Special Event', notes: 'Weekend feature show', isSpecialEvent: true },
    ];
    setSlots(presets);
  };

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Create an optimized weekly live broadcast streaming schedule for a creator.
Niche / Content: "${streamerNiche}"
Target Platform: "${targetPlatform}"
Target Weekly Broadcast Volume: ~${weeklyGoalHours} hours
Timezone: "${timezone}"

Generate 3-5 distinct broadcast slots across the week without overlapping times.
Return a JSON array in format:
[
  {
    "day": "Monday",
    "startTime": "19:00",
    "endTime": "22:00",
    "platform": "Twitch",
    "category": "Coding & Design",
    "notes": "Weekly kick-off",
    "isSpecialEvent": false
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
          const withIds = parsed.map((item: any, i: number) => ({
            ...item,
            id: Date.now().toString() + i,
            isSpecialEvent: Boolean(item.isSpecialEvent),
          }));
          setSlots(withIds);
        } else {
          generateAlgorithmicSchedule();
        }
      } else {
        generateAlgorithmicSchedule();
      }
    } catch {
      generateAlgorithmicSchedule();
    } finally {
      setIsAiLoading(false);
    }
  };

  // Detect overlapping slots on same day
  const overlaps: string[] = [];
  slots.forEach((s1, idx1) => {
    slots.forEach((s2, idx2) => {
      if (idx1 < idx2 && s1.day === s2.day) {
        if (s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
          overlaps.push(`Time conflict on ${s1.day}: "${s1.category}" (${s1.startTime}-${s1.endTime}) overlaps with "${s2.category}" (${s2.startTime}-${s2.endTime}).`);
        }
      }
    });
  });

  const formatTimeDisplay = (time24: string): string => {
    if (format24h) return time24;
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const generateTextSchedule = (): string => {
    let out = `WEEKLY STREAMING SCHEDULE (${timezone})\n==========================================\n`;
    daysOfWeek.forEach(day => {
      const daySlots = slots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (daySlots.length > 0) {
        out += `\n${day.toUpperCase()}:\n`;
        daySlots.forEach(s => {
          out += `• ${formatTimeDisplay(s.startTime)} - ${formatTimeDisplay(s.endTime)}: ${s.category} [${s.platform}]${s.isSpecialEvent ? ' ⭐ SPECIAL EVENT' : ''}\n`;
        });
      }
    });
    return out;
  };

  const exportIcs = () => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dev27//Stream Schedule//EN',
      'CALSCALE:GREGORIAN',
    ];

    slots.forEach((s) => {
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:stream-${s.id}@dev27.tools`);
      ics.push(`SUMMARY:${s.platform}: ${s.category}`);
      ics.push(`DESCRIPTION:${s.notes || s.category} on ${s.platform}`);
      ics.push(`LOCATION:${s.platform}`);
      ics.push('STATUS:CONFIRMED');
      ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-schedule-${Date.now()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const csv = 'Day,Start Time,End Time,Platform,Category,Special Event,Notes\n' +
      slots.map(s => `"${s.day}","${s.startTime}","${s.endTime}","${s.platform}","${s.category}","${s.isSpecialEvent}","${s.notes}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-schedule-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Schedule Generator Prompt Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-[#8A244B]" />
          <span>Broadcast Schedule Assistant</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Streamer Vibe / Niche:</label>
            <input
              type="text"
              value={streamerNiche}
              onChange={(e) => setStreamerNiche(e.target.value)}
              placeholder="e.g. Speedrunning, Web Development, Chess"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Primary Platform(s):</label>
            <input
              type="text"
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              placeholder="Twitch, YouTube, Kick"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Target Hours per Week:</label>
            <input
              type="number"
              min={2}
              max={60}
              value={weeklyGoalHours}
              onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-bold text-center"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={generateAlgorithmicSchedule}
            className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] cursor-pointer"
          >
            Apply Standard Schedule
          </button>

          <button
            type="button"
            onClick={generateWithAi}
            disabled={isAiLoading}
            className="px-4 py-2 text-xs font-semibold bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{isAiLoading ? 'AI Generating...' : 'AI Generate Schedule (Gemini)'}</span>
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="p-4 bg-white card-dev27 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Timezone:</span>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">Universal Coordinated Time (UTC)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Berlin">Central Europe (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={format24h}
              onChange={(e) => setFormat24h(e.target.checked)}
              className="rounded-[2px] text-[#8A244B]"
            />
            <span>24-Hour Time Format</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={addSlot}
            className="px-3 py-1.5 font-semibold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#8A244B]" />
            Add Broadcast Slot
          </button>
          <button
            onClick={exportIcs}
            className="px-3 py-1.5 font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Export iCal (.ICS)
          </button>
          <button
            onClick={exportCsv}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] cursor-pointer"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Conflict Warning */}
      {overlaps.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 space-y-1">
          <div className="flex items-center gap-1 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Scheduling Overlap Detected:</span>
          </div>
          {overlaps.map((ov, i) => (
            <p key={i} className="text-[11px]">{ov}</p>
          ))}
        </div>
      )}

      {/* Slot List */}
      <div className="space-y-2">
        {slots.map((s) => (
          <div key={s.id} className="p-3 bg-white card-dev27 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center border border-slate-200/90 rounded-[4px]">
            <div>
              <label className="text-[10px] text-slate-400 block">Day:</label>
              <select
                value={s.day}
                onChange={(e) => updateSlot(s.id, 'day', e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white font-medium"
              >
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block">Start / End:</label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="time"
                  value={s.startTime}
                  onChange={(e) => updateSlot(s.id, 'startTime', e.target.value)}
                  className="w-full p-1 border border-slate-300 rounded-[4px] text-center text-xs"
                />
                <span>-</span>
                <input
                  type="time"
                  value={s.endTime}
                  onChange={(e) => updateSlot(s.id, 'endTime', e.target.value)}
                  className="w-full p-1 border border-slate-300 rounded-[4px] text-center text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block">Platform:</label>
              <input
                type="text"
                value={s.platform}
                onChange={(e) => updateSlot(s.id, 'platform', e.target.value)}
                placeholder="Twitch, YouTube"
                className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 block">Category / Game:</label>
              <input
                type="text"
                value={s.category}
                onChange={(e) => updateSlot(s.id, 'category', e.target.value)}
                placeholder="Game, podcast, coding"
                className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white font-medium"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
              <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={s.isSpecialEvent}
                  onChange={(e) => updateSlot(s.id, 'isSpecialEvent', e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Special</span>
              </label>
              <button
                onClick={() => deleteSlot(s.id)}
                className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                title="Remove slot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formatted Text Preview */}
      <div className="p-4 bg-white card-dev27 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Weekly Schedule Text Export</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateTextSchedule());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-2.5 py-1 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-[#8A244B]" />}
            Copy Text
          </button>
        </div>
        <pre className="font-mono text-xs p-3 bg-slate-900 text-slate-100 border border-slate-200 rounded-[4px] whitespace-pre-wrap">
          {generateTextSchedule()}
        </pre>
      </div>
    </div>
  );
};
