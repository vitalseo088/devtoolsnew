import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, Check, Image as ImageIcon, Info, FileText } from 'lucide-react';

interface PsdMetadata {
  signature: string;
  version: number;
  channels: number;
  width: number;
  height: number;
  depth: number;
  colorMode: string;
  compression: string;
  fileSizeBytes: number;
}

export const PsdToPngConverter: React.FC = () => {
  const [meta, setMeta] = useState<PsdMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorModes: Record<number, string> = {
    0: 'Bitmap',
    1: 'Grayscale',
    2: 'Indexed',
    3: 'RGB',
    4: 'CMYK',
    7: 'Multichannel',
    8: 'Duotone',
    9: 'Lab',
  };

  const compressionNames: Record<number, string> = {
    0: 'Raw uncompressed',
    1: 'RLE (PackBits)',
    2: 'ZIP without prediction',
    3: 'ZIP with prediction',
  };

  // Genuine PackBits RLE byte decoder
  const unpackPackBits = (src: Uint8Array, destLength: number): Uint8Array => {
    const dest = new Uint8Array(destLength);
    let srcIdx = 0;
    let destIdx = 0;

    while (destIdx < destLength && srcIdx < src.length) {
      let n = src[srcIdx++];
      if (n > 128) {
        // Repeated run
        const count = 256 - n + 1;
        const val = src[srcIdx++];
        for (let i = 0; i < count && destIdx < destLength; i++) {
          dest[destIdx++] = val;
        }
      } else if (n < 128) {
        // Literal run
        const count = n + 1;
        for (let i = 0; i < count && destIdx < destLength && srcIdx < src.length; i++) {
          dest[destIdx++] = src[srcIdx++];
        }
      }
      // n === 128 is no-op in standard PackBits
    }
    return dest;
  };

  const parsePsdFile = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setPngUrl(null);
      setMeta(null);

      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);
      const bytes = new Uint8Array(buffer);

      if (buffer.byteLength < 26) {
        throw new Error('File is too small to be a valid Photoshop PSD.');
      }

      // Check signature '8BPS'
      const sig = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      if (sig !== '8BPS') {
        throw new Error(`Invalid PSD signature: "${sig}". Expected "8BPS".`);
      }

      const version = view.getUint16(4, false);
      if (version !== 1 && version !== 2) {
        throw new Error(`Unsupported PSD version ${version}.`);
      }

      const channels = view.getUint16(12, false);
      const height = view.getUint32(14, false);
      const width = view.getUint32(18, false);
      const depth = view.getUint16(22, false);
      const colorModeCode = view.getUint16(24, false);
      const colorMode = colorModes[colorModeCode] || `Unknown (${colorModeCode})`;

      if (width <= 0 || height <= 0 || width > 20000 || height > 20000) {
        throw new Error(`Unreasonable PSD dimensions: ${width}x${height}.`);
      }

      let offset = 26;

      // Color Mode Data Section
      if (offset + 4 > buffer.byteLength) throw new Error('Truncated PSD color data.');
      const colorDataLen = view.getUint32(offset, false);
      offset += 4 + colorDataLen;

      // Image Resources Section
      if (offset + 4 > buffer.byteLength) throw new Error('Truncated PSD resources.');
      const imgResLen = view.getUint32(offset, false);
      offset += 4 + imgResLen;

      // Layer and Mask Section
      if (offset + 4 > buffer.byteLength) throw new Error('Truncated PSD layer data.');
      const layerMaskLen = view.getUint32(offset, false);
      offset += 4 + layerMaskLen;

      // Image Data Section
      if (offset + 2 > buffer.byteLength) throw new Error('Missing PSD composite image data.');
      const compression = view.getUint16(offset, false);
      offset += 2;

      setMeta({
        signature: sig,
        version,
        channels,
        width,
        height,
        depth,
        colorMode,
        compression: compressionNames[compression] || `Compression ${compression}`,
        fileSizeBytes: file.size,
      });

      // Canvas setup
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not acquire 2D canvas context.');

      const imgData = ctx.createImageData(width, height);
      const pixels = imgData.data;

      const numPixels = width * height;
      const channelPlanes: Uint8Array[] = [];

      if (compression === 0) {
        // Raw planar data
        for (let c = 0; c < channels; c++) {
          const plane = bytes.subarray(offset, offset + numPixels);
          channelPlanes.push(plane);
          offset += numPixels;
        }
      } else if (compression === 1) {
        // RLE PackBits
        const scanlineCount = channels * height;
        const scanlineByteCounts: number[] = [];
        for (let i = 0; i < scanlineCount; i++) {
          scanlineByteCounts.push(view.getUint16(offset, false));
          offset += 2;
        }

        let scanlineIdx = 0;
        for (let c = 0; c < channels; c++) {
          const plane = new Uint8Array(numPixels);
          let planeOffset = 0;
          for (let y = 0; y < height; y++) {
            const byteCount = scanlineByteCounts[scanlineIdx++];
            const packedLine = bytes.subarray(offset, offset + byteCount);
            offset += byteCount;
            const unpackedLine = unpackPackBits(packedLine, width);
            plane.set(unpackedLine, planeOffset);
            planeOffset += width;
          }
          channelPlanes.push(plane);
        }
      } else {
        throw new Error(
          `Composite image uses ${compressionNames[compression] || 'ZIP'} compression, which requires external zlib expansion.`
        );
      }

      // Merge Planar data into RGBA pixel array
      if (colorModeCode === 3) {
        // RGB
        const rPlane = channelPlanes[0];
        const gPlane = channelPlanes[1] || rPlane;
        const bPlane = channelPlanes[2] || rPlane;
        const aPlane = channels >= 4 ? channelPlanes[3] : null;

        for (let i = 0; i < numPixels; i++) {
          const pIdx = i * 4;
          pixels[pIdx] = rPlane ? rPlane[i] : 0;
          pixels[pIdx + 1] = gPlane ? gPlane[i] : 0;
          pixels[pIdx + 2] = bPlane ? bPlane[i] : 0;
          pixels[pIdx + 3] = aPlane ? aPlane[i] : 255;
        }
      } else if (colorModeCode === 1) {
        // Grayscale
        const grayPlane = channelPlanes[0];
        const aPlane = channels >= 2 ? channelPlanes[1] : null;
        for (let i = 0; i < numPixels; i++) {
          const pIdx = i * 4;
          const g = grayPlane ? grayPlane[i] : 0;
          pixels[pIdx] = g;
          pixels[pIdx + 1] = g;
          pixels[pIdx + 2] = g;
          pixels[pIdx + 3] = aPlane ? aPlane[i] : 255;
        }
      } else if (colorModeCode === 4) {
        // CMYK to RGB approximation
        const cPlane = channelPlanes[0];
        const mPlane = channelPlanes[1];
        const yPlane = channelPlanes[2];
        const kPlane = channelPlanes[3];
        for (let i = 0; i < numPixels; i++) {
          const pIdx = i * 4;
          const c = (cPlane ? cPlane[i] : 0) / 255;
          const m = (mPlane ? mPlane[i] : 0) / 255;
          const y = (yPlane ? yPlane[i] : 0) / 255;
          const k = (kPlane ? kPlane[i] : 0) / 255;
          pixels[pIdx] = Math.round(255 * (1 - c) * (1 - k));
          pixels[pIdx + 1] = Math.round(255 * (1 - m) * (1 - k));
          pixels[pIdx + 2] = Math.round(255 * (1 - y) * (1 - k));
          pixels[pIdx + 3] = 255;
        }
      } else {
        // Generic fallback to grayscale
        const plane = channelPlanes[0];
        for (let i = 0; i < numPixels; i++) {
          const pIdx = i * 4;
          const v = plane ? plane[i] : 0;
          pixels[pIdx] = v;
          pixels[pIdx + 1] = v;
          pixels[pIdx + 2] = v;
          pixels[pIdx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const url = canvas.toDataURL('image/png');
      setPngUrl(url);
    } catch (err: any) {
      setError(err.message || 'Error parsing and decoding PSD file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) parsePsdFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-8 border-2 border-dashed border-slate-300 hover:border-[#8A244B] bg-white card-dev27 text-center transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept=".psd"
          id="psd-upload"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) parsePsdFile(f);
          }}
        />
        <label htmlFor="psd-upload" className="cursor-pointer block">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#F2EFE7] text-[#8A244B] rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Click to upload or drag &amp; drop your Photoshop .PSD file
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Genuine browser decoding • Extracts visible composite image • Preserves transparency • 100% private
          </p>
        </label>
      </div>

      {loading && (
        <div className="p-4 bg-white card-dev27 text-center text-xs text-slate-600 font-medium animate-pulse">
          Parsing binary PSD document structures, reading channels, and unpacking RLE scanlines...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Decoding Notice: </span>
            {error}
          </div>
        </div>
      )}

      {/* Metadata Cards */}
      {meta && (
        <div className="p-4 bg-white card-dev27 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
            <Info className="w-4 h-4 text-[#8A244B]" />
            <span>PSD Header &amp; Metadata Inspection</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-[4px] border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Dimensions</span>
              <span className="font-mono font-bold text-slate-900">{meta.width} × {meta.height} px</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-[4px] border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Color Mode & Depth</span>
              <span className="font-mono font-bold text-slate-900">{meta.colorMode} ({meta.depth}-bit)</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-[4px] border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Channels</span>
              <span className="font-mono font-bold text-slate-900">{meta.channels} channels</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-[4px] border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Compression</span>
              <span className="font-mono font-bold text-slate-900">{meta.compression}</span>
            </div>
          </div>
        </div>
      )}

      {/* Decoded PNG Result Preview */}
      {pngUrl && (
        <div className="p-4 bg-white card-dev27 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-700" />
              <span className="text-xs font-bold text-slate-800">Converted PNG Image Preview</span>
            </div>
            <a
              href={pngUrl}
              download="converted-psd.png"
              className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          </div>

          <div className="p-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 rounded-[4px] flex items-center justify-center overflow-auto max-h-[420px]">
            <img src={pngUrl} alt="Decoded PSD preview" className="max-w-full max-h-[380px] object-contain shadow-sm border border-slate-200" />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
