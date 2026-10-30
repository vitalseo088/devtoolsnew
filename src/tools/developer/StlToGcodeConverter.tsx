import React, { useState } from 'react';
import { Upload, Download, Settings, Check, AlertCircle, Box, Clock, Layers } from 'lucide-react';

interface StlMeshInfo {
  facetCount: number;
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
  dimX: number; dimY: number; dimZ: number;
  volumeCm3: number;
}

export const StlToGcodeConverter: React.FC = () => {
  const [meshInfo, setMeshInfo] = useState<StlMeshInfo | null>(null);
  const [fileName, setFileName] = useState<string>('sample_calibration_cube.stl');
  // Slicing parameters
  const [layerHeight, setLayerHeight] = useState<number>(0.2);
  const [nozzleDiameter, setNozzleDiameter] = useState<number>(0.4);
  const [filamentDiameter, setFilamentDiameter] = useState<number>(1.75);
  const [printSpeed, setPrintSpeed] = useState<number>(50); // mm/s
  const [travelSpeed, setTravelSpeed] = useState<number>(120); // mm/s
  const [infillPercent, setInfillPercent] = useState<number>(20);
  const [wallCount, setWallCount] = useState<number>(2);
  const [bedTemp, setBedTemp] = useState<number>(60);
  const [nozzleTemp, setNozzleTemp] = useState<number>(200);
  const [skirtLoops, setSkirtLoops] = useState<number>(2);
  const [bedWidth, setBedWidth] = useState<number>(220);
  const [bedDepth, setBedDepth] = useState<number>(220);

  const [scale, setScale] = useState<number>(1.0);
  const [gcodeOutput, setGcodeOutput] = useState<string>('');
  const [slicingStats, setSlicingStats] = useState<{
    layers: number;
    filamentMeters: number;
    materialGrams: number;
    estimatedMinutes: number;
  } | null>(null);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with standard 20mm calibration cube
  React.useEffect(() => {
    const cubeInfo: StlMeshInfo = {
      facetCount: 12,
      minX: 0, maxX: 20,
      minY: 0, maxY: 20,
      minZ: 0, maxZ: 20,
      dimX: 20, dimY: 20, dimZ: 20,
      volumeCm3: 8.0,
    };
    setMeshInfo(cubeInfo);
    sliceMesh(cubeInfo, scale);
  }, []);

  // Parse Binary or ASCII STL
  const parseStl = async (file: File) => {
    try {
      setError(null);
      setFileName(file.name);
      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      let facetCount = 0;

      // Check if binary STL (header 80 bytes + 4 bytes uint32 count)
      const isBinary = buffer.byteLength >= 84 &&
        buffer.byteLength === 84 + view.getUint32(80, true) * 50;

      if (isBinary) {
        facetCount = view.getUint32(80, true);
        let offset = 84;
        for (let i = 0; i < facetCount; i++) {
          offset += 12; // skip normal
          for (let v = 0; v < 3; v++) {
            const x = view.getFloat32(offset, true);
            const y = view.getFloat32(offset + 4, true);
            const z = view.getFloat32(offset + 8, true);
            offset += 12;

            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
          }
          offset += 2; // attribute byte count
        }
      } else {
        // ASCII STL
        const text = new TextDecoder().decode(buffer);
        const vertexMatches = text.matchAll(/vertex\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)/g);
        for (const match of vertexMatches) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const z = parseFloat(match[3]);
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
          facetCount++;
        }
        facetCount = Math.floor(facetCount / 3);
      }

      if (facetCount === 0 || minX === Infinity) {
        throw new Error('Could not extract valid mesh triangles from STL.');
      }

      const dimX = Math.max(0.1, maxX - minX);
      const dimY = Math.max(0.1, maxY - minY);
      const dimZ = Math.max(0.1, maxZ - minZ);
      const volumeCm3 = (dimX * dimY * dimZ * 0.4) / 1000; // estimated volume

      const info: StlMeshInfo = {
        facetCount,
        minX, maxX, minY, maxY, minZ, maxZ,
        dimX, dimY, dimZ, volumeCm3
      };
      setMeshInfo(info);
      sliceMesh(info, scale);
    } catch (err: any) {
      setError(err.message || 'Error parsing STL file');
    }
  };

  // Slice model and generate valid G-code toolpaths
  const sliceMesh = (info: StlMeshInfo, modelScale: number) => {
    setIsSlicing(true);
    const scaledX = info.dimX * modelScale;
    const scaledY = info.dimY * modelScale;
    const scaledZ = info.dimZ * modelScale;

    // Bed centering coordinates
    const startX = (bedWidth - scaledX) / 2;
    const startY = (bedDepth - scaledY) / 2;

    const totalLayers = Math.max(1, Math.ceil(scaledZ / layerHeight));
    const lines: string[] = [];

    // Header standard Marlin / RepRap G-code
    lines.push('; Generated by Dev27 Slicer Engine');
    lines.push(`; Model: ${fileName}`);
    lines.push(`; Dimensions: ${scaledX.toFixed(2)} x ${scaledY.toFixed(2)} x ${scaledZ.toFixed(2)} mm`);
    lines.push(`; Total Layers: ${totalLayers} (Layer Height: ${layerHeight}mm)`);
    lines.push('G21 ; metric values');
    lines.push('G90 ; absolute positioning');
    lines.push('M82 ; absolute extrusion mode');
    lines.push(`M140 S${bedTemp} ; set bed temperature`);
    lines.push(`M104 S${nozzleTemp} ; set extruder temperature`);
    lines.push(`M190 S${bedTemp} ; wait for bed temperature`);
    lines.push(`M109 S${nozzleTemp} ; wait for extruder temperature`);
    lines.push('G28 ; home all axes');
    lines.push('G1 Z15.0 F6000 ; move the platform down 15mm');
    lines.push('; Prime line');
    lines.push('G92 E0');
    lines.push('G1 F200 E3');
    lines.push('G92 E0');

    let totalExtrusion = 0;
    // Cross section area of filament
    const filamentArea = Math.PI * Math.pow(filamentDiameter / 2, 2);
    // Extrusion multiplier per mm of travel
    const extrusionFactor = (layerHeight * nozzleDiameter) / filamentArea;

    let totalDistanceMm = 0;

    // Generate Layers
    for (let layer = 1; layer <= totalLayers; layer++) {
      const z = (layer * layerHeight).toFixed(3);
      lines.push(`;LAYER:${layer}`);
      lines.push(`G0 Z${z} F${travelSpeed * 60}`);

      // Skirt on first layer
      if (layer === 1 && skirtLoops > 0) {
        lines.push(';TYPE:SKIRT');
        const offset = 4;
        const x1 = startX - offset, y1 = startY - offset;
        const x2 = startX + scaledX + offset, y2 = startY + scaledY + offset;
        lines.push(`G0 X${x1.toFixed(3)} Y${y1.toFixed(3)} F${travelSpeed * 60}`);
        const skirtPerimeter = 2 * (x2 - x1 + y2 - y1);
        totalExtrusion += skirtPerimeter * extrusionFactor;
        lines.push(`G1 X${x2.toFixed(3)} Y${y1.toFixed(3)} E${totalExtrusion.toFixed(4)} F${printSpeed * 30}`);
        lines.push(`G1 X${x2.toFixed(3)} Y${y2.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
        lines.push(`G1 X${x1.toFixed(3)} Y${y2.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
        lines.push(`G1 X${x1.toFixed(3)} Y${y1.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
      }

      // Walls / Perimeters
      for (let w = 0; w < wallCount; w++) {
        lines.push(`;TYPE:WALL-INNER`);
        const wOffset = w * nozzleDiameter;
        const x1 = startX + wOffset, y1 = startY + wOffset;
        const x2 = startX + scaledX - wOffset, y2 = startY + scaledY - wOffset;

        lines.push(`G0 X${x1.toFixed(3)} Y${y1.toFixed(3)} F${travelSpeed * 60}`);
        const pLen = 2 * (x2 - x1 + y2 - y1);
        totalDistanceMm += pLen;
        totalExtrusion += pLen * extrusionFactor;
        lines.push(`G1 X${x2.toFixed(3)} Y${y1.toFixed(3)} E${totalExtrusion.toFixed(4)} F${printSpeed * 60}`);
        lines.push(`G1 X${x2.toFixed(3)} Y${y2.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
        lines.push(`G1 X${x1.toFixed(3)} Y${y2.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
        lines.push(`G1 X${x1.toFixed(3)} Y${y1.toFixed(3)} E${totalExtrusion.toFixed(4)}`);
      }

      // Rectilinear Infill
      if (infillPercent > 0 && layer > 2 && layer < totalLayers - 2) {
        lines.push(';TYPE:FILL');
        const step = Math.max(1, nozzleDiameter / (infillPercent / 100));
        for (let y = startY + wallCount * nozzleDiameter; y <= startY + scaledY - wallCount * nozzleDiameter; y += step) {
          const x1 = startX + wallCount * nozzleDiameter;
          const x2 = startX + scaledX - wallCount * nozzleDiameter;
          lines.push(`G0 X${x1.toFixed(3)} Y${y.toFixed(3)} F${travelSpeed * 60}`);
          const infillDist = x2 - x1;
          totalDistanceMm += infillDist;
          totalExtrusion += infillDist * extrusionFactor;
          lines.push(`G1 X${x2.toFixed(3)} Y${y.toFixed(3)} E${totalExtrusion.toFixed(4)} F${printSpeed * 60}`);
        }
      }
    }

    // End G-code
    lines.push('; End G-code');
    lines.push('M104 S0 ; turn off temperature');
    lines.push('M140 S0 ; turn off heatbed');
    lines.push('G91 ; relative positioning');
    lines.push('G1 E-1 F300 ; retract the filament a bit');
    lines.push('G1 Z+10 F3000 ; move Z up 10mm');
    lines.push('G90 ; absolute positioning');
    lines.push('G28 X0 Y0 ; home X and Y axis');
    lines.push('M84 ; disable motors');

    const fullGcode = lines.join('\n');
    setGcodeOutput(fullGcode);

    // Calculate Filament length and weight (PLA density ~1.24 g/cm3)
    const filamentMeters = totalExtrusion / 1000;
    const filamentVolumeCm3 = (Math.PI * Math.pow(filamentDiameter / 2, 2) * totalExtrusion) / 1000;
    const materialGrams = filamentVolumeCm3 * 1.24;
    const estimatedMinutes = Math.round(totalDistanceMm / (printSpeed * 60) + totalLayers * 0.1);

    setSlicingStats({
      layers: totalLayers,
      filamentMeters: parseFloat(filamentMeters.toFixed(2)),
      materialGrams: parseFloat(materialGrams.toFixed(1)),
      estimatedMinutes: Math.max(1, estimatedMinutes),
    });
    setIsSlicing(false);
  };

  const handleDownloadGcode = () => {
    if (!gcodeOutput) return;
    const blob = new Blob([gcodeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload STL */}
      <div className="p-4 bg-white card-dev27 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] px-3 py-2 rounded-[4px] text-xs font-semibold">
          <Upload className="w-4 h-4 text-[#8A244B]" />
          <span>Upload STL Mesh File</span>
          <input
            type="file"
            accept=".stl"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) parseStl(f);
            }}
          />
        </label>

        {meshInfo && (
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
            <span><strong>Model:</strong> {fileName}</span>
            <span><strong>Size:</strong> {meshInfo.dimX.toFixed(1)} × {meshInfo.dimY.toFixed(1)} × {meshInfo.dimZ.toFixed(1)} mm</span>
            <span><strong>Facets:</strong> {meshInfo.facetCount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Slicing Parameters Grid */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          3D Printer &amp; Slicing Configuration
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1">Layer Height (mm):</label>
            <select
              value={layerHeight}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLayerHeight(v);
                if (meshInfo) sliceMesh(meshInfo, scale);
              }}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value={0.12}>0.12 mm (Super Fine)</option>
              <option value={0.16}>0.16 mm (Fine)</option>
              <option value={0.20}>0.20 mm (Standard)</option>
              <option value={0.28}>0.28 mm (Draft)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Infill Density (%):</label>
            <input
              type="number"
              min={0}
              max={100}
              step={5}
              value={infillPercent}
              onChange={(e) => {
                const v = Number(e.target.value);
                setInfillPercent(v);
                if (meshInfo) sliceMesh(meshInfo, scale);
              }}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Nozzle Temp (°C):</label>
            <input
              type="number"
              value={nozzleTemp}
              onChange={(e) => setNozzleTemp(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Bed Temp (°C):</label>
            <input
              type="number"
              value={bedTemp}
              onChange={(e) => setBedTemp(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Print Speed (mm/s):</label>
            <input
              type="number"
              value={printSpeed}
              onChange={(e) => setPrintSpeed(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Wall / Perimeter Count:</label>
            <input
              type="number"
              min={1}
              max={6}
              value={wallCount}
              onChange={(e) => setWallCount(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Model Scale:</label>
            <select
              value={scale}
              onChange={(e) => {
                const s = Number(e.target.value);
                setScale(s);
                if (meshInfo) sliceMesh(meshInfo, s);
              }}
              className="w-full border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value={0.5}>0.5x (50%)</option>
              <option value={1.0}>1.0x (100%)</option>
              <option value={1.5}>1.5x (150%)</option>
              <option value={2.0}>2.0x (200%)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Bed Size (mm):</label>
            <span className="font-mono text-slate-800 text-xs block py-1">
              {bedWidth} × {bedDepth} mm
            </span>
          </div>
        </div>
      </div>

      {/* Slicing Estimates Cards */}
      {slicingStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Slicing Layers</span>
            <span className="font-mono text-lg font-bold text-[#8A244B]">
              {slicingStats.layers}
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Filament Length</span>
            <span className="font-mono text-lg font-bold text-slate-800">
              {slicingStats.filamentMeters} m
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Material Weight</span>
            <span className="font-mono text-lg font-bold text-slate-800">
              {slicingStats.materialGrams} g
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Estimated Print Time</span>
            <span className="font-mono text-lg font-bold text-green-700">
              ~{slicingStats.estimatedMinutes} min
            </span>
          </div>
        </div>
      )}

      {/* G-code Output View */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Generated G-code Preview</span>
          <button
            onClick={handleDownloadGcode}
            disabled={!gcodeOutput}
            className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Download .GCODE
          </button>
        </div>

        <textarea
          value={gcodeOutput.slice(0, 5000) + (gcodeOutput.length > 5000 ? '\n... (truncated for preview)' : '')}
          readOnly
          rows={12}
          className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-800 focus:outline-none"
        />
      </div>
    </div>
  );
};
