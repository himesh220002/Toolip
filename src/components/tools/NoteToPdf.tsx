'use client';

import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FileText, Download, Check, AlertCircle } from 'lucide-react';

export const NoteToPdf: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState<string>('Project Meeting Notes');
  const [noteBody, setNoteBody] = useState<string>(
    '1. Toolip platform features 27 everyday utility tools.\n2. All PDF, Image, and Calculation operations process client-side for maximum privacy and speed.\n3. CurrentContext tracker allows real-time tag updates and JSON export.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const generatePdfFromNotes = async () => {
    try {
      setIsGenerating(true);
      setStatusMsg('');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { height } = page.getSize();

      page.drawText(noteTitle, {
        x: 50,
        y: height - 50,
        size: 18,
        font: boldFont,
        color: rgb(0.05, 0.45, 0.8),
      });

      page.drawText(noteBody, {
        x: 50,
        y: height - 90,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: 500,
        lineHeight: 16,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      a.click();

      setStatusMsg('✓ Polished PDF document generated and downloaded!');
    } catch (err: any) {
      setStatusMsg('Error generating PDF: ' + (err.message || 'PDF export issue'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-300">Note Title:</label>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm font-semibold text-white focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-300">Note Body Content:</label>
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={10}
          className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl text-xs text-sky-200 focus:outline-none resize-none leading-relaxed font-mono"
        />
      </div>

      <button
        onClick={generatePdfFromNotes}
        disabled={isGenerating}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg"
      >
        <Download className="h-4 w-4" />
        <span>{isGenerating ? 'Generating PDF...' : 'Convert Notes to PDF Document'}</span>
      </button>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};
