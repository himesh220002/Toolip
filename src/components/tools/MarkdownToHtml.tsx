'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Eye,
  Code,
  Printer,
  Download,
  Sparkles,
  RotateCcw,
  Palette,
  CheckSquare
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULT_MARKDOWN = `# Toolip Professional Markdown & PDF Converter

### Everyday Utility Features:
- **PDF Merger & Splitter**: Combine and re-order PDF pages instantly.
- **Passport Photo Maker**: Guaranteed 35x45mm format under 80 KB.
- **Enterprise Invoice Generator**: Itemized invoices with tax calculations.

\`\`\`javascript
console.log("Built with Next.js, Tailwind CSS & Clean PDF Engine");
\`\`\`

> "Simple tools that solve small annoyances get used constantly."

| Feature | Category | Status |
| --- | --- | --- |
| Live HTML Render | Developer Tool | Ready |
| 1-Click PDF Export | Document Utilities | Active |

- [x] Full Task Checkbox Support
- [ ] Auto-generate Table of Contents
- [x] Customizable CSS Themes
`;

export const MarkdownToHtml: React.FC = () => {
  const [markdown, setMarkdown, resetMarkdown] = useLocalStorage<string>('toolip_md_input_v2', DEFAULT_MARKDOWN);
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'html'>('rendered');
  const [previewTheme, setPreviewTheme] = useState<'github' | 'dark' | 'serif' | 'minimal'>('github');

  // Complete GitHub Flavored Markdown Parser
  const parseMarkdown = (text: string) => {
    let html = text
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code class="code-block">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>')
      // Headings
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Bold & Italic & Strikethrough
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/~~(.*)~~/gim, '<del>$1</del>')
      // Task lists
      .replace(/^- \[x\] (.*$)/gim, '<li class="task-item checked"><input type="checkbox" checked disabled/> $1</li>')
      .replace(/^- \[ \] (.*$)/gim, '<li class="task-item"><input type="checkbox" disabled/> $1</li>')
      // Unordered lists
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Horizontal Rules
      .replace(/^---$/gim, '<hr/>')
      // Markdown Tables
      .replace(/\| (.*) \|/gim, (match) => {
        const cells = match
          .split('|')
          .filter((c) => c.trim() !== '')
          .map((c) => `<td>${c.trim()}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .replace(/\n\n/gim, '<br/>');

    return html;
  };

  useEffect(() => {
    setHtmlOutput(parseMarkdown(markdown));
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtmlFile = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `markdown_doc_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printToPdf = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Markdown Document Export</title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              color: #1e293b !important;
              background: #ffffff !important;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
            }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            h2 { color: #0284c7; }
            blockquote { border-left: 4px solid #6366f1; padding-left: 12px; color: #475569; font-style: italic; background: #f8fafc; padding-top: 4px; padding-bottom: 4px; }
            pre { background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            td, th { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          </style>
        </head>
        <body>
          ${htmlOutput}
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

  // Preview Theme Styles
  const getThemeClass = () => {
    switch (previewTheme) {
      case 'dark':
        return 'bg-slate-950 text-slate-100 border-slate-800';
      case 'serif':
        return 'bg-amber-50 text-amber-950 font-serif border-amber-200';
      case 'minimal':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      case 'github':
      default:
        return 'bg-white text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Markdown to HTML & PDF Converter Studio</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Theme Selector */}
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
            <Palette className="h-3.5 w-3.5 text-indigo-400 ml-1.5" />
            <select
              value={previewTheme}
              onChange={(e) => setPreviewTheme(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none pr-1"
            >
              <option value="github" className="bg-slate-900">GitHub Light</option>
              <option value="dark" className="bg-slate-900">Dark Mode</option>
              <option value="serif" className="bg-slate-900">Elegant Serif</option>
              <option value="minimal" className="bg-slate-900">Minimal Clean</option>
            </select>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'rendered' ? 'html' : 'rendered')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold border border-slate-700/60 transition-all"
          >
            {viewMode === 'rendered' ? <Code className="h-3.5 w-3.5 text-indigo-400" /> : <Eye className="h-3.5 w-3.5 text-indigo-400" />}
            <span>{viewMode === 'rendered' ? 'Show Code' : 'Show Render'}</span>
          </button>

          <button
            onClick={copyHtml}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold border border-slate-700/60 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
            <span>{copied ? 'Copied HTML!' : 'Copy HTML'}</span>
          </button>

          <button
            onClick={downloadHtmlFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold border border-slate-700/60 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Download .HTML</span>
          </button>

          <button
            onClick={resetMarkdown}
            title="Reset markdown back to default template"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-rose-400 font-semibold border border-slate-700/60 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={printToPdf}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 hover:from-indigo-400 hover:to-sky-300 text-white font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Printer className="h-4 w-4" />
            <span>Convert to PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Markdown Input */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileCode className="h-4 w-4" />
            <span>Markdown Source Editor</span>
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            className="w-full h-[420px] p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner leading-relaxed"
          />
        </div>

        {/* Output View */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{viewMode === 'rendered' ? 'Visual Rendered HTML Output' : 'Raw HTML Markup'}</span>
          </label>

          {viewMode === 'rendered' ? (
            <div
              className={`w-full h-[420px] p-5 rounded-2xl text-sm overflow-auto shadow-2xl border ${getThemeClass()}`}
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          ) : (
            <textarea
              readOnly
              value={htmlOutput}
              className="w-full h-[420px] p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-300 focus:outline-none resize-none shadow-inner"
            />
          )}
        </div>
      </div>
    </div>
  );
};
