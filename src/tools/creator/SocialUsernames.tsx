import React, { useState } from 'react';
import { Copy, RefreshCw, Bookmark, Check, ShieldCheck, Tag, Music, Swords, Sparkles } from 'lucide-react';

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

  const generateUsernames = () => {
    const kw = (keyword || 'Core').trim().replace(/\s+/g, '');
    const suggestions: { handle: string; tag?: string; note?: string }[] = [];

    const prefixes = ['The', 'Real', 'Just', 'Its', 'iam', 'official', 'hey'];
    const aestheticWords = ['Nova', 'Glow', 'Luna', 'Echo', 'Drift', 'Aura', 'Sol', 'Vivid', 'Bloom'];
    const gamingWords = ['Pixel', 'Shadow', 'Frost', 'Vortex', 'Blitz', 'Rogue', 'Apex', 'Titan'];
    const suffixes = ['HQ', 'Lab', 'Club', 'Zone', 'Daily', 'TV', 'Feed', 'World'];

    if (type === 'roblox') {
      // Roblox Rules: 3 to 20 chars, only letters, numbers, and at most one underscore. Cannot start or end with underscore.
      const robloxBases = [kw, `${kw}Hero`, `Super${kw}`, `${kw}Blox`, `${kw}Pro`, `Real${kw}`, `${kw}Gamer`];
      robloxBases.forEach(base => {
        let clean = base.replace(/[^a-zA-Z0-9]/g, '');
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
      const clanAdjectives = ['Phantom', 'Iron', 'Apex', 'Vanguard', 'Silent', 'Fatal', 'Immortal', 'Omega'];
      clanAdjectives.forEach(adj => {
        const name = `${adj} ${kw}`;
        const tag = `[${adj[0]}${kw.slice(0, 2).toUpperCase()}]`;
        suggestions.push({ handle: name, tag, note: 'Squad Name & Tag' });
      });
    } else if (type === 'band') {
      const bandFormats = [
        `The ${kw}s`,
        `${kw} and the Echoes`,
        `Velvet ${kw}`,
        `Electric ${kw}`,
        `${kw} Theory`,
        `Midnight ${kw}`,
        `Broken ${kw}`,
        `Atomic ${kw}`,
      ];
      bandFormats.forEach(b => {
        suggestions.push({ handle: b, note: 'Band & Music Project' });
      });
    } else {
      // General TikTok / Instagram / YouTube
      const list = style === 'Gaming' ? gamingWords : aestheticWords;
      list.forEach(word => {
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

      prefixes.slice(0, 4).forEach(p => {
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
    setResults(Array.from(unique.values()).slice(0, 16));
  };

  React.useEffect(() => {
    generateUsernames();
  }, [type, style, includeNumbers, includeSymbols, maxLen]);

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
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
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
              <option value="Aesthetic">Aesthetic & Clean</option>
              <option value="Gaming">Gaming & Competitive</option>
              <option value="Creative">Creative & Punchy</option>
              <option value="Professional">Professional & Brand</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Custom Prefix (optional):</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. the, real"
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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded-[2px] text-[#8A244B]"
              />
              <span>Include Numbers</span>
            </label>

            {type !== 'youtube' && type !== 'roblox' && (
              <label className="flex items-center gap-1 cursor-pointer">
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

          <button
            onClick={generateUsernames}
            className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate New Handles
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {results.map((r, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">{r.handle}</span>
                {r.tag && (
                  <span className="font-mono text-xs px-1.5 py-0.2 bg-[#F2EFE7] text-[#8A244B] rounded font-bold">
                    {r.tag}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">{r.note} · {r.handle.length} chars</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFavorites({ ...favorites, [r.handle]: !favorites[r.handle] })}
                className={`p-1 rounded-[4px] ${favorites[r.handle] ? 'text-[#8A244B]' : 'text-slate-300 hover:text-slate-500'}`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={() => copyToClipboard(r.handle, `h-${idx}`)}
                className="p-1 text-slate-500 hover:text-[#8A244B]"
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
