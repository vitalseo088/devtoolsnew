import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, ChevronLeft, ChevronRight, Grid, Monitor, Eye, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState<boolean>(false);

  // 4.8 Screen Size
  const [diagonalInches, setDiagonalInches] = useState<number>(27);
  const [aspectRatioStr, setAspectRatioStr] = useState<string>('16:9');
  const [unitMetric, setUnitMetric] = useState<boolean>(false);

  // 4.9 Aspect Ratio
  const [arWidth, setArWidth] = useState<number>(1920);
  const [arHeight, setArHeight] = useState<number>(1080);
  const [targetWidth, setTargetWidth] = useState<number>(1280);

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

  const copySummary = () => {
    let text = `${titles[tool]} Summary:\n`;
    if (tool === 'screen-size') {
      text += `Diagonal: ${diagonalInches}" (${aspectRatioStr})\nWidth: ${calcWidthIn.toFixed(2)}" (${calcWidthCm.toFixed(1)} cm)\nHeight: ${calcHeightIn.toFixed(2)}" (${calcHeightCm.toFixed(1)} cm)\nViewable Area: ${calcAreaSqIn.toFixed(1)} sq in (${calcAreaSqCm.toFixed(0)} cm²)`;
    } else if (tool === 'aspect-ratio') {
      text += `Original: ${arWidth} × ${arHeight} (${simplifiedRatio})\nDecimal Ratio: ${(arWidth / (arHeight || 1)).toFixed(3)}:1\nScaled to ${targetWidth}px Width: ${targetWidth} × ${computedTargetHeight} px`;
    } else if (tool === 'ppi') {
      text += `Resolution: ${resH} × ${resV} on ${ppiDiag}" display\nPPI: ${calculatedPpi.toFixed(1)} PPI\nDot Pitch: ${dotPitchMm} mm\nTotal Pixels: ${totalPixels.toLocaleString()}`;
    } else {
      text += `Current Test Color: ${testColors[currentColorIdx].name}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tool === 'dead-pixel') {
    return (
      <div className="space-y-5">
        <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
              Display Quality
            </span>
            <h2 className="text-lg font-bold text-[#111F35]">{titles[tool]}</h2>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2 font-bold text-xs bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Test'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentColorIdx((currentColorIdx - 1 + testColors.length) % testColors.length)}
                    className="px-3 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev Color
                  </button>
                  <button
                    onClick={() => setCurrentColorIdx((currentColorIdx + 1) % testColors.length)}
                    className="px-3 py-1.5 bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    Next Color <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-slate-800 ml-1">
                    {testColors[currentColorIdx].name} ({currentColorIdx + 1}/{testColors.length})
                  </span>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded-[2px] text-[#8A244B]"
                  />
                  <span>Show Alignment Grid</span>
                </label>
              </div>

              {/* Test Viewport Screen */}
              <div
                className={`rounded-[4px] border border-slate-300 relative flex items-center justify-center transition-colors cursor-pointer select-none ${
                  isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-80'
                }`}
                style={{ backgroundColor: testColors[currentColorIdx].color }}
                onClick={() => setCurrentColorIdx((currentColorIdx + 1) % testColors.length)}
              >
                {showGrid && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                )}
                <div className="text-xs px-3.5 py-2 rounded-[4px] bg-black/70 text-white backdrop-blur-sm pointer-events-none font-medium">
                  Click viewport or press Space / Arrow keys to cycle colors • Esc to exit
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] text-xs text-slate-600 space-y-3">
              <span className="font-extrabold text-slate-800 uppercase tracking-wider block pb-1 border-b border-slate-100">
                Diagnostic Inspection Guide
              </span>
              <p>• <strong className="text-slate-900">Dead Pixels:</strong> Permanently off subpixels that show as black dots on white or solid color screens.</p>
              <p>• <strong className="text-slate-900">Stuck Pixels:</strong> Subpixels stuck permanently illuminated (red, green, blue) on dark backgrounds.</p>
              <p>• <strong className="text-slate-900">Screen Uniformity:</strong> Check for back-light bleed around bezel edges using the 50% neutral gray palette.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Display &amp; Optics
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
              <span>Display Specifications</span>
              <span className="text-slate-400 font-normal lowercase">input measurements</span>
            </h3>

            {tool === 'screen-size' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Diagonal Screen Size (inches)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={diagonalInches}
                      onChange={(e) => setDiagonalInches(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Aspect Ratio Format
                    </label>
                    <select
                      value={aspectRatioStr}
                      onChange={(e) => setAspectRatioStr(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 text-xs font-bold"
                    >
                      <option value="16:9">16:9 (Standard Widescreen / 1080p / 4K)</option>
                      <option value="16:10">16:10 (MacBook / Dell XPS)</option>
                      <option value="21:9">21:9 (Ultrawide Monitor)</option>
                      <option value="32:9">32:9 (Super Ultrawide)</option>
                      <option value="4:3">4:3 (Classic / iPad)</option>
                      <option value="3:2">3:2 (Microsoft Surface)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={unitMetric}
                      onChange={(e) => setUnitMetric(e.target.checked)}
                      className="rounded-[2px] text-[#8A244B]"
                    />
                    <span>Display measurements in Metric (cm / cm²)</span>
                  </label>
                </div>
              </div>
            )}

            {tool === 'aspect-ratio' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Original Width (px)
                    </label>
                    <input
                      type="number"
                      value={arWidth}
                      onChange={(e) => setArWidth(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Original Height (px)
                    </label>
                    <input
                      type="number"
                      value={arHeight}
                      onChange={(e) => setArHeight(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                    Target Resized Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-[#8A244B]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Calculates exact height to preserve aspect ratio without distortion</span>
                </div>
              </div>
            )}

            {tool === 'ppi' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Diagonal Size (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={ppiDiag}
                      onChange={(e) => setPpiDiag(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Horizontal Pixels
                    </label>
                    <input
                      type="number"
                      value={resH}
                      onChange={(e) => setResH(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Vertical Pixels
                    </label>
                    <input
                      type="number"
                      value={resV}
                      onChange={(e) => setResV(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { label: '1080p (24")', d: 24, w: 1920, h: 1080 },
                    { label: '1440p (27")', d: 27, w: 2560, h: 1440 },
                    { label: '4K UHD (32")', d: 32, w: 3840, h: 2160 },
                    { label: 'MacBook 16" (Retina)', d: 16.2, w: 3456, h: 2234 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setPpiDiag(p.d);
                        setResH(p.w);
                        setResV(p.h);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-[4px] text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {tool === 'screen-size' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Total Viewable Screen Area
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {unitMetric ? `${calcAreaSqCm.toFixed(0)}` : `${calcAreaSqIn.toFixed(1)}`}
                </span>
                <span className="text-sm text-slate-600 font-bold">
                  {unitMetric ? 'cm²' : 'sq inches'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Physical Width</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">
                    {unitMetric ? `${calcWidthCm.toFixed(1)} cm` : `${calcWidthIn.toFixed(2)}"`}
                  </span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Physical Height</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">
                    {unitMetric ? `${calcHeightCm.toFixed(1)} cm` : `${calcHeightIn.toFixed(2)}"`}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Aspect Ratio</span>
                  <span className="font-mono text-base font-bold text-[#2E7D32]">{aspectRatioStr}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Diagonal</span>
                  <span className="font-mono text-base font-bold text-slate-800">{diagonalInches}"</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'aspect-ratio' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Simplified Aspect Ratio
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {simplifiedRatio}
                </span>
                <span className="text-xs text-slate-500 font-bold">({(arWidth / (arHeight || 1)).toFixed(3)}:1)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Scaled Height</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{computedTargetHeight} px</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Target Width</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{targetWidth} px</span>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">New Resolution</span>
                  <span className="font-mono text-base font-bold text-slate-800">{targetWidth} × {computedTargetHeight} px</span>
                </div>
              </div>
            </div>
          )}

          {tool === 'ppi' && (
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Pixel Density
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                  {calculatedPpi.toFixed(1)}
                </span>
                <span className="text-sm text-slate-600 font-bold">PPI</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Dot Pitch</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{dotPitchMm} mm</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Megapixels</span>
                  <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{(totalPixels / 1000000).toFixed(2)} MP</span>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Classification</span>
                  <span className="font-mono text-base font-bold text-slate-800">
                    {calculatedPpi >= 200 ? 'High-DPI / Retina Display' : calculatedPpi >= 110 ? 'Standard Desktop Monitor' : 'Large Format TV / Display'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
