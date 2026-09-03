'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileType, Upload, Download, Check, AlertCircle, Trash2 } from 'lucide-react';

export const ImageToPdf: React.FC = () => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((f) =>
        f.type.startsWith('image/')
      );
      const newItems = selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newItems]);
      setErrorMsg('');
      setStatusMsg('');
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      setErrorMsg('Please upload at least one image.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setStatusMsg('Creating PDF from images...');

      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let embeddedImage;

        if (item.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Default to JPG for jpg/jpeg/webp canvas converted
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        let page;
        if (pageSize === 'a4') {
          // Standard A4: 595.28 x 841.89 points
          page = pdfDoc.addPage([595.28, 841.89]);
          const { width: imgW, height: imgH } = embeddedImage;
          const scale = Math.min(545 / imgW, 791 / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const x = (595.28 - drawW) / 2;
          const y = (841.89 - drawH) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawW,
            height: drawH,
          });
        } else {
          // Fit page to image dimensions
          const { width, height } = embeddedImage;
          page = pdfDoc.addPage([width, height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `images_converted_${Date.now()}.pdf`;
      a.click();

      setStatusMsg('✓ PDF successfully generated and downloaded!');
    } catch (err: any) {
      setErrorMsg('Error converting images: ' + (err.message || 'Format conversion issue'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Row */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <label className="text-xs font-semibold text-gray-300">PDF Page Layout:</label>
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => setPageSize('a4')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              pageSize === 'a4'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            A4 Standard Page
          </button>
          <button
            onClick={() => setPageSize('fit')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              pageSize === 'fit'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            Fit to Image Aspect
          </button>
        </div>
      </div>

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-800 hover:border-sky-500/50 rounded-2xl p-8 text-center bg-gray-950/40 transition-colors">
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          id="img-input"
        />
        <label htmlFor="img-input" className="cursor-pointer space-y-3 block">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Click to upload Images (JPG / PNG)</span>
            <p className="text-xs text-gray-500 mt-1">Combine multiple photos into a single PDF document</p>
          </div>
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((item, idx) => (
            <div key={idx} className="relative group rounded-xl border border-gray-800 overflow-hidden bg-gray-900">
              <img
                src={item.preview}
                alt={`upload-${idx}`}
                className="h-28 w-full object-cover"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-rose-400 hover:text-white transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="p-1.5 text-[10px] text-gray-400 truncate bg-gray-950">
                {item.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Action */}
      <button
        onClick={convertToPdf}
        disabled={isProcessing || images.length === 0}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Download className="h-4 w-4" />
        <span>{isProcessing ? 'Generating PDF...' : `Convert ${images.length} Image(s) to PDF`}</span>
      </button>

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
