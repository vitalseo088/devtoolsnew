import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Bookmark, Check, Download, Heart, Sparkles, Filter } from 'lucide-react';

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

  // Discipline for horse, single vs paired for rabbit/fish
  const [horseDiscipline, setHorseDiscipline] = useState<string>('racing');
  const [pairedNames, setPairedNames] = useState<boolean>(false);

  const generateNames = () => {
    const list: PetNameResult[] = [];
    const kw = keywordInclude.trim().toLowerCase();
    const exList = keywordExclude.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    // Domain name pools by animal and theme
    const dogNames = [
      { name: 'Milo', gender: 'male', style: 'cute', meaning: 'Beloved soldier, gentle companion' },
      { name: 'Luna', gender: 'female', style: 'traditional', meaning: 'The moon; celestial radiance' },
      { name: 'Cooper', gender: 'male', style: 'traditional', meaning: 'Barrel maker; reliable working dog' },
      { name: 'Bella', gender: 'female', style: 'cute', meaning: 'Beautiful; joyful heart' },
      { name: 'Thor', gender: 'male', style: 'strong', meaning: 'Norse god of thunder and strength' },
      { name: 'Athena', gender: 'female', style: 'strong', meaning: 'Goddess of wisdom and courageous defense' },
      { name: 'Waffles', gender: 'unisex', style: 'funny', meaning: 'Sweet, golden-brown and lovable' },
      { name: 'Buster', gender: 'male', style: 'playful', meaning: 'High-energy spirited explorer' },
      { name: 'Daisy', gender: 'female', style: 'cute', meaning: 'Day\'s eye; fresh sunny nature' },
      { name: 'Ranger', gender: 'male', style: 'strong', meaning: 'Guardian of the outdoor wilderness' },
      { name: 'Pip', gender: 'unisex', style: 'short', meaning: 'Quick one-syllable recall command' },
      { name: 'Rusty', gender: 'male', style: 'color', meaning: 'Warm red/copper coat tones' },
    ];

    const catNames = [
      { name: 'Oliver', gender: 'male', style: 'traditional', meaning: 'Olive branch; peaceful observer' },
      { name: 'Cleo', gender: 'female', style: 'elegant', meaning: 'Short for Cleopatra; queenly grace' },
      { name: 'Mochi', gender: 'unisex', style: 'food', meaning: 'Soft, sweet Japanese rice cake' },
      { name: 'Simba', gender: 'male', style: 'mythology', meaning: 'Swahili for lion; courageous prince' },
      { name: 'Nala', gender: 'female', style: 'mythology', meaning: 'Beloved gift; fierce huntress' },
      { name: 'Shadow', gender: 'unisex', style: 'color', meaning: 'Silent, stealthy midnight prowler' },
      { name: 'Biscuit', gender: 'unisex', style: 'food', meaning: 'Comforting, kneading baker' },
      { name: 'Freya', gender: 'female', style: 'mythology', meaning: 'Norse goddess associated with sacred cats' },
      { name: 'Jasper', gender: 'male', style: 'unique', meaning: 'Spotted gemstone of calm intuition' },
      { name: 'Ziggy', gender: 'unisex', style: 'funny', meaning: 'Playful zig-zagging nocturnal acrobat' },
    ];

    const horseNames = [
      { name: 'Starlight Sovereign', gender: 'unisex', style: 'racing', meaning: 'Official registered Thoroughbred style' },
      { name: 'Copper Ridge', gender: 'male', style: 'western', meaning: 'Sturdy mountain trail companion' },
      { name: 'Valkyrie Belle', gender: 'female', style: 'dressage', meaning: 'Noble elegance and precision gait' },
      { name: 'Thunder Echo', gender: 'male', style: 'racing', meaning: 'Galloping stride that shakes the earth' },
      { name: 'Dakota Breeze', gender: 'unisex', style: 'trail', meaning: 'Allied plains wanderer' },
      { name: 'Silver Phantom', gender: 'male', style: 'jumping', meaning: 'Graceful clearance over towering oxers' },
      { name: 'Midnight Eclipse', gender: 'female', style: 'strong', meaning: 'Deep black coat with blinding speed' },
    ];

    const rabbitNames = [
      { name: 'Clover & Honey', gender: 'unisex', style: 'paired', meaning: 'Classic bonded meadow pair' },
      { name: 'Pepper & Salt', gender: 'unisex', style: 'paired', meaning: 'Two-tone speckled bunny duo' },
      { name: 'Thumper', gender: 'male', style: 'cute', meaning: 'Foot-stamping curious explorer' },
      { name: 'Hazel', gender: 'female', style: 'nature', meaning: 'Watership Down inspired woodland leader' },
      { name: 'Barnaby', gender: 'male', style: 'unique', meaning: 'Floppy-eared dignified gentleman' },
      { name: 'Buttercup', gender: 'female', style: 'food', meaning: 'Bright yellow wildflower sweetness' },
    ];

    const birdNames = [
      { name: 'Kiwi', gender: 'unisex', style: 'tropical', meaning: 'Bright green vibrant fruit namesake' },
      { name: 'Rio', gender: 'male', style: 'tropical', meaning: 'Vibrant exotic carnival energy' },
      { name: 'Skye', gender: 'female', style: 'nature', meaning: 'Infinite open blue flight horizons' },
      { name: 'Echo', gender: 'unisex', style: 'unique', meaning: 'Remarkable vocal mimicry and charm' },
      { name: 'Mango', gender: 'unisex', style: 'color', meaning: 'Sun-drenched yellow & orange plumage' },
      { name: 'Merlin', gender: 'male', style: 'mythology', meaning: 'Wise soaring magical companion' },
    ];

    const fishNames = [
      { name: 'Finley', gender: 'male', style: 'cute', meaning: 'Playful swimmer with flowing fins' },
      { name: 'Bubbles', gender: 'unisex', style: 'funny', meaning: 'Active surface feeder and aerator fan' },
      { name: 'Neptune', gender: 'male', style: 'mythology', meaning: 'Roman god of the deep ocean realm' },
      { name: 'Coral', gender: 'female', style: 'nature', meaning: 'Delicate tropical reef dweller' },
      { name: 'Nemo & Dory', gender: 'unisex', style: 'paired', meaning: 'Vibrant saltwater clownfish and tang pair' },
      { name: 'Apollo', gender: 'male', style: 'unique', meaning: 'Radiant golden shimmering swimmer' },
    ];

    let pool = dogNames;
    if (animal === 'cat' || animal === 'kitten') pool = catNames;
    if (animal === 'horse') pool = horseNames;
    if (animal === 'rabbit') pool = rabbitNames;
    if (animal === 'bird') pool = birdNames;
    if (animal === 'fish') pool = fishNames;

    // Filter by gender, letter, keywords
    const filtered = pool.filter((item) => {
      if (gender !== 'any' && item.gender !== 'unisex' && item.gender !== gender) return false;
      if (firstLetter !== 'all' && !item.name.toLowerCase().startsWith(firstLetter.toLowerCase())) return false;
      if (kw && !item.name.toLowerCase().includes(kw) && !item.meaning.toLowerCase().includes(kw)) return false;
      if (exList.some(ex => item.name.toLowerCase().includes(ex))) return false;
      return true;
    });

    // Add generated thematic variations
    const suffixes = ['Bean', 'Bear', 'Star', 'Chief', 'Scout', 'Belle', 'Dash'];
    const extraGen: PetNameResult[] = [];
    if (breed) {
      extraGen.push({
        name: `${breed.split(' ')[0]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        gender: gender === 'any' ? 'unisex' : gender,
        style: 'breed-inspired',
        meaning: `Specially crafted for ${breed} temperament and heritage.`,
      });
    }

    setResults([...filtered, ...extraGen]);
  };

  useEffect(() => {
    generateNames();
  }, [animal, gender, namingStyle, firstLetter, pairedNames]);

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
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs font-medium"
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
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Personality / Vibe:</label>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
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
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs font-mono"
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
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
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
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Exclude Words:</label>
            <input
              type="text"
              value={keywordExclude}
              onChange={(e) => setKeywordExclude(e.target.value)}
              placeholder="e.g. spot, rover"
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={generateNames}
            className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Suggestions
          </button>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => downloadNames('csv')}
              className="px-2.5 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => downloadNames('txt')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px]"
            >
              Export TXT
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {results.map((r, idx) => (
          <div key={idx} className="p-3 bg-white card-dev27 flex flex-col justify-between gap-2 text-xs">
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
                  className={`p-1 rounded-[4px] ${favorites[r.name] ? 'text-red-600' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => copyName(r.name)}
                  className="p-1 text-slate-400 hover:text-[#8A244B]"
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
