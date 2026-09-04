'use client';

import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  Upload,
  Download,
  FileText,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  FileCode,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const SAMPLE_DOC_TEXT = `# Executive Engineering Report
Project: Toolip Productivity Platform v2.4
Date: September 2026

## 1. Overview
Toolip provides 31+ client-side utility applications operating 100% locally inside the user browser DOM. All processing occurs in memory without remote server uploads.

## 2. Key Architecture Benefits
- Client-Side Privacy Guarantee: Zero telemetry and zero payload data transmitted over external API calls.
- High Performance: Sub-millisecond text processing & instantaneous PDF document generation.
- State Persistence: Built-in local storage cache persistence allowing users to save work across page reloads.

## 3. Supported Export Formats
- Portable Document Format (.PDF)
- Plain Text Document (.TXT)
- HTML Web Markup (.HTML)
- Markdown File (.MD)
`;

export const FileConverter: React.FC = () => {
  const [docContent, setDocContent, resetDocContent] = useLocalStorage<string>(
    'toolip_file_converter_content',
    SAMPLE_DOC_TEXT
  );
  const [fileName, setFileName] = useState<string>('sample_document.md');
  const [targetFormat, setTargetFormat] = useState<'pdf' | 'txt' | 'html' | 'md' | 'json'>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setStatusMsg('');

      try {
        const text = await file.text();
        setDocContent(text);
      } catch (err) {
        setStatusMsg('Error reading uploaded file text content.');
      }
    }
  };

  // Convert & Export File
  const convertAndDownload = async () => {
    if (!docContent.trim()) {
      setStatusMsg('Please provide or upload document text content to convert.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMsg('Processing multi-page document conversion...');

      const baseName = fileName.replace(/\.[^/.]+$/, '');

      if (targetFormat === 'pdf') {
        // Advanced Multi-Page PDF Generation Engine using pdf-lib
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 11;
        const lineHeight = 16;
        const margin = 50;
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const maxTextWidth = pageWidth - margin * 2;

        const lines = docContent.split('\n');
        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;
        let pagesGenerated = 1;

        // Draw header on first page
        currentPage.drawText(`Document Export: ${baseName}`, {
          x: margin,
          y: y,
          size: 9,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        y -= 25;

        // Wrap and write lines line-by-line across multiple pages
        for (const line of lines) {
          // Word wrap line to fit page width
          const words = line.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxTextWidth) {
              // Draw current line and drop y
              if (y < margin + 30) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                pagesGenerated++;
                y = pageHeight - margin;
              }
              currentPage.drawText(currentLine, {
                x: margin,
                y: y,
                size: fontSize,
                font,
                color: rgb(0.1, 0.1, 0.1)
              });
              y -= lineHeight;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            if (y < margin + 30) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              pagesGenerated++;
              y = pageHeight - margin;
            }
            currentPage.drawText(currentLine, {
              x: margin,
              y: y,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1)
            });
            y -= lineHeight;
          }
        }

        setPdfPageCount(pagesGenerated);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (targetFormat === 'html') {
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${baseName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px auto; max-width: 800px; line-height: 1.6; color: #0f172a; padding: 20px; }
    h1, h2, h3 { color: #0284c7; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; overflow-x: auto; }
  </style>
</head>
<body>
  ${docContent.replace(/\n/g, '<br/>')}
</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (targetFormat === 'json') {
        const jsonPayload = JSON.stringify(
          {
            title: baseName,
            exportedAt: new Date().toISOString(),
            content: docContent,
            linesCount: docContent.split('\n').length,
            wordsCount: docContent.split(/\s+/).filter(Boolean).length
          },
          null,
          2
        );
        const blob = new Blob([jsonPayload], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Plain Text or Markdown
        const mimeType = targetFormat === 'md' ? 'text/markdown' : 'text/plain';
        const ext = targetFormat === 'md' ? 'md' : 'txt';
        const blob = new Blob([docContent], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setStatusMsg(`✓ Document converted successfully to .${targetFormat.toUpperCase()}!`);
    } catch (err: any) {
      setStatusMsg('Conversion error: ' + (err.message || 'Unable to process document file.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const wordCount = docContent.split(/\s+/).filter(Boolean).length;
  const lineCount = docContent.split('\n').length;
  const charCount = docContent.length;

  return (
    <div className="space-y-6">
      {/* Upload Dropzone Header */}
      <div className="border-2 border-dashed border-gray-800 hover:border-sky-500/50 rounded-2xl p-6 text-center bg-gray-950/60 transition-all">
        <input
          type="file"
          accept=".txt, .md, .docx, .html, .json, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-conv-input-v2"
        />
        <label htmlFor="file-conv-input-v2" className="cursor-pointer space-y-3 block">
          <div className="mx-auto h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">
              {fileName !== 'sample_document.md' ? `Loaded: ${fileName}` : 'Upload Document (.TXT, .MD, .HTML, .JSON, .DOCX)'}
            </span>
            <p className="text-xs text-gray-400 mt-1">Or edit document text in the live editor below</p>
          </div>
        </label>
      </div>

      {/* Target Format & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-400 font-semibold">Convert Target Format:</span>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
          >
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="txt">Plain Text (.txt)</option>
            <option value="md">Markdown (.md)</option>
            <option value="html">HTML Web Page (.html)</option>
            <option value="json">JSON Metadata Payload (.json)</option>
          </select>

          <button
            onClick={resetDocContent}
            title="Reset document back to sample template"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400 font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Stats */}
        <div className="font-mono text-xs text-sky-400 flex items-center space-x-3">
          <span>Words: {wordCount}</span>
          <span>Lines: {lineCount}</span>
          <span>Chars: {charCount}</span>
        </div>
      </div>

      {/* Live Document Text Editor */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
          <FileCode className="h-4 w-4 text-sky-400" />
          <span>Live Document Editor & Input Source:</span>
        </label>
        <textarea
          value={docContent}
          onChange={(e) => setDocContent(e.target.value)}
          placeholder="Paste or type document content here..."
          className="w-full h-80 p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
        />
      </div>

      {/* Convert & Export Action Button */}
      <button
        onClick={convertAndDownload}
        disabled={isProcessing}
        className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:scale-[1.01] transition-transform"
      >
        <Download className="h-4 w-4" />
        <span>{isProcessing ? 'Converting & Formatting Document...' : `Convert & Download as .${targetFormat.toUpperCase()}`}</span>
      </button>

      {/* Status Alert */}
      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};
