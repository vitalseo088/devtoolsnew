import React, { useState, useEffect } from 'react';
import { Copy, Download, RefreshCw, Bookmark, Check, Sparkles, Clock, FileText, Bot, Loader2 } from 'lucide-react';

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
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateNames = () => {
    const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const primary = kwList[0] || topic.split(' ')[0] || 'Studio';
    const secondary = kwList[1] || 'Chronicles';
    const tertiary = kwList[2] || 'Uncut';
    const excludes = excludedWords.toLowerCase().split(',').map(w => w.trim()).filter(Boolean);

    const patterns = [
      { name: `The ${primary} Dispatch`, style: 'Professional & Direct' },
      { name: `Beyond ${secondary}`, style: 'Curiosity & Storytelling' },
      { name: `${primary} Unfiltered`, style: 'Casual & Candid' },
      { name: `The ${primary} & ${secondary} Show`, style: 'Classic Co-host' },
      { name: `${primary} Lab: ${category} Voices`, style: 'Educational / Deep Dive' },
      { name: `Inside the ${primary} Matrix`, style: 'Tech & Modern' },
      { name: `Decode: ${primary}`, style: 'Minimalist & Punchy' },
      { name: `${primary} After Hours`, style: 'Conversational' },
      { name: `Mind the ${secondary}`, style: 'Clever & Witty' },
      { name: `The Practical ${primary}`, style: 'Actionable Advice' },
      { name: `Zero to ${primary}`, style: 'Growth & Mastery' },
      { name: `${primary} Sessions`, style: 'Interview & Intimate' },
      { name: `${category} Insights with ${primary}`, style: 'Niche Authority' },
      { name: `${primary} & ${tertiary}`, style: 'Bold & Punchy' },
      { name: `The ${primary} Blueprint`, style: 'Strategy & Tactics' },
      { name: `Talking ${primary}`, style: 'Accessible & Friendly' }
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
        score: Math.floor(Math.random() * 12) + 88,
      }));

    const uniqueMap = new Map();
    filtered.forEach(item => uniqueMap.set(item.name, item));
    setResults(Array.from(uniqueMap.values()));
  };

  useEffect(() => {
    generateNames();
  }, [category, tone, nameLength]);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Generate 10 creative, catchy podcast show name ideas for a podcast about "${topic}".
Category: ${category}
Keywords: ${keywords}
Tone: ${tone}
Excluded words: ${excludedWords}

Return JSON array in format:
[
  {"name": "Podcast Name", "style": "Style descriptor", "score": 95}
]`;
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: 'Respond only with valid JSON array.' }),
      });
      const data = await res.json();
      if (data.text) {
        const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResults(parsed);
        } else {
          generateNames();
        }
      } else {
        generateNames();
      }
    } catch (e) {
      generateNames();
    } finally {
      setIsAiLoading(false);
    }
  };

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
      <div className="p-4 bg-white card-dev27 shadow-sm flex flex-wrap items-center justify-between gap-3">
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
            <span>Export CSV</span>
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
                placeholder="e.g. AI & Design, Gaming, Personal Finance"
                className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. future, tech, creative, code"
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

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Excluded Words (optional)</label>
              <input
                type="text"
                value={excludedWords}
                onChange={(e) => setExcludedWords(e.target.value)}
                placeholder="e.g. daily, talk"
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={generateNames}
                className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Names</span>
              </button>

              <button
                type="button"
                onClick={generateWithAi}
                disabled={isAiLoading}
                className="w-full py-2 px-4 font-semibold text-xs bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{isAiLoading ? 'AI Generating...' : 'AI Generate (Gemini)'}</span>
              </button>
            </div>
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
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateTitles = () => {
    const kw = keywords.split(',')[0]?.trim() || topic;
    const kw2 = keywords.split(',')[1]?.trim() || 'Best Practices';
    const generated = [
      { title: `Ep. ${episodeNum}: Why Most Devs Get ${kw} Completely Wrong`, type: 'Curiosity Hook' },
      { title: `Ep. ${episodeNum}: The Ultimate Blueprint for ${topic}`, type: 'Masterclass' },
      { title: `Ep. ${episodeNum}: Inside ${kw}: How Top Teams Scale Without Downtime`, type: 'Engineering Case Study' },
      { title: `Ep. ${episodeNum}: Can ${kw} Actually Save Your Project?`, type: 'Debate & Analysis' },
      { title: `Ep. ${episodeNum}: 5 Battle-Tested ${kw} Strategies for ${kw2}`, type: 'Actionable Guide' },
      { title: `Ep. ${episodeNum}: Stop Making These Costly ${kw} Mistakes`, type: 'Warning' },
      { title: `Ep. ${episodeNum}: The Secret to Mastering ${topic} in 2026`, type: 'Growth & Secrets' },
      { title: `Ep. ${episodeNum}: From Zero to Production with ${kw}`, type: 'Beginner to Advanced' },
    ];
    setTitles(generated);
  };

  useEffect(() => {
    generateTitles();
  }, []);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Generate 8 high-click-through podcast episode titles for Episode #${episodeNum}.
Topic: ${topic}
Keywords: ${keywords}

Return JSON array in format:
[
  {"title": "Ep. 42: ...", "type": "Curiosity Hook"}
]`;
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: 'Respond only with valid JSON array.' }),
      });
      const data = await res.json();
      if (data.text) {
        const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTitles(parsed);
        } else {
          generateTitles();
        }
      } else {
        generateTitles();
      }
    } catch (e) {
      generateTitles();
    } finally {
      setIsAiLoading(false);
    }
  };

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

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={generateTitles}
                className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Titles</span>
              </button>
              <button
                type="button"
                onClick={generateWithAi}
                disabled={isAiLoading}
                className="w-full py-2 px-4 font-semibold text-xs bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{isAiLoading ? 'AI Generating...' : 'AI Generate (Gemini)'}</span>
              </button>
            </div>
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
  const [summary, setSummary] = useState<string>('Deep dive into client-side processing, performance benchmarks, and zero-server scalability.');
  const [guestName, setGuestName] = useState<string>('Elena Rostova');
  const [guestBio, setGuestBio] = useState<string>('Principal Systems Engineer at Cloud Tech');
  const [timestamps, setTimestamps] = useState<string>(
    `00:00 - Introduction & Welcome
04:15 - Core Concepts & Foundational Architecture
14:30 - Performance Bottlenecks & Benchmarks
26:45 - Live Case Study & Real-World Examples
38:00 - Key Takeaways & Audience Q&A`
  );
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateDescription = () => {
    const guestBlock = guestName.trim() ? `In this episode of ${podcastName}, we feature special guest ${guestName}${guestBio ? ` (${guestBio})` : ''} to discuss "${episodeTitle}".` : `In this episode of ${podcastName}, we take a deep dive into "${episodeTitle}".`;

    const text = `${guestBlock}

EPISODE SUMMARY:
${summary}

TIMESTAMPS:
${timestamps}

KEY LESSONS & TAKEAWAYS:
• In-depth analysis of ${episodeTitle} principles.
• Practical strategies you can implement right away.
• Critical mistakes to avoid in production.

RESOURCES & LINKS:
• Official Website: https://dev27.tools
• Subscribe on Apple Podcasts, Spotify, and YouTube!

#podcast #${podcastName.replace(/[^a-zA-Z0-9]/g, '')} #audio #creator`;

    setGeneratedOutput(text);
  };

  useEffect(() => {
    generateDescription();
  }, [podcastName, episodeTitle, guestName]);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Write a comprehensive, professional podcast episode show notes description.
Podcast: ${podcastName}
Episode Title: ${episodeTitle}
Summary: ${summary}
Guest: ${guestName} (${guestBio})
Timestamps: ${timestamps}

Format cleanly with sections for Overview, Key Takeaways, Timestamps, and Resources.`;
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.text) {
        setGeneratedOutput(data.text);
      } else {
        generateDescription();
      }
    } catch (e) {
      generateDescription();
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between flex-wrap gap-2">
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

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={generateDescription}
                className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Description</span>
              </button>

              <button
                type="button"
                onClick={generateWithAi}
                disabled={isAiLoading}
                className="w-full py-2 px-4 font-semibold text-xs bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{isAiLoading ? 'AI Generating...' : 'AI Generate (Gemini)'}</span>
              </button>
            </div>
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
  const [topic, setTopic] = useState<string>('Gardening Tips & Organic Growing');
  const [format, setFormat] = useState<string>('Interview');
  const [guestName, setGuestName] = useState<string>('Marcus Vance');
  const [coHostName, setCoHostName] = useState<string>('Sarah Jenkins');
  const [sponsorName, setSponsorName] = useState<string>('Dev27 Tools');
  const [script, setScript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateScript = () => {
    let text = '';
    const cleanTopic = topic.trim() || 'Today\'s Main Subject';
    const cleanGuest = guestName.trim() || 'Our Special Guest';
    const cleanCoHost = coHostName.trim() || 'Co-Host Alex';
    const cleanSponsor = sponsorName.trim() || 'Dev27';

    if (format === 'Solo Monologue') {
      text = `[EPISODE INTRO]
[HOST]: Welcome back to the show! I'm your host, and today we're diving straight into "${cleanTopic}".
[HOST]: If you've ever struggled to make sense of this subject or wondered how to get real results, this episode is tailor-made for you.

[SECTION 1: THE CORE PROBLEM]
[HOST]: Let's start with why "${cleanTopic}" is such a huge talking point right now. Most people get overwhelmed because of conflicting information.
[HOST]: But when you break it down into fundamental principles, it becomes remarkably straightforward.

[SPONSOR BREAK / MID-ROLL]
[HOST]: Today's episode is brought to you by ${cleanSponsor}. Check out fast, client-side tools and utilities with zero telemetry at dev27.tools.

[SECTION 2: STEP-BY-STEP ACTION PLAN]
[HOST]: Here are the 3 essential steps you need to take when approaching "${cleanTopic}":
[HOST]: Step 1: Establish your foundation and clarify your objectives.
[HOST]: Step 2: Avoid common pitfalls by testing small before committing big.
[HOST]: Step 3: Continuously refine your setup based on feedback and real data.

[CALL TO ACTION & OUTRO]
[HOST]: That wraps up today's breakdown on "${cleanTopic}".
[HOST]: If you found value in this episode, please leave a 5-star review, subscribe on Spotify or Apple Podcasts, and share it with a friend! Until next time!`;
    } else if (format === 'Two Co-hosts') {
      text = `[EPISODE INTRO]
[HOST A]: Hey everyone, welcome back to the podcast! I'm here with my co-host, ${cleanCoHost}.
[HOST B - ${cleanCoHost}]: Hey everyone! Today we're tackling a topic we've both been eager to discuss: "${cleanTopic}".
[HOST A]: Absolutely. It feels like everyone has an opinion on "${cleanTopic}", but what actually works?

[SECTION 1: DEBATE & PERSPECTIVES]
[HOST B - ${cleanCoHost}]: From my side, the biggest mistake people make is ignoring the basic fundamentals. What's your take?
[HOST A]: I completely agree. People rush to advanced strategies without getting step one right.

[SPONSOR BREAK]
[HOST A]: Quick reminder: Today's conversation is powered by ${cleanSponsor}. Discover over 60 free, private web tools at dev27.tools.

[SECTION 2: KEY TAKEAWAYS]
[HOST B - ${cleanCoHost}]: If our listeners only take away one thing today about "${cleanTopic}", what should it be?
[HOST A]: Focus on consistency over complexity. Keep it practical.

[OUTRO]
[HOST A & B]: Thanks for listening! Don't forget to hit subscribe and check back next week!`;
    } else if (format === 'Storytelling') {
      text = `[EPISODE INTRO - NARRATIVE HOOK]
[NARRATOR]: It began with a simple question about "${cleanTopic}". But what seemed straightforward turned into a journey of discovery.

[CHAPTER 1: THE ORIGIN STORY]
[NARRATOR]: When we look at "${cleanTopic}", we find stories of trial, error, and unexpected breakthroughs.

[MID-ROLL ANNOUNCEMENT]
[HOST]: Supported by ${cleanSponsor} — empowering creators and developers worldwide.

[CHAPTER 2: THE BREAKTHROUGH]
[NARRATOR]: The turning point came when the core lesson of "${cleanTopic}" was finally understood.

[CONCLUSION & LESSON]
[NARRATOR]: Thank you for listening to this narrative feature. Join us next episode as we explore another compelling story.`;
    } else {
      // Default: Interview Format
      text = `[EPISODE INTRO]
[HOST]: Welcome back to the show. Today we are tackling something on every listener's radar: "${cleanTopic}".
[HOST]: Joining us today is subject matter expert ${cleanGuest}. Welcome to the mic, ${cleanGuest}!
[GUEST - ${cleanGuest}]: Great to be here! Excited to dig into "${cleanTopic}" with you today.

[SECTION 1: THE CURRENT HOOK & STATUS QUO]
[HOST]: Let's start with the big picture. When people ask you about "${cleanTopic}", what is the biggest misconception you run into?
[GUEST - ${cleanGuest}]: The biggest myth is that it has to be overly complicated. In reality, focusing on solid core habits produces 80% of the results.
[HOST]: That makes complete sense. Simplicity almost always wins over friction.

[SPONSOR BREAK / MID-ROLL]
[HOST]: Quick reminder: Today's conversation is brought to you by ${cleanSponsor}—the 100% private, client-side toolkit for developers and creators. Check out free tools with zero telemetry at dev27.tools.

[SECTION 2: DEEP DIVE & PRACTICAL STRATEGY]
[HOST]: ${cleanGuest}, what is the number one piece of advice you would give someone starting out with "${cleanTopic}" today?
[GUEST - ${cleanGuest}]: Start small, track your progress, and don't be afraid to iterate when circumstances change.

[CALL TO ACTION & OUTRO]
[HOST]: Incredible insights today on "${cleanTopic}". ${cleanGuest}, where can our audience find your work and stay connected?
[GUEST - ${cleanGuest}]: You can find my latest updates, publications, and projects online and on social media!
[HOST]: Thank you for tuning in! Make sure to hit subscribe, leave a review, and catch us next week!`;
    }

    setScript(text);
  };

  useEffect(() => {
    generateScript();
  }, [topic, format, guestName, coHostName, sponsorName]);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Write a complete, highly engaging podcast script for a podcast episode.
Topic: "${topic}"
Format: ${format}
Guest Name: ${guestName}
Co-Host Name: ${coHostName}
Sponsor Name: ${sponsorName}

Format with speaker cues like [HOST]:, [GUEST - ${guestName}]:, section headers, and timestamps. Make it detailed, informative, and customized strictly to "${topic}".`;
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.text) {
        setScript(data.text);
      } else {
        generateScript();
      }
    } catch (e) {
      generateScript();
    } finally {
      setIsAiLoading(false);
    }
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = (wordCount / 150).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between flex-wrap gap-2">
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
                placeholder="e.g. Gardening Tips, Crypto Investing, Fitness"
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
                <option value="Solo Monologue">Solo Monologue</option>
                <option value="Interview">Guest Interview</option>
                <option value="Two Co-hosts">Two Co-hosts</option>
                <option value="Storytelling">Narrative / Storytelling</option>
              </select>
            </div>

            {format === 'Interview' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-sm"
                />
              </div>
            )}

            {format === 'Two Co-hosts' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Co-Host Name</label>
                <input
                  type="text"
                  value={coHostName}
                  onChange={(e) => setCoHostName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Sponsor / Mid-Roll Mention</label>
              <input
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
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

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={generateScript}
                className="w-full py-2.5 px-4 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Script</span>
              </button>

              <button
                type="button"
                onClick={generateWithAi}
                disabled={isAiLoading}
                className="w-full py-2 px-4 font-semibold text-xs bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{isAiLoading ? 'AI Scriptwriting...' : 'AI Generate Script (Gemini)'}</span>
              </button>
            </div>
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
