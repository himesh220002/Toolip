'use client';

import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Printer,
  Copy,
  Check,
  Eye,
  Code,
  Sparkles,
  Upload,
  FileType,
  RefreshCw,
} from 'lucide-react';

export const HtmlToPdf: React.FC = () => {
  const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; line-height: 1.6; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-top: 20px; }
    .badge { background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
    th { background: #edf2f7; color: #334155; }
  </style>
</head>
<body>
  <span class="badge">Toolip Official Document</span>
  <h1>HTML to PDF Document Export</h1>
  <p>This is a live rendered HTML template ready for instant clean PDF export.</p>
  
  <div class="card">
    <h3>Project Features & Summary</h3>
    <ul>
      <li>Fast client-side PDF rendering engine</li>
      <li>Clean margin alignment without browser header/footer clutter</li>
      <li>Full CSS styling, tables, custom fonts & color support</li>
    </ul>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Category</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Interactive HTML Code Editor</td>
        <td>Developer Tool</td>
        <td>✓ Verified</td>
      </tr>
      <tr>
        <td>Clean Isolated PDF Generator</td>
        <td>PDF Utilities</td>
        <td>✓ Ready</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

  const [htmlCode, setHtmlCode] = useState<string>(DEFAULT_HTML);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [themeStyle, setThemeStyle] = useState<'default' | 'modern' | 'minimalist'>('default');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHtmlCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const copyHtmlCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtmlFile = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Isolated Clean Window PDF Generator
  const printToPdf = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HTML Document Export</title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 750);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <FileCode className="h-4 w-4 text-indigo-400" />
          <span>HTML Code to PDF Converter</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* File Upload Button */}
          <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold cursor-pointer border border-slate-700/60 transition-all">
            <Upload className="h-3.5 w-3.5 text-indigo-400" />
            <span>Upload .HTML File</span>
            <input type="file" accept=".html,.htm,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={copyHtmlCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold border border-slate-700/60 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={downloadHtmlFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold border border-slate-700/60 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Save .HTML File</span>
          </button>

          {/* Primary Action Button: PDF Export */}
          <button
            onClick={printToPdf}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 hover:from-indigo-400 hover:to-sky-300 text-white font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Printer className="h-4 w-4" />
            <span>Convert & Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Editor */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Code className="h-4 w-4" />
              <span>HTML Source Editor</span>
            </label>
            <button
              onClick={() => setHtmlCode(DEFAULT_HTML)}
              className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Load Template</span>
            </button>
          </div>

          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder="Type or paste your raw HTML markup here..."
            className="w-full h-[500px] p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner leading-relaxed"
          />
        </div>

        {/* Right Column: Live Rendered Output */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Live Document Render</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                Print Engine Ready
              </span>
            </div>

            {/* Render Frame */}
            <div className="w-full h-[450px] bg-white rounded-2xl border border-slate-700 shadow-2xl overflow-auto p-2">
              <iframe
                title="HTML Render Preview"
                srcDoc={htmlCode}
                className="w-full h-full border-0 rounded-xl"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>

          {/* Download Action Footer */}
          <button
            onClick={printToPdf}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <Download className="h-4 w-4" />
            <span>Download Formatted PDF Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
