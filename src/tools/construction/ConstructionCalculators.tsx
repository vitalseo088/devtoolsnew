import React, { useState } from 'react';
import { Hammer, Ruler, Layers, AlertCircle, Check, DollarSign, Copy } from 'lucide-react';

interface Props {
  tool: 'roof-pitch' | 'stair' | 'concrete' | 'deck-board' | 'gravel' | 'fence' | 'drywall' | 'flooring';
}

export const ConstructionCalculators: React.FC<Props> = ({ tool }) => {
  // 5.1 Roof Pitch
  const [roofRiseInches, setRoofRiseInches] = useState<number>(6);
  const [roofRunInches, setRoofRunInches] = useState<number>(12);
  const [roofSpanFt, setRoofSpanFt] = useState<number>(24);
  const [overhangInches, setOverhangInches] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);

  // 5.2 Stair
  const [floorHeightInches, setFloorHeightInches] = useState<number>(108);
  const [targetRiserInches, setTargetRiserInches] = useState<number>(7.5);
  const [targetTreadInches, setTargetTreadInches] = useState<number>(10.5);

  // 5.3 Concrete Volume
  const [concreteShape, setConcreteShape] = useState<'slab' | 'column' | 'footing'>('slab');
  const [slabLengthFt, setSlabLengthFt] = useState<number>(20);
  const [slabWidthFt, setSlabWidthFt] = useState<number>(10);
  const [slabThicknessInches, setSlabThicknessInches] = useState<number>(4);
  const [columnDiameterInches, setColumnDiameterInches] = useState<number>(12);
  const [columnHeightFt, setColumnHeightFt] = useState<number>(8);
  const [concreteWastePct, setConcreteWastePct] = useState<number>(10);
  const [bagSize, setBagSize] = useState<number>(80);
  const [pricePerBag, setPricePerBag] = useState<number>(6.50);

  // 5.4 Deck Board
  const [cDeckLengthFt, setCDeckLengthFt] = useState<number>(24);
  const [cDeckWidthFt, setCDeckWidthFt] = useState<number>(14);
  const [cBoardWidthInches, setCBoardWidthInches] = useState<number>(5.5);
  const [cBoardLengthFt, setCBoardLengthFt] = useState<number>(16);

  // 5.5 Gravel
  const [gravelLengthFt, setGravelLengthFt] = useState<number>(20);
  const [gravelWidthFt, setGravelWidthFt] = useState<number>(10);
  const [gravelDepthInches, setGravelDepthInches] = useState<number>(3);
  const [stoneDensityTonsPerYard, setStoneDensityTonsPerYard] = useState<number>(1.4);

  // 5.6 Fence
  const [fenceLengthFt, setFenceLengthFt] = useState<number>(150);
  const [fenceHeightFt, setFenceHeightFt] = useState<number>(6);
  const [postSpacingFt, setPostSpacingFt] = useState<number>(8);
  const [gateCount, setGateCount] = useState<number>(1);
  const [gateWidthFt, setGateWidthFt] = useState<number>(4);
  const [picketWidthInches, setPicketWidthInches] = useState<number>(5.5);

  // 5.7 Drywall
  const [roomLengthFt, setRoomLengthFt] = useState<number>(16);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(12);
  const [roomCeilingHeightFt, setRoomCeilingHeightFt] = useState<number>(9);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [doorCount, setDoorCount] = useState<number>(2);
  const [windowCount, setWindowCount] = useState<number>(2);
  const [sheetSize, setSheetSize] = useState<'4x8' | '4x12'>('4x8');

  // 5.8 Flooring
  const [floorRoomLengthFt, setFloorRoomLengthFt] = useState<number>(18);
  const [floorRoomWidthFt, setFloorRoomWidthFt] = useState<number>(14);
  const [installPattern, setInstallPattern] = useState<'straight' | 'diagonal' | 'herringbone'>('straight');
  const [boxCoverageSqFt, setBoxCoverageSqFt] = useState<number>(24);
  const [pricePerSqFt, setPricePerSqFt] = useState<number>(4.20);

  const [applied, setApplied] = useState({
    roofRiseInches,
    roofRunInches,
    roofSpanFt,
    overhangInches,
    floorHeightInches,
    targetRiserInches,
    targetTreadInches,
    concreteShape,
    slabLengthFt,
    slabWidthFt,
    slabThicknessInches,
    columnDiameterInches,
    columnHeightFt,
    concreteWastePct,
    bagSize,
    pricePerBag,
    gravelLengthFt,
    gravelWidthFt,
    gravelDepthInches,
    stoneDensityTonsPerYard,
    fenceLengthFt,
    fenceHeightFt,
    postSpacingFt,
    gateCount,
    gateWidthFt,
    picketWidthInches,
    roomLengthFt,
    roomWidthFt,
    roomCeilingHeightFt,
    includeCeiling,
    doorCount,
    windowCount,
    sheetSize,
    floorRoomLengthFt,
    floorRoomWidthFt,
    installPattern,
    boxCoverageSqFt,
    pricePerSqFt,
    cDeckLengthFt,
    cDeckWidthFt,
    cBoardWidthInches,
    cBoardLengthFt,
  });

  const hasChanges =
    roofRiseInches !== applied.roofRiseInches ||
    roofRunInches !== applied.roofRunInches ||
    roofSpanFt !== applied.roofSpanFt ||
    overhangInches !== applied.overhangInches ||
    floorHeightInches !== applied.floorHeightInches ||
    targetRiserInches !== applied.targetRiserInches ||
    targetTreadInches !== applied.targetTreadInches ||
    concreteShape !== applied.concreteShape ||
    slabLengthFt !== applied.slabLengthFt ||
    slabWidthFt !== applied.slabWidthFt ||
    slabThicknessInches !== applied.slabThicknessInches ||
    columnDiameterInches !== applied.columnDiameterInches ||
    columnHeightFt !== applied.columnHeightFt ||
    concreteWastePct !== applied.concreteWastePct ||
    bagSize !== applied.bagSize ||
    pricePerBag !== applied.pricePerBag ||
    gravelLengthFt !== applied.gravelLengthFt ||
    gravelWidthFt !== applied.gravelWidthFt ||
    gravelDepthInches !== applied.gravelDepthInches ||
    stoneDensityTonsPerYard !== applied.stoneDensityTonsPerYard ||
    fenceLengthFt !== applied.fenceLengthFt ||
    fenceHeightFt !== applied.fenceHeightFt ||
    postSpacingFt !== applied.postSpacingFt ||
    gateCount !== applied.gateCount ||
    gateWidthFt !== applied.gateWidthFt ||
    picketWidthInches !== applied.picketWidthInches ||
    roomLengthFt !== applied.roomLengthFt ||
    roomWidthFt !== applied.roomWidthFt ||
    roomCeilingHeightFt !== applied.roomCeilingHeightFt ||
    includeCeiling !== applied.includeCeiling ||
    doorCount !== applied.doorCount ||
    windowCount !== applied.windowCount ||
    sheetSize !== applied.sheetSize ||
    floorRoomLengthFt !== applied.floorRoomLengthFt ||
    floorRoomWidthFt !== applied.floorRoomWidthFt ||
    installPattern !== applied.installPattern ||
    boxCoverageSqFt !== applied.boxCoverageSqFt ||
    pricePerSqFt !== applied.pricePerSqFt ||
    cDeckLengthFt !== applied.cDeckLengthFt ||
    cDeckWidthFt !== applied.cDeckWidthFt ||
    cBoardWidthInches !== applied.cBoardWidthInches ||
    cBoardLengthFt !== applied.cBoardLengthFt;

  const handleCalculate = () => {
    setApplied({
      roofRiseInches,
      roofRunInches,
      roofSpanFt,
      overhangInches,
      floorHeightInches,
      targetRiserInches,
      targetTreadInches,
      concreteShape,
      slabLengthFt,
      slabWidthFt,
      slabThicknessInches,
      columnDiameterInches,
      columnHeightFt,
      concreteWastePct,
      bagSize,
      pricePerBag,
      gravelLengthFt,
      gravelWidthFt,
      gravelDepthInches,
      stoneDensityTonsPerYard,
      fenceLengthFt,
      fenceHeightFt,
      postSpacingFt,
      gateCount,
      gateWidthFt,
      picketWidthInches,
      roomLengthFt,
      roomWidthFt,
      roomCeilingHeightFt,
      includeCeiling,
      doorCount,
      windowCount,
      sheetSize,
      floorRoomLengthFt,
      floorRoomWidthFt,
      installPattern,
      boxCoverageSqFt,
      pricePerSqFt,
      cDeckLengthFt,
      cDeckWidthFt,
      cBoardWidthInches,
      cBoardLengthFt,
    });
  };

  // 5.1 Roof Pitch
  const pitchRatio = `${applied.roofRiseInches}:12`;
  const roofAngleDeg = (Math.atan(applied.roofRiseInches / applied.roofRunInches) * 180) / Math.PI;
  const slopePercentage = (applied.roofRiseInches / applied.roofRunInches) * 100;
  const halfSpanInches = (applied.roofSpanFt * 12) / 2;
  const totalRunInches = halfSpanInches + applied.overhangInches;
  const rafterLengthInches = Math.sqrt(Math.pow(totalRunInches, 2) + Math.pow((totalRunInches * (applied.roofRiseInches / 12)), 2));
  const rafterLengthFt = rafterLengthInches / 12;

  // 5.2 Stair
  const numRisers = Math.round(applied.floorHeightInches / applied.targetRiserInches);
  const actualRiserHeight = applied.floorHeightInches / (numRisers || 1);
  const numTreads = Math.max(1, numRisers - 1);
  const totalStairRunInches = numTreads * applied.targetTreadInches;
  const stairAngleDeg = (Math.atan(actualRiserHeight / applied.targetTreadInches) * 180) / Math.PI;
  const stringerLengthInches = Math.sqrt(Math.pow(applied.floorHeightInches, 2) + Math.pow(totalStairRunInches, 2));
  const isIrcCompliant = actualRiserHeight <= 7.75 && applied.targetTreadInches >= 10.0;

  // 5.3 Concrete
  let concreteCuFt = 0;
  if (applied.concreteShape === 'slab') {
    concreteCuFt = applied.slabLengthFt * applied.slabWidthFt * (applied.slabThicknessInches / 12);
  } else if (applied.concreteShape === 'column') {
    const radiusFt = (applied.columnDiameterInches / 2) / 12;
    concreteCuFt = Math.PI * Math.pow(radiusFt, 2) * applied.columnHeightFt;
  } else {
    concreteCuFt = applied.slabLengthFt * (applied.slabWidthFt) * (applied.slabThicknessInches / 12);
  }
  const concreteCuFtWithWaste = concreteCuFt * (1 + applied.concreteWastePct / 100);
  const concreteCuYards = concreteCuFtWithWaste / 27;
  const cuFtPerBag = applied.bagSize === 80 ? 0.60 : 0.45;
  const totalBagsNeeded = Math.ceil(concreteCuFtWithWaste / cuFtPerBag);
  const totalConcreteCost = totalBagsNeeded * applied.pricePerBag;

  // 5.5 Gravel
  const gravelAreaSqFt = applied.gravelLengthFt * applied.gravelWidthFt;
  const gravelCuFt = gravelAreaSqFt * (applied.gravelDepthInches / 12);
  const gravelCuYards = gravelCuFt / 27;
  const gravelWeightTons = gravelCuYards * applied.stoneDensityTonsPerYard;
  const gravelWeightKg = gravelWeightTons * 907.185;

  // 5.6 Fence
  const netFenceLength = Math.max(0, applied.fenceLengthFt - (applied.gateCount * applied.gateWidthFt));
  const postSections = Math.ceil(netFenceLength / applied.postSpacingFt);
  const totalFencePosts = postSections + 1 + (applied.gateCount * 2);
  const picketsPerSection = Math.ceil((applied.postSpacingFt * 12) / applied.picketWidthInches);
  const totalPickets = postSections * picketsPerSection;
  const railsPerSection = applied.fenceHeightFt >= 6 ? 3 : 2;
  const totalRails = postSections * railsPerSection;
  const postConcreteBags = totalFencePosts * 2;

  // 5.7 Drywall
  const wallPerimeter = 2 * (applied.roomLengthFt + applied.roomWidthFt);
  const grossWallArea = wallPerimeter * applied.roomCeilingHeightFt;
  const ceilingArea = applied.includeCeiling ? (applied.roomLengthFt * applied.roomWidthFt) : 0;
  const doorsWindowsArea = (applied.doorCount * 21) + (applied.windowCount * 15);
  const netDrywallArea = Math.max(0, grossWallArea + ceilingArea - doorsWindowsArea);
  const sheetArea = applied.sheetSize === '4x8' ? 32 : 48;
  const drywallSheetsNeeded = Math.ceil((netDrywallArea * 1.1) / sheetArea);
  const drywallScrewsLbs = Math.ceil(drywallSheetsNeeded * 0.35);
  const jointTapeRolls = Math.ceil((drywallSheetsNeeded * 35) / 250);

  // 5.8 Flooring
  const rawFloorArea = applied.floorRoomLengthFt * applied.floorRoomWidthFt;
  const patternWastePct = applied.installPattern === 'straight' ? 10 : applied.installPattern === 'diagonal' ? 15 : 20;
  const totalFloorAreaWithWaste = rawFloorArea * (1 + patternWastePct / 100);
  const boxesNeeded = Math.ceil(totalFloorAreaWithWaste / applied.boxCoverageSqFt);
  const totalFlooringCost = totalFloorAreaWithWaste * applied.pricePerSqFt;

  const titles: Record<string, string> = {
    'roof-pitch': 'Roof Pitch, Angle & Rafter Length Calculator',
    'stair': 'Staircase Stringer, Riser & Tread Calculator (IRC Code)',
    'concrete': 'Concrete Volume, Yardage & Bag Calculator',
    'deck-board': 'Deck Board Coverage & Material Calculator',
    'gravel': 'Gravel, Crushed Stone & Aggregates Calculator',
    'fence': 'Fence Posts, Rails, Pickets & Concrete Calculator',
    'drywall': 'Drywall Sheet, Tape & Fastener Calculator',
    'flooring': 'Flooring Area, Installation Pattern & Waste Calculator',
  };

  const copySummary = () => {
    let text = `${titles[tool]} Summary:\n`;
    if (tool === 'roof-pitch') {
      text += `Pitch Ratio: ${pitchRatio} | Angle: ${roofAngleDeg.toFixed(1)}° | Slope: ${slopePercentage.toFixed(1)}%\nRafter Length: ${rafterLengthFt.toFixed(2)} ft (${rafterLengthInches.toFixed(1)}")`;
    } else if (tool === 'stair') {
      text += `Risers: ${numRisers} @ ${actualRiserHeight.toFixed(2)}" height\nTreads: ${numTreads} @ ${targetTreadInches}" run\nStringer: ${(stringerLengthInches / 12).toFixed(2)} ft\nIRC Compliant: ${isIrcCompliant ? 'PASS' : 'FAIL'}`;
    } else if (tool === 'concrete') {
      text += `Volume: ${concreteCuYards.toFixed(2)} yd³ (${concreteCuFtWithWaste.toFixed(1)} cu ft w/ ${concreteWastePct}% waste)\nBags (${bagSize} lb): ${totalBagsNeeded} bags (~$${totalConcreteCost.toFixed(0)})`;
    } else if (tool === 'gravel') {
      text += `Volume: ${gravelCuYards.toFixed(2)} yd³ | Weight: ${gravelWeightTons.toFixed(2)} tons (${gravelWeightKg.toFixed(0)} kg)`;
    } else if (tool === 'fence') {
      text += `Fence Length: ${fenceLengthFt} ft\nPosts: ${totalFencePosts} | Rails: ${totalRails} | Pickets: ${totalPickets} | Concrete: ${postConcreteBags} bags`;
    } else if (tool === 'drywall') {
      text += `Net Area: ${netDrywallArea.toFixed(0)} sq ft\nSheets (${sheetSize}): ${drywallSheetsNeeded} sheets | Screws: ~${drywallScrewsLbs} lbs | Tape: ${jointTapeRolls} roll(s)`;
    } else {
      text += `Net Floor Area: ${rawFloorArea} sq ft | With ${patternWastePct}% Waste: ${totalFloorAreaWithWaste.toFixed(0)} sq ft\nBoxes Needed: ${boxesNeeded} boxes (~$${totalFlooringCost.toFixed(0)})`;
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
            Construction Engineering
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

      {/* Professional 2-Column Split: Left Inputs, Right Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Project Dimensions &amp; Inputs</span>
              <span className="text-slate-400 font-normal lowercase">input parameters</span>
            </h3>

            {tool === 'roof-pitch' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                    Roof Rise (inches per 12" run)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={roofRiseInches}
                    onChange={(e) => setRoofRiseInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Building Span / Width (ft)
                  </label>
                  <input
                    type="number"
                    value={roofSpanFt}
                    onChange={(e) => setRoofSpanFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Eave Overhang (inches)
                  </label>
                  <input
                    type="number"
                    value={overhangInches}
                    onChange={(e) => setOverhangInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Roof Run Standard (in)
                  </label>
                  <input
                    type="number"
                    value={roofRunInches}
                    disabled
                    className="w-full p-2.5 border border-slate-200 rounded-[4px] bg-slate-100 font-mono text-sm text-slate-500"
                  />
                </div>
              </div>
            )}

            {tool === 'stair' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Total Rise / Floor Height (in)
                  </label>
                  <input
                    type="number"
                    value={floorHeightInches}
                    onChange={(e) => setFloorHeightInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">9 ft ceiling = 108"</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Target Riser (in)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={targetRiserInches}
                    onChange={(e) => setTargetRiserInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">IRC Max: 7.75"</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Target Tread Run (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetTreadInches}
                    onChange={(e) => setTargetTreadInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">IRC Min: 10.0"</span>
                </div>
              </div>
            )}

            {tool === 'concrete' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  {(['slab', 'column', 'footing'] as const).map(shape => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setConcreteShape(shape)}
                      className={`px-4 py-2 rounded-[4px] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        concreteShape === shape
                          ? 'bg-[#8A244B] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>

                {concreteShape === 'slab' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Length (ft)
                      </label>
                      <input
                        type="number"
                        value={slabLengthFt}
                        onChange={(e) => setSlabLengthFt(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Width (ft)
                      </label>
                      <input
                        type="number"
                        value={slabWidthFt}
                        onChange={(e) => setSlabWidthFt(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Thickness (in)
                      </label>
                      <input
                        type="number"
                        value={slabThicknessInches}
                        onChange={(e) => setSlabThicknessInches(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {concreteShape === 'column' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Diameter (in)
                      </label>
                      <input
                        type="number"
                        value={columnDiameterInches}
                        onChange={(e) => setColumnDiameterInches(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Height (ft)
                      </label>
                      <input
                        type="number"
                        value={columnHeightFt}
                        onChange={(e) => setColumnHeightFt(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Waste Margin (%)
                    </label>
                    <input
                      type="number"
                      value={concreteWastePct}
                      onChange={(e) => setConcreteWastePct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Pre-Mix Bag Size
                    </label>
                    <select
                      value={bagSize}
                      onChange={(e) => setBagSize(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    >
                      <option value={80}>80 lb Bag (0.60 cu ft)</option>
                      <option value={60}>60 lb Bag (0.45 cu ft)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Price / Bag ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pricePerBag}
                      onChange={(e) => setPricePerBag(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool === 'gravel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Length (ft)</label>
                  <input
                    type="number"
                    value={gravelLengthFt}
                    onChange={(e) => setGravelLengthFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Width (ft)</label>
                  <input
                    type="number"
                    value={gravelWidthFt}
                    onChange={(e) => setGravelWidthFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Layer Depth (in)</label>
                  <select
                    value={gravelDepthInches}
                    onChange={(e) => setGravelDepthInches(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  >
                    <option value={2}>2" (Decorative / Path)</option>
                    <option value={3}>3" (Standard Driveway)</option>
                    <option value={4}>4" (Heavy Duty Base)</option>
                    <option value={6}>6" (Sub-base Foundation)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Stone Density</label>
                  <select
                    value={stoneDensityTonsPerYard}
                    onChange={(e) => setStoneDensityTonsPerYard(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  >
                    <option value={1.4}>Crushed Stone / Gravel (~1.4 t/yd³)</option>
                    <option value={1.3}>Pea Gravel (~1.3 t/yd³)</option>
                    <option value={1.5}>River Rock / Dense (~1.5 t/yd³)</option>
                  </select>
                </div>
              </div>
            )}

            {tool === 'fence' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Total Length (ft)</label>
                  <input
                    type="number"
                    value={fenceLengthFt}
                    onChange={(e) => setFenceLengthFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Height (ft)</label>
                  <select
                    value={fenceHeightFt}
                    onChange={(e) => setFenceHeightFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  >
                    <option value={4}>4 ft (Picket)</option>
                    <option value={6}>6 ft (Privacy)</option>
                    <option value={8}>8 ft (Tall Security)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Post Spacing</label>
                  <select
                    value={postSpacingFt}
                    onChange={(e) => setPostSpacingFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  >
                    <option value={6}>6 ft (High Wind)</option>
                    <option value={8}>8 ft (Standard)</option>
                  </select>
                </div>
              </div>
            )}

            {tool === 'drywall' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Length (ft)</label>
                    <input
                      type="number"
                      value={roomLengthFt}
                      onChange={(e) => setRoomLengthFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Width (ft)</label>
                    <input
                      type="number"
                      value={roomWidthFt}
                      onChange={(e) => setRoomWidthFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Ceiling Height (ft)</label>
                    <input
                      type="number"
                      value={roomCeilingHeightFt}
                      onChange={(e) => setRoomCeilingHeightFt(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Sheet Size</label>
                    <select
                      value={sheetSize}
                      onChange={(e) => setSheetSize(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-medium"
                    >
                      <option value="4x8">4' × 8' Sheet (32 sq ft)</option>
                      <option value="4x12">4' × 12' Sheet (48 sq ft)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Door Openings</label>
                    <input
                      type="number"
                      value={doorCount}
                      onChange={(e) => setDoorCount(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Window Openings</label>
                    <input
                      type="number"
                      value={windowCount}
                      onChange={(e) => setWindowCount(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool === 'flooring' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Room Length (ft)</label>
                  <input
                    type="number"
                    value={floorRoomLengthFt}
                    onChange={(e) => setFloorRoomLengthFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Room Width (ft)</label>
                  <input
                    type="number"
                    value={floorRoomWidthFt}
                    onChange={(e) => setFloorRoomWidthFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Installation Pattern</label>
                  <select
                    value={installPattern}
                    onChange={(e) => setInstallPattern(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-medium"
                  >
                    <option value="straight">Straight Plank (10% Waste)</option>
                    <option value="diagonal">Diagonal Pattern (15% Waste)</option>
                    <option value="herringbone">Herringbone / Parquet (20% Waste)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Box Coverage (sq ft)</label>
                  <input
                    type="number"
                    value={boxCoverageSqFt}
                    onChange={(e) => setBoxCoverageSqFt(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Calculate button for construction inputs */}
          <div className="p-4 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90">
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full py-3 px-5 text-sm font-extrabold rounded-[4px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all bg-[#8A244B] hover:bg-[#721C3D] text-white"
            >
              <Hammer className="w-4 h-4" />
              {hasChanges ? 'Apply & Calculate Estimate' : 'Calculate Estimate'}
            </button>
            {hasChanges && (
              <p className="text-xs text-amber-800 font-semibold text-center mt-2 bg-amber-50 border border-amber-200 py-1.5 px-2 rounded-[4px]">
                Dimensions modified. Click "Apply & Calculate Estimate" to view updated outputs.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {hasChanges && (
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full py-2.5 px-4 bg-[#8A244B] hover:bg-[#721C3D] text-white text-xs font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Hammer className="w-4 h-4" />
              Apply Changes &amp; Recalculate
            </button>
          )}
          {tool === 'roof-pitch' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Calculated Rafter Length (Half-Span + Overhang)
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {rafterLengthFt.toFixed(2)}
                </span>
                <span className="text-sm text-slate-600 font-bold">ft ({rafterLengthInches.toFixed(1)}")</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Pitch Ratio</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{pitchRatio}</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Roof Angle</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{roofAngleDeg.toFixed(1)}°</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Slope Percentage</span>
                  <span className="font-mono text-base font-bold text-slate-800">{slopePercentage.toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Total Run</span>
                  <span className="font-mono text-base font-bold text-slate-800">{(totalRunInches / 12).toFixed(1)} ft</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'stair' && (
            <>
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Required Riser Count
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    {numRisers}
                  </span>
                  <span className="text-sm text-slate-600 font-bold">risers @ {actualRiserHeight.toFixed(2)}"</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Tread Count</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">{numTreads} steps</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Stringer Length</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">{(stringerLengthInches / 12).toFixed(2)} ft</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Horizontal Run</span>
                    <span className="font-mono text-base font-bold text-slate-800">{(totalStairRunInches / 12).toFixed(1)} ft</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Incline Angle</span>
                    <span className="font-mono text-base font-bold text-slate-800">{stairAngleDeg.toFixed(1)}°</span>
                  </div>
                </div>
              </div>

              {/* Building code alert box */}
              <div className={`p-4 rounded-[4px] border text-xs flex items-start gap-2.5 ${
                isIrcCompliant ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isIrcCompliant ? 'text-green-700' : 'text-red-600'}`} />
                <div>
                  <span className="font-extrabold block">IRC Building Code Section R311.7:</span>
                  {isIrcCompliant ? (
                    <span>Compliant with standard residential building code (riser &le; 7.75", tread &ge; 10").</span>
                  ) : (
                    <span>Warning: Dimensions exceed residential code limits. Riser must be 7.75" or less, tread run 10.0" or greater.</span>
                  )}
                </div>
              </div>
            </>
          )}

          {tool === 'concrete' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Total Concrete Volume
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {concreteCuYards.toFixed(2)}
                </span>
                <span className="text-sm text-slate-600 font-bold">cubic yards</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">{bagSize} lb Bags Needed</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{totalBagsNeeded} bags</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Estimated Cost</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">${totalConcreteCost.toFixed(0)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Cubic Feet (w/ waste)</span>
                  <span className="font-mono text-base font-bold text-slate-800">{concreteCuFtWithWaste.toFixed(1)} cu ft</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Waste Allowance</span>
                  <span className="font-mono text-base font-bold text-slate-800">{concreteWastePct}%</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'gravel' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Estimated Gravel Weight
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
                  {gravelWeightTons.toFixed(2)}
                </span>
                <span className="text-sm text-slate-600 font-bold">tons ({gravelWeightKg.toFixed(0)} kg)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Volume (Yards)</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{gravelCuYards.toFixed(2)} yd³</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Volume (Cu Ft)</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{gravelCuFt.toFixed(1)} cu ft</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'fence' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Total Fence Posts Needed
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {totalFencePosts}
                </span>
                <span className="text-sm text-slate-600 font-bold">posts</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Pickets</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{totalPickets} pickets</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Rails</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{totalRails} rails</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Post Concrete</span>
                  <span className="font-mono text-base font-bold text-slate-800">{postConcreteBags} bags</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Post Spacing</span>
                  <span className="font-mono text-base font-bold text-slate-800">{postSpacingFt} ft</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'drywall' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Drywall Sheets Required ({sheetSize})
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {drywallSheetsNeeded}
                </span>
                <span className="text-sm text-slate-600 font-bold">sheets (10% waste)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Net Surface</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{netDrywallArea.toFixed(0)} sq ft</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Screws</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">~{drywallScrewsLbs} lbs</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Joint Tape</span>
                  <span className="font-mono text-base font-bold text-slate-800">{jointTapeRolls} roll(s)</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Compound Mud</span>
                  <span className="font-mono text-base font-bold text-slate-800">{Math.ceil(drywallSheetsNeeded / 10)} bucket(s)</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'flooring' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Flooring Boxes Required
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {boxesNeeded}
                </span>
                <span className="text-sm text-slate-600 font-bold">boxes ({boxCoverageSqFt} sq ft/box)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Total with {patternWastePct}% Waste</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{totalFloorAreaWithWaste.toFixed(0)} sq ft</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Estimated Cost</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">${totalFlooringCost.toFixed(0)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Net Floor Area</span>
                  <span className="font-mono text-base font-bold text-slate-800">{rawFloorArea} sq ft</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Pattern Waste</span>
                  <span className="font-mono text-base font-bold text-slate-800">{patternWastePct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
