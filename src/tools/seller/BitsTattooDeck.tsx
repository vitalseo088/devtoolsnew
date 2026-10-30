import React, { useState } from 'react';
import { DollarSign, Percent, Hammer, Scissors, Layers, Check } from 'lucide-react';

interface ToolProps {
  tool: 'deck-material' | 'twitch-bits' | 'tattoo-price';
}

export const BitsTattooDeckCalculator: React.FC<ToolProps> = ({ tool }) => {
  // 3.9 Deck Material
  const [deckLengthFt, setDeckLengthFt] = useState<number>(20);
  const [deckWidthFt, setDeckWidthFt] = useState<number>(12);
  const [boardWidthInches, setBoardWidthInches] = useState<number>(5.5); // standard 5/4x6
  const [boardLengthFt, setBoardLengthFt] = useState<number>(16);
  const [joistSpacingInches, setJoistSpacingInches] = useState<number>(16); // 16" on center
  const [postSpacingFt, setPostSpacingFt] = useState<number>(8);
  const [wastePct, setWastePct] = useState<number>(10);
  const [includeRailings, setIncludeRailings] = useState<boolean>(true);
  const [boardPrice, setBoardPrice] = useState<number>(18.5); // price per board

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
  // Effective board width including gap
  const boardCoverageSqFt = (boardWidthInches / 12) * boardLengthFt;
  const rawBoardCount = Math.ceil(deckAreaSqFt / boardCoverageSqFt);
  const totalDeckBoards = Math.ceil(rawBoardCount * (1 + wastePct / 100));

  // Joists count (running across width spaced every joistSpacingInches)
  const joistCount = Math.ceil((deckLengthFt * 12) / joistSpacingInches) + 1;
  // Rim joists / outer perimeter
  const perimeterFt = 2 * (deckLengthFt + deckWidthFt);
  // Support posts
  const postCount = Math.max(4, Math.ceil(deckLengthFt / postSpacingFt + 1) * 2);
  // Beams (doubled 2x10s across posts)
  const beamBoards = Math.ceil(deckLengthFt / 10) * 2;
  // Screws: ~350 screws per 100 sq ft (5 lb box = ~350 screws)
  const screwBoxes = Math.ceil(deckAreaSqFt / 100);
  const estimatedMaterialCost = totalDeckBoards * boardPrice + joistCount * 14 + postCount * 22 + screwBoxes * 35;

  // Twitch Bits Calculations
  const creatorUsd = bitsInput * 0.01;
  // Approximate viewer purchase cost tiers: Twitch charges ~1.40 for 100 bits (~40% markup)
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[tool]}
        </span>

        {tool === 'deck-material' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Deck Length (ft):</label>
              <input
                type="number"
                value={deckLengthFt}
                onChange={(e) => setDeckLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Deck Width (ft):</label>
              <input
                type="number"
                value={deckWidthFt}
                onChange={(e) => setDeckWidthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Board Width (inches):</label>
              <select
                value={boardWidthInches}
                onChange={(e) => setBoardWidthInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={3.5}>3.5" (2x4 / nominal 4")</option>
                <option value={5.5}>5.5" (Standard 5/4x6)</option>
                <option value={7.25}>7.25" (2x8)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Board Length (ft):</label>
              <select
                value={boardLengthFt}
                onChange={(e) => setBoardLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={12}>12 ft</option>
                <option value={16}>16 ft</option>
                <option value={20}>20 ft</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Joist Spacing (inches):</label>
              <select
                value={joistSpacingInches}
                onChange={(e) => setJoistSpacingInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={12}>12" on-center (Commercial / Diagonal)</option>
                <option value={16}>16" on-center (Residential Standard)</option>
                <option value={24}>24" on-center (Light Duty)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Waste Factor (%):</label>
              <input
                type="number"
                min={0}
                max={30}
                value={wastePct}
                onChange={(e) => setWastePct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Board Unit Price ($):</label>
              <input
                type="number"
                step="0.5"
                value={boardPrice}
                onChange={(e) => setBoardPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={includeRailings}
                  onChange={(e) => setIncludeRailings(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Include Perimeter Railings</span>
              </label>
            </div>
          </div>
        )}

        {tool === 'twitch-bits' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
              <span className="font-bold text-slate-800 block">1. Bits to Creator USD Payout</span>
              <label className="text-slate-600 block">Enter Twitch Bits:</label>
              <input
                type="number"
                min={1}
                step={100}
                value={bitsInput}
                onChange={(e) => setBitsInput(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-base font-bold text-[#8A244B]"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[100, 500, 1000, 2500, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBitsInput(amt)}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] hover:bg-slate-100"
                  >
                    {amt.toLocaleString()} bits
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2">
              <span className="font-bold text-slate-800 block">2. Reverse: Target USD to Required Bits</span>
              <label className="text-slate-600 block">Enter Desired USD Payout ($):</label>
              <input
                type="number"
                min={1}
                step={10}
                value={targetUsdInput}
                onChange={(e) => setTargetUsdInput(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-base font-bold text-slate-900"
              />
              <div className="text-[11px] text-slate-600 pt-1">
                Requires: <strong className="text-[#8A244B] font-mono">{bitsNeededForTargetUsd.toLocaleString()} Bits</strong>
              </div>
            </div>
          </div>
        )}

        {tool === 'tattoo-price' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Tattoo Dimensions (W × H in):</label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  value={tattooWidthInches}
                  onChange={(e) => setTattooWidthInches(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-[4px] text-center"
                />
                <span>×</span>
                <input
                  type="number"
                  value={tattooHeightInches}
                  onChange={(e) => setTattooHeightInches(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-[4px] text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Estimated Hours:</label>
              <input
                type="number"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Artist Hourly Rate ($/hr):</label>
              <input
                type="number"
                step="10"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Complexity Level:</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value="minimal">Minimal / Simple Outline</option>
                <option value="moderate">Moderate / Shaded</option>
                <option value="complex">Complex / Hyper-Realistic</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Deposit Paid ($):</label>
              <input
                type="number"
                step="10"
                value={depositPaid}
                onChange={(e) => setDepositPaid(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Tip Percentage (%):</label>
              <select
                value={tipPct}
                onChange={(e) => setTipPct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={15}>15% Standard</option>
                <option value={20}>20% Great Service</option>
                <option value={25}>25% Outstanding Art</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={isColor}
                  onChange={(e) => setIsColor(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Color Palette (vs Black &amp; Grey)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tool === 'deck-material' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Deck Surface Area</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {deckAreaSqFt} sq ft
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Deck Boards</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {totalDeckBoards} boards ({boardLengthFt}')
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Joists Required</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {joistCount} joists
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Estimated Cost</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                ${estimatedMaterialCost.toLocaleString()}
              </span>
            </div>
          </>
        )}

        {tool === 'twitch-bits' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Creator Payout (1¢/bit)</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                ${creatorUsd.toFixed(2)} USD
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Viewer Purchase Cost</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                ~${estimatedViewerCost.toFixed(2)} USD
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Platform Cut (~28%)</span>
              <span className="font-mono text-lg font-bold text-[#D84315]">
                ~${twitchPlatformCut.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Bits Input</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {bitsInput.toLocaleString()}
              </span>
            </div>
          </>
        )}

        {tool === 'tattoo-price' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Tattoo Area</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {squareInches} sq in
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Base Tattoo Cost</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                ${baseTattooCost.toFixed(0)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Estimated Tip ({tipPct}%)</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                +${tipAmount.toFixed(0)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Remaining Balance</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                ${remainingBalance.toFixed(0)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Bill of Materials / Breakdown List */}
      <div className="p-4 bg-white card-dev27 space-y-2 text-xs">
        <span className="font-bold text-slate-800 block pb-1 border-b border-slate-100">
          Detailed Itemization &amp; Material Breakdown
        </span>

        {tool === 'deck-material' && (
          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Deck Boards (including {wastePct}% waste allowance):</span>
              <span className="font-mono font-bold text-slate-900">{totalDeckBoards} units @ ${boardPrice} = ${(totalDeckBoards * boardPrice).toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Support Joists (16" O.C.):</span>
              <span className="font-mono font-bold text-slate-900">{joistCount} boards (2x8 lumber)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Beams &amp; Girders:</span>
              <span className="font-mono font-bold text-slate-900">{beamBoards} doubled 2x10 boards</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Support Posts (4x4 or 6x6):</span>
              <span className="font-mono font-bold text-slate-900">{postCount} posts</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Composite / Wood Deck Screws:</span>
              <span className="font-mono font-bold text-slate-900">{screwBoxes} box(es) (~350 screws/box)</span>
            </div>
            {includeRailings && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Perimeter Railing System:</span>
                <span className="font-mono font-bold text-slate-900">~{perimeterFt} linear feet of railing</span>
              </div>
            )}
          </div>
        )}

        {tool === 'twitch-bits' && (
          <p className="text-slate-600">
            <strong>Payout Rule:</strong> Twitch pays partnered and affiliate creators exactly <strong>$0.01 per Bit</strong> (100 bits = $1.00 USD).
            Viewers pay an additional 20–40% markup when purchasing bits from Twitch/Amazon to cover payment processing fees.
          </p>
        )}

        {tool === 'tattoo-price' && (
          <div className="space-y-1 text-slate-600">
            <p><strong>Hourly Estimation:</strong> {estimatedHours} hours × ${hourlyRate}/hr = ${(estimatedHours * hourlyRate).toFixed(0)}.</p>
            <p>Complexity modifier ({complexity}): <strong>{complexityMultiplier}x</strong>. Color modifier: <strong>{colorMultiplier}x</strong>.</p>
            <p><strong>Shop Minimum:</strong> ${shopMinimum}. If total falls below shop minimum, the minimum charge applies.</p>
          </div>
        )}
      </div>
    </div>
  );
};
