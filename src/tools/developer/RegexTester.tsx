import React, { useState, useMemo } from 'react';
import { Copy, Check, AlertCircle, Play, Bookmark } from 'lucide-react';

interface TestCase {
  id: string;
  text: string;
  expected: boolean;
}

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean; y: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [testText, setTestText] = useState<string>(
    `Welcome to Dev27 Suite! Reach us at support@dev27.tools or sales-team@cloud.dev27.io for assistance. Note: invalid@email (missing domain extension).`
  );
  const [replaceStr, setReplaceStr] = useState<string>('[$1 at $2]');
  const [showReplace, setShowReplace] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', text: 'contact@example.com', expected: true },
    { id: '2', text: 'invalid.user@', expected: false },
    { id: '3', text: 'team@sub.domain.co.uk', expected: true },
  ]);
  const [newTestCase, setNewTestCase] = useState<string>('');

  const flagStr = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, active]) => active)
      .map(([f]) => f)
      .join('');
  }, [flags]);

  const regexResult = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, replaced: testText };
    }
    try {
      const rx = new RegExp(pattern, flagStr);
      const matches: any[] = [];
      let replaced = '';

      if (flags.g) {
        let match;
        let count = 0;
        const maxMatches = 1000;
        while ((match = rx.exec(testText)) !== null && count < maxMatches) {
          count++;
          matches.push({
            index: match.index,
            length: match[0].length,
            fullMatch: match[0],
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });
          if (match[0].length === 0) {
            rx.lastIndex++;
          }
        }
      } else {
        const match = rx.exec(testText);
        if (match) {
          matches.push({
            index: match.index,
            length: match[0].length,
            fullMatch: match[0],
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });
        }
      }

      try {
        replaced = testText.replace(new RegExp(pattern, flagStr), replaceStr);
      } catch {
        replaced = testText;
      }

      return { matches, error: null, replaced };
    } catch (err: any) {
      return { matches: [], error: err.message, replaced: testText };
    }
  }, [pattern, flagStr, testText, replaceStr, flags.g]);

  const presets = [
    { name: 'Email Address', pat: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})' },
    { name: 'URL (HTTP/S)', pat: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'IPv4 Address', pat: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b' },
    { name: 'Phone (US)', pat: '(\\+?1[-. ]?)?\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})' },
    { name: 'Hex Color', pat: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})' },
    { name: 'Date (YYYY-MM-DD)', pat: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b' },
    { name: 'UUID v4', pat: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}' },
  ];

  // Render text with matches highlighted
  const renderHighlightedText = () => {
    if (!regexResult.matches.length || regexResult.error) {
      return <span className="whitespace-pre-wrap">{testText}</span>;
    }
    const chunks: React.ReactNode[] = [];
    let lastIndex = 0;

    regexResult.matches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        chunks.push(
          <span key={`text-${lastIndex}`}>{testText.slice(lastIndex, m.index)}</span>
        );
      }
      chunks.push(
        <mark
          key={`match-${idx}`}
          className="bg-[#F2EFE7] text-[#8A244B] font-bold border-b-2 border-[#8A244B] px-0.5 rounded-[2px]"
          title={`Match #${idx + 1}: Index ${m.index}`}
        >
          {m.fullMatch}
        </mark>
      );
      lastIndex = m.index + m.length;
    });

    if (lastIndex < testText.length) {
      chunks.push(<span key={`text-end`}>{testText.slice(lastIndex)}</span>);
    }

    return <div className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">{chunks}</div>;
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flagStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addTestCase = () => {
    if (!newTestCase.trim()) return;
    setTestCases([...testCases, { id: Date.now().toString(), text: newTestCase, expected: true }]);
    setNewTestCase('');
  };

  return (
    <div className="space-y-4">
      {/* Pattern Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center flex-1 bg-slate-50 border border-slate-300 rounded-[4px] px-3 py-1.5 focus-within:border-[#8A244B]">
            <span className="text-slate-400 font-mono text-base font-bold mr-1.5">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 font-mono text-xs sm:text-sm bg-transparent focus:outline-none text-[#8A244B] font-semibold"
            />
            <span className="text-slate-400 font-mono text-base font-bold ml-1.5">/</span>
            <span className="font-mono text-xs text-slate-600 font-bold ml-1">{flagStr || '-'}</span>
          </div>

          <button
            onClick={copyPattern}
            className="px-3 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Regex'}
          </button>
        </div>

        {/* Flags selection */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <span className="font-bold text-slate-600">Flags:</span>
          {(['g', 'i', 'm', 's', 'u', 'y'] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                className="rounded-[2px] text-[#8A244B] focus:ring-0"
              />
              <span className="font-mono font-bold">{flag}</span>
              <span className="text-slate-400 text-[11px]">
                {flag === 'g' ? '(global)' : flag === 'i' ? '(case-ins)' : flag === 'm' ? '(multiline)' : flag === 's' ? '(dotAll)' : flag === 'u' ? '(unicode)' : '(sticky)'}
              </span>
            </label>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setPattern(p.pat)}
              className="px-2 py-0.5 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {regexResult.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>Regex Syntax Error: {regexResult.error}</span>
        </div>
      )}

      {/* Test Text & Match Highlighting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Test Text Input</span>
            <span className="text-slate-400 font-mono text-[11px]">{testText.length} chars</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:border-[#8A244B] resize-y"
            placeholder="Type or paste test text..."
          />
        </div>

        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Matches Highlighted</span>
            <span className="px-2 py-0.5 bg-[#8A244B] text-white text-[11px] font-bold rounded-[4px]">
              {regexResult.matches.length} Matches
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] min-h-[190px] max-h-[260px] overflow-y-auto">
            {renderHighlightedText()}
          </div>
        </div>
      </div>

      {/* Replacement testing */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">String Replacement Preview</span>
          <label className="text-xs text-slate-600 flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showReplace}
              onChange={(e) => setShowReplace(e.target.checked)}
              className="rounded-[2px] text-[#8A244B]"
            />
            <span>Enable Replacement</span>
          </label>
        </div>

        {showReplace && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Replacement Pattern ($1, $2, etc.):
              </label>
              <input
                type="text"
                value={replaceStr}
                onChange={(e) => setReplaceStr(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:border-[#8A244B] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Replaced Output:
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-[4px] text-xs font-mono text-slate-800 min-h-[38px] whitespace-pre-wrap">
                {regexResult.replaced}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Captured Groups List */}
      {regexResult.matches.length > 0 && (
        <div className="p-4 bg-white card-dev27 space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            Detailed Captured Groups ({regexResult.matches.length} total)
          </span>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {regexResult.matches.slice(0, 20).map((m, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-[4px] text-xs font-mono">
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span className="font-bold text-[#8A244B]">Match #{idx + 1}</span>
                  <span className="text-[11px]">Position: {m.index}..{m.index + m.length}</span>
                </div>
                <div className="font-semibold text-slate-900 mb-1">Full: "{m.fullMatch}"</div>
                {m.groups.length > 0 && (
                  <div className="pl-3 border-l-2 border-slate-300 space-y-0.5 text-[11px] text-slate-700">
                    {m.groups.map((g: string, gIdx: number) => (
                      <div key={gIdx}>
                        Group ${gIdx + 1}: <span className="text-slate-900 font-medium">"{g}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Cases Runner */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-700 block">Test Cases Suite</span>
        <div className="space-y-2">
          {testCases.map((tc) => {
            let passes = false;
            try {
              passes = new RegExp(pattern, flagStr).test(tc.text);
            } catch {
              passes = false;
            }
            return (
              <div key={tc.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-[4px] text-xs">
                <span className="font-mono text-slate-800">{tc.text}</span>
                <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[11px] ${passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {passes ? 'Matches' : 'No Match'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newTestCase}
            onChange={(e) => setNewTestCase(e.target.value)}
            placeholder="Add a new test string..."
            className="flex-1 text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-none focus:border-[#8A244B]"
            onKeyDown={(e) => e.key === 'Enter' && addTestCase()}
          />
          <button
            onClick={addTestCase}
            className="px-3 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px]"
          >
            Add Case
          </button>
        </div>
      </div>
    </div>
  );
};
