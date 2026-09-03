'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, AlertCircle, RefreshCcw, Sparkles } from 'lucide-react';

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(
    '{"name": "Toolip", "type": "Everyday Utility Platform", "tools": 19, "active": true}'
  );
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentSpace, setIndentSpace] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [jsonStats, setJsonStats] = useState<{ keys: number; size: string } | null>(null);

  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setOutputJson('');
        setErrorMsg('');
        setJsonStats(null);
        return;
      }

      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSpace);
      setOutputJson(formatted);
      setErrorMsg('');

      // Calculate stats
      const keyCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;
      const byteSize = new Blob([formatted]).size;
      setJsonStats({
        keys: keyCount,
        size: (byteSize / 1024).toFixed(2) + ' KB',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
      setOutputJson('');
      setJsonStats(null);
    }
  };

  const minifyJson = () => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={formatJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prettify / Format</span>
          </button>

          <button
            onClick={minifyJson}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
          >
            Minify JSON
          </button>

          <div className="flex items-center space-x-1 text-xs text-gray-400 pl-2">
            <span>Indent:</span>
            <select
              value={indentSpace}
              onChange={(e) => setIndentSpace(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-white rounded px-1.5 py-1 focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>
        </div>

        {jsonStats && (
          <div className="text-xs text-emerald-400 font-mono flex items-center space-x-3">
            <span>✓ Valid JSON</span>
            <span>Keys: {jsonStats.keys}</span>
            <span>Size: {jsonStats.size}</span>
          </div>
        )}
      </div>

      {/* Editor Dual Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Paste raw JSON input:</label>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste your unformatted JSON here..."
            className="w-full h-80 p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        {/* Formatted Output Pane */}
        <div className="space-y-1 relative">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-400">Formatted & Validated Output:</label>
            {outputJson && (
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>
          <pre className="w-full h-80 p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-emerald-300 overflow-auto whitespace-pre-wrap">
            {outputJson || <span className="text-gray-600">Click "Prettify / Format" to see output...</span>}
          </pre>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>JSON Syntax Error: {errorMsg}</span>
        </div>
      )}
    </div>
  );
};
