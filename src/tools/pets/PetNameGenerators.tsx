import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Bookmark, Check, Download, Heart, Sparkles, Filter, Bot, Loader2 } from 'lucide-react';

interface Props {
  animal: 'dog' | 'cat' | 'puppy' | 'kitten' | 'horse' | 'rabbit' | 'bird' | 'fish';
}

interface PetNameResult {
  name: string;
  gender: string;
  style: string;
  meaning: string;
}

export const PetNameGenerators: React.FC<Props> = ({ animal }) => {
  const [gender, setGender] = useState<'any' | 'male' | 'female' | 'unisex'>('any');
  const [breed, setBreed] = useState<string>('');
  const [personality, setPersonality] = useState<string>('playful');
  const [appearance, setAppearance] = useState<string>('golden');
  const [namingStyle, setNamingStyle] = useState<string>('cute');
  const [firstLetter, setFirstLetter] = useState<string>('all');
  const [keywordInclude, setKeywordInclude] = useState<string>('');
  const [keywordExclude, setKeywordExclude] = useState<string>('');
  const [results, setResults] = useState<PetNameResult[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [pairedNames, setPairedNames] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const generateNames = () => {
    const kw = keywordInclude.trim().toLowerCase();
    const exList = keywordExclude.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const cleanBreed = breed.trim();

    // Comprehensive Name Library by Animal & Style
    const baseDatabase: Record<string, PetNameResult[]> = {
      dog: [
        { name: 'Milo', gender: 'male', style: 'cute', meaning: 'Beloved soldier, gentle companion' },
        { name: 'Luna', gender: 'female', style: 'traditional', meaning: 'The moon; celestial radiance' },
        { name: 'Cooper', gender: 'male', style: 'traditional', meaning: 'Barrel maker; reliable working companion' },
        { name: 'Bella', gender: 'female', style: 'cute', meaning: 'Beautiful; joyful heart' },
        { name: 'Thor', gender: 'male', style: 'strong', meaning: 'Norse god of thunder and strength' },
        { name: 'Athena', gender: 'female', style: 'strong', meaning: 'Goddess of wisdom and courageous defense' },
        { name: 'Waffles', gender: 'unisex', style: 'food', meaning: 'Sweet, golden-brown and lovable' },
        { name: 'Buster', gender: 'male', style: 'playful', meaning: 'High-energy spirited explorer' },
        { name: 'Daisy', gender: 'female', style: 'nature', meaning: 'Day\'s eye; fresh sunny nature' },
        { name: 'Ranger', gender: 'male', style: 'strong', meaning: 'Guardian of the outdoor wilderness' },
        { name: 'Pip', gender: 'unisex', style: 'cute', meaning: 'Quick one-syllable recall command' },
        { name: 'Rusty', gender: 'male', style: 'traditional', meaning: 'Warm red/copper coat tones' },
        { name: 'Zeus', gender: 'male', style: 'mythology', meaning: 'Ruler of the heavens; majestic posture' },
        { name: 'Hazel', gender: 'female', style: 'nature', meaning: 'Warm golden-brown eyes and coat' },
        { name: 'Peanut', gender: 'unisex', style: 'food', meaning: 'Small, spunky, irresistible bundle' },
        { name: 'Apollo', gender: 'male', style: 'mythology', meaning: 'God of light and sun; shining coat' },
        { name: 'Kona', gender: 'unisex', style: 'nature', meaning: 'Hawaiian origin; warm coastal breeze' },
        { name: 'Duke', gender: 'male', style: 'traditional', meaning: 'Noble leader of high lineage' },
        { name: 'Stella', gender: 'female', style: 'traditional', meaning: 'Bright shining star' },
        { name: 'Oreo', gender: 'unisex', style: 'food', meaning: 'Classic black and white coat balance' },
      ],
      cat: [
        { name: 'Oliver', gender: 'male', style: 'traditional', meaning: 'Olive branch; peaceful observer' },
        { name: 'Cleo', gender: 'female', style: 'mythology', meaning: 'Short for Cleopatra; queenly grace' },
        { name: 'Mochi', gender: 'unisex', style: 'food', meaning: 'Soft, sweet Japanese rice cake' },
        { name: 'Simba', gender: 'male', style: 'mythology', meaning: 'Swahili for lion; courageous prince' },
        { name: 'Nala', gender: 'female', style: 'mythology', meaning: 'Beloved gift; fierce huntress' },
        { name: 'Shadow', gender: 'unisex', style: 'nature', meaning: 'Silent, stealthy midnight prowler' },
        { name: 'Biscuit', gender: 'unisex', style: 'food', meaning: 'Comforting, kneading baker' },
        { name: 'Freya', gender: 'female', style: 'mythology', meaning: 'Norse goddess associated with sacred cats' },
        { name: 'Jasper', gender: 'male', style: 'traditional', meaning: 'Spotted gemstone of calm intuition' },
        { name: 'Ziggy', gender: 'unisex', style: 'cute', meaning: 'Playful zig-zagging nocturnal acrobat' },
        { name: 'Felix', gender: 'male', style: 'traditional', meaning: 'Latin for happy and fortunate' },
        { name: 'Willow', gender: 'female', style: 'nature', meaning: 'Slender, graceful woodland whisker' },
        { name: 'Cosmo', gender: 'male', style: 'mythology', meaning: 'Order and beauty of the universe' },
        { name: 'Pumpkin', gender: 'unisex', style: 'food', meaning: 'Warm orange autumn sweetness' },
      ],
      puppy: [
        { name: 'Teddy', gender: 'male', style: 'cute', meaning: 'Soft fluffy cuddly bear' },
        { name: 'Coco', gender: 'female', style: 'food', meaning: 'Sweet chocolate berry' },
        { name: 'Scout', gender: 'unisex', style: 'playful', meaning: 'Curiosity on four paws' },
        { name: 'Ziggy', gender: 'male', style: 'cute', meaning: 'Bouncy energetic tail-wagger' },
        { name: 'Penny', gender: 'female', style: 'traditional', meaning: 'Shiny copper lucky charm' },
        { name: 'Ziggy', gender: 'unisex', style: 'playful', meaning: 'Playful pup with endless bounce' },
        { name: 'Charlie', gender: 'male', style: 'traditional', meaning: 'Friendly neighborhood pup' },
        { name: 'Rosie', gender: 'female', style: 'cute', meaning: 'Sweet blooming garden flower' },
      ],
      kitten: [
        { name: 'Pixie', gender: 'female', style: 'cute', meaning: 'Magical tiny playful sprite' },
        { name: 'Milo', gender: 'male', style: 'cute', meaning: 'Gentle curious purring companion' },
        { name: 'Bean', gender: 'unisex', style: 'food', meaning: 'Tiny toe-bean sweetness' },
        { name: 'Giga', gender: 'unisex', style: 'cute', meaning: 'Hyperactive energy packed into miniature size' },
        { name: 'Lulu', gender: 'female', style: 'cute', meaning: 'Precious sparkling diamond' },
        { name: 'Sprout', gender: 'unisex', style: 'nature', meaning: 'Fresh new growth and endless curiosity' },
      ],
      horse: [
        { name: 'Starlight Sovereign', gender: 'unisex', style: 'traditional', meaning: 'Official registered Thoroughbred style' },
        { name: 'Copper Ridge', gender: 'male', style: 'nature', meaning: 'Sturdy mountain trail companion' },
        { name: 'Valkyrie Belle', gender: 'female', style: 'mythology', meaning: 'Noble elegance and precision gait' },
        { name: 'Thunder Echo', gender: 'male', style: 'strong', meaning: 'Galloping stride that shakes the earth' },
        { name: 'Dakota Breeze', gender: 'unisex', style: 'nature', meaning: 'Allied plains wanderer' },
        { name: 'Silver Phantom', gender: 'male', style: 'strong', meaning: 'Graceful clearance over towering oxers' },
        { name: 'Midnight Eclipse', gender: 'female', style: 'strong', meaning: 'Deep black coat with blinding speed' },
        { name: 'Blaze', gender: 'male', style: 'traditional', meaning: 'White stripe down a fiery coat' },
      ],
      rabbit: [
        { name: 'Clover', gender: 'unisex', style: 'nature', meaning: 'Lucky meadow grazer' },
        { name: 'Thumper', gender: 'male', style: 'playful', meaning: 'Foot-stamping curious explorer' },
        { name: 'Hazel', gender: 'female', style: 'nature', meaning: 'Woodland leader and gentle soul' },
        { name: 'Barnaby', gender: 'male', style: 'traditional', meaning: 'Floppy-eared dignified gentleman' },
        { name: 'Buttercup', gender: 'female', style: 'food', meaning: 'Bright yellow wildflower sweetness' },
        { name: 'Pip & Squeak', gender: 'unisex', style: 'cute', meaning: 'Double bunny bonded pair' },
      ],
      bird: [
        { name: 'Kiwi', gender: 'unisex', style: 'food', meaning: 'Bright green vibrant fruit namesake' },
        { name: 'Rio', gender: 'male', style: 'nature', meaning: 'Vibrant exotic carnival energy' },
        { name: 'Skye', gender: 'female', style: 'nature', meaning: 'Infinite open blue flight horizons' },
        { name: 'Echo', gender: 'unisex', style: 'cute', meaning: 'Remarkable vocal mimicry and charm' },
        { name: 'Mango', gender: 'unisex', style: 'food', meaning: 'Sun-drenched yellow & orange plumage' },
        { name: 'Merlin', gender: 'male', style: 'mythology', meaning: 'Wise soaring magical companion' },
      ],
      fish: [
        { name: 'Finley', gender: 'male', style: 'cute', meaning: 'Playful swimmer with flowing fins' },
        { name: 'Bubbles', gender: 'unisex', style: 'cute', meaning: 'Active surface feeder and aerator fan' },
        { name: 'Neptune', gender: 'male', style: 'mythology', meaning: 'Roman god of the deep ocean realm' },
        { name: 'Coral', gender: 'female', style: 'nature', meaning: 'Delicate tropical reef dweller' },
        { name: 'Apollo', gender: 'male', style: 'mythology', meaning: 'Radiant golden shimmering swimmer' },
      ],
    };

    const pairedDatabase: PetNameResult[] = [
      { name: 'Peanut & Butter', gender: 'unisex', style: 'paired', meaning: 'Classic inseparable duo' },
      { name: 'Thunder & Lightning', gender: 'unisex', style: 'paired', meaning: 'High-energy storm dynamic' },
      { name: 'Salt & Pepper', gender: 'unisex', style: 'paired', meaning: 'Contrast speckled duo' },
      { name: 'Clover & Honey', gender: 'unisex', style: 'paired', meaning: 'Sweet meadow companions' },
      { name: 'Nemo & Dory', gender: 'unisex', style: 'paired', meaning: 'Aquatic adventure pair' },
      { name: 'Batman & Robin', gender: 'unisex', style: 'paired', meaning: 'Heroic Crime-fighting duo' },
      { name: 'Cookies & Cream', gender: 'unisex', style: 'paired', meaning: 'Sweet black and white pair' },
    ];

    let pool = baseDatabase[animal] || baseDatabase.dog;
    if (pairedNames) {
      pool = pairedDatabase;
    }

    // Dynamic procedural name synthesis engine to ensure rich names even with strict filters!
    const synthesized: PetNameResult[] = [];

    // Synthesize based on breed
    if (cleanBreed) {
      const breedWord = cleanBreed.split(' ')[0];
      synthesized.push(
        { name: `${breedWord} Scout`, gender: 'male', style: 'breed-inspired', meaning: `Tailored for ${cleanBreed} active nature` },
        { name: `${breedWord} Duchess`, gender: 'female', style: 'breed-inspired', meaning: `Regal elegance fitting for a ${cleanBreed}` },
        { name: `Baron ${breedWord}`, gender: 'male', style: 'breed-inspired', meaning: `Distinguished ${cleanBreed} heritage` }
      );
    }

    // Synthesize based on personality & appearance
    const personalityPrefixes: Record<string, string[]> = {
      playful: ['Zippy', 'Bouncer', 'Dash', 'Sparky', 'Scooter', 'Jester'],
      calm: ['Sereno', 'Zen', 'Whisper', 'Mellow', 'Haven', 'Pal'],
      strong: ['Rex', 'Titan', 'Baron', 'Kaiser', 'Kodiak', 'Maverick'],
      curiosity: ['Quest', 'Scout', 'Radar', 'Snooper', 'Atlas', 'Finder'],
      regal: ['Sovereign', 'King', 'Princess', 'Regina', 'Sterling', 'Royalty']
    };

    const prefixes = personalityPrefixes[personality] || personalityPrefixes.playful;
    prefixes.forEach((p, i) => {
      synthesized.push({
        name: p,
        gender: i % 2 === 0 ? 'male' : 'female',
        style: namingStyle,
        meaning: `${personality.charAt(0).toUpperCase() + personality.slice(1)} spirit with ${appearance} coat highlights.`
      });
    });

    // Merge pool with synthesized items
    const combined = [...pool, ...synthesized];

    // Filter combined pool based on parameters
    const filtered = combined.filter((item) => {
      // Gender filter
      if (gender !== 'any' && item.gender !== 'unisex' && item.gender !== gender) return false;
      // First letter filter
      if (firstLetter !== 'all' && !item.name.toLowerCase().startsWith(firstLetter.toLowerCase())) return false;
      // Keyword include
      if (kw && !item.name.toLowerCase().includes(kw) && !item.meaning.toLowerCase().includes(kw)) return false;
      // Keyword exclude
      if (exList.some(ex => item.name.toLowerCase().includes(ex))) return false;
      return true;
    });

    // If filtering left fewer than 6 items, fallback generate fallback synthesized items matching first letter & gender
    if (filtered.length < 6) {
      const char = firstLetter !== 'all' ? firstLetter.toUpperCase() : 'A';
      const fallbackNames = [
        `${char}ster`, `${char}lex`, `${char}va`, `${char}stra`, `${char}polo`, `${char}rchi`, `${char}nzo`
      ];
      fallbackNames.forEach(n => {
        if (!exList.some(ex => n.toLowerCase().includes(ex))) {
          filtered.push({
            name: n,
            gender: gender === 'any' ? 'unisex' : gender,
            style: namingStyle,
            meaning: `Custom name matching initial '${char}' and ${personality} temperament.`
          });
        }
      });
    }

    // Deduplicate by name
    const uniqueMap = new Map();
    filtered.forEach(item => uniqueMap.set(item.name, item));
    setResults(Array.from(uniqueMap.values()).slice(0, 18));
  };

  useEffect(() => {
    generateNames();
  }, [animal, gender, namingStyle, personality, appearance, firstLetter, pairedNames]);

  const generateWithAi = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Generate 12 unique, charming pet name suggestions for a ${animal}.
Breed/Type: ${breed || 'General'}
Gender preference: ${gender}
Personality/Vibe: ${personality}
Appearance: ${appearance}
Naming Style: ${namingStyle}
First letter filter: ${firstLetter}
Must include keyword: ${keywordInclude}
Exclude words: ${keywordExclude}

Return a valid JSON array in format:
[
  {"name": "Name", "gender": "male/female/unisex", "style": "Cute/Strong", "meaning": "Short explanation"}
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

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const downloadNames = (fmt: 'csv' | 'txt') => {
    let out = '';
    if (fmt === 'csv') {
      out = 'Name,Gender,Style,Meaning\n' + results.map(r => `"${r.name}","${r.gender}","${r.style}","${r.meaning}"`).join('\n');
    } else {
      out = results.map(r => `${r.name} (${r.gender}) - ${r.meaning}`).join('\n');
    }
    const blob = new Blob([out], { type: fmt === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${animal}-names-${Date.now()}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const titles: Record<string, string> = {
    dog: 'Dog Name Generator (Breed, Size & Recall Friendly)',
    cat: 'Cat Name Generator (Cute, Food & Mythology Themes)',
    puppy: 'Puppy Name Generator (Recall & Training Friendly)',
    kitten: 'Kitten Name Generator (Playful & Coat Pattern Themes)',
    horse: 'Horse Name Generator (Stable Nicknames & Registered Thoroughbreds)',
    rabbit: 'Rabbit & Bunny Name Generator (Single & Paired Duos)',
    bird: 'Bird & Parrot Name Generator (Pronounceable & Tropical)',
    fish: 'Fish & Aquarium Name Generator (Single, Paired & Schools)',
  };

  return (
    <div className="space-y-4">
      {/* Parameter Controls */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[animal]} Parameters
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Gender:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs font-medium focus:outline-none"
            >
              <option value="any">Any Gender / Neutral</option>
              <option value="male">Male (Boy)</option>
              <option value="female">Female (Girl)</option>
              <option value="unisex">Unisex / Neutral Only</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Breed / Type (Optional):</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Golden Retriever, Siamese"
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Personality / Vibe:</label>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs focus:outline-none"
            >
              <option value="playful">Playful &amp; Energetic</option>
              <option value="calm">Calm &amp; Gentle</option>
              <option value="strong">Protective &amp; Strong</option>
              <option value="curious">Curious &amp; Adventurous</option>
              <option value="regal">Regal &amp; Elegant</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">First Letter Filter:</label>
            <select
              value={firstLetter}
              onChange={(e) => setFirstLetter(e.target.value)}
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs font-mono focus:outline-none"
            >
              <option value="all">Any Letter (A-Z)</option>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Naming Style:</label>
            <select
              value={namingStyle}
              onChange={(e) => setNamingStyle(e.target.value)}
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs focus:outline-none"
            >
              <option value="cute">Cute &amp; Sweet</option>
              <option value="traditional">Traditional Classic</option>
              <option value="strong">Strong &amp; Heroic</option>
              <option value="food">Food &amp; Dessert Inspired</option>
              <option value="mythology">Mythology &amp; Legends</option>
              <option value="nature">Nature &amp; Botanical</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Include Keyword:</label>
            <input
              type="text"
              value={keywordInclude}
              onChange={(e) => setKeywordInclude(e.target.value)}
              placeholder="e.g. Star, Sun"
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Exclude Words:</label>
            <input
              type="text"
              value={keywordExclude}
              onChange={(e) => setKeywordExclude(e.target.value)}
              placeholder="e.g. spot, rover"
              className="w-full p-2 border border-[#111F35] focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] rounded-[4px] bg-white text-xs focus:outline-none"
            />
          </div>

          {(animal === 'rabbit' || animal === 'fish') && (
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium text-xs">
                <input
                  type="checkbox"
                  checked={pairedNames}
                  onChange={(e) => setPairedNames(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Generate Paired Duos</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateNames}
              className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Pet Names</span>
            </button>

            <button
              type="button"
              onClick={generateWithAi}
              disabled={isAiLoading}
              className="px-4 py-2 text-xs font-semibold bg-[#111F35] hover:bg-slate-800 text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              <span>{isAiLoading ? 'AI Generating...' : 'AI Generate (Gemini)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => downloadNames('csv')}
              className="px-2.5 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => downloadNames('txt')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] cursor-pointer font-medium"
            >
              Export TXT
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {results.map((r, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex flex-col justify-between gap-2 text-xs border border-slate-200/90 rounded-[4px]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-base text-slate-900 block">{r.name}</span>
                <span className="text-[11px] text-[#8A244B] font-semibold capitalize">
                  {r.gender} · {r.style}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFavorites({ ...favorites, [r.name]: !favorites[r.name] })}
                  className={`p-1 rounded-[4px] cursor-pointer ${favorites[r.name] ? 'text-red-600' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => copyName(r.name)}
                  className="p-1 text-slate-400 hover:text-[#8A244B] cursor-pointer"
                  title="Copy Name"
                >
                  {copiedName === r.name ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 italic border-t border-slate-100 pt-1.5">
              "{r.meaning}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
