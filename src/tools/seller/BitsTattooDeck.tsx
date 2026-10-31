import React, { useState } from 'react';
import { DollarSign, Percent, Hammer, Scissors, Layers, Check, Copy } from 'lucide-react';

interface ToolProps {
  tool: 'deck-material' | 'twitch-bits' | 'tattoo-price';
}

export const BitsTattooDeckCalculator: React.FC<ToolProps> = ({ tool }) => {
  // 3.9 Deck Material
  const [deckLengthFt, setDeckLengthFt] = useState<number>(20);
  const [deckWidthFt, setDeckWidthFt] = useState<number>(12);
  const [boardWidthInches, setBoardWidthInches] = useState<number>(5.5);
  const [boardLengthFt, setBoardLengthFt] = useState<number>(16);
  const [joistSpacingInches, setJoistSpacingInches] = useState<number>(16);
  const [postSpacingFt, setPostSpacingFt] = useState<number>(8);
  const [wastePct, setWastePct] = useState<number>(10);
  const [includeRailings, setIncludeRailings] = useState<boolean>(true);
  const [boardPrice, setBoardPrice] = useState<number>(18.5);
  const [copied, setCopied] = useState<boolean>(false);

  // 3.10 Twitch Bits
  const [bitsInput, setBitsInput] = useState<number>(5000);
  const [targetUsdInput, setTargetUsdInput] = useState<number>(50);

  // 3.11 Tattoo Price
  const [tattooWidthInches, setTattooWidthInches] = useState<number>(4);
  const [tattooHeightInches, setTattooHeightInches] = useState<number>(6);
  const [estimatedHours, setEstimatedHours] = useState<number>(3.5);
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [shopMinimum, setShopMinimum] = useState<number>(100);
  const [complexity, setComplexity] = useState<'minimal' | 'moderate' | 'complex'>('moderate');
  const [isColor, setIsColor] = useState<boolean>(false);
  const [depositPaid, setDepositPaid] = useState<number>(50);
  const [tipPct, setTipPct] = useState<number>(20);

  // Deck Calculations
  const deckAreaSqFt = deckLengthFt * deckWidthFt;
  const boardCoverageSqFt = (boardWidthInches / 12) * boardLengthFt;
  const rawBoardCount = Math.ceil(deckAreaSqFt / (boardCoverageSqFt || 1));
  const totalDeckBoards = Math.ceil(rawBoardCount * (1 + wastePct / 100));

  const joistCount = Math.ceil((deckLengthFt * 12) / joistSpacingInches) + 1;
  const perimeterFt = 2 * (deckLengthFt + deckWidthFt);
  const postCount = Math.max(4, Math.ceil(deckLengthFt / postSpacingFt + 1) * 2);
  const beamBoards = Math.ceil(deckLengthFt / 10) * 2;
  const screwBoxes = Math.ceil(deckAreaSqFt / 100);
  const estimatedMaterialCost = totalDeckBoards * boardPrice + joistCount * 14 + postCount * 22 + screwBoxes * 35;

  // Twitch Bits Calculations
  const creatorUsd = bitsInput * 0.01;
  const estimatedViewerCost = bitsInput * 0.014;
  const twitchPlatformCut = estimatedViewerCost - creatorUsd;
  const bitsNeededForTargetUsd = Math.round(targetUsdInput / 0.01);

  // Tattoo Calculations
  const squareInches = tattooWidthInches * tattooHeightInches;
  const complexityMultiplier = complexity === 'minimal' ? 0.9 : complexity === 'moderate' ? 1.0 : 1.35;
  const colorMultiplier = isColor ? 1.2 : 1.0;
  const rawHourlyCost = estimatedHours * hourlyRate * complexityMultiplier * colorMultiplier;
  const baseTattooCost = Math.max(shopMinimum, rawHourlyCost);
  const tipAmount = baseTattooCost * (tipPct / 100);
  const totalTattooWithTip = baseTattooCost + tipAmount;
  const remainingBalance = totalTattooWithTip - depositPaid;

  const titles: Record<string, string> = {
    'deck-material': 'Deck Material, Framing & Lumber Calculator',
    'twitch-bits': 'Twitch Bits to USD & Creator Payout Converter',
    'tattoo-price': 'Tattoo Cost & Session Rate Calculator',
  };

  const copySummary = () => {
    let text = `${titles[tool]} Summary:\n`;
    if (tool === 'deck-material') {
      text += `Deck Area: ${deckAreaSqFt} sq ft (${deckLengthFt}' × ${deckWidthFt}')
Total Boards: ${totalDeckBoards} units (${boardLengthFt}' boards with ${wastePct}% waste)
Joists (16" OC): ${joistCount} boards
Posts: ${postCount} posts | Screw Boxes: ${screwBoxes} boxes
Estimated Material Cost: $${estimatedMaterialCost.toLocaleString()}`;
    } else if (tool === 'twitch-bits') {
      text += `Bits Input: ${bitsInput.toLocaleString()} Bits
Creator Payout: $${creatorUsd.toFixed(2)} USD
Estimated Viewer Purchase Cost: ~$${estimatedViewerCost.toFixed(2)} USD
Twitch Platform Cut: ~$${twitchPlatformCut.toFixed(2)} USD`;
    } else {
      text += `Tattoo Size: ${squareInches} sq in (${tattooWidthInches}" × ${tattooHeightInches}")
Estimated Session: ${estimatedHours} hrs @ $${hourlyRate}/hr
Base Cost: $${baseTattooCost.toFixed(0)}
Tip (${tipPct}%): +$${tipAmount.toFixed(0)}
Deposit Paid: -$${depositPaid.toFixed(0)}
Total Balance Due: $${remainingBalance.toFixed(0)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Specialized Estimators
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">{titles[tool]}</h2>
        </div>
        <button
          onClick={copySummary}
          className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-[#8A244B]" />}
          <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Professional 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Configuration Inputs</span>
              <span className="text-slate-400 font-normal lowercase">interactive parameters</span>
            </h3>

            {tool === 'deck-material' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Deck Length (ft)
                    </label>
                    <input
                      type="number"
                      value={deckLengthFt}
                      onChange={(e) => setDeckLengthFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Deck Width (ft)
                    </label>
                    <input
                      type="number"
                      value={deckWidthFt}
                      onChange={(e) => setDeckWidthFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Board Width (in)
                    </label>
                    <select
                      value={boardWidthInches}
                      onChange={(e) => setBoardWidthInches(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    >
                      <option value={3.5}>3.5" (2x4)</option>
                      <option value={5.5}>5.5" (Standard 5/4x6)</option>
                      <option value={7.25}>7.25" (2x8)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Board Length (ft)
                    </label>
                    <select
                      value={boardLengthFt}
                      onChange={(e) => setBoardLengthFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    >
                      <option value={8}>8 ft</option>
                      <option value={10}>10 ft</option>
                      <option value={12}>12 ft</option>
                      <option value={14}>14 ft</option>
                      <option value={16}>16 ft</option>
                      <option value={20}>20 ft</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Waste Margin (%)
                    </label>
                    <input
                      type="number"
                      value={wastePct}
                      onChange={(e) => setWastePct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Board Unit Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={boardPrice}
                      onChange={(e) => setBoardPrice(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold text-xs">
                      <input
                        type="checkbox"
                        checked={includeRailings}
                        onChange={(e) => setIncludeRailings(e.target.checked)}
                        className="rounded-[2px] text-[#8A244B]"
                      />
                      <span>Include Perimeter Railings Calculation</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {tool === 'twitch-bits' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Twitch Bits Amount
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={bitsInput}
                    onChange={(e) => setBitsInput(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-xl font-extrabold text-[#8A244B]"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[100, 500, 1000, 2500, 5000, 10000, 25000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBitsInput(amt)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-[4px] text-xs font-bold hover:bg-[#8A244B]/10 hover:border-[#8A244B] transition-colors cursor-pointer"
                      >
                        {amt.toLocaleString()} bits
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Reverse: Target USD Payout ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={10}
                    value={targetUsdInput}
                    onChange={(e) => setTargetUsdInput(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                  />
                  <div className="text-xs text-slate-600 pt-2">
                    Required for ${targetUsdInput.toLocaleString()} USD payout: <strong className="text-[#8A244B] font-mono text-sm">{bitsNeededForTargetUsd.toLocaleString()} Bits</strong>
                  </div>
                </div>
              </div>
            )}

            {tool === 'tattoo-price' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Dimensions (W × H in)
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        value={tattooWidthInches}
                        onChange={(e) => setTattooWidthInches(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-center text-sm font-bold"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        value={tattooHeightInches}
                        onChange={(e) => setTattooHeightInches(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-center text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Artist Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Design Complexity
                    </label>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-medium"
                    >
                      <option value="minimal">Minimal / Simple Outline</option>
                      <option value="moderate">Moderate / Shaded</option>
                      <option value="complex">Complex / Hyper-Realistic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Deposit Paid ($)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Tip Percentage (%)
                    </label>
                    <select
                      value={tipPct}
                      onChange={(e) => setTipPct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-medium"
                    >
                      <option value={15}>15% Standard</option>
                      <option value={20}>20% Great Service</option>
                      <option value={25}>25% Outstanding Art</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold text-xs">
                    <input
                      type="checkbox"
                      checked={isColor}
                      onChange={(e) => setIsColor(e.target.checked)}
                      className="rounded-[2px] text-[#8A244B]"
                    />
                    <span>Full Color Palette (vs Black &amp; Grey shading)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {tool === 'deck-material' && (
            <>
              {/* Hero Deck Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Total Deck Boards Needed
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    {totalDeckBoards}
                  </span>
                  <span className="text-sm text-slate-600 font-bold">boards ({boardLengthFt}' length)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Estimated Cost</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">
                      ${estimatedMaterialCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Surface Area</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">{deckAreaSqFt} sq ft</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Support Joists</span>
                    <span className="font-mono text-base font-bold text-slate-800">{joistCount} boards</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Posts &amp; Screws</span>
                    <span className="font-mono text-base font-bold text-slate-800">{postCount} posts / {screwBoxes} box</span>
                  </div>
                </div>
              </div>

              {/* Bill of materials breakdown */}
              <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 text-xs space-y-2">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block pb-1 border-b border-slate-100">
                  Itemized Framing Schedule
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Deck Planks ({wastePct}% waste)</span>
                  <span className="font-mono font-bold text-slate-900">{totalDeckBoards} units @ ${boardPrice}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Joists (16" on center)</span>
                  <span className="font-mono font-bold text-slate-900">{joistCount} (2x8 lumber)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Beams &amp; Girders</span>
                  <span className="font-mono font-bold text-slate-900">{beamBoards} doubled 2x10s</span>
                </div>
                {includeRailings && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Perimeter Railings</span>
                    <span className="font-mono font-bold text-slate-900">~{perimeterFt} linear ft</span>
                  </div>
                )}
              </div>
            </>
          )}

          {tool === 'twitch-bits' && (
            <>
              {/* Hero Bits Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Creator Net Payout (1¢ / Bit)
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
                    ${creatorUsd.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-600 font-bold">USD</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Viewer Paid (est.)</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">~${estimatedViewerCost.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Platform Cut</span>
                    <span className="font-mono text-lg font-extrabold text-[#D84315]">~${twitchPlatformCut.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white card-dev27 shadow-md rounded-[4px] text-xs text-slate-600 space-y-2">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block">Bits Economics:</span>
                <p>Twitch guarantees partners and affiliates exactly $0.01 per bit cheers. The viewer markup (20–40%) covers credit card processing and Twitch platform distribution.</p>
              </div>
            </>
          )}

          {tool === 'tattoo-price' && (
            <>
              {/* Hero Tattoo Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Remaining Balance Due at Appointment
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    ${remainingBalance.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">(Includes {tipPct}% tip)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Base Tattoo Cost</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">${baseTattooCost.toFixed(0)}</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Tip ({tipPct}%)</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">+${tipAmount.toFixed(0)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Deposit Paid</span>
                    <span className="font-mono text-base font-bold text-[#D84315]">-${depositPaid.toFixed(0)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Surface Area</span>
                    <span className="font-mono text-base font-bold text-slate-800">{squareInches} sq in</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
