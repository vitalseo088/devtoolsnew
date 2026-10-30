import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, ChevronLeft, ChevronRight, Grid, Monitor, Eye } from 'lucide-react';

interface Props {
  tool: 'dead-pixel' | 'screen-size' | 'aspect-ratio' | 'ppi';
}

export const DisplayCalculators: React.FC<Props> = ({ tool }) => {
  // 4.7 Dead Pixel Test
  const testColors = [
    { name: 'Black (Stuck Bright Pixels)', color: '#000000', text: '#FFFFFF' },
    { name: 'Pure White (Dead Dark Pixels)', color: '#FFFFFF', text: '#000000' },
    { name: 'Pure Red (Subpixel Inspection)', color: '#FF0000', text: '#FFFFFF' },
    { name: 'Pure Green (Subpixel Inspection)', color: '#00FF00', text: '#000000' },
    { name: 'Pure Blue (Subpixel Inspection)', color: '#0000FF', text: '#FFFFFF' },
    { name: 'Cyan', color: '#00FFFF', text: '#000000' },
    { name: 'Magenta', color: '#FF00FF', text: '#FFFFFF' },
    { name: 'Yellow', color: '#FFFF00', text: '#000000' },
    { name: '50% Neutral Gray (Uniformity)', color: '#808080', text: '#FFFFFF' },
  ];
  const [currentColorIdx, setCurrentColorIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // 4.8 Screen Size
  const [diagonalInches, setDiagonalInches] = useState<number>(27);
  const [aspectRatioStr, setAspectRatioStr] = useState<string>('16:9');
  const [unitMetric, setUnitMetric] = useState<boolean>(false);

  // 4.9 Aspect Ratio
  const [arWidth, setArWidth] = useState<number>(1920);
  const [arHeight, setArHeight] = useState<number>(1080);
  const [targetWidth, setTargetWidth] = useState<number>(1280);
  const [lockRatio, setLockRatio] = useState<boolean>(true);

  // 4.10 PPI
  const [ppiDiag, setPpiDiag] = useState<number>(27);
  const [resH, setResH] = useState<number>(2560);
  const [resV, setResV] = useState<number>(1440);

  // Keyboard navigation for dead pixel
  useEffect(() => {
    if (tool !== 'dead-pixel') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentColorIdx((prev) => (prev + 1) % testColors.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentColorIdx((prev) => (prev - 1 + testColors.length) % testColors.length);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tool, isFullscreen]);

  // Screen Size Math
  const [arW, arH] = aspectRatioStr.split(':').map(Number);
  // angle = atan(arH / arW)
  const angle = Math.atan((arH || 9) / (arW || 16));
  const calcWidthIn = diagonalInches * Math.cos(angle);
  const calcHeightIn = diagonalInches * Math.sin(angle);
  const calcAreaSqIn = calcWidthIn * calcHeightIn;
  const calcWidthCm = calcWidthIn * 2.54;
  const calcHeightCm = calcHeightIn * 2.54;
  const calcAreaSqCm = calcWidthCm * calcHeightCm;

  // Aspect Ratio GCD Simplifier
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(arWidth), Math.round(arHeight));
  const simplifiedRatio = divisor > 0 ? `${Math.round(arWidth / divisor)}:${Math.round(arHeight / divisor)}` : '16:9';
  const computedTargetHeight = arWidth > 0 ? Math.round((targetWidth * arHeight) / arWidth) : 0;

  // PPI Math
  const diagonalPixels = Math.sqrt(Math.pow(resH, 2) + Math.pow(resV, 2));
  const calculatedPpi = ppiDiag > 0 ? diagonalPixels / ppiDiag : 0;
  const totalPixels = resH * resV;
  const dotPitchMm = calculatedPpi > 0 ? (25.4 / calculatedPpi).toFixed(4) : '0';

  const titles = {
    'dead-pixel': 'Dead & Stuck Pixel Screen Inspection Test',
    'screen-size': 'Screen Physical Dimensions & Display Area Calculator',
    'aspect-ratio': 'Aspect Ratio Simplifier & Scaling Calculator',
    'ppi': 'Pixels Per Inch (PPI) & Density Calculator',
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[tool]}
        </span>

        {tool === 'dead-pixel' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentColorIdx((currentColorIdx - 1 + testColors.length) % testColors.length)}
                  className="px-2.5 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Color
                </button>
                <button
                  onClick={() => setCurrentColorIdx((currentColorIdx + 1) % testColors.length)}
                  className="px-2.5 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 font-semibold"
                >
                  Next Color <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-slate-800 ml-2">
                  {testColors[currentColorIdx].name} ({currentColorIdx + 1}/{testColors.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded-[2px] text-[#8A244B]"
                  />
                  <span>Show Alignment Grid</span>
                </label>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="px-3 py-1.5 font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
                >
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </button>
              </div>
            </div>

            {/* Test Viewport Screen */}
            <div
              className={`rounded-[4px] border border-slate-300 relative flex items-center justify-center transition-colors cursor-pointer select-none ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-64'
              }`}
              style={{ backgroundColor: testColors[currentColorIdx].color }}
              onClick={() => setCurrentColorIdx((currentColorIdx + 1) % testColors.length)}
            >
              {showGrid && (
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              )}
              <div
                className="text-xs px-3 py-1.5 rounded-[4px] bg-black/60 text-white backdrop-blur-sm pointer-events-none"
              >
                Click or press Space / Arrow keys to cycle colors • Esc to exit
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">How to Identify Display Defects:</span>
              <p>• <strong>Dead Pixels:</strong> Permanently off subpixels that appear black on a white or colored screen.</p>
              <p>• <strong>Stuck Pixels:</strong> Subpixels stuck permanently on red, green, or blue that shine bright on black backgrounds.</p>
            </div>
          </div>
        )}

        {tool === 'screen-size' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Diagonal Screen Size (inches):</label>
              <input
                type="number"
                step="0.5"
                value={diagonalInches}
                onChange={(e) => setDiagonalInches(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold text-[#8A244B]"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Aspect Ratio:</label>
              <select
                value={aspectRatioStr}
                onChange={(e) => setAspectRatioStr(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-medium"
              >
                <option value="16:9">16:9 (Standard Widescreen)</option>
                <option value="16:10">16:10 (MacBook / Productivity)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
                <option value="32:9">32:9 (Super Ultrawide)</option>
                <option value="4:3">4:3 (Legacy / iPad)</option>
                <option value="3:2">3:2 (Surface / Modern Laptops)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={unitMetric}
                  onChange={(e) => setUnitMetric(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B]"
                />
                <span>Show Metric Units (cm / cm²)</span>
              </label>
            </div>
          </div>
        )}

        {tool === 'aspect-ratio' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Original Width (px):</label>
              <input
                type="number"
                value={arWidth}
                onChange={(e) => setArWidth(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Original Height (px):</label>
              <input
                type="number"
                value={arHeight}
                onChange={(e) => setArHeight(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Resized Width:</label>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => setTargetWidth(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Locked Height Result:</label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-[4px] font-mono font-bold text-[#8A244B]">
                {computedTargetHeight} px
              </div>
            </div>
          </div>
        )}

        {tool === 'ppi' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Diagonal Size (inches):</label>
              <input
                type="number"
                step="0.5"
                value={ppiDiag}
                onChange={(e) => setPpiDiag(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Horizontal Resolution (px):</label>
              <input
                type="number"
                value={resH}
                onChange={(e) => setResH(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vertical Resolution (px):</label>
              <input
                type="number"
                value={resV}
                onChange={(e) => setResV(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tool === 'screen-size' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Physical Width</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {unitMetric ? `${calcWidthCm.toFixed(1)} cm` : `${calcWidthIn.toFixed(2)} in`}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Physical Height</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {unitMetric ? `${calcHeightCm.toFixed(1)} cm` : `${calcHeightIn.toFixed(2)} in`}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Viewable Area</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {unitMetric ? `${calcAreaSqCm.toFixed(0)} cm²` : `${calcAreaSqIn.toFixed(1)} sq in`}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Aspect Ratio</span>
              <span className="font-mono text-lg font-bold text-slate-700">
                {aspectRatioStr}
              </span>
            </div>
          </>
        )}

        {tool === 'aspect-ratio' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Simplified Ratio</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {simplifiedRatio}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Decimal Ratio</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {(arWidth / (arHeight || 1)).toFixed(3)}:1
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Scaled Dimensions</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {targetWidth} × {computedTargetHeight}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Megapixels</span>
              <span className="font-mono text-lg font-bold text-slate-700">
                {((arWidth * arHeight) / 1000000).toFixed(2)} MP
              </span>
            </div>
          </>
        )}

        {tool === 'ppi' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Pixel Density</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {calculatedPpi.toFixed(1)} PPI
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Pixels</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {totalPixels.toLocaleString()} ({(totalPixels / 1000000).toFixed(2)} MP)
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Dot Pitch</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {dotPitchMm} mm
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Display Category</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {calculatedPpi >= 200 ? 'High-DPI / Retina' : calculatedPpi >= 110 ? 'Standard Desktop' : 'Large Format'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
