'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, Layers, Split, Upload, Check, AlertCircle } from 'lucide-react';

export const PdfTools: React.FC = () => {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [splitRange, setSplitRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf'
      );
      if (mode === 'split') {
        setFiles(selected.slice(0, 1)); // split mode accepts 1 PDF
      } else {
        setFiles((prev) => [...prev, ...selected]);
      }
      setErrorMsg('');
      setStatusMsg('');
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setStatusMsg('Merging PDF files...');

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      a.click();

      setStatusMsg('✓ Merged PDF generated and downloaded successfully!');
    } catch (err: any) {
      setErrorMsg('Error merging PDFs: ' + (err.message || 'Invalid PDF structure'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      setErrorMsg('Please select a PDF file to split.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setStatusMsg('Splitting PDF file...');

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = srcPdf.getPageCount();

      // Parse range e.g. "1-3, 5"
      const pagesToExtract = new Set<number>();
      const parts = splitRange.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToExtract.add(i - 1);
            }
          }
        } else {
          const pageNum = parseInt(trimmed, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            pagesToExtract.add(pageNum - 1);
          }
        }
      }

      if (pagesToExtract.size === 0) {
        setErrorMsg(`Invalid page range. File has ${totalPages} total pages.`);
        setIsProcessing(false);
        return;
      }

      const splitPdf = await PDFDocument.create();
      const indices = Array.from(pagesToExtract).sort((a, b) => a - b);
      const copiedPages = await splitPdf.copyPages(srcPdf, indices);
      copiedPages.forEach((page) => splitPdf.addPage(page));

      const pdfBytes = await splitPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `split_pages_${splitRange.replace(/\s+/g, '')}.pdf`;
      a.click();

      setStatusMsg(`✓ Extracted ${indices.length} pages into new PDF successfully!`);
    } catch (err: any) {
      setErrorMsg('Error splitting PDF: ' + (err.message || 'Invalid page range'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher — larger, clearer */}
      <div className="flex p-1.5 bg-gunmetal-800 border border-white/10 rounded-xl max-w-sm clip-chamfer-sm">
        <button
          onClick={() => {
            setMode('merge');
            setFiles([]);
            setErrorMsg('');
            setStatusMsg('');
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'merge'
              ? 'bg-halo-cyan text-gunmetal-900 shadow-halo'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Merge PDFs</span>
        </button>
        <button
          onClick={() => {
            setMode('split');
            setFiles([]);
            setErrorMsg('');
            setStatusMsg('');
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'split'
              ? 'bg-halo-cyan text-gunmetal-900 shadow-halo'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Split className="h-4 w-4" />
          <span>Split PDF</span>
        </button>
      </div>

      {/* Upload Zone — fixed contrast on dark */}
      <div className="border-2 border-dashed border-white/15 hover:border-halo-cyan/40 rounded-2xl p-10 text-center bg-white/[0.03] hover:bg-halo-cyan/[0.04] transition-colors group">
        <input
          type="file"
          accept="application/pdf"
          multiple={mode === 'merge'}
          onChange={handleFileChange}
          className="hidden"
          id="pdf-input"
        />
        <label htmlFor="pdf-input" className="cursor-pointer space-y-4 block">
          <div className="mx-auto h-14 w-14 clip-chamfer bg-halo-cyan/10 border border-halo-cyan/20 text-halo-cyan flex items-center justify-center group-hover:bg-halo-cyan/15 transition-colors">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[15px] font-bold text-white tracking-[0.02em]">
              {mode === 'merge' ? 'Click to select PDFs to merge' : 'Click to select PDF to split'}
            </span>
            <p className="text-[13px] text-white/45 mt-1.5 font-mono">Accepts .pdf files • Client-side, instant</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 clip-chamfer-sm font-mono text-xs font-bold text-white/60 group-hover:text-halo-cyan group-hover:border-halo-cyan/30">
            BROWSE FILES
          </span>
        </label>
      </div>

      {/* Selected File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-gray-400">Selected File(s):</h4>
          <div className="space-y-1.5">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs"
              >
                <div className="flex items-center space-x-3 truncate">
                  <FileText className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  <span className="text-gray-200 truncate">{file.name}</span>
                  <span className="text-gray-500 font-mono">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-rose-400 hover:text-rose-300 ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Range Input */}
      {mode === 'split' && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Page Range to Extract (e.g., "1-3", "2, 4, 6", "1-5"):
          </label>
          <input
            type="text"
            value={splitRange}
            onChange={(e) => setSplitRange(e.target.value)}
            placeholder="1-3, 5"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={mode === 'merge' ? handleMerge : handleSplit}
        disabled={isProcessing || files.length === 0}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Download className="h-4 w-4" />
        <span>
          {isProcessing
            ? 'Processing PDF...'
            : mode === 'merge'
            ? `Merge ${files.length} PDF(s)`
            : 'Extract & Download Split PDF'}
        </span>
      </button>

      {/* Feedback Messages */}
      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
