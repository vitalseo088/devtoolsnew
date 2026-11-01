import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Bookmark, Check, ShieldCheck, Tag, Music, Swords, Sparkles, Bot, Loader2 } from 'lucide-react';

interface GeneratorProps {
  type: 'tiktok' | 'instagram' | 'youtube' | 'band' | 'clan' | 'roblox';
}

export const SocialUsernameGenerator: React.FC<GeneratorProps> = ({ type }) => {
  const [keyword, setKeyword] = useState<string>('Vibe');
  const [niche, setNiche] = useState<string>('Tech & Gaming');
  const [style, setStyle] = useState<string>('Aesthetic');
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [maxLen, setMaxLen] = useState<number>(type === 'roblox' ? 20 : 15);
  const [results, setResults] = useState<{ handle: string; tag?: string; note?: string }[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateUsernames = () => {
    const rawKw = keyword.trim() || 'Core';
    const kw = rawKw.replace(/\s+/g, '');
    const suggestions: { handle: string; tag?: string; note?: string }[] = [];

    const prefixes = ['The', 'Real', 'Just', 'Its', 'iam', 'official', 'hey'];
    const aestheticWords = ['Nova', 'Glow', 'Luna', 'Echo', 'Drift', 'Aura', 'Sol', 'Vivid', 'Bloom', 'Pulse', 'Wave', 'Oasis'];
    const gamingWords = ['Pixel', 'Shadow', 'Frost', 'Vortex', 'Blitz', 'Rogue', 'Apex', 'Titan', 'Ghost', 'Strike', 'Havoc', 'Zero'];
    const creativeWords = ['Studio', 'Craft', 'Lab', 'Verse', 'Forge', 'Canvas', 'Chronicle', 'Spark', 'Atelier', 'Sphere'];
    const professionalWords = ['HQ', 'Media', 'Insights', 'Group', 'Official', 'Network', 'Ventures', 'Digital', 'Direct'];
    const suffixes = ['HQ', 'Lab', 'Club', 'Zone', 'Daily', 'TV', 'Feed', 'World', 'Space'];

    if (type === 'roblox') {
      // Roblox Rules: 3 to 20 chars, only letters, numbers, and at most one underscore. Cannot start or end with underscore.
      const robloxBases = [
        kw,
        `${kw}Hero`,
        `Super${kw}`,
        `${kw}Blox`,
        `${kw}Pro`,
        `Real${kw}`,
        `${kw}Gamer`,
        `${kw}Master`,
        `Captain${kw}`,
        `${kw}Legend`,
        `Epic${kw}`,
        `${kw}Playz`
      ];

      robloxBases.forEach(base => {
        let clean = base.replace(/[^a-zA-Z0-9]/g, '');
        if (prefix) clean = `${prefix.replace(/[^a-zA-Z0-9]/g, '')}${clean}`;
        if (suffix) clean = `${clean}${suffix.replace(/[^a-zA-Z0-9]/g, '')}`;
        if (clean.length < 3) clean = `${clean}123`;
        if (includeNumbers) clean = `${clean}${Math.floor(Math.random() * 89) + 10}`;
        if (clean.length > maxLen) clean = clean.slice(0, maxLen);
        suggestions.push({ handle: clean, note: 'Roblox TOS compliant' });
      });

      // Add underscore variation
      if (includeSymbols) {
        let uName = `${kw}_Blox`.replace(/[^a-zA-Z0-9_]/g, '');
        if (uName.length <= maxLen && uName.length >= 3) {
          suggestions.push({ handle: uName, note: 'Single internal underscore' });
        }
      }
    } else if (type === 'clan') {
      const clanAdjectives = ['Phantom', 'Iron', 'Apex', 'Vanguard', 'Silent', 'Fatal', 'Immortal', 'Omega', 'Valkyrie', 'Eclipse', 'Nemesis', 'Reign'];
      clanAdjectives.forEach(adj => {
        let baseName = `${adj} ${rawKw}`;
        if (prefix) baseName = `${prefix} ${baseName}`;
        if (suffix) baseName = `${baseName} ${suffix}`;
        const tag = `[${adj[0]}${rawKw.slice(0, 2).toUpperCase()}]`;
        suggestions.push({ handle: baseName, tag, note: 'Squad Name & Tag' });
      });
    } else if (type === 'band') {
      const bandFormats = [
        `The ${rawKw}s`,
        `${rawKw} and the Echoes`,
        `Velvet ${rawKw}`,
        `Electric ${rawKw}`,
        `${rawKw} Theory`,
        `Midnight ${rawKw}`,
        `Broken ${rawKw}`,
        `Atomic ${rawKw}`,
        `The Neon ${rawKw}`,
        `${rawKw} Syndicate`,
        `Lunar ${rawKw}`,
        `${rawKw} Sound System`
      ];
      bandFormats.forEach(b => {
        suggestions.push({ handle: b, note: 'Band & Music Project' });
      });
    } else {
      // General TikTok / Instagram / YouTube
      let wordPool = aestheticWords;
      if (style === 'Gaming') wordPool = gamingWords;
      else if (style === 'Creative') wordPool = creativeWords;
      else if (style === 'Professional') wordPool = professionalWords;

      wordPool.forEach(word => {
        let candidate = '';
        if (prefix) candidate += prefix;
        candidate += `${kw}${word}`;
        if (suffix) candidate += suffix;
        if (includeNumbers) candidate += Math.floor(Math.random() * 90) + 10;
        if (includeSymbols && type !== 'youtube') candidate = `${candidate}_`;
        if (candidate.length <= maxLen) {
          suggestions.push({ handle: candidate, note: `${style} style` });
        }
      });

      prefixes.slice(0, 5).forEach(p => {
        let candidate = `${p}_${kw}`.toLowerCase();
        if (includeNumbers) candidate += Math.floor(Math.random() * 9) + 1;
        if (candidate.length <= maxLen) {
          suggestions.push({ handle: candidate, note: 'Simple & Brandable' });
        }
      });
    }

    // Deduplicate
    const unique = new Map();
    suggestions.forEach(s => unique.set(s.handle, s));
    setResults(Array.from(unique.values()).slice(0, 18));
  };

  useEffect(() => {
    generateUsernames();
  }, [type, style, includeNumbers, includeSymbols, maxLen]);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Generate 14 distinctive, highly brandable ${type.toUpperCase()} usernames / handles.
Seed Keyword: "${keyword}"
Niche/Topic: "${niche}"
Style: "${style}"
Custom Prefix: "${prefix}"
Custom Suffix: "${suffix}"
Include Numbers: ${includeNumbers}
Include Symbols (underscores/dots): ${includeSymbols}
Max Character Length: ${maxLen}

Platform Requirements for ${type.toUpperCase()}:
${type === 'roblox' ? '- MUST be 3 to 20 chars, only letters/numbers and at most one underscore. Cannot start or end with underscore.' : ''}
${type === 'youtube' ? '- YouTube channel name (spaces allowed, no trailing punctuation).' : ''}
${type === 'clan' ? '- Gaming Clan name with a 3-4 letter bracketed tag like [TAG].' : ''}
${type === 'band' ? '- Musical band or artist stage name.' : ''}

Return JSON array in format:
[
  {"handle": "HandleName", "tag": "[OPT]", "note": "Style explanation"}
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
          setResults(parsed);
        } else {
          generateUsernames();
        }
      } else {
        generateUsernames();
      }
    } catch (e) {
      generateUsernames();
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const titles: Record<string, string> = {
    tiktok: 'TikTok Username Generator',
    instagram: 'Instagram Username Generator',
    youtube: 'YouTube Channel Name Generator',
    band: 'Band Name Generator',
    clan: 'Gaming Clan & Tag Generator',
    roblox: 'Roblox Username Generator (Family-Safe)',
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {titles[type] || 'Username Generator'} Parameters
          </span>
          {type === 'roblox' && (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-[4px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Roblox Compliance Verified
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Seed Keyword / Name:</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Vibe, Apex, Spark"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Style:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            >
              <option value="Aesthetic">Aesthetic &amp; Clean</option>
              <option value="Gaming">Gaming &amp; Competitive</option>
              <option value="Creative">Creative &amp; Punchy</option>
              <option value="Professional">Professional &amp; Brand</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Custom Prefix (optional):</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. the, real, iam"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Custom Suffix (optional):</label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. HQ, Club, TV"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Max Character Length:</label>
            <input
              type="number"
              min={3}
              max={type === 'roblox' ? 20 : 30}
              value={maxLen}
              onChange={(e) => setMaxLen(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-center"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center gap-4 pt-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded-[2px] text-[#8A244B]"
              />
              <span>Include Numbers</span>
            </label>

            {type !== 'youtube' && type !== 'roblox' && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Include Underscores</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={generateUsernames}
              className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Handles</span>
            </button>

            <button
              onClick={generateWithAi}
              disabled={isAiLoading}
              className="px-4 py-2 text-xs font-semibold bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              <span>{isAiLoading ? 'AI Generating...' : 'AI Generate (Gemini)'}</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {results.length} handles ready
          </span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {results.map((r, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex items-center justify-between gap-2 border border-slate-200/90 rounded-[4px]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">{r.handle}</span>
                {r.tag && (
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-[#F2EFE7] text-[#8A244B] rounded font-bold">
                    {r.tag}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">{r.note} · {r.handle.length} chars</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFavorites({ ...favorites, [r.handle]: !favorites[r.handle] })}
                className={`p-1 rounded-[4px] cursor-pointer ${favorites[r.handle] ? 'text-[#8A244B]' : 'text-slate-300 hover:text-slate-500'}`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={() => copyToClipboard(r.handle, `h-${idx}`)}
                className="p-1 text-slate-500 hover:text-[#8A244B] cursor-pointer"
                title="Copy Handle"
              >
                {copiedKey === `h-${idx}` ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
