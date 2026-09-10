'use client';

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  Download,
  Check,
  AlertCircle,
  Trash2,
  ArrowUpDown,
  MoveLeft,
  MoveRight,
  GripVertical,
  Plus,
  RotateCcw,
  FileCheck,
  Sliders,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  margin?: number;
  cornerRadius?: number;
}

export const ImageToPdf: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(0); // 0 to 60 pt
  const [marginApplyToAll, setMarginApplyToAll] = useState<boolean>(true); // Default true
  const [cornerRadius, setCornerRadius] = useState<number>(0); // 0 to 50 px (default 0)
  const [cornerApplyToAll, setCornerApplyToAll] = useState<boolean>(true); // Default true
  const [mergePdf, setMergePdf] = useState<boolean>(true); // Default true
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Drag & Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [activePreviewIdx, setActivePreviewIdx] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  // Get Effective Per-Image Margin
  const getItemMargin = (item?: ImageItem): number => {
    if (!item) return margin;
    if (marginApplyToAll) return margin;
    return item.margin !== undefined ? item.margin : margin;
  };

  // Get Effective Per-Image Corner Radius
  const getItemCornerRadius = (item?: ImageItem): number => {
    if (!item) return cornerRadius;
    if (cornerApplyToAll) return cornerRadius;
    return item.cornerRadius !== undefined ? item.cornerRadius : cornerRadius;
  };

  // Toggle Margin Apply to All
  const toggleMarginApplyToAll = (applyAll: boolean) => {
    setMarginApplyToAll(applyAll);
    if (applyAll) {
      setImages((prev) => prev.map((img) => ({ ...img, margin })));
    } else {
      setImages((prev) => prev.map((img) => ({ ...img, margin: img.margin ?? margin })));
    }
  };

  // Toggle Corner Radius Apply to All
  const toggleCornerApplyToAll = (applyAll: boolean) => {
    setCornerApplyToAll(applyAll);
    if (applyAll) {
      setImages((prev) => prev.map((img) => ({ ...img, cornerRadius })));
    } else {
      setImages((prev) => prev.map((img) => ({ ...img, cornerRadius: img.cornerRadius ?? cornerRadius })));
    }
  };

  // Change Margin Handler
  const handleMarginChange = (val: number) => {
    if (marginApplyToAll) {
      setMargin(val);
      setImages((prev) => prev.map((img) => ({ ...img, margin: val })));
    } else {
      if (images[activePreviewIdx]) {
        setImages((prev) => {
          const updated = [...prev];
          if (updated[activePreviewIdx]) {
            updated[activePreviewIdx] = { ...updated[activePreviewIdx], margin: val };
          }
          return updated;
        });
      }
    }
  };

  // Change Corner Radius Handler
  const handleCornerRadiusChange = (val: number) => {
    if (cornerApplyToAll) {
      setCornerRadius(val);
      setImages((prev) => prev.map((img) => ({ ...img, cornerRadius: val })));
    } else {
      if (images[activePreviewIdx]) {
        setImages((prev) => {
          const updated = [...prev];
          if (updated[activePreviewIdx]) {
            updated[activePreviewIdx] = { ...updated[activePreviewIdx], cornerRadius: val };
          }
          return updated;
        });
      }
    }
  };

  // Helper to process rounded corners on image canvas if cornerRadius > 0
  const getProcessedImageBytes = async (file: File, radiusPx: number): Promise<{ bytes: ArrayBuffer; isPng: boolean }> => {
    if (radiusPx <= 0) {
      const bytes = await file.arrayBuffer();
      return { bytes, isPng: file.type === 'image/png' };
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          file.arrayBuffer().then((b) => resolve({ bytes: b, isPng: file.type === 'image/png' }));
          return;
        }

        const scale = Math.min(w, h) / 400;
        const r = Math.min(Math.min(w / 2, h / 2), Math.max(0, radiusPx * scale));

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(0, 0, w, h, r);
        } else {
          ctx.moveTo(r, 0);
          ctx.arcTo(w, 0, w, h, r);
          ctx.arcTo(w, h, 0, h, r);
          ctx.arcTo(0, h, 0, 0, r);
          ctx.arcTo(0, 0, w, 0, r);
          ctx.closePath();
        }
        ctx.clip();
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => {
          if (!blob) {
            file.arrayBuffer().then((b) => resolve({ bytes: b, isPng: file.type === 'image/png' }));
            return;
          }
          blob.arrayBuffer().then((b) => resolve({ bytes: b, isPng: true }));
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        file.arrayBuffer().then((b) => resolve({ bytes: b, isPng: file.type === 'image/png' }));
      };
      img.src = url;
    });
  };

  // Calculate Paper Aspect Ratio (Width / Height) for Real-Time Visualizer
  const getPaperAspectRatio = (imgItem?: ImageItem): number => {
    let imgW = 800;
    let imgH = 600;
    if (imgItem) {
      // Default estimation or fit
    }

    if (pageSize === 'fit') {
      return imgItem ? 4 / 3 : 1;
    }

    const baseSizes = {
      a4: { w: 595.28, h: 841.89 },
      letter: { w: 612.00, h: 792.00 },
      legal: { w: 612.00, h: 1008.00 },
      a3: { w: 841.89, h: 1190.55 },
      a5: { w: 419.53, h: 595.28 },
    };

    const { w, h } = baseSizes[pageSize] || baseSizes.a4;
    let isLandscape = orientation === 'landscape';
    if (orientation === 'auto' && imgItem) {
      isLandscape = imgW > imgH;
    }

    return isLandscape ? Math.max(w, h) / Math.min(w, h) : Math.min(w, h) / Math.max(w, h);
  };

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((f) =>
        f.type.startsWith('image/')
      );
      const newItems: ImageItem[] = selectedFiles.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newItems]);
      setErrorMsg('');
      setStatusMsg('');
    }
  };

  // Remove Single Image
  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clear All Images
  const clearAllImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setStatusMsg('');
    setErrorMsg('');
  };

  // Drag & Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...images];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(idx, 0, removed);
    setImages(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const moveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const updated = [...images];
    const [removed] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, removed);
    setImages(updated);
  };

  // Sort Images Alphabetically by Name (A-Z / Z-A)
  const sortByName = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    const sorted = [...images].sort((a, b) => {
      const nameA = a.file.name.toLowerCase();
      const nameB = b.file.name.toLowerCase();
      return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    setImages(sorted);
    setStatusMsg(`✨ Sorted images ${order === 'asc' ? 'A to Z' : 'Z to A'}`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Page Dimensions Helper (in PDF points)
  const getPageDimensions = (
    size: 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit',
    orient: 'portrait' | 'landscape' | 'auto',
    imgWidth: number,
    imgHeight: number
  ): { width: number; height: number } => {
    if (size === 'fit') {
      return { width: imgWidth, height: imgHeight };
    }

    const baseSizes = {
      a4: { w: 595.28, h: 841.89 },
      letter: { w: 612.00, h: 792.00 },
      legal: { w: 612.00, h: 1008.00 },
      a3: { w: 841.89, h: 1190.55 },
      a5: { w: 419.53, h: 595.28 },
    };

    const { w, h } = baseSizes[size] || baseSizes.a4;

    let isLandscape = orient === 'landscape';
    if (orient === 'auto') {
      isLandscape = imgWidth > imgHeight;
    }

    return isLandscape
      ? { width: Math.max(w, h), height: Math.min(w, h) }
      : { width: Math.min(w, h), height: Math.max(w, h) };
  };

  // Convert Images to PDF
  const convertToPdf = async () => {
    if (images.length === 0) {
      setErrorMsg('Please upload at least one image first.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setStatusMsg('Processing images to PDF...');

      if (mergePdf) {
        // Merge into 1 single multi-page PDF document
        const pdfDoc = await PDFDocument.create();

        for (const item of images) {
          const itemMargin = getItemMargin(item);
          const itemRadius = getItemCornerRadius(item);
          const { bytes, isPng } = await getProcessedImageBytes(item.file, itemRadius);
          let embeddedImage;

          if (isPng) {
            embeddedImage = await pdfDoc.embedPng(bytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(bytes);
          }

          const { width: imgW, height: imgH } = embeddedImage;
          const pageDim = getPageDimensions(pageSize, orientation, imgW, imgH);
          const pad = itemMargin;

          const printableW = Math.max(10, pageDim.width - pad * 2);
          const printableH = Math.max(10, pageDim.height - pad * 2);

          const scale = Math.min(printableW / imgW, printableH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;

          const x = pad + (printableW - drawW) / 2;
          const y = pad + (printableH - drawH) / 2;

          const page = pdfDoc.addPage([pageDim.width, pageDim.height]);
          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawW,
            height: drawH,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `images_combined_${Date.now()}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatusMsg(`✓ Combined PDF (${images.length} pages) generated & downloaded!`);
      } else {
        // Generate separate individual PDF files for each image
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          const pdfDoc = await PDFDocument.create();
          const itemMargin = getItemMargin(item);
          const itemRadius = getItemCornerRadius(item);
          const { bytes, isPng } = await getProcessedImageBytes(item.file, itemRadius);
          let embeddedImage;

          if (isPng) {
            embeddedImage = await pdfDoc.embedPng(bytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(bytes);
          }

          const { width: imgW, height: imgH } = embeddedImage;
          const pageDim = getPageDimensions(pageSize, orientation, imgW, imgH);
          const pad = itemMargin;

          const printableW = Math.max(10, pageDim.width - pad * 2);
          const printableH = Math.max(10, pageDim.height - pad * 2);

          const scale = Math.min(printableW / imgW, printableH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;

          const x = pad + (printableW - drawW) / 2;
          const y = pad + (printableH - drawH) / 2;

          const page = pdfDoc.addPage([pageDim.width, pageDim.height]);
          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawW,
            height: drawH,
          });

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.file.name.replace(/\.[^/.]+$/, '')}_page_${i + 1}.pdf`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        setStatusMsg(`✓ ${images.length} individual PDF files generated & downloaded!`);
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      setErrorMsg('Error creating PDF: ' + (err.message || 'PDF export issue'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Studio 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Image Upload & Drag-to-Rearrange Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Image Toolbar */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Uploaded Images ({images.length})
              </span>
              {images.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  {images.length} Page{images.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Add More Images Button */}
              <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all">
                <Plus className="h-4 w-4" />
                <span>Add Images</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* Sort A-Z / Z-A Dropdown Buttons */}
              {images.length > 1 && (
                <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => sortByName('asc')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sortOrder === 'asc'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Sort images by filename A to Z"
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => sortByName('desc')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sortOrder === 'desc'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Sort images by filename Z to A"
                  >
                    Z-A
                  </button>
                </div>
              )}

              {/* Clear All Button */}
              {images.length > 0 && (
                <button
                  onClick={clearAllImages}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-gray-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-all text-xs"
                  title="Clear all uploaded images"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Upload Dropzone (When Empty) */}
          {images.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-3xl p-12 text-center bg-slate-950/60 backdrop-blur-xl transition-all">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="img-upload-hero"
              />
              <label htmlFor="img-upload-hero" className="cursor-pointer space-y-4 block">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Click or Drag & Drop Images (JPG / PNG / WebP)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    Select multiple photos to arrange, customize margins & orientation, and preview PDF live.
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* REAL-TIME LIVE PDF PAGE CANVAS STAGE */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Real-Time PDF Page Preview
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                      Page {activePreviewIdx + 1} of {images.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-[11px] font-mono text-gray-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                      {pageSize.toUpperCase()} • {orientation.toUpperCase()} • Margin: {margin}px
                    </span>
                    {/* Navigation buttons for preview pages */}
                    {images.length > 1 && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setActivePreviewIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold text-xs"
                          title="Previous Page"
                        >
                          ◀ Prev
                        </button>
                        <button
                          onClick={() => setActivePreviewIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold text-xs"
                          title="Next Page"
                        >
                          Next ▶
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated Paper Sheet Canvas Frame */}
                <div className="bg-slate-900/60 rounded-2xl p-6 min-h-[320px] flex items-center justify-center relative overflow-hidden border border-slate-800/60">
                  {images[activePreviewIdx] && (
                    <div
                      className="bg-white shadow-2xl rounded-xs transition-all duration-300 relative flex items-center justify-center overflow-hidden"
                      style={{
                        width: orientation === 'landscape' ? '380px' : '260px',
                        height: orientation === 'landscape' ? '260px' : '360px',
                        padding: `${Math.round((getItemMargin(images[activePreviewIdx]) / 60) * 28)}px`,
                      }}
                    >
                      {/* Printable Area Dashed Guide Line */}
                      <div
                        className="w-full h-full border border-dashed border-amber-500/70 rounded-xs flex items-center justify-center relative bg-slate-50/50"
                      >
                        <img
                          src={images[activePreviewIdx].preview}
                          alt="Live PDF Preview"
                          className="max-h-full max-w-full object-contain shadow-sm transition-all"
                          style={{ borderRadius: `${getItemCornerRadius(images[activePreviewIdx])}px` }}
                        />
                        {/* Printable Margin Overlay Label */}
                        <div className="absolute top-1 right-1 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-800 px-1 rounded backdrop-blur-xs pointer-events-none">
                          Printable Bounds
                        </div>
                      </div>

                      {/* Paper Page Edge Watermark */}
                      <div className="absolute bottom-1 left-2 text-[9px] font-mono text-gray-400 pointer-events-none">
                        {pageSize.toUpperCase()} Paper
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Drag-and-Drop Image Cards Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-1">
                  <span>Page Arrangement (Click to select for preview)</span>
                  <span className="text-[10px] text-amber-400">💡 Drag cards to reorder</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
                  {images.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onClick={() => setActivePreviewIdx(idx)}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      className={`relative group rounded-2xl border transition-all duration-200 bg-slate-900 overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer ${
                        activePreviewIdx === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/10'
                          : draggedIdx === idx
                          ? 'opacity-40 border-amber-500 scale-95'
                          : dragOverIdx === idx
                          ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105'
                          : 'border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      {/* Top Bar Badge & Controls */}
                      <div className="p-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="font-extrabold text-amber-400 flex items-center space-x-1">
                          <GripVertical className="h-3.5 w-3.5 text-gray-500" />
                          <span>P.{idx + 1}</span>
                        </span>

                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          {idx > 0 && (
                            <button
                              onClick={() => moveImage(idx, idx - 1)}
                              className="p-1 rounded hover:bg-slate-800 text-gray-400 hover:text-white"
                              title="Move Left"
                            >
                              <MoveLeft className="h-3 w-3" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              onClick={() => moveImage(idx, idx + 1)}
                              className="p-1 rounded hover:bg-slate-800 text-gray-400 hover:text-white"
                              title="Move Right"
                            >
                              <MoveRight className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              removeImage(idx);
                              if (activePreviewIdx >= images.length - 1 && activePreviewIdx > 0) {
                                setActivePreviewIdx(activePreviewIdx - 1);
                              }
                            }}
                            className="p-1 rounded hover:bg-rose-950 text-rose-400 hover:text-rose-200"
                            title="Remove image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Mini Simulated PDF Page Thumbnail */}
                      <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
                        <div
                          className="bg-white rounded-xs transition-all duration-200 relative flex items-center justify-center shadow-md overflow-hidden"
                          style={{
                            width: orientation === 'landscape' ? '100%' : '75%',
                            height: orientation === 'landscape' ? '75%' : '100%',
                            padding: `${Math.round((getItemMargin(item) / 60) * 10)}px`,
                          }}
                        >
                          <div className="w-full h-full border border-dashed border-amber-500/40 rounded-xs flex items-center justify-center">
                            <img
                              src={item.preview}
                              alt={item.file.name}
                              className="max-h-full max-w-full object-contain"
                              style={{ borderRadius: `${Math.round(getItemCornerRadius(item) * 0.3)}px` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Filename Footer */}
                      <div className="p-2 text-[10px] font-mono text-gray-300 truncate bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="truncate">{item.file.name}</span>
                        {activePreviewIdx === idx && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Image to PDF Options Panel */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Image to PDF Options</span>
            </h3>
          </div>

          {/* 1. Page Orientation Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300">Page Orientation:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'portrait', label: 'Portrait', icon: RectangleVertical },
                { id: 'landscape', label: 'Landscape', icon: RectangleHorizontal },
                { id: 'auto', label: 'Auto Fit', icon: Square },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOrientation(o.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                    orientation === o.id
                      ? 'bg-amber-600/20 border-amber-400 text-amber-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <o.icon className="h-5 w-5" />
                  <span className="text-[11px]">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Page Size Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300">Page Size:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="a4">A4 (297 × 210 mm)</option>
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="legal">Legal (8.5 × 14 in)</option>
              <option value="a3">A3 (420 × 297 mm)</option>
              <option value="a5">A5 (210 × 148 mm)</option>
              <option value="fit">Fit to Image Aspect Ratio</option>
            </select>
          </div>

          {/* 3. Margins: Preset Chips + Drag Slider + Apply to All Checkbox */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-1.5">
                <label className="font-semibold text-gray-300">Page Margin Padding:</label>
                {!marginApplyToAll && images[activePreviewIdx] && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    Page {activePreviewIdx + 1}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-amber-400 font-extrabold text-xs">
                  {getItemMargin(images[activePreviewIdx])} px
                </span>
                <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
                  <input
                    type="checkbox"
                    id="margin-apply-all"
                    checked={marginApplyToAll}
                    onChange={(e) => toggleMarginApplyToAll(e.target.checked)}
                    className="h-3.5 w-3.5 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="margin-apply-all" className="text-[11px] font-bold text-gray-300 cursor-pointer select-none">
                    Apply to all
                  </label>
                </div>
              </div>
            </div>

            {/* Margin Preset Chips */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 0, label: 'No Margin' },
                { value: 15, label: 'Small (15px)' },
                { value: 30, label: 'Big (30px)' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => handleMarginChange(p.value)}
                  className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                    getItemMargin(images[activePreviewIdx]) === p.value
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Margin Drag Slider */}
            <input
              type="range"
              min={0}
              max={60}
              value={getItemMargin(images[activePreviewIdx])}
              onChange={(e) => handleMarginChange(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Image Corner Roundness Controller + Apply to All Checkbox */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-1.5">
                <label className="font-semibold text-gray-300">Image Corner Roundness:</label>
                {!cornerApplyToAll && images[activePreviewIdx] && (
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                    Page {activePreviewIdx + 1}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-purple-400 font-extrabold text-xs">
                  {getItemCornerRadius(images[activePreviewIdx]) === 0
                    ? '0px (Sharp)'
                    : `${getItemCornerRadius(images[activePreviewIdx])} px`}
                </span>
                <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
                  <input
                    type="checkbox"
                    id="corner-apply-all"
                    checked={cornerApplyToAll}
                    onChange={(e) => toggleCornerApplyToAll(e.target.checked)}
                    className="h-3.5 w-3.5 accent-purple-500 rounded cursor-pointer"
                  />
                  <label htmlFor="corner-apply-all" className="text-[11px] font-bold text-gray-300 cursor-pointer select-none">
                    Apply to all
                  </label>
                </div>
              </div>
            </div>

            {/* Corner Radius Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { value: 0, label: '0px' },
                { value: 12, label: '12px' },
                { value: 25, label: '25px' },
                { value: 50, label: '50px' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleCornerRadiusChange(c.value)}
                  className={`py-1 rounded-xl border text-[10px] font-bold transition-all ${
                    getItemCornerRadius(images[activePreviewIdx]) === c.value
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Corner Radius Drag Slider */}
            <input
              type="range"
              min={0}
              max={50}
              value={getItemCornerRadius(images[activePreviewIdx])}
              onChange={(e) => handleCornerRadiusChange(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-gray-400">
              {getItemCornerRadius(images[activePreviewIdx]) === 0
                ? 'Standard sharp corners (0px rounding).'
                : `Rounds image corners by ${getItemCornerRadius(images[activePreviewIdx])}px in live preview & PDF.`}
            </p>
          </div>

          {/* 4. Merge All Images in One PDF Checkbox (Default True) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer" onClick={() => setMergePdf(!mergePdf)}>
              <input
                type="checkbox"
                id="merge-toggle"
                checked={mergePdf}
                onChange={(e) => setMergePdf(e.target.checked)}
                className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="merge-toggle" className="text-xs text-gray-200 font-extrabold cursor-pointer select-none">
                Merge all images in one PDF file
              </label>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 px-1">
              {mergePdf
                ? 'Combines all uploaded photos into a single multi-page PDF document.'
                : 'Generates separate individual PDF files for each photo.'}
            </p>
          </div>

          {/* Export Action Button */}
          <button
            onClick={convertToPdf}
            disabled={isProcessing || images.length === 0}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
          >
            <Download className="h-4 w-4" />
            <span>
              {isProcessing
                ? 'Generating PDF...'
                : mergePdf
                ? `Convert ${images.length} Image(s) to 1 PDF`
                : `Export ${images.length} Individual PDF(s)`}
            </span>
          </button>

          {/* Status & Error Messages */}
          {statusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

