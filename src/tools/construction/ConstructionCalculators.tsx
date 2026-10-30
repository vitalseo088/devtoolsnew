import React, { useState } from 'react';
import { Hammer, Ruler, Layers, AlertCircle, Check, DollarSign } from 'lucide-react';

interface Props {
  tool: 'roof-pitch' | 'stair' | 'concrete' | 'deck-board' | 'gravel' | 'fence' | 'drywall' | 'flooring';
}

export const ConstructionCalculators: React.FC<Props> = ({ tool }) => {
  // 5.1 Roof Pitch
  const [roofRiseInches, setRoofRiseInches] = useState<number>(6); // 6:12 standard
  const [roofRunInches, setRoofRunInches] = useState<number>(12);
  const [roofSpanFt, setRoofSpanFt] = useState<number>(24); // Building width
  const [overhangInches, setOverhangInches] = useState<number>(12);

  // 5.2 Stair
  const [floorHeightInches, setFloorHeightInches] = useState<number>(108); // 9 ft
  const [targetRiserInches, setTargetRiserInches] = useState<number>(7.5); // standard 7-7.75"
  const [targetTreadInches, setTargetTreadInches] = useState<number>(10.5); // standard 10-11"

  // 5.3 Concrete Volume
  const [concreteShape, setConcreteShape] = useState<'slab' | 'column' | 'footing'>('slab');
  const [slabLengthFt, setSlabLengthFt] = useState<number>(20);
  const [slabWidthFt, setSlabWidthFt] = useState<number>(10);
  const [slabThicknessInches, setSlabThicknessInches] = useState<number>(4);
  const [columnDiameterInches, setColumnDiameterInches] = useState<number>(12);
  const [columnHeightFt, setColumnHeightFt] = useState<number>(8);
  const [concreteWastePct, setConcreteWastePct] = useState<number>(10);
  const [bagSize, setBagSize] = useState<number>(80); // 80 lb bag = 0.60 cu ft
  const [pricePerBag, setPricePerBag] = useState<number>(6.50);

  // 5.4 Deck Board (Already in seller, but customized for structural construction)
  const [cDeckLengthFt, setCDeckLengthFt] = useState<number>(24);
  const [cDeckWidthFt, setCDeckWidthFt] = useState<number>(14);
  const [cBoardWidthInches, setCBoardWidthInches] = useState<number>(5.5);
  const [cBoardLengthFt, setCBoardLengthFt] = useState<number>(16);

  // 5.5 Gravel
  const [gravelLengthFt, setGravelLengthFt] = useState<number>(20);
  const [gravelWidthFt, setGravelWidthFt] = useState<number>(10);
  const [gravelDepthInches, setGravelDepthInches] = useState<number>(3);
  const [stoneDensityTonsPerYard, setStoneDensityTonsPerYard] = useState<number>(1.4); // ~1.4 tons/yd³ for crushed stone

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

  // Calculations:
  // 5.1 Roof Pitch
  const pitchRatio = `${roofRiseInches}:12`;
  const roofAngleDeg = (Math.atan(roofRiseInches / roofRunInches) * 180) / Math.PI;
  const slopePercentage = (roofRiseInches / roofRunInches) * 100;
  // rafter length for half-span + overhang
  const halfSpanInches = (roofSpanFt * 12) / 2;
  const totalRunInches = halfSpanInches + overhangInches;
  const rafterLengthInches = Math.sqrt(Math.pow(totalRunInches, 2) + Math.pow((totalRunInches * (roofRiseInches / 12)), 2));
  const rafterLengthFt = rafterLengthInches / 12;

  // 5.2 Stair Math & Building Code
  const numRisers = Math.round(floorHeightInches / targetRiserInches);
  const actualRiserHeight = floorHeightInches / (numRisers || 1);
  const numTreads = Math.max(1, numRisers - 1);
  const totalStairRunInches = numTreads * targetTreadInches;
  const stairAngleDeg = (Math.atan(actualRiserHeight / targetTreadInches) * 180) / Math.PI;
  const stringerLengthInches = Math.sqrt(Math.pow(floorHeightInches, 2) + Math.pow(totalStairRunInches, 2));

  // IRC Building Code checks: Riser <= 7.75", Tread >= 10", 2R + T between 24" and 25"
  const isIrcCompliant = actualRiserHeight <= 7.75 && targetTreadInches >= 10.0;

  // 5.3 Concrete Volume
  let concreteCuFt = 0;
  if (concreteShape === 'slab') {
    concreteCuFt = slabLengthFt * slabWidthFt * (slabThicknessInches / 12);
  } else if (concreteShape === 'column') {
    const radiusFt = (columnDiameterInches / 2) / 12;
    concreteCuFt = Math.PI * Math.pow(radiusFt, 2) * columnHeightFt;
  } else {
    // Footing
    concreteCuFt = slabLengthFt * (slabWidthFt) * (slabThicknessInches / 12);
  }
  const concreteCuFtWithWaste = concreteCuFt * (1 + concreteWastePct / 100);
  const concreteCuYards = concreteCuFtWithWaste / 27;
  const concreteCuMeters = concreteCuYards * 0.764555;
  // Bag requirements: 80lb bag yields ~0.60 cu ft, 60lb bag yields ~0.45 cu ft
  const cuFtPerBag = bagSize === 80 ? 0.60 : 0.45;
  const totalBagsNeeded = Math.ceil(concreteCuFtWithWaste / cuFtPerBag);
  const totalConcreteCost = totalBagsNeeded * pricePerBag;

  // 5.5 Gravel
  const gravelAreaSqFt = gravelLengthFt * gravelWidthFt;
  const gravelCuFt = gravelAreaSqFt * (gravelDepthInches / 12);
  const gravelCuYards = gravelCuFt / 27;
  const gravelWeightTons = gravelCuYards * stoneDensityTonsPerYard;
  const gravelWeightKg = gravelWeightTons * 907.185;

  // 5.6 Fence
  const netFenceLength = Math.max(0, fenceLengthFt - (gateCount * gateWidthFt));
  const postSections = Math.ceil(netFenceLength / postSpacingFt);
  const totalFencePosts = postSections + 1 + (gateCount * 2);
  const picketsPerSection = Math.ceil((postSpacingFt * 12) / picketWidthInches);
  const totalPickets = postSections * picketsPerSection;
  const railsPerSection = fenceHeightFt >= 6 ? 3 : 2;
  const totalRails = postSections * railsPerSection;
  const postConcreteBags = totalFencePosts * 2; // ~2 50lb bags per post

  // 5.7 Drywall
  const wallPerimeter = 2 * (roomLengthFt + roomWidthFt);
  const grossWallArea = wallPerimeter * roomCeilingHeightFt;
  const ceilingArea = includeCeiling ? (roomLengthFt * roomWidthFt) : 0;
  const doorsWindowsArea = (doorCount * 21) + (windowCount * 15); // standard 21 sq ft door, 15 sq ft window
  const netDrywallArea = Math.max(0, grossWallArea + ceilingArea - doorsWindowsArea);
  const sheetArea = sheetSize === '4x8' ? 32 : 48;
  const drywallSheetsNeeded = Math.ceil((netDrywallArea * 1.1) / sheetArea); // 10% waste
  const drywallScrewsLbs = Math.ceil(drywallSheetsNeeded * 0.35); // ~1.5 lbs per 4-5 sheets
  const jointTapeRolls = Math.ceil((drywallSheetsNeeded * 35) / 250); // 250 ft roll

  // 5.8 Flooring
  const rawFloorArea = floorRoomLengthFt * floorRoomWidthFt;
  const patternWastePct = installPattern === 'straight' ? 10 : installPattern === 'diagonal' ? 15 : 20;
  const totalFloorAreaWithWaste = rawFloorArea * (1 + patternWastePct / 100);
  const boxesNeeded = Math.ceil(totalFloorAreaWithWaste / boxCoverageSqFt);
  const totalFlooringCost = totalFloorAreaWithWaste * pricePerSqFt;

  const titles = {
    'roof-pitch': 'Roof Pitch, Angle & Rafter Length Calculator',
    'stair': 'Staircase Stringer, Riser & Tread Calculator (IRC Code Check)',
    'concrete': 'Concrete Volume, Yardage & Bag Calculator',
    'deck-board': 'Deck Board Coverage & Fastener Calculator',
    'gravel': 'Gravel, Crushed Stone & Aggregates Calculator',
    'fence': 'Fence Posts, Rails, Pickets & Concrete Calculator',
    'drywall': 'Drywall Sheet, Tape & Joint Compound Calculator',
    'flooring': 'Flooring Area, Installation Pattern & Waste Calculator',
  };

  return (
    <div className="space-y-4">
      {/* Parameters Header */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[tool]}
        </span>

        {tool === 'roof-pitch' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Roof Rise (inches):</label>
              <input
                type="number"
                step="0.5"
                value={roofRiseInches}
                onChange={(e) => setRoofRiseInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold text-[#8A244B]"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Roof Run (standard 12"):</label>
              <input
                type="number"
                value={roofRunInches}
                onChange={(e) => setRoofRunInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Building Span / Width (ft):</label>
              <input
                type="number"
                value={roofSpanFt}
                onChange={(e) => setRoofSpanFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Eave Overhang (inches):</label>
              <input
                type="number"
                value={overhangInches}
                onChange={(e) => setOverhangInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
          </div>
        )}

        {tool === 'stair' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Total Floor-to-Floor Height (in):</label>
              <input
                type="number"
                step="0.5"
                value={floorHeightInches}
                onChange={(e) => setFloorHeightInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold text-[#8A244B]"
              />
              <span className="text-[10px] text-slate-400">Finished floor to finished floor</span>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Riser Height (in):</label>
              <input
                type="number"
                step="0.25"
                value={targetRiserInches}
                onChange={(e) => setTargetRiserInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400">IRC max is 7.75"</span>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Tread Depth (in):</label>
              <input
                type="number"
                step="0.5"
                value={targetTreadInches}
                onChange={(e) => setTargetTreadInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400">IRC min is 10.0"</span>
            </div>
          </div>
        )}

        {tool === 'concrete' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Slab / Project Length (ft):</label>
              <input
                type="number"
                value={slabLengthFt}
                onChange={(e) => setSlabLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Slab Width (ft):</label>
              <input
                type="number"
                value={slabWidthFt}
                onChange={(e) => setSlabWidthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Thickness (inches):</label>
              <select
                value={slabThicknessInches}
                onChange={(e) => setSlabThicknessInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={4}>4" (Patio, Sidewalk, Shed)</option>
                <option value={5}>5" (Standard Garage / Driveway)</option>
                <option value={6}>6" (Heavy Vehicle / Commercial)</option>
                <option value={8}>8" (Structural Footing)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Bag Size / Weight:</label>
              <select
                value={bagSize}
                onChange={(e) => setBagSize(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={80}>80 lb Bag (0.60 cu ft)</option>
                <option value={60}>60 lb Bag (0.45 cu ft)</option>
              </select>
            </div>
          </div>
        )}

        {tool === 'gravel' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Area Length (ft):</label>
              <input
                type="number"
                value={gravelLengthFt}
                onChange={(e) => setGravelLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Area Width (ft):</label>
              <input
                type="number"
                value={gravelWidthFt}
                onChange={(e) => setGravelWidthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Depth (inches):</label>
              <select
                value={gravelDepthInches}
                onChange={(e) => setGravelDepthInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={2}>2" (Decorative / Walkway)</option>
                <option value={3}>3" (Standard Driveway / Path)</option>
                <option value={4}>4" (Heavy Duty Base)</option>
                <option value={6}>6" (Sub-base Foundation)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Material Density:</label>
              <select
                value={stoneDensityTonsPerYard}
                onChange={(e) => setStoneDensityTonsPerYard(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={1.4}>Crushed Stone / Gravel (~1.4 t/yd³)</option>
                <option value={1.3}>Pea Gravel (~1.3 t/yd³)</option>
                <option value={1.5}>River Rock / Dense (~1.5 t/yd³)</option>
              </select>
            </div>
          </div>
        )}

        {tool === 'fence' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Total Fence Length (ft):</label>
              <input
                type="number"
                value={fenceLengthFt}
                onChange={(e) => setFenceLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Fence Height (ft):</label>
              <select
                value={fenceHeightFt}
                onChange={(e) => setFenceHeightFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={4}>4 ft (Picket / Decorative)</option>
                <option value={6}>6 ft (Privacy Standard)</option>
                <option value={8}>8 ft (Tall Security)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Post Spacing (ft):</label>
              <select
                value={postSpacingFt}
                onChange={(e) => setPostSpacingFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={6}>6 ft (High Wind)</option>
                <option value={8}>8 ft (Standard)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Gate Count:</label>
              <input
                type="number"
                min={0}
                value={gateCount}
                onChange={(e) => setGateCount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-center"
              />
            </div>
          </div>
        )}

        {tool === 'drywall' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Room Length (ft):</label>
              <input
                type="number"
                value={roomLengthFt}
                onChange={(e) => setRoomLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Room Width (ft):</label>
              <input
                type="number"
                value={roomWidthFt}
                onChange={(e) => setRoomWidthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Ceiling Height (ft):</label>
              <select
                value={roomCeilingHeightFt}
                onChange={(e) => setRoomCeilingHeightFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value={8}>8 ft (Standard)</option>
                <option value={9}>9 ft (Modern)</option>
                <option value={10}>10 ft (Tall)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Sheet Size:</label>
              <select
                value={sheetSize}
                onChange={(e) => setSheetSize(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value="4x8">4' × 8' (32 sq ft)</option>
                <option value="4x12">4' × 12' (48 sq ft)</option>
              </select>
            </div>
          </div>
        )}

        {tool === 'flooring' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Room Length (ft):</label>
              <input
                type="number"
                value={floorRoomLengthFt}
                onChange={(e) => setFloorRoomLengthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Room Width (ft):</label>
              <input
                type="number"
                value={floorRoomWidthFt}
                onChange={(e) => setFloorRoomWidthFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Install Pattern (Waste %):</label>
              <select
                value={installPattern}
                onChange={(e) => setInstallPattern(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
              >
                <option value="straight">Straight Plank (+10% Waste)</option>
                <option value="diagonal">Diagonal (+15% Waste)</option>
                <option value="herringbone">Herringbone (+20% Waste)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Sq Ft Per Box:</label>
              <input
                type="number"
                step="0.5"
                value={boxCoverageSqFt}
                onChange={(e) => setBoxCoverageSqFt(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tool === 'roof-pitch' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Pitch Ratio</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {pitchRatio}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Roof Angle</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {roofAngleDeg.toFixed(1)}°
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Slope Percentage</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {slopePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Rafter Length</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {rafterLengthFt.toFixed(2)} ft ({rafterLengthInches.toFixed(1)}")
              </span>
            </div>
          </>
        )}

        {tool === 'stair' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Number of Risers</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {numRisers} risers
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Actual Riser Height</span>
              <span className={`font-mono text-lg font-bold ${actualRiserHeight <= 7.75 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
                {actualRiserHeight.toFixed(2)}"
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Horizontal Run</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {(totalStairRunInches / 12).toFixed(1)} ft ({totalStairRunInches.toFixed(0)}")
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Stringer Length</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {(stringerLengthInches / 12).toFixed(2)} ft
              </span>
            </div>
          </>
        )}

        {tool === 'concrete' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Cubic Yards</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {concreteCuYards.toFixed(2)} yd³
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Cubic Feet (w/ {concreteWastePct}% waste)</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {concreteCuFtWithWaste.toFixed(1)} cu ft
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">{bagSize} lb Bags Needed</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {totalBagsNeeded} bags
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Estimated Cost</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ${totalConcreteCost.toFixed(0)}
              </span>
            </div>
          </>
        )}

        {tool === 'gravel' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Volume</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {gravelCuYards.toFixed(2)} yd³ ({gravelCuFt.toFixed(1)} cu ft)
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Estimated Weight (Tons)</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {gravelWeightTons.toFixed(2)} tons
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Weight in Kilograms</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {gravelWeightKg.toFixed(0)} kg
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">0.5 Cu Ft Bags Equivalent</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {Math.ceil(gravelCuFt / 0.5)} bags
              </span>
            </div>
          </>
        )}

        {tool === 'fence' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Fence Posts</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {totalFencePosts} posts
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Horizontal Rails</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {totalRails} rails ({postSpacingFt}')
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Vertical Pickets</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {totalPickets} pickets
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Post Concrete Bags</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {postConcreteBags} bags (50 lb)
              </span>
            </div>
          </>
        )}

        {tool === 'drywall' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Net Surface Area</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {netDrywallArea.toFixed(0)} sq ft
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">{sheetSize} Drywall Sheets</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {drywallSheetsNeeded} sheets
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Drywall Screws</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                ~{drywallScrewsLbs} lbs (1-1/4")
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Joint Tape &amp; Mud</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {jointTapeRolls} roll(s) / {Math.ceil(drywallSheetsNeeded / 10)} bucket(s)
              </span>
            </div>
          </>
        )}

        {tool === 'flooring' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Net Floor Area</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {rawFloorArea} sq ft
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total with {patternWastePct}% Waste</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {totalFloorAreaWithWaste.toFixed(0)} sq ft
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Boxes Needed</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {boxesNeeded} boxes ({boxCoverageSqFt} sq ft/box)
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Estimated Cost</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                ${totalFlooringCost.toFixed(0)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Code Notice for Stairs */}
      {tool === 'stair' && (
        <div className={`p-3 rounded-[4px] border text-xs flex items-start gap-2 ${
          isIrcCompliant ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isIrcCompliant ? 'text-green-700' : 'text-red-600'}`} />
          <div>
            <span className="font-bold">IRC Code Reference (Section R311.7): </span>
            {isIrcCompliant ? (
              <span>Your dimensions ({actualRiserHeight.toFixed(2)}" riser and {targetTreadInches}" tread) pass standard residential building codes (max riser 7-3/4", min tread 10").</span>
            ) : (
              <span>Warning: Dimensions exceed standard building code safety thresholds (Riser must be $\le 7.75"$, Tread $\ge 10.0"$). Adjust riser count or run depth.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
