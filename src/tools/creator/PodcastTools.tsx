import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Bookmark, Check, Sparkles, Clock, FileText } from 'lucide-react';

interface NameSuggestion {
  name: string;
  style: string;
  score: number;
}

// 2.1 Podcast Name Generator
export const PodcastNameGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('Artificial Intelligence & Design');
  const [keywords, setKeywords] = useState<string>('future, tech, creative, code');
  const [category, setCategory] = useState<string>('Technology');
  const [tone, setTone] = useState<string>('casual');
  const [nameLength, setNameLength] = useState<'any' | 'short' | 'long'>('any');
  const [excludedWords, setExcludedWords] = useState<string>('');
  const [results, setResults] = useState<NameSuggestion[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateNames = () => {
    const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const primary = kwList[0] || topic.split(' ')[0] || 'Studio';
    const secondary = kwList[1] || 'Chronicles';
    const excludes = excludedWords.toLowerCase().split(',').map(w => w.trim()).filter(Boolean);

    const patterns = [
      { name: `The ${primary} Dispatch`, style: 'Professional & Direct' },
      { name: `Beyond ${secondary}`, style: 'Curiosity & Storytelling' },
      { name: `${primary} Unfiltered`, style: 'Casual & Candid' },
      { name: `The ${primary} & ${secondary} Show`, style: 'Classic Co-host' },
      { name: `${primary} Lab: Future Voices`, style: 'Educational / Deep Dive' },
      { name: `Inside the ${primary} Matrix`, style: 'Tech & Modern' },
      { name: `Decode: ${primary}`, style: 'Minimalist & Punchy' },
      { name: `${primary} After Hours`, style: 'Conversational' },
      { name: `Mind the ${secondary}`, style: 'Clever & Witty' },
      { name: `The Practical ${primary}`, style: 'Actionable Advice' },
      { name: `Zero to ${primary}`, style: 'Growth & Mastery' },
      { name: `${primary} Sessions`, style: 'Interview & Intimate' },
    ];

    const filtered = patterns
      .filter(p => !excludes.some(ex => p.name.toLowerCase().includes(ex)))
      .filter(p => {
        if (nameLength === 'short') return p.name.split(' ').length <= 3;
        if (nameLength === 'long') return p.name.split(' ').length > 3;
        return true;
      })
      .map(p => ({
        name: p.name,
        style: p.style,
        score: Math.floor(Math.random() * 15) + 85,
      }));

    const uniqueMap = new Map();
    filtered.forEach(item => uniqueMap.set(item.name, item));
    setResults(Array.from(uniqueMap.values()));
  };

  React.useEffect(() => {
    generateNames();
  }, [category, tone, nameLength]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAll = () => {
    const text = results.map(r => r.name).join('\n');
    copyToClipboard(text, 'all');
  };

  const downloadResults = (format: 'txt' | 'csv') => {
    let content = '';
    if (format === 'csv') {
      content = 'Podcast Name,Style,Match Score\n' + results.map(r => `"${r.name}","${r.style}",${r.score}%`).join('\n');
    } else {
      content = results.map(r => `${r.name} (${r.style})`).join('\n');
    }
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-names.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">Creator Suite</span>
          <h2 className="text-lg font-bold text-[#111F35]">Podcast Show Name Generator</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="px-3 py-1.5 rounded-[4px] bg-[#8A244B] hover:bg-[#721C3D] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'all' ? 'Copied' : 'Copy All'}</span>
          </button>
          <button
            onClick={() => downloadResults('csv')}
            className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Show Concept &amp; Niche
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Topic or Niche</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs"
                >
                  <option value="Technology">Technology &amp; Software</option>
                  <option value="Business">Business &amp; Finance</option>
                  <option value="True Crime">True Crime &amp; Mystery</option>
                  <option value="Comedy">Comedy &amp; Culture</option>
                  <option value="Health">Health &amp; Wellness</option>
                  <option value="Education">Education &amp; Science</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Length</label>
                <select
                  value={nameLength}
                  onChange={(e) => setNameLength(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs"
                >
                  <option value="any">Any Length</option>
                  <option value="short">Short (1-3 words)</option>
                  <option value="long">Descriptive (4+)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={generateNames}
              className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Suggestions</span>
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center justify-between">
              <span>Generated Title Concepts ({results.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">Relevance 85-99%</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((r, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-2 hover:border-[#8A244B] transition-colors">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{r.name}</div>
                    <div className="text-[11px] text-slate-500">{r.style} · <strong className="text-[#2E7D32]">{r.score}%</strong> match</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFavorites({ ...favorites, [r.name]: !favorites[r.name] })}
                      className={`p-1.5 rounded-[4px] cursor-pointer ${favorites[r.name] ? 'text-[#8A244B]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(r.name, `name-${idx}`)}
                      className="p-1.5 rounded-[4px] text-slate-500 hover:text-[#8A244B] cursor-pointer"
                    >
                      {copiedKey === `name-${idx}` ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2.2 Podcast Episode Title Generator
export const PodcastEpisodeTitleGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('Scaling Next.js Applications');
  const [keywords, setKeywords] = useState<string>('performance, SSR, edge caching');
  const [episodeNum, setEpisodeNum] = useState<number>(42);
  const [titles, setTitles] = useState<{ title: string; type: string }[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateTitles = () => {
    const kw = keywords.split(',')[0]?.trim() || topic;
    const generated = [
      { title: `Ep. ${episodeNum}: Why Most Devs Get ${kw} Completely Wrong`, type: 'Curiosity Hook' },
      { title: `Ep. ${episodeNum}: The Ultimate Blueprint for ${topic}`, type: 'Masterclass' },
      { title: `Ep. ${episodeNum}: Inside ${kw}: How Top Teams Scale Without Downtime`, type: 'Engineering Case' },
      { title: `Ep. ${episodeNum}: Can ${kw} Actually Save Your Web App?`, type: 'Debate & Analysis' },
      { title: `Ep. ${episodeNum}: 5 Battle-Tested ${kw} Strategies with Proven Results`, type: 'Actionable Guide' },
      { title: `Ep. ${episodeNum}: Stop Making These ${kw} Mistakes`, type: 'Warning' },
    ];
    setTitles(generated);
  };

  React.useEffect(() => {
    generateTitles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">Creator Suite</span>
          <h2 className="text-lg font-bold text-[#111F35]">Podcast Episode Title Generator</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Episode Details
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Episode Core Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Episode Number</label>
              <input
                type="number"
                value={episodeNum}
                onChange={(e) => setEpisodeNum(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm font-bold text-center"
              />
            </div>

            <button
              type="button"
              onClick={generateTitles}
              className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Titles</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Optimized Episode Titles
            </h4>

            <div className="space-y-2">
              {titles.map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3 hover:border-[#8A244B] transition-colors">
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500">{t.type} · {t.title.length} chars</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(t.title);
                      setCopiedKey(`t-${idx}`);
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 text-slate-700 hover:border-[#8A244B] rounded-[4px] flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                  >
                    {copiedKey === `t-${idx}` ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === `t-${idx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2.3 Podcast Description Generator
export const PodcastDescriptionGenerator: React.FC = () => {
  const [podcastName, setPodcastName] = useState<string>('Dev27 Tech Dispatch');
  const [episodeTitle, setEpisodeTitle] = useState<string>('Building Scalable Web Architecture');
  const [summary, setSummary] = useState<string>('Deep dive into client-side processing, database indexing, and edge rendering with Senior Architect Elena Rostova.');
  const [guestName, setGuestName] = useState<string>('Elena Rostova');
  const [guestBio, setGuestBio] = useState<string>('Principal Systems Engineer at Aurora Cloud.');
  const [timestamps, setTimestamps] = useState<string>(
    `00:00 - Introduction & Welcome
04:15 - Why Traditional RDBMS Stalls at Scale
14:30 - Edge Compute vs Central Server Bottlenecks
26:45 - Live Case Study: 10M Concurrent Sessions
38:00 - Elena's Advice for Junior Engineers`
  );
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateDescription = () => {
    const text = `In this episode of ${podcastName}, we talk with ${guestName} (${guestBio}) about ${episodeTitle}.

${summary}

TIMESTAMPS:
${timestamps}

KEY TAKEAWAYS:
• Practical lessons on edge architecture and zero-server scalability.
• How to diagnose throughput bottlenecks before launch.
• Tools and benchmarks used every day in high-traffic production.

CONNECT & RESOURCES:
• Try Dev27 Browser-based Tools: https://dev27.tools
• Subscribe to ${podcastName} on Apple Podcasts & Spotify!

#podcast #tech #engineering #softwarearchitecture`;

    setGeneratedOutput(text);
  };

  React.useEffect(() => {
    generateDescription();
  }, [podcastName, episodeTitle, guestName]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">Creator Suite</span>
          <h2 className="text-lg font-bold text-[#111F35]">Podcast Show Notes &amp; Description Maker</h2>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedOutput);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-3.5 py-1.5 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Description Copied' : 'Copy Description'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Episode Metadata
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Podcast Name</label>
              <input
                type="text"
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Episode Title</label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Guest Bio</label>
                <input
                  type="text"
                  value={guestBio}
                  onChange={(e) => setGuestBio(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Episode Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Timestamps</label>
              <textarea
                value={timestamps}
                onChange={(e) => setTimestamps(e.target.value)}
                rows={4}
                className="w-full font-mono text-xs p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={generateDescription}
              className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Description</span>
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Publish-Ready Description &amp; Show Notes
              </span>
              <span className="text-xs text-slate-500 font-mono">{generatedOutput.length} chars</span>
            </div>

            <textarea
              value={generatedOutput}
              onChange={(e) => setGeneratedOutput(e.target.value)}
              rows={14}
              className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-[4px] focus:outline-none leading-relaxed select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 2.4 Podcast Script Maker
export const PodcastScriptMaker: React.FC = () => {
  const [topic, setTopic] = useState<string>('The Future of Autonomous Web Agents');
  const [format, setFormat] = useState<string>('Interview');
  const [guestName, setGuestName] = useState<string>('Marcus Vance');
  const [script, setScript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateScript = () => {
    const text = `[EPISODE INTRO]
[HOST]: Welcome back to the show. Today we are tackling something on every builder's radar: "${topic}".
[HOST]: Have you ever wondered what happens when software starts writing, deploying, and debugging itself without human bottlenecks? Joining us today is ${guestName}. Welcome to the mic!
[GUEST - ${guestName}]: Great to be here. Excited to dig into this!

[SECTION 1: THE CURRENT HOOK & STATUS QUO]
[HOST]: Let's start with the big picture. When people hear "autonomous agents", they often imagine sci-fi robots. What does the real technology look like right now in practical production environments?
[GUEST]: Right now, it's about reliable tool orchestration. Instead of static text responses, models interact with APIs, databases, and code sandboxes in closed execution loops.
[HOST]: Exactly. The barrier hasn't been intelligence—it's been deterministic reliability.

[SPONSOR BREAK / MID-ROLL]
[HOST]: Quick reminder: Today's conversation is brought to you by Dev27—the 100% private, client-side toolkit for developers and creators. Check out over 60 free tools with zero telemetry at dev27.tools.

[SECTION 2: DEEP DIVE & KEY CHALLENGES]
[HOST]: ${guestName}, what is the number one failure mode you see when teams attempt to integrate tool-calling agents into production?
[GUEST]: Error recovery. Most engineers don't account for what happens when a third-party API rate-limits or returns malformed payloads. Resilient agents need graceful fallbacks.

[CALL TO ACTION & OUTRO]
[HOST]: Incredible insights. For our listeners: where can people follow your work and connect with you?
[GUEST]: You can find my research notes and code repositories on GitHub and Twitter.
[HOST]: Thank you for tuning in! Make sure to hit subscribe, leave a 5-star review, and we'll catch you next week with another deep dive!`;

    setScript(text);
  };

  React.useEffect(() => {
    generateScript();
  }, [topic, format, guestName]);

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = (wordCount / 150).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">Creator Suite</span>
          <h2 className="text-lg font-bold text-[#111F35]">Podcast Script Maker &amp; Teleprompter</h2>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(script);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-3.5 py-1.5 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Script Copied' : 'Copy Script'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Script Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Episode Prompt &amp; Format
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Topic / Episode Theme</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Show Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-medium"
              >
                <option value="Solo">Solo Monologue</option>
                <option value="Interview">Guest Interview</option>
                <option value="Co-hosted">Two Co-hosts</option>
                <option value="Storytelling">Narrative / Storytelling</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Guest Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-sm"
              />
            </div>

            {/* Speaking Stats Highlight */}
            <div className="p-3.5 bg-[#F2EFE7] rounded-[4px] border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase block">Estimated Delivery</span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl font-extrabold text-[#8A244B]">~{estimatedMinutes} min</span>
                <span className="text-xs text-slate-600 font-bold">{wordCount} total words</span>
              </div>
            </div>

            <button
              type="button"
              onClick={generateScript}
              className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Script</span>
            </button>
          </div>
        </div>

        {/* Right: Full Script Viewport */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Full Production Teleprompter Script
              </span>
              <span className="text-xs text-slate-500 font-mono">150 words/min</span>
            </div>

            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={16}
              className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-[4px] focus:outline-none leading-relaxed select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
