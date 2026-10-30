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
  const [audience, setAudience] = useState<string>('Developers and Designers');
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

    // Deduplicate
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
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Podcast Show Parameters
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Topic or Niche:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Target Keywords (comma separated):</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Podcast Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            >
              <option value="Technology">Technology & Software</option>
              <option value="Business">Business & Entrepreneurship</option>
              <option value="True Crime">True Crime & Mystery</option>
              <option value="Comedy">Comedy & Pop Culture</option>
              <option value="Health">Health & Wellness</option>
              <option value="Education">Education & History</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Tone & Speaking Style:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            >
              <option value="casual">Casual & Conversational</option>
              <option value="professional">Professional & Authoritative</option>
              <option value="educational">Educational & Instructive</option>
              <option value="funny">Humorous & Entertaining</option>
              <option value="inspirational">Inspirational & Uplifting</option>
              <option value="serious">Serious & Investigative</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Name Length Preference:</label>
            <select
              value={nameLength}
              onChange={(e) => setNameLength(e.target.value as any)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            >
              <option value="any">Any Length</option>
              <option value="short">Short (1-3 words)</option>
              <option value="long">Descriptive (4+ words)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Exclude Words (comma separated):</label>
            <input
              type="text"
              value={excludedWords}
              onChange={(e) => setExcludedWords(e.target.value)}
              placeholder="e.g. podcast, daily"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={generateNames}
            className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Suggestions
          </button>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={copyAll}
              className="px-2.5 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
            >
              {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
              Copy All
            </button>
            <button
              onClick={() => downloadResults('csv')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px]"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {results.map((r, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-slate-900">{r.name}</div>
              <div className="text-[11px] text-slate-500">{r.style} · Relevance {r.score}%</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFavorites({ ...favorites, [r.name]: !favorites[r.name] })}
                className={`p-1.5 rounded-[4px] ${favorites[r.name] ? 'text-[#8A244B]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Favorite"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={() => copyToClipboard(r.name, `name-${idx}`)}
                className="p-1.5 rounded-[4px] text-slate-500 hover:text-[#8A244B]"
                title="Copy Name"
              >
                {copiedKey === `name-${idx}` ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2.2 Podcast Episode Title Generator
export const PodcastEpisodeTitleGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('Scaling Next.js Applications');
  const [summary, setSummary] = useState<string>('Performance optimization techniques, caching strategies, and server actions');
  const [keywords, setKeywords] = useState<string>('performance, SSR, edge caching, serverless');
  const [episodeNum, setEpisodeNum] = useState<number>(42);
  const [tone, setTone] = useState<string>('curiosity');
  const [titles, setTitles] = useState<{ title: string; type: string }[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateTitles = () => {
    const kw = keywords.split(',')[0]?.trim() || topic;
    const generated = [
      { title: `Ep. ${episodeNum}: Why Most Devs Get ${kw} Completely Wrong`, type: 'Curiosity & Hook' },
      { title: `Ep. ${episodeNum}: The Ultimate Blueprint for ${topic}`, type: 'Educational & Masterclass' },
      { title: `Ep. ${episodeNum}: Inside ${kw}: How Top Engineering Teams Scale`, type: 'Interview & Inside Look' },
      { title: `Ep. ${episodeNum}: Can ${kw} Actually Save Your Web App?`, type: 'Question-Based' },
      { title: `Ep. ${episodeNum}: 5 Battle-Tested ${kw} Strategies with Proven Results`, type: 'Listicle & Actionable' },
      { title: `Ep. ${episodeNum}: The Truth About ${topic} in 2026`, type: 'Trend & Analysis' },
      { title: `Ep. ${episodeNum}: From Slow to Instant: Mastering ${kw}`, type: 'Transformation Story' },
      { title: `Ep. ${episodeNum}: Stop Making These ${kw} Mistakes`, type: 'Warning & High-Click' },
    ];
    setTitles(generated);
  };

  React.useEffect(() => {
    generateTitles();
  }, [tone]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Episode Details
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-slate-600 font-medium block mb-1">Episode Core Topic:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Keywords:</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Episode Number:</label>
            <input
              type="number"
              value={episodeNum}
              onChange={(e) => setEpisodeNum(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>
        </div>

        <button
          onClick={generateTitles}
          className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate SEO &amp; Curiosity Titles
        </button>
      </div>

      <div className="space-y-2">
        {titles.map((t, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">{t.title}</div>
              <div className="text-[11px] text-slate-500">{t.type} · {t.title.length} characters</div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(t.title);
                setCopiedKey(`t-${idx}`);
                setTimeout(() => setCopiedKey(null), 2000);
              }}
              className="px-2.5 py-1 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
            >
              {copiedKey === `t-${idx}` ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
              {copiedKey === `t-${idx}` ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
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
  const [guestBio, setGuestBio] = useState<string>('Principal Systems Engineer at Aurora Cloud, creator of open-source high-throughput microservices.');
  const [timestamps, setTimestamps] = useState<string>(
    `00:00 - Introduction & Welcome
04:15 - Why Traditional RDBMS Stalls at Scale
14:30 - Edge Compute vs Central Server Bottlenecks
26:45 - Live Case Study: 10M Concurrent Sessions
38:00 - Elena's Advice for Junior Engineers
44:20 - Closing Thoughts & Resource Links`
  );
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateDescription = () => {
    const text = `In this episode of ${podcastName}, host talks with ${guestName} (${guestBio}) about ${episodeTitle}.

${summary}

TIMESTAMPS:
${timestamps}

KEY TAKEAWAYS:
• Practical lessons on edge architecture and zero-server scalability.
• How to diagnose throughput bottlenecks before launch.
• The exact tools Elena uses every day to inspect distributed performance.

CONNECT & RESOURCES:
• Follow ${guestName} on Twitter / LinkedIn
• Try Dev27 Browser-based Tools: https://dev27.tools
• Subscribe to ${podcastName} on Apple Podcasts & Spotify!

#podcast #tech #engineering #developers #softwarearchitecture`;

    setGeneratedOutput(text);
  };

  React.useEffect(() => {
    generateDescription();
  }, [podcastName, episodeTitle, guestName]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Show Notes &amp; Description Inputs
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Podcast Name:</label>
            <input
              type="text"
              value={podcastName}
              onChange={(e) => setPodcastName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Episode Title:</label>
            <input
              type="text"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Guest Name:</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="text-slate-600 font-medium block mb-1">Episode Summary:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="text-slate-600 font-medium block mb-1">Timestamps Breakdown:</label>
            <textarea
              value={timestamps}
              onChange={(e) => setTimestamps(e.target.value)}
              rows={4}
              className="w-full font-mono text-xs p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>
        </div>

        <button
          onClick={generateDescription}
          className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Generate Structured Show Notes
        </button>
      </div>

      <div className="p-4 bg-white card-dev27 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Generated Episode Description</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedOutput);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-1 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Description'}
          </button>
        </div>

        <textarea
          value={generatedOutput}
          onChange={(e) => setGeneratedOutput(e.target.value)}
          rows={12}
          className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none"
        />
      </div>
    </div>
  );
};

// 2.4 Podcast Script Maker
export const PodcastScriptMaker: React.FC = () => {
  const [topic, setTopic] = useState<string>('The Future of Autonomous Web Agents');
  const [format, setFormat] = useState<string>('Interview');
  const [hostsCount, setHostsCount] = useState<number>(1);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(15);
  const [speakingRateWpm, setSpeakingRateWpm] = useState<number>(150);
  const [guestName, setGuestName] = useState<string>('Marcus Vance');
  const [script, setScript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateScript = () => {
    const text = `[EPISODE INTRO]
[HOST]: Welcome back to the show. Today we are tackling something everyone is talking about: "${topic}".
[HOST]: Have you ever wondered what happens when software starts writing, deploying, and debugging itself without human hand-holding? Joining us today is ${guestName}. Welcome to the mic!
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
  const estimatedMinutes = (wordCount / speakingRateWpm).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Podcast Script Settings
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-slate-600 font-medium block mb-1">Topic / Episode Theme:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white focus:border-[#8A244B]"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Show Format:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            >
              <option value="Solo">Solo Monologue</option>
              <option value="Interview">Guest Interview</option>
              <option value="Co-hosted">Two Co-hosts</option>
              <option value="Storytelling">Narrative / Storytelling</option>
              <option value="News">News Commentary</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Guest Name (if applicable):</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={generateScript}
            className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Script
          </button>

          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span>Words: <strong>{wordCount}</strong></span>
            <span>Est. Speaking Time: <strong className="text-[#8A244B]">~{estimatedMinutes} min</strong> (@ {speakingRateWpm} wpm)</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white card-dev27 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Complete Structured Script</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(script);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-1 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Script'}
          </button>
        </div>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={16}
          className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none"
        />
      </div>
    </div>
  );
};
