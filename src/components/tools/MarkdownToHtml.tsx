'use client';

import React, { useState, useEffect } from 'react';
import { FileCode, Copy, Check, Eye, Code } from 'lucide-react';

export const MarkdownToHtml: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(
    `# Welcome to Toolip Markdown Editor\n\n### Everyday Utility Features:\n- **PDF Merger**: Combine documents easily.\n- **QR Generator**: Custom QR codes.\n- **Loan EMI**: Instant financial calculations.\n\n\`\`\`javascript\nconsole.log("Built with Next.js & Tailwind CSS");\n\`\`\`\n\n> "Simple tools that solve small annoyances get used constantly."`
  );
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'html' | 'rendered'>('rendered');

  // Simple clean markdown parser for headers, bold, italics, code blocks, blockquotes, lists
  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
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

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => setViewMode('rendered')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'rendered'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Rendered Preview</span>
          </button>

          <button
            onClick={() => setViewMode('html')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'html'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Raw HTML Code</span>
          </button>
        </div>

        <button
          onClick={copyHtml}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied HTML!' : 'Copy HTML'}</span>
        </button>
      </div>

      {/* Editor & Preview Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Markdown Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Markdown Editor:</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            className="w-full h-80 p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        {/* Output View */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">
            {viewMode === 'rendered' ? 'Visual HTML Render:' : 'Raw HTML Markup:'}
          </label>
          {viewMode === 'rendered' ? (
            <div
              className="w-full h-80 p-4 bg-gray-950 border border-gray-800 rounded-xl text-gray-200 text-sm overflow-auto prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          ) : (
            <textarea
              readOnly
              value={htmlOutput}
              className="w-full h-80 p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
