import React, { useState } from 'react';
import { Copy, Download, Upload, Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  initialMode?: 'json-to-csv' | 'csv-to-json';
}

export const JsonCsvConverter: React.FC<Props> = ({ initialMode = 'json-to-csv' }) => {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>(initialMode);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [includeBom, setIncludeBom] = useState<boolean>(false);
  const [flattenNested, setFlattenNested] = useState<boolean>(true);
  const [autoDetectTypes, setAutoDetectTypes] = useState<boolean>(true);
  const [previewLimit, setPreviewLimit] = useState<number>(10);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [selectedHeaders, setSelectedHeaders] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleJson = `[
  {
    "id": 101,
    "name": "Sarah Connor",
    "contact": {
      "email": "sarah@cyberdyne.org",
      "city": "Los Angeles"
    },
    "roles": ["admin", "lead"],
    "active": true
  },
  {
    "id": 102,
    "name": "John Connor",
    "contact": {
      "email": "john@resistance.net",
      "city": "Unknown"
    },
    "roles": ["commander"],
    "active": true
  },
  {
    "id": 103,
    "name": "Miles Dyson",
    "contact": {
      "email": "miles@cyberdyne.org",
      "city": "Pasadena"
    },
    "roles": ["researcher"],
    "active": false
  }
]`;

  const sampleCsv = `id,name,email,role,active
101,Sarah Connor,sarah@cyberdyne.org,admin,true
102,John Connor,john@resistance.net,commander,true
103,Miles Dyson,miles@cyberdyne.org,researcher,false`;

  // Flatten nested object helper
  const flattenObject = (obj: any, prefix = '', res: Record<string, any> = {}): Record<string, any> => {
    for (const key of Object.keys(obj || {})) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        flattenObject(val, newKey, res);
      } else if (Array.isArray(val)) {
        res[newKey] = JSON.stringify(val);
      } else {
        res[newKey] = val;
      }
    }
    return res;
  };

  const convertJsonToCsv = (jsonStr: string) => {
    try {
      setError(null);
      if (!jsonStr.trim()) {
        setOutput('');
        setAvailableHeaders([]);
        return;
      }
      let parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        if (typeof parsed === 'object' && parsed !== null) {
          parsed = [parsed];
        } else {
          throw new Error('JSON input must be an array of objects or a single object.');
        }
      }

      const rows: Record<string, any>[] = parsed.map((item: any) =>
        flattenNested ? flattenObject(item) : item
      );

      // Collect all unique keys
      const headerSet = new Set<string>();
      rows.forEach(r => {
        Object.keys(r).forEach(k => headerSet.add(k));
      });
      const headers = Array.from(headerSet);
      setAvailableHeaders(headers);

      // Maintain selected headers state
      const activeHeaders = headers.filter(h =>
        selectedHeaders[h] !== undefined ? selectedHeaders[h] : true
      );

      const delimChar = delimiter === '\\t' ? '\t' : delimiter;

      const formatCell = (val: any): string => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(delimChar) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const lines: string[] = [];
      if (includeHeaders) {
        lines.push(activeHeaders.map(formatCell).join(delimChar));
      }

      rows.forEach(row => {
        const line = activeHeaders.map(h => formatCell(row[h] !== undefined ? row[h] : '')).join(delimChar);
        lines.push(line);
      });

      setOutput(lines.join('\n'));
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
      setOutput('');
    }
  };

  // CSV parser handling quoted cells, escapes, linebreaks
  const parseCsv = (text: string, delim: string): string[][] => {
    const d = delim === '\\t' ? '\t' : delim;
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === d && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell);
        currentCell = '';
        if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
    return rows;
  };

  const convertCsvToJson = (csvStr: string) => {
    try {
      setError(null);
      if (!csvStr.trim()) {
        setOutput('');
        return;
      }
      // Auto detect delimiter if comma not found
      let effectiveDelim = delimiter;
      if (delimiter === 'auto') {
        const firstLine = csvStr.split('\n')[0] || '';
        const counts: Record<string, number> = {
          ',': (firstLine.match(/,/g) || []).length,
          ';': (firstLine.match(/;/g) || []).length,
          '\t': (firstLine.match(/\t/g) || []).length,
          '|': (firstLine.match(/\|/g) || []).length,
        };
        const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        effectiveDelim = max && max[1] > 0 ? max[0] : ',';
      }

      const rows = parseCsv(csvStr, effectiveDelim);
      if (rows.length === 0) {
        setOutput('[]');
        return;
      }

      const headers = includeHeaders ? rows[0] : rows[0].map((_, i) => `col_${i + 1}`);
      const dataRows = includeHeaders ? rows.slice(1) : rows;

      const castValue = (raw: string) => {
        if (!autoDetectTypes) return raw;
        const trimmed = raw.trim();
        if (trimmed === '') return '';
        if (trimmed.toLowerCase() === 'true') return true;
        if (trimmed.toLowerCase() === 'false') return false;
        if (trimmed.toLowerCase() === 'null') return null;
        if (!isNaN(Number(trimmed)) && !trimmed.startsWith('0x') && trimmed !== '') {
          return Number(trimmed);
        }
        return raw;
      };

      const result = dataRows.map(row => {
        const item: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const val = row[idx] !== undefined ? row[idx] : '';
          item[h.trim() || `col_${idx + 1}`] = castValue(val);
        });
        return item;
      });

      setOutput(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV');
      setOutput('');
    }
  };

  const handleRun = (val = input, m = mode) => {
    if (m === 'json-to-csv') {
      convertJsonToCsv(val);
    } else {
      convertCsvToJson(val);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      handleRun(text, mode);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output) return;
    const isCsv = mode === 'json-to-csv';
    const ext = isCsv ? 'csv' : 'json';
    const mime = isCsv ? 'text/csv;charset=utf-8;' : 'application/json';
    const content = isCsv && includeBom ? '\uFEFF' + output : output;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white card-dev27">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('json-to-csv');
              setInput('');
              setOutput('');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
              mode === 'json-to-csv' ? 'bg-[#8A244B] text-white' : 'bg-[#F2EFE7] text-[#111F35] hover:bg-slate-200'
            }`}
          >
            JSON to CSV
          </button>
          <button
            onClick={() => {
              setMode('csv-to-json');
              setInput('');
              setOutput('');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
              mode === 'csv-to-json' ? 'bg-[#8A244B] text-white' : 'bg-[#F2EFE7] text-[#111F35] hover:bg-slate-200'
            }`}
          >
            CSV to JSON
          </button>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                setTimeout(() => handleRun(input, mode), 0);
              }}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
              {mode === 'csv-to-json' && <option value="auto">Auto-detect</option>}
            </select>
          </div>

          <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => {
                setIncludeHeaders(e.target.checked);
                setTimeout(() => handleRun(input, mode), 0);
              }}
              className="rounded-[2px] text-[#8A244B] focus:ring-0"
            />
            <span>First row is header</span>
          </label>

          {mode === 'json-to-csv' ? (
            <>
              <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flattenNested}
                  onChange={(e) => {
                    setFlattenNested(e.target.checked);
                    setTimeout(() => handleRun(input, mode), 0);
                  }}
                  className="rounded-[2px] text-[#8A244B] focus:ring-0"
                />
                <span>Flatten Objects</span>
              </label>
              <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBom}
                  onChange={(e) => setIncludeBom(e.target.checked)}
                  className="rounded-[2px] text-[#8A244B] focus:ring-0"
                />
                <span>Excel BOM</span>
              </label>
            </>
          ) : (
            <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetectTypes}
                onChange={(e) => {
                  setAutoDetectTypes(e.target.checked);
                  setTimeout(() => handleRun(input, mode), 0);
                }}
                className="rounded-[2px] text-[#8A244B] focus:ring-0"
              />
              <span>Detect numbers & booleans</span>
            </label>
          )}

          <div className="flex items-center gap-1.5">
            <label className="px-2 py-1 text-xs font-medium bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3 text-[#8A244B]" />
              Upload
              <input type="file" accept={mode === 'json-to-csv' ? '.json' : '.csv,.txt'} onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => {
                const sample = mode === 'json-to-csv' ? sampleJson : sampleCsv;
                setInput(sample);
                handleRun(sample, mode);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-[#F2EFE7] text-[#111F35] rounded-[4px] hover:bg-slate-200"
            >
              Sample
            </button>
            <button
              onClick={() => {
                setInput('');
                setOutput('');
                setError(null);
              }}
              className="px-2 py-1 text-xs text-slate-500 hover:text-red-700"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Column filtering for JSON to CSV */}
      {mode === 'json-to-csv' && availableHeaders.length > 0 && (
        <div className="p-2.5 bg-white card-dev27 text-xs">
          <span className="font-semibold text-slate-700 mr-2">Select Columns to Export:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {availableHeaders.map(h => (
              <label key={h} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-[4px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHeaders[h] !== undefined ? selectedHeaders[h] : true}
                  onChange={(e) => {
                    const updated = { ...selectedHeaders, [h]: e.target.checked };
                    setSelectedHeaders(updated);
                    setTimeout(() => handleRun(input, mode), 0);
                  }}
                  className="rounded-[2px] text-[#8A244B] focus:ring-0"
                />
                <span className="font-mono text-[11px] text-slate-700">{h}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Input {mode === 'json-to-csv' ? 'JSON' : 'CSV'}</span>
            <span className="text-slate-400 font-mono text-[11px]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleRun(e.target.value, mode);
            }}
            placeholder={mode === 'json-to-csv' ? 'Paste JSON array here...' : 'Paste CSV text here...'}
            rows={15}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:border-[#8A244B] resize-y"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Output {mode === 'json-to-csv' ? 'CSV' : 'JSON'}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="px-2 py-0.5 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-[#8A244B]" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="px-2 py-0.5 text-xs bg-[#8A244B] text-white hover:bg-[#721C3D] rounded-[4px] flex items-center gap-1 disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output preview will appear here..."
            rows={15}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none resize-y text-slate-800"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
