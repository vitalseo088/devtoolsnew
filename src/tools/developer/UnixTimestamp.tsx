import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Calendar, ArrowRight, Play, Pause } from 'lucide-react';

export const UnixTimestamp: React.FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState<boolean>(true);
  const [timestampInput, setTimestampInput] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [unit, setUnit] = useState<'auto' | 'seconds' | 'ms'>('auto');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 19));
  const [timezone, setTimezone] = useState<string>('Local');
  const [format24h, setFormat24h] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticking clock
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Parse input timestamp
  const parsedDate = React.useMemo(() => {
    const raw = timestampInput.trim();
    if (!raw) return null;
    const num = Number(raw);
    if (isNaN(num)) return null;

    let ms = num;
    if (unit === 'seconds') {
      ms = num * 1000;
    } else if (unit === 'ms') {
      ms = num;
    } else {
      // Auto: if > 1e11 (approx year 1973 in ms), assume ms, else seconds
      ms = Math.abs(num) > 9999999999 ? num : num * 1000;
    }
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [timestampInput, unit]);

  // Convert date to timestamp
  const convertedFromDate = React.useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      ms: d.getTime(),
    };
  }, [dateInput]);

  const copyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const useCurrentAsInput = () => {
    setTimestampInput(String(currentEpoch));
  };

  return (
    <div className="space-y-4">
      {/* Live Clock Card */}
      <div className="p-4 bg-white card-dev27 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F2EFE7] text-[#8A244B] rounded-[4px]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Current Unix Epoch Time
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-extrabold text-[#8A244B]">
                {currentEpoch}
              </span>
              <span className="text-xs text-slate-500 font-mono">seconds</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1.5"
          >
            {isLive ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-green-700" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={useCurrentAsInput}
            className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px]"
          >
            Use in Converter
          </button>
        </div>
      </div>

      {/* Timestamp to Date Converter */}
      <div className="p-4 bg-white card-dev27 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            1. Convert Timestamp to Human Date
          </span>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Unit:</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="border border-slate-300 rounded-[4px] px-2 py-0.5 bg-white text-xs"
              >
                <option value="auto">Auto-detect</option>
                <option value="seconds">Seconds (s)</option>
                <option value="ms">Milliseconds (ms)</option>
              </select>
            </div>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={format24h}
                onChange={(e) => setFormat24h(e.target.checked)}
                className="rounded-[2px] text-[#8A244B]"
              />
              <span>24h Time</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="e.g. 1730300000 or -50000"
            className="flex-1 font-mono text-sm p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:border-[#8A244B] focus:outline-none"
          />
          <button
            onClick={() => setTimestampInput(String(Math.floor(Date.now() / 1000)))}
            className="px-3 py-2 text-xs font-medium bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px]"
          >
            Now
          </button>
        </div>

        {parsedDate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {[
              {
                label: 'UTC (GMT)',
                val: parsedDate.toUTCString(),
                key: 'utc',
              },
              {
                label: 'Local Browser Time',
                val: parsedDate.toLocaleString('en-US', { hour12: !format24h }),
                key: 'local',
              },
              {
                label: 'ISO 8601 Format',
                val: parsedDate.toISOString(),
                key: 'iso',
              },
              {
                label: 'Relative Time',
                val: (() => {
                  const diffSec = Math.round((parsedDate.getTime() - Date.now()) / 1000);
                  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
                  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
                  if (Math.abs(diffSec) < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
                  if (Math.abs(diffSec) < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
                  return rtf.format(Math.round(diffSec / 86400), 'day');
                })(),
                key: 'relative',
              },
            ].map((item) => (
              <div key={item.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{item.label}</span>
                  <button
                    onClick={() => copyValue(item.val, item.key)}
                    className="text-[11px] text-[#8A244B] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === item.key ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === item.key ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-xs font-semibold text-slate-800 break-all">{item.val}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-red-600">Please enter a valid numeric Unix timestamp.</p>
        )}
      </div>

      {/* Date to Timestamp Converter */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          2. Convert Date to Unix Timestamp
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="sm:col-span-1">
            <label className="text-xs text-slate-600 block mb-1">Select Date & Time:</label>
            <input
              type="datetime-local"
              step="1"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full text-xs font-mono p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B] focus:outline-none"
            />
          </div>

          {convertedFromDate && (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Seconds (s)</span>
                  <button
                    onClick={() => copyValue(String(convertedFromDate.seconds), 'sec')}
                    className="text-[11px] text-[#8A244B] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'sec' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-xs font-bold text-[#8A244B]">
                  {convertedFromDate.seconds}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">Milliseconds (ms)</span>
                  <button
                    onClick={() => copyValue(String(convertedFromDate.ms), 'ms')}
                    className="text-[11px] text-[#8A244B] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'ms' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-xs font-bold text-[#8A244B]">
                  {convertedFromDate.ms}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
