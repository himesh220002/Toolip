'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  FileText,
  Download,
  Check,
  Sliders,
  Palette,
  Eye,
  Sparkles,
  Printer,
  Calendar,
  Type,
  Layout,
  Maximize2,
} from 'lucide-react';

export const NoteToPdf: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState<string>('Executive Project Summary');
  const [noteSubtitle, setNoteSubtitle] = useState<string>('Toolip Utility Platform Architecture & Roadmap');
  const [authorName, setAuthorName] = useState<string>('Himesh & Team');
  const [noteBody, setNoteBody] = useState<string>(
    `1. Executive Overview:
Toolip features 32+ standalone client-side utility tools designed for high performance, zero data latency, and privacy compliance.

2. Core Technical Architecture:
• Framework: Next.js 14 App Router with TypeScript & Tailwind CSS.
• Client-Side Processing: PDF manipulation via pdf-lib, HTML5 Canvas image editing, Web Audio API frequency visualizer, and Web Speech API dictation.
• Standalone Workspaces: Each tool functions as an isolated single-page application with unique URL routes (/tools/[id]).

3. Next Milestones & Deliverables:
• Add automated offline PWA service worker caching for offline utility access.
• Enhance PDF exporter with custom watermark, page numbering stamps, and password protection.`
  );

  // Styling & Theme State
  const [theme, setTheme] = useState<'corporate' | 'emerald' | 'minimal' | 'midnight' | 'sunset'>('corporate');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<number>(14); // 12 to 24 px
  const [marginPadding, setMarginPadding] = useState<number>(36); // 20 to 60 px
  const [showFooterDate, setShowFooterDate] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const previewSheetRef = useRef<HTMLDivElement | null>(null);

  // Document Color Themes Config
  const THEME_CONFIGS = {
    corporate: {
      name: 'Corporate Blue',
      headerBg: 'bg-indigo-600',
      accentColor: '#4f46e5',
      paperBg: 'bg-white',
      textColor: 'text-slate-900',
      subtitleColor: 'text-indigo-600',
      borderAccent: 'border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    emerald: {
      name: 'Emerald Clean',
      headerBg: 'bg-emerald-600',
      accentColor: '#059669',
      paperBg: 'bg-emerald-50/30',
      textColor: 'text-slate-900',
      subtitleColor: 'text-emerald-700',
      borderAccent: 'border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    minimal: {
      name: 'Minimalist Light',
      headerBg: 'bg-slate-900',
      accentColor: '#0f172a',
      paperBg: 'bg-white',
      textColor: 'text-slate-900',
      subtitleColor: 'text-slate-600',
      borderAccent: 'border-slate-400',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    },
    midnight: {
      name: 'Midnight Dark',
      headerBg: 'bg-purple-600',
      accentColor: '#9333ea',
      paperBg: 'bg-slate-950',
      textColor: 'text-slate-100',
      subtitleColor: 'text-purple-400',
      borderAccent: 'border-purple-500',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800',
    },
    sunset: {
      name: 'Warm Sunset',
      headerBg: 'bg-amber-600',
      accentColor: '#d97706',
      paperBg: 'bg-amber-50/20',
      textColor: 'text-slate-900',
      subtitleColor: 'text-amber-700',
      borderAccent: 'border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  };

  const currentTheme = THEME_CONFIGS[theme];

  // Font Family Mapping
  const FONT_CLASSES = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Clean Isolated Document PDF Printing Engine
  const printCleanPdfDocument = () => {
    if (!previewSheetRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fontStyle =
      fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'mono'
        ? 'Courier New, monospace'
        : 'Inter, system-ui, sans-serif';

    const hexAccent = currentTheme.accentColor;
    const isDark = theme === 'midnight';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${noteTitle || 'Note Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: ${marginPadding}px;
              font-family: ${fontStyle};
              color: ${isDark ? '#f8fafc' : '#0f172a'};
              background-color: ${isDark ? '#090d16' : '#ffffff'};
              line-height: 1.6;
              box-sizing: border-box;
            }
            .header-bar {
              border-bottom: 3px solid ${hexAccent};
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 6px 0;
              color: ${isDark ? '#ffffff' : '#0f172a'};
            }
            .subtitle {
              font-size: 13px;
              font-weight: 600;
              color: ${hexAccent};
              margin: 0;
            }
            .meta-bar {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: ${isDark ? '#94a3b8' : '#64748b'};
              margin-top: 10px;
            }
            .content-body {
              font-size: ${fontSize}px;
              white-space: pre-wrap;
            }
            .footer-stamp {
              position: fixed;
              bottom: 20px;
              left: ${marginPadding}px;
              right: ${marginPadding}px;
              border-top: 1px solid ${isDark ? '#1e293b' : '#e2e8f0'};
              padding-top: 8px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: ${isDark ? '#64748b' : '#94a3b8'};
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <h1 class="title">${noteTitle || 'Untitled Note'}</h1>
            ${noteSubtitle ? `<div class="subtitle">${noteSubtitle}</div>` : ''}
            <div class="meta-bar">
              <span>Author: ${authorName || 'Anonymous'}</span>
              <span>Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
            </div>
          </div>

          <div class="content-body">${noteBody}</div>

          ${
            showFooterDate
              ? `<div class="footer-stamp">
                  <span>Generated via Toolip Note Studio</span>
                  <span>Page 1 of 1</span>
                </div>`
              : ''
          }

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export PDF Document using pdf-lib vector engine
  const generateVectorPdf = async () => {
    try {
      setIsGenerating(true);
      setStatusMsg('');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(
        fontFamily === 'serif'
          ? StandardFonts.TimesRoman
          : fontFamily === 'mono'
          ? StandardFonts.Courier
          : StandardFonts.Helvetica
      );
      const boldFont = await pdfDoc.embedFont(
        fontFamily === 'serif'
          ? StandardFonts.TimesRomanBold
          : fontFamily === 'mono'
          ? StandardFonts.CourierBold
          : StandardFonts.HelveticaBold
      );

      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Dimensions
      const { height, width } = page.getSize();

      const pad = marginPadding;
      let yCursor = height - pad;

      // Header Title
      page.drawText(noteTitle || 'Untitled Note', {
        x: pad,
        y: yCursor,
        size: 20,
        font: boldFont,
        color: rgb(0.05, 0.1, 0.2),
      });
      yCursor -= 24;

      // Subtitle
      if (noteSubtitle) {
        page.drawText(noteSubtitle, {
          x: pad,
          y: yCursor,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.35, 0.75),
        });
        yCursor -= 18;
      }

      // Meta date
      page.drawText(`Author: ${authorName} | Date: ${new Date().toLocaleDateString()}`, {
        x: pad,
        y: yCursor,
        size: 9,
        font,
        color: rgb(0.4, 0.45, 0.5),
      });
      yCursor -= 14;

      // Accent Rule
      page.drawLine({
        start: { x: pad, y: yCursor },
        end: { x: width - pad, y: yCursor },
        thickness: 2,
        color: rgb(0.2, 0.35, 0.75),
      });
      yCursor -= 20;

      // Note Body text block wrapping
      const lines = noteBody.split('\n');
      for (const line of lines) {
        if (yCursor < pad + 30) break; // End of page safeguard
        page.drawText(line, {
          x: pad,
          y: yCursor,
          size: Math.min(fontSize, 14),
          font,
          color: rgb(0.1, 0.15, 0.2),
          maxWidth: width - pad * 2,
          lineHeight: 16,
        });
        yCursor -= 16;
      }

      // Footer stamp
      if (showFooterDate) {
        page.drawText('Generated with Toolip Note to PDF Studio', {
          x: pad,
          y: pad,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${(noteTitle || 'note_document').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      a.click();

      setStatusMsg('✓ High-resolution PDF document generated & downloaded!');
    } catch (err: any) {
      console.error('PDF error:', err);
      setStatusMsg('Error generating PDF: ' + (err.message || 'PDF export issue'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Control Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Note to PDF Side-by-Side Studio</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={printCleanPdfDocument}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 transition-all shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Print Clean PDF</span>
          </button>

          <button
            onClick={generateVectorPdf}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? 'Exporting PDF...' : 'Download PDF Document'}</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Studio Layout (2 Columns on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Note Editor & Styling Controls */}
        <div className="space-y-5">
          {/* Note Metadata Inputs */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              <FileText className="h-4 w-4" />
              <span>Document Details</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300">Document Title:</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Subtitle / Tagline:</label>
                <input
                  type="text"
                  value={noteSubtitle}
                  onChange={(e) => setNoteSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Author Name:</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Multiline Content Textarea */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Type className="h-4 w-4" />
                <span>Note Content Body</span>
              </span>
              <span className="font-mono text-[10px] text-gray-400">{noteBody.length} characters</span>
            </div>

            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={12}
              placeholder="Type your notes, meeting bullet points, or document draft here..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed font-mono whitespace-pre-wrap shadow-inner"
            />
          </div>

          {/* Document Theme & Styling Controls */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
              <Palette className="h-4 w-4" />
              <span>Theme & Typography Options</span>
            </div>

            {/* Document Color Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Select Document Theme:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(THEME_CONFIGS) as Array<keyof typeof THEME_CONFIGS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      theme === key
                        ? 'bg-slate-800 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: THEME_CONFIGS[key].accentColor }}
                    />
                    <span className="truncate">{THEME_CONFIGS[key].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-gray-300">Font Family:</label>
              <div className="flex gap-2">
                {[
                  { id: 'sans', label: 'Sans-Serif (Modern)' },
                  { id: 'serif', label: 'Serif (Classic)' },
                  { id: 'mono', label: 'Monospace (Code)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      fontFamily === f.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Font Size & Page Margins */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Font Size:</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Page Margins:</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{marginPadding}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={marginPadding}
                  onChange={(e) => setMarginPadding(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Stamp Toggle */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="footer-toggle"
                checked={showFooterDate}
                onChange={(e) => setShowFooterDate(e.target.checked)}
                className="h-4 w-4 accent-indigo-500 rounded cursor-pointer"
              />
              <label htmlFor="footer-toggle" className="text-xs text-gray-300 font-semibold cursor-pointer">
                Include Footer Stamp (Date, Page Number & Platform Attribution)
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 PDF Paper Sheet Preview (Side-by-Side View) */}
        <div className="space-y-3 sticky top-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Live A4 PDF Sheet Preview</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              Live Responsive Preview
            </span>
          </div>

          {/* Live A4 Paper Sheet Container */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl flex justify-center shadow-2xl overflow-hidden">
            <div
              ref={previewSheetRef}
              className={`w-full max-w-lg aspect-[210/297] rounded-xl shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden border ${currentTheme.paperBg} ${currentTheme.textColor} ${FONT_CLASSES[fontFamily]}`}
              style={{ padding: `${marginPadding}px` }}
            >
              {/* Header Accent & Title Block */}
              <div className="space-y-2 border-b-2 pb-4" style={{ borderColor: currentTheme.accentColor }}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${currentTheme.badgeBg}`}>
                    {currentTheme.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                  {noteTitle || 'Untitled Note Document'}
                </h1>

                {noteSubtitle && (
                  <div className={`text-xs font-bold ${currentTheme.subtitleColor}`}>
                    {noteSubtitle}
                  </div>
                )}

                <div className="text-[10px] text-gray-400 font-mono">
                  Author: <span className="font-semibold text-gray-300">{authorName || 'Anonymous'}</span>
                </div>
              </div>

              {/* Note Content Body Paragraphs */}
              <div
                className="flex-1 my-4 leading-relaxed whitespace-pre-wrap overflow-y-auto"
                style={{ fontSize: `${fontSize}px` }}
              >
                {noteBody || 'Your notes will render here live in real-time...'}
              </div>

              {/* Footer Stamp */}
              {showFooterDate && (
                <div className="pt-3 border-t border-gray-300/40 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>Generated with Toolip Note to PDF Studio</span>
                  <span>Page 1 of 1</span>
                </div>
              )}
            </div>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
