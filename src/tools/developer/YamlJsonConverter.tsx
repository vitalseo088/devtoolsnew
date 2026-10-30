import React, { useState } from 'react';
import * as yaml from 'js-yaml';
import { Copy, Download, RefreshCw, Trash2, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';

interface Props {
  initialMode?: 'yaml-to-json' | 'json-to-yaml';
}

export const YamlJsonConverter: React.FC<Props> = ({ initialMode = 'yaml-to-json' }) => {
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>(initialMode);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [indent, setIndent] = useState<number | 'tab'>(2);
  const [compact, setCompact] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleYaml = `# Server Configuration
app:
  name: "Dev27 Suite"
  version: "1.0.0"
  enabled: true
  ports:
    - 80
    - 443
database: &default_db
  host: "localhost"
  port: 5432
  credentials:
    username: "admin"
    password: "secret_password"
replica:
  <<: *default_db
  host: "replica.internal"
`;

  const sampleJson = `{
  "app": {
    "name": "Dev27 Suite",
    "version": "1.0.0",
    "enabled": true,
    "ports": [80, 443]
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin"
    }
  }
}`;

  const convert = (textToConvert = input, currentMode = mode) => {
    if (!textToConvert.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    setError(null);
    try {
      if (currentMode === 'yaml-to-json') {
        const parsed = yaml.load(textToConvert);
        if (parsed === undefined) {
          setOutput('');
          return;
        }
        const indentVal = compact ? 0 : (indent === 'tab' ? '\t' : indent);
        const jsonStr = JSON.stringify(parsed, null, indentVal);
        setOutput(jsonStr);
      } else {
        const parsed = JSON.parse(textToConvert);
        const yamlStr = yaml.dump(parsed, {
          indent: indent === 'tab' ? 2 : indent,
          lineWidth: -1
        });
        setOutput(yamlStr);
      }
    } catch (err: any) {
      setOutput('');
      const lineMatch = err.message?.match(/line (\d+)/i) || (err.mark ? [null, err.mark.line + 1] : null);
      const colMatch = err.message?.match(/column (\d+)/i) || (err.mark ? [null, err.mark.column + 1] : null);
      setError({
        message: err.reason || err.message || 'Syntax error',
        line: lineMatch ? Number(lineMatch[1]) : undefined,
        column: colMatch ? Number(colMatch[1]) : undefined
      });
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    convert(val, mode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const isJson = mode === 'yaml-to-json';
    const ext = isJson ? 'json' : 'yaml';
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    const nextMode = mode === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json';
    const nextInput = output;
    setMode(nextMode);
    setInput(nextInput);
    convert(nextInput, nextMode);
  };

  const loadSample = () => {
    const sample = mode === 'yaml-to-json' ? sampleYaml : sampleJson;
    setInput(sample);
    convert(sample, mode);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode and Option Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white card-dev27">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('yaml-to-json');
              convert(input, 'yaml-to-json');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
              mode === 'yaml-to-json' ? 'bg-[#8A244B] text-white' : 'bg-[#F2EFE7] text-[#111F35] hover:bg-slate-200'
            }`}
          >
            YAML to JSON
          </button>
          <button
            onClick={() => {
              setMode('json-to-yaml');
              convert(input, 'json-to-yaml');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
              mode === 'json-to-yaml' ? 'bg-[#8A244B] text-white' : 'bg-[#F2EFE7] text-[#111F35] hover:bg-slate-200'
            }`}
          >
            JSON to YAML
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Indentation:</span>
            <select
              value={indent}
              onChange={(e) => {
                const val = e.target.value === 'tab' ? 'tab' : Number(e.target.value);
                setIndent(val as any);
                setTimeout(() => convert(input, mode), 0);
              }}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>

          {mode === 'yaml-to-json' && (
            <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => {
                  setCompact(e.target.checked);
                  setTimeout(() => convert(input, mode), 0);
                }}
                className="rounded-[2px] text-[#8A244B] focus:ring-0"
              />
              <span>Compact / Minify</span>
            </label>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={loadSample}
              className="px-2.5 py-1 text-xs font-medium bg-[#F2EFE7] text-[#111F35] rounded-[4px] hover:bg-slate-200"
            >
              Sample
            </button>
            <button
              onClick={handleSwap}
              disabled={!output}
              className="px-2.5 py-1 text-xs font-medium bg-[#F2EFE7] text-[#111F35] rounded-[4px] hover:bg-slate-200 disabled:opacity-40 flex items-center gap-1"
              title="Swap Output to Input"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Swap
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 rounded-[4px]"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Parsing Error: </span>
            {error.message}
            {error.line && <span className="ml-2 font-mono">(Line {error.line}{error.column ? `, Col ${error.column}` : ''})</span>}
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Input {mode === 'yaml-to-json' ? 'YAML' : 'JSON'}</span>
            <span className="text-slate-400 font-mono text-[11px]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === 'yaml-to-json' ? 'Paste or write YAML here...' : 'Paste or write JSON here...'}
            rows={16}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:border-[#8A244B] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Output {mode === 'yaml-to-json' ? 'JSON' : 'YAML'}</span>
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
            placeholder="Converted output will appear here..."
            rows={16}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none resize-y text-slate-800"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
