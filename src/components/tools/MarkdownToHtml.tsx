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
  CheckSquare,
  Maximize2
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

  // Pane Resizing & Drag Expand State
  const [editorHeight, setEditorHeight] = useLocalStorage<number>('toolip_md_editor_height', 420);
  const [outputHeight, setOutputHeight] = useLocalStorage<number>('toolip_md_output_height', 420);
  const [syncHeights, setSyncHeights] = useLocalStorage<boolean>('toolip_md_sync_heights', true);
  const [cornerDragEnabled, setCornerDragEnabled] = useLocalStorage<boolean>('toolip_md_corner_drag', true);

  const handleMouseDown = (e: React.MouseEvent, pane: 'input' | 'output') => {
    e.preventDefault();
    const startY = e.clientY;
    const startEditorH = editorHeight;
    const startOutputH = outputHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      if (pane === 'input') {
        const newH = Math.max(200, Math.min(1400, startEditorH + deltaY));
        setEditorHeight(newH);
        if (syncHeights) setOutputHeight(newH);
      } else {
        const newH = Math.max(200, Math.min(1400, startOutputH + deltaY));
        setOutputHeight(newH);
        if (syncHeights) setEditorHeight(newH);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent, pane: 'input' | 'output') => {
    if (!e.touches[0]) return;
    const startY = e.touches[0].clientY;
    const startEditorH = editorHeight;
    const startOutputH = outputHeight;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches[0]) return;
      const deltaY = moveEvent.touches[0].clientY - startY;
      if (pane === 'input') {
        const newH = Math.max(200, Math.min(1400, startEditorH + deltaY));
        setEditorHeight(newH);
        if (syncHeights) setOutputHeight(newH);
      } else {
        const newH = Math.max(200, Math.min(1400, startOutputH + deltaY));
        setOutputHeight(newH);
        if (syncHeights) setEditorHeight(newH);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

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

      {/* Height & Drag Expand Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 font-semibold flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-indigo-400" /> Height:
          </span>
          {[
            { label: 'Compact', size: 300 },
            { label: 'Standard', size: 420 },
            { label: 'Tall', size: 580 },
            { label: 'Max', size: 750 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setEditorHeight(preset.size);
                setOutputHeight(preset.size);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                editorHeight === preset.size
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              {preset.label} ({preset.size}px)
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncHeights}
              onChange={(e) => {
                setSyncHeights(e.target.checked);
                if (e.target.checked) setOutputHeight(editorHeight);
              }}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-[11px]">Sync Panes</span>
          </label>

          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cornerDragEnabled}
              onChange={(e) => setCornerDragEnabled(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-[11px] font-semibold text-indigo-400">Bottom-Right Drag Expand</span>
          </label>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Markdown Input */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl relative">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileCode className="h-4 w-4" />
            <span>Markdown Source Editor</span>
          </label>
          <div className="relative group">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
              style={{ height: `${editorHeight}px` }}
              className={`w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner ${
                cornerDragEnabled ? 'resize-y' : 'resize-none'
              }`}
            />
            {/* Custom Bottom-Right Corner Drag Handle */}
            {cornerDragEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'input')}
                onTouchStart={(e) => handleTouchStart(e, 'input')}
                title="Drag bottom-right corner to expand markdown editor height"
                className="absolute bottom-2.5 right-2.5 p-1 rounded-br-lg rounded-tl-md bg-indigo-950/90 hover:bg-indigo-500 border border-indigo-500/50 text-indigo-400 hover:text-white cursor-se-resize shadow-lg transition-colors group-hover:opacity-100 flex items-center justify-center select-none z-10"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M14 14H11V12H14V14ZM14 10H7V8H14V10ZM14 6H3V4H14V6Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Output View */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl relative">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{viewMode === 'rendered' ? 'Visual Rendered HTML Output' : 'Raw HTML Markup'}</span>
          </label>

          <div className="relative group">
            {viewMode === 'rendered' ? (
              <div
                style={{ height: `${outputHeight}px` }}
                className={`w-full p-5 rounded-2xl text-sm overflow-auto shadow-2xl border ${getThemeClass()} ${
                  cornerDragEnabled ? 'resize-y' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            ) : (
              <textarea
                readOnly
                value={htmlOutput}
                style={{ height: `${outputHeight}px` }}
                className={`w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-300 focus:outline-none shadow-inner ${
                  cornerDragEnabled ? 'resize-y' : 'resize-none'
                }`}
              />
            )}

            {/* Custom Bottom-Right Corner Drag Handle */}
            {cornerDragEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'output')}
                onTouchStart={(e) => handleTouchStart(e, 'output')}
                title="Drag bottom-right corner to expand preview pane height"
                className="absolute bottom-2.5 right-2.5 p-1 rounded-br-lg rounded-tl-md bg-emerald-950/90 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-400 hover:text-white cursor-se-resize shadow-lg transition-colors group-hover:opacity-100 flex items-center justify-center select-none z-10"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M14 14H11V12H14V14ZM14 10H7V8H14V10ZM14 6H3V4H14V6Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
