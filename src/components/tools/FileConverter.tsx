'use client';

import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { RefreshCw, Upload, Download, FileText, Check, AlertCircle } from 'lucide-react';

export const FileConverter: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'pdf' | 'txt'>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSourceFile(e.target.files[0]);
      setStatusMsg('');
    }
  };

  const convertFile = async () => {
    if (!sourceFile) return;

    try {
      setIsProcessing(true);
      setStatusMsg('Converting document file...');

      const text = await sourceFile.text();

      if (targetFormat === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { height } = page.getSize();

        page.drawText(text.slice(0, 2000) || 'Sample converted document content', {
          x: 50,
          y: height - 50,
          size: 11,
          font,
          color: rgb(0.1, 0.1, 0.1),
          maxWidth: 500,
          lineHeight: 14,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${sourceFile.name.replace(/\.[^/.]+$/, '')}.pdf`;
        a.click();
      } else {
        // Export as TXT
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${sourceFile.name.replace(/\.[^/.]+$/, '')}.txt`;
        a.click();
      }

      setStatusMsg('✓ Document converted and downloaded successfully!');
    } catch (err: any) {
      setStatusMsg('Error during conversion: ' + (err.message || 'Format conversion error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-800 hover:border-sky-500/50 rounded-2xl p-8 text-center bg-gray-950/40 transition-colors">
        <input
          type="file"
          accept=".txt, .md, .docx, .html"
          onChange={handleFileChange}
          className="hidden"
          id="file-conv-input"
        />
        <label htmlFor="file-conv-input" className="cursor-pointer space-y-3 block">
          <div className="mx-auto h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">
              {sourceFile ? sourceFile.name : 'Upload Document File (.TXT, .MD, .DOCX)'}
            </span>
            <p className="text-xs text-gray-500 mt-1">Client-side document file conversion</p>
          </div>
        </label>
      </div>

      {sourceFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <label className="text-xs font-semibold text-gray-300">Convert To Target Format:</label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="txt">Plain Text (.txt)</option>
            </select>
          </div>

          <button
            onClick={convertFile}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-xs shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>{isProcessing ? 'Converting File...' : 'Convert & Download File'}</span>
          </button>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};
