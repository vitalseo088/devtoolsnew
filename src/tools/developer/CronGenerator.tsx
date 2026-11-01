import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Calendar, HelpCircle, RefreshCw, Bot, Loader2, Sparkles } from 'lucide-react';

export const CronGenerator: React.FC = () => {
  const [naturalInput, setNaturalInput] = useState<string>('Every Monday and Wednesday at 9:30 AM');
  const [minute, setMinute] = useState<string>('30');
  const [hour, setHour] = useState<string>('9');
  const [dom, setDom] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dow, setDow] = useState<string>('1,3');
  const [expression, setExpression] = useState<string>('30 9 * * 1,3');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [runsCount, setRunsCount] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync builder fields to expression
  const updateFromFields = (m: string, h: string, dm: string, mo: string, dw: string) => {
    const expr = `${m} ${h} ${dm} ${mo} ${dw}`.trim();
    setExpression(expr);
    validateExpression(expr);
  };

  const handleFieldChange = (field: 'm' | 'h' | 'dm' | 'mo' | 'dw', val: string) => {
    let m = minute, h = hour, dm = dom, mo = month, dw = dow;
    if (field === 'm') { setMinute(val); m = val; }
    if (field === 'h') { setHour(val); h = val; }
    if (field === 'dm') { setDom(val); dm = val; }
    if (field === 'mo') { setMonth(val); mo = val; }
    if (field === 'dw') { setDow(val); dw = val; }
    updateFromFields(m, h, dm, mo, dw);
  };

  const applyPreset = (preset: string) => {
    const parts = preset.split(' ');
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDom(parts[2]);
      setMonth(parts[3]);
      setDow(parts[4]);
      setExpression(preset);
      validateExpression(preset);
    }
  };

  const validateExpression = (expr: string): boolean => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      setManualError('Expression must have exactly 5 fields (minute hour day-of-month month day-of-week).');
      return false;
    }
    setManualError(null);
    return true;
  };

  const handleManualChange = (val: string) => {
    setExpression(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDom(parts[2]);
      setMonth(parts[3]);
      setDow(parts[4]);
      setManualError(null);
    } else {
      setManualError('Cron expression requires 5 space-separated fields.');
    }
  };

  // Rule-based NLP parser
  const parseNaturalLanguage = () => {
    const s = naturalInput.toLowerCase().trim();
    let m = '*', h = '*', dm = '*', mo = '*', dw = '*';

    if (s.includes('every minute')) {
      m = '*'; h = '*';
    } else if (s.includes('every 5 min')) {
      m = '*/5'; h = '*';
    } else if (s.includes('every 10 min')) {
      m = '*/10'; h = '*';
    } else if (s.includes('every 15 min')) {
      m = '*/15'; h = '*';
    } else if (s.includes('every 30 min') || s.includes('every half hour')) {
      m = '*/30'; h = '*';
    } else if (s.includes('every hour')) {
      m = '0'; h = '*';
    } else if (s.includes('every day at midnight') || s.includes('midnight')) {
      m = '0'; h = '0';
    }

    // Time detection like 9:30 AM or 14:00
    const timeMatch = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch && !s.includes('every ')) {
      let hourNum = parseInt(timeMatch[1], 10);
      const minNum = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];
      if (ampm === 'pm' && hourNum < 12) hourNum += 12;
      if (ampm === 'am' && hourNum === 12) hourNum = 0;
      m = minNum.toString();
      h = hourNum.toString();
    }

    // Weekdays
    if (s.includes('weekday') || s.includes('monday to friday') || s.includes('mon-fri')) {
      dw = '1-5';
    } else if (s.includes('weekend')) {
      dw = '6,0';
    } else {
      const daysFound: number[] = [];
      if (s.includes('sun')) daysFound.push(0);
      if (s.includes('mon')) daysFound.push(1);
      if (s.includes('tue')) daysFound.push(2);
      if (s.includes('wed')) daysFound.push(3);
      if (s.includes('thu')) daysFound.push(4);
      if (s.includes('fri')) daysFound.push(5);
      if (s.includes('sat')) daysFound.push(6);
      if (daysFound.length > 0) dw = daysFound.join(',');
    }

    setMinute(m);
    setHour(h);
    setDom(dm);
    setMonth(mo);
    setDow(dw);
    const newExpr = `${m} ${h} ${dm} ${mo} ${dw}`;
    setExpression(newExpr);
    validateExpression(newExpr);
  };

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Convert this natural language schedule into a standard 5-field cron expression (minute hour day-of-month month day-of-week):
Schedule description: "${naturalInput}"

Return a JSON object in format:
{
  "expression": "30 9 * * 1,3",
  "explanation": "At 09:30 AM on Monday and Wednesday"
}`;

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: 'Respond only with valid JSON object.' }),
      });
      const data = await res.json();
      if (data.text) {
        const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.expression) {
          applyPreset(parsed.expression);
        } else {
          parseNaturalLanguage();
        }
      } else {
        parseNaturalLanguage();
      }
    } catch {
      parseNaturalLanguage();
    } finally {
      setIsAiLoading(false);
    }
  };

  // Human description generator
  const getHumanDescription = (): string => {
    if (manualError) return 'Invalid expression syntax';
    if (expression === '* * * * *') return 'Every minute, every day';
    if (expression === '*/5 * * * *') return 'Every 5 minutes';
    if (expression === '*/15 * * * *') return 'Every 15 minutes';
    if (expression === '*/30 * * * *') return 'Every 30 minutes';
    if (expression === '0 * * * *') return 'Every hour on the hour (:00)';
    if (expression === '0 0 * * *') return 'Every day at midnight (00:00)';
    if (expression === '0 9 * * 1-5') return 'Every weekday (Mon-Fri) at 09:00 AM';
    if (expression === '0 0 * * 0') return 'Every Sunday at midnight';
    if (expression === '0 0 1 * *') return 'First day of every month at midnight';
    if (expression === '0 0 1 1 *') return 'First day of January (New Year) at midnight';

    return `Minute: ${minute}, Hour: ${hour}, Day of month: ${dom}, Month: ${month}, Day of week: ${dow}`;
  };

  // Simple next runs calculation
  const getNextRuns = (): string[] => {
    if (manualError) return [];
    const results: string[] = [];
    const now = new Date();
    let current = new Date(now.getTime() + 60000);
    current.setSeconds(0, 0);

    const matchField = (val: number, rule: string, min: number, max: number): boolean => {
      if (rule === '*') return true;
      if (rule.startsWith('*/')) {
        const step = parseInt(rule.slice(2), 10);
        return !isNaN(step) && step > 0 && (val % step === 0);
      }
      if (rule.includes(',')) {
        return rule.split(',').some(p => matchField(val, p.trim(), min, max));
      }
      if (rule.includes('-')) {
        const [start, end] = rule.split('-').map(Number);
        return val >= start && val <= end;
      }
      return Number(rule) === val;
    };

    let iterations = 0;
    while (results.length < runsCount && iterations < 50000) {
      iterations++;
      const m = current.getMinutes();
      const h = current.getHours();
      const dm = current.getDate();
      const mo = current.getMonth() + 1;
      const dw = current.getDay();

      const matchM = matchField(m, minute, 0, 59);
      const matchH = matchField(h, hour, 0, 23);
      const matchDM = matchField(dm, dom, 1, 31);
      const matchMO = matchField(mo, month, 1, 12);
      const matchDW = matchField(dw, dow, 0, 6);

      if (matchM && matchH && matchDM && matchMO && matchDW) {
        results.push(
          current.toLocaleString('en-US', {
            timeZone: timezone === 'Local' ? undefined : timezone,
            dateStyle: 'full',
            timeStyle: 'medium',
          })
        );
      }
      current = new Date(current.getTime() + 60000);
    }
    return results;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: 'Every minute', val: '* * * * *' },
    { label: 'Every 5 min', val: '*/5 * * * *' },
    { label: 'Every 15 min', val: '*/15 * * * *' },
    { label: 'Every 30 min', val: '*/30 * * * *' },
    { label: 'Every hour', val: '0 * * * *' },
    { label: 'Daily at 00:00', val: '0 0 * * *' },
    { label: 'Daily at 09:00', val: '0 9 * * *' },
    { label: 'Weekdays at 9am', val: '0 9 * * 1-5' },
    { label: 'Weekly (Sunday)', val: '0 0 * * 0' },
    { label: 'Monthly (1st)', val: '0 0 1 * *' },
    { label: 'Yearly (Jan 1)', val: '0 0 1 1 *' },
  ];

  return (
    <div className="space-y-4">
      {/* Natural Language Prompt Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-[#8A244B]" />
          <span>Natural Language Schedule Converter</span>
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
            placeholder="e.g. Every Monday and Wednesday at 9:30 AM"
            className="flex-1 p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-medium"
          />
          <button
            onClick={parseNaturalLanguage}
            className="px-4 py-2.5 text-xs font-bold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] cursor-pointer whitespace-nowrap"
          >
            Translate to Cron
          </button>
          <button
            onClick={generateWithAi}
            disabled={isAiLoading}
            className="px-4 py-2.5 text-xs font-semibold bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{isAiLoading ? 'Translating...' : 'AI Translate (Gemini)'}</span>
          </button>
        </div>
      </div>

      {/* Expression Display Card */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cron Expression</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={expression}
                onChange={(e) => handleManualChange(e.target.value)}
                className="font-mono text-lg font-bold text-[#8A244B] px-3 py-1.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:outline-none focus:border-[#8A244B] w-64 sm:w-80"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="text-xs bg-[#F2EFE7] p-2.5 rounded-[4px] border border-slate-200 w-full sm:w-auto">
            <span className="font-bold text-[#111F35] block mb-0.5">Human Schedule:</span>
            <span className="text-slate-700">{getHumanDescription()}</span>
          </div>
        </div>

        {manualError && (
          <p className="text-xs text-red-600 font-medium">{manualError}</p>
        )}
      </div>

      {/* Presets Grid */}
      <div className="p-3 bg-white card-dev27">
        <span className="text-xs font-bold text-slate-600 block mb-2">Common Scheduling Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.val)}
              className={`px-2.5 py-1 text-xs rounded-[4px] border transition-colors cursor-pointer ${
                expression === p.val
                  ? 'bg-[#8A244B] text-white border-[#8A244B]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#F2EFE7]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field-by-Field Builder Controls */}
      <div className="p-4 bg-white card-dev27 space-y-4">
        <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">
          5-Field Cron Interactive Builder
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Minute */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Minute (0-59)
            </label>
            <input
              type="text"
              value={minute}
              onChange={(e) => handleFieldChange('m', e.target.value)}
              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded-[4px] bg-white mb-2"
              placeholder="*"
            />
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['*', '0', '*/5', '*/15', '*/30'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFieldChange('m', opt)}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Hour */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Hour (0-23)
            </label>
            <input
              type="text"
              value={hour}
              onChange={(e) => handleFieldChange('h', e.target.value)}
              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded-[4px] bg-white mb-2"
              placeholder="*"
            />
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['*', '0', '9', '12', '*/2', '*/6'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFieldChange('h', opt)}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Month */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              3. Day (1-31)
            </label>
            <input
              type="text"
              value={dom}
              onChange={(e) => handleFieldChange('dm', e.target.value)}
              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded-[4px] bg-white mb-2"
              placeholder="*"
            />
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['*', '1', '15', 'L', '*/2'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFieldChange('dm', opt)}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Month */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              4. Month (1-12)
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => handleFieldChange('mo', e.target.value)}
              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded-[4px] bg-white mb-2"
              placeholder="*"
            />
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['*', '1', '6', '12', '*/3'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFieldChange('mo', opt)}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              5. Day of Week
            </label>
            <input
              type="text"
              value={dow}
              onChange={(e) => handleFieldChange('dw', e.target.value)}
              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded-[4px] bg-white mb-2"
              placeholder="*"
            />
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['*', '0 (Sun)', '1-5', '6,0'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFieldChange('dw', opt.split(' ')[0])}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Execution Times & Timezone */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8A244B]" />
            <span className="text-xs font-bold text-slate-800">Next Calculated Execution Times</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Timezone:</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="border border-slate-300 rounded-[4px] px-2 py-0.5 bg-white text-xs"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="Local">Local Browser Time</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Count:</span>
              <select
                value={runsCount}
                onChange={(e) => setRunsCount(Number(e.target.value))}
                className="border border-slate-300 rounded-[4px] px-2 py-0.5 bg-white text-xs"
              >
                <option value={5}>Next 5</option>
                <option value={10}>Next 10</option>
                <option value={20}>Next 20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[4px] p-3 border border-slate-200">
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-800 font-mono">
            {getNextRuns().map((run, idx) => (
              <li key={idx} className="py-0.5">
                <span className="text-slate-900">{run}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Syntax Reference Guide */}
      <div className="p-3 bg-white card-dev27 text-xs text-slate-600">
        <span className="font-bold text-slate-800 block mb-1">Special Characters Syntax:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div><code className="text-[#8A244B] font-bold">*</code> : Any value (wildcard)</div>
          <div><code className="text-[#8A244B] font-bold">,</code> : Value list separator (e.g. 1,3,5)</div>
          <div><code className="text-[#8A244B] font-bold">-</code> : Range of values (e.g. 1-5)</div>
          <div><code className="text-[#8A244B] font-bold">/</code> : Step increments (e.g. */10)</div>
        </div>
      </div>
    </div>
  );
};
