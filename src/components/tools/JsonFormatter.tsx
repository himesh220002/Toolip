'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Download,
  Wrench,
  ChevronRight,
  ChevronDown,
  FileCode,
  CheckCircle2,
  FileType
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const SAMPLE_JSON_TEMPLATES: Record<string, string> = {
  'User API Response': `{
  "status": 200,
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": "usr_98472394",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "roles": ["admin", "developer"],
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en-US"
    },
    "metadata": {
      "lastLogin": "2026-09-04T22:15:00Z",
      "loginCount": 42
    }
  }
}`,
  'Product Catalog': `[
  {
    "sku": "PROD-001",
    "name": "Wireless Ergonomic Keyboard",
    "price": 129.99,
    "inStock": true,
    "tags": ["hardware", "accessories", "wireless"]
  },
  {
    "sku": "PROD-002",
    "name": "4K Ultra-Wide Monitor",
    "price": 499.50,
    "inStock": false,
    "tags": ["hardware", "displays"]
  }
]`,
  'App Config': `{
  "appName": "Toolip Developer Suite",
  "version": "2.4.0",
  "features": {
    "autoSave": true,
    "maxFileSizeMb": 50,
    "supportedFormats": ["json", "yaml", "xml", "csv"]
  },
  "endpoints": {
    "api": "https://api.toolip.app/v1",
    "telemetry": null
  }
}`
};

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson, resetInputJson] = useLocalStorage<string>(
    'toolip_json_input_v2',
    SAMPLE_JSON_TEMPLATES['User API Response']
  );
  const [outputJson, setOutputJson] = useState<string>('');
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const [indentSpace, setIndentSpace] = useState<number>(2);
  const [autoFormat, setAutoFormat] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'formatted' | 'tree' | 'yaml'>('formatted');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [jsonStats, setJsonStats] = useState<{ keys: number; size: string; depth: number } | null>(null);
  const [repairNotice, setRepairNotice] = useState<string>('');

  // Calculate object depth recursively
  const getObjectDepth = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let depth = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        depth = Math.max(depth, getObjectDepth(obj[key]));
      }
    }
    return 1 + depth;
  };

  // Convert JSON object to simple YAML representation
  const jsonToYaml = (obj: any, indent = 0): string => {
    const spacing = ' '.repeat(indent);
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => `${spacing}- ${jsonToYaml(item, indent + 2).trim()}`).join('\n');
    }
    let yaml = '';
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        yaml += `${spacing}${key}:\n${jsonToYaml(val, indent + 2)}\n`;
      } else {
        yaml += `${spacing}${key}: ${JSON.stringify(val)}\n`;
      }
    }
    return yaml.trim();
  };

  const processJson = (rawText: string) => {
    if (!rawText.trim()) {
      setOutputJson('');
      setYamlOutput('');
      setErrorMsg('');
      setErrorLine(null);
      setJsonStats(null);
      setParsedObject(null);
      setRepairNotice('');
      return;
    }

    try {
      const parsed = JSON.parse(rawText);
      const formatted = JSON.stringify(parsed, null, indentSpace);
      setOutputJson(formatted);
      setYamlOutput(jsonToYaml(parsed));
      setErrorMsg('');
      setErrorLine(null);
      setParsedObject(parsed);

      // Compute statistics
      const keysCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;
      const depthCount = getObjectDepth(parsed);
      const byteSize = new Blob([formatted]).size;
      setJsonStats({
        keys: keysCount,
        depth: depthCount,
        size: (byteSize / 1024).toFixed(2) + ' KB'
      });
      setRepairNotice('');
    } catch (err: any) {
      const message = err.message || 'Invalid JSON syntax';
      setErrorMsg(message);

      // Try extracting line number from error message
      const match = message.match(/line (\d+) column (\d+)/i) || message.match(/at position (\d+)/i);
      if (match && match[1]) {
        setErrorLine(parseInt(match[1], 10));
      } else {
        setErrorLine(null);
      }

      setOutputJson('');
      setYamlOutput('');
      setJsonStats(null);
      setParsedObject(null);
    }
  };

  useEffect(() => {
    if (autoFormat) {
      processJson(inputJson);
    }
  }, [inputJson, indentSpace, autoFormat]);

  // Repair common JSON syntax errors (trailing commas, single quotes, JS comments)
  const repairJson = () => {
    let repaired = inputJson;
    // Strip single-line comments
    repaired = repaired.replace(/\/\/.*/g, '');
    // Strip multi-line comments
    repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');
    // Fix single quotes to double quotes around keys/strings
    repaired = repaired.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    // Remove trailing commas in objects and arrays
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

    try {
      const parsed = JSON.parse(repaired);
      const formatted = JSON.stringify(parsed, null, indentSpace);
      setInputJson(formatted);
      setRepairNotice('✓ Automatically fixed quotes, comments, and trailing commas!');
      setErrorMsg('');
      setTimeout(() => setRepairNotice(''), 3500);
    } catch (err: any) {
      setErrorMsg('Auto-repair failed. Please check syntax manually: ' + err.message);
    }
  };

  const copyOutput = () => {
    const textToCopy = viewMode === 'yaml' ? yamlOutput : outputJson;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJsonFile = () => {
    const content = viewMode === 'yaml' ? yamlOutput : outputJson;
    const ext = viewMode === 'yaml' ? 'yaml' : 'json';
    if (!content) return;
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payload_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Interactive Tree View Component
  const RenderTree = ({ data, name = 'root' }: { data: any; name?: string }) => {
    const [expanded, setExpanded] = useState<boolean>(true);
    const isObject = typeof data === 'object' && data !== null;

    if (!isObject) {
      return (
        <div className="font-mono text-xs py-0.5 flex items-center gap-2 pl-4">
          <span className="text-sky-400">{name}:</span>
          <span className={typeof data === 'string' ? 'text-amber-300' : typeof data === 'number' ? 'text-emerald-400' : 'text-purple-400'}>
            {JSON.stringify(data)}
          </span>
        </div>
      );
    }

    const keys = Object.keys(data);
    return (
      <div className="font-mono text-xs pl-2 border-l border-white/10 my-0.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-gray-300 hover:text-white font-semibold focus:outline-none py-0.5"
        >
          {expanded ? <ChevronDown className="h-3 w-3 text-sky-400" /> : <ChevronRight className="h-3 w-3 text-sky-400" />}
          <span className="text-sky-300">{name}</span>
          <span className="text-gray-500 text-[10px]">({Array.isArray(data) ? `${data.length} items` : `${keys.length} keys`})</span>
        </button>

        {expanded && (
          <div className="pl-3 space-y-0.5">
            {keys.map((k) => (
              <RenderTree key={k} data={data[k]} name={k} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Preset Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <FileType className="h-3.5 w-3.5 text-sky-400" /> Samples:
          </span>
          {Object.keys(SAMPLE_JSON_TEMPLATES).map((templateName) => (
            <button
              key={templateName}
              onClick={() => {
                setInputJson(SAMPLE_JSON_TEMPLATES[templateName]);
                setRepairNotice('');
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              {templateName}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Repair Button */}
          <button
            onClick={repairJson}
            title="Auto-fix trailing commas, single quotes, and JS comments"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-semibold transition-colors"
          >
            <Wrench className="h-3.5 w-3.5 text-indigo-400" />
            <span>Auto-Repair JSON</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={resetInputJson}
            title="Reset JSON input back to default sample"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400 font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Formatting Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/80 border border-gray-800 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => processJson(inputJson)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-sm transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prettify / Format</span>
          </button>

          <div className="flex items-center space-x-1 text-gray-400">
            <span>Indent:</span>
            <select
              value={indentSpace}
              onChange={(e) => setIndentSpace(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 focus:outline-none font-mono"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={0}>Minify (0)</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoFormat}
              onChange={(e) => setAutoFormat(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-sky-500 focus:ring-0"
            />
            <span>Auto-Format on Type</span>
          </label>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'formatted' ? 'bg-sky-500 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            JSON Code
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'tree' ? 'bg-sky-500 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tree Inspector
          </button>
          <button
            onClick={() => setViewMode('yaml')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'yaml' ? 'bg-sky-500 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            YAML Export
          </button>
        </div>
      </div>

      {/* Notifications */}
      {repairNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{repairNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <strong>JSON Syntax Error:</strong> {errorMsg}
            </span>
          </div>
          <button
            onClick={repairJson}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-bold border border-rose-500/40"
          >
            Try Auto-Repair
          </button>
        </div>
      )}

      {/* Editor & Viewer Dual Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Textarea Pane */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>Raw JSON Input Editor:</span>
            <span className="font-mono text-[11px] text-sky-400">
              {inputJson.split('\n').length} lines • {inputJson.length} chars
            </span>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste your unformatted or minified JSON string here..."
            className="w-full h-96 p-3.5 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
          />
        </div>

        {/* Output & Inspection Pane */}
        <div className="space-y-1 relative">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>
              {viewMode === 'formatted' ? 'Validated JSON Output:' : viewMode === 'tree' ? 'Interactive Tree View:' : 'YAML Payload Output:'}
            </span>

            <div className="flex items-center space-x-3">
              {jsonStats && (
                <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Valid • {jsonStats.keys} keys • {jsonStats.size}
                </span>
              )}

              {(outputJson || yamlOutput) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyOutput}
                    className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={downloadJsonFile}
                    className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-96 p-3.5 bg-gray-950 border border-gray-800 rounded-xl overflow-auto">
            {viewMode === 'formatted' && (
              <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {outputJson || <span className="text-gray-600">Enter valid JSON to view formatted code output...</span>}
              </pre>
            )}

            {viewMode === 'tree' && (
              <div>
                {parsedObject ? (
                  <RenderTree data={parsedObject} name="Payload" />
                ) : (
                  <span className="font-mono text-xs text-gray-600">Enter valid JSON to render interactive tree view...</span>
                )}
              </div>
            )}

            {viewMode === 'yaml' && (
              <pre className="font-mono text-xs text-amber-300 whitespace-pre-wrap leading-relaxed">
                {yamlOutput || <span className="text-gray-600 font-mono text-xs">Enter valid JSON to render YAML payload...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
