'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Download,
  Sliders,
  RotateCw,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
  Eye,
  Pipette,
} from 'lucide-react';

export const PassportPhotoMaker: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('photo.jpg');

  // Zoom & Pan Position State
  const [zoomScale, setZoomScale] = useState<number>(1.0); // 0.5x to 3.0x
  const [panX, setPanX] = useState<number>(0); // -200 to 200 px
  const [panY, setPanY] = useState<number>(0); // -200 to 200 px

  // Background Filler State
  const [bgColor, setBgColor] = useState<string>('#FFFFFF'); // Default Official White
  const [autoEdgeColor, setAutoEdgeColor] = useState<string | null>(null);

  // Live Filter Parameters
  const [contrast, setContrast] = useState<number>(0); // -50 to 50
  const [brightness, setBrightness] = useState<number>(0); // -50 to 50
  const [tilt, setTilt] = useState<number>(0); // -45 to 45 degrees
  const [smoother, setSmoother] = useState<number>(1); // 0 to 3 blur/smoothing
  const [maxKb, setMaxKb] = useState<number>(80); // Target max size in KB (default 80 KB)
  const [aspect, setAspect] = useState<'passport' | 'square'>('passport'); // 35x45mm vs 2x2in

  // Interactive Drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preset background colors
  const BG_COLOR_PRESETS = [
    { label: 'Official White', color: '#FFFFFF' },
    { label: 'Passport Blue', color: '#00A3E0' },
    { label: 'Light Blue', color: '#E0F2FE' },
    { label: 'Light Gray', color: '#E5E7EB' },
    { label: 'Off White', color: '#F8FAFC' },
    { label: 'Warm Cream', color: '#FAF5EF' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFileName(file.name);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      resetPositionAndZoom();
    }
  };

  const resetPositionAndZoom = () => {
    setZoomScale(1.0);
    setPanX(0);
    setPanY(0);
  };

  // Re-render live canvas whenever parameters change
  useEffect(() => {
    if (selectedImage) {
      processPassportPhoto();
    }
  }, [
    selectedImage,
    zoomScale,
    panX,
    panY,
    bgColor,
    contrast,
    brightness,
    tilt,
    smoother,
    maxKb,
    aspect,
  ]);

  // Helper to extract top and side edge average color from image
  const extractAutoEdgeColor = (img: HTMLImageElement) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);

    try {
      // Sample pixels along top row and left/right top corners
      const topData = tempCtx.getImageData(0, 0, img.width, Math.min(20, img.height)).data;
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < topData.length; i += 16) {
        r += topData[i];
        g += topData[i + 1];
        b += topData[i + 2];
        count++;
      }

      if (count > 0) {
        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);
        const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
        setAutoEdgeColor(hex);
      }
    } catch (e) {
      console.warn('Could not extract edge color', e);
    }
  };

  const sampleEdgeColorAndSet = () => {
    if (!selectedImage) return;
    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      extractAutoEdgeColor(img);
      if (autoEdgeColor) {
        setBgColor(autoEdgeColor);
      }
    };
  };

  const processPassportPhoto = () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedImage;

    img.onload = () => {
      // Auto sample edge color on initial load if not set
      if (!autoEdgeColor) {
        extractAutoEdgeColor(img);
      }

      // Standard dimensions: 35x45mm ratio -> 413 x 531 px
      const targetW = aspect === 'passport' ? 413 : 450;
      const targetH = aspect === 'passport' ? 531 : 450;

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.save();
      ctx.clearRect(0, 0, targetW, targetH);

      // Background Filler
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      // Base scaling to fit canvas
      const baseScale = Math.max(targetW / img.width, targetH / img.height);
      const finalScale = baseScale * zoomScale;

      const drawW = img.width * finalScale;
      const drawH = img.height * finalScale;

      // Center point with pan offset
      const centerX = targetW / 2 + panX;
      const centerY = targetH / 2 + panY;

      ctx.translate(centerX, centerY);
      ctx.rotate((tilt * Math.PI) / 180);

      // Filter Effects
      const contrastVal = 100 + contrast;
      const brightnessVal = 100 + brightness;
      const blurVal = smoother;

      ctx.filter = `contrast(${contrastVal}%) brightness(${brightnessVal}%) blur(${blurVal}px)`;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Compression algorithm targeting maxKb
      let quality = 0.94;
      const compressToTarget = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const sizeKb = blob.size / 1024;
              if (sizeKb > maxKb && quality > 0.15) {
                quality -= 0.08;
                compressToTarget();
              } else {
                const url = URL.createObjectURL(blob);
                setOutputUrl(url);
                setOutputSizeKb(Number(sizeKb.toFixed(1)));
                setIsProcessing(false);
              }
            }
          },
          'image/jpeg',
          quality
        );
      };

      compressToTarget();
    };
  };

  // Mouse Drag Handlers for direct Canvas Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newPanX = e.clientX - dragStart.x;
    const newPanY = e.clientY - dragStart.y;
    // Bound pan range
    setPanX(Math.min(250, Math.max(-250, newPanX)));
    setPanY(Math.min(250, Math.max(-250, newPanY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetAll = () => {
    setZoomScale(1.0);
    setPanX(0);
    setPanY(0);
    setBgColor('#FFFFFF');
    setContrast(0);
    setBrightness(0);
    setTilt(0);
    setSmoother(1);
    setMaxKb(80);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!selectedImage ? (
        <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-3xl p-10 text-center bg-slate-900/40 backdrop-blur-xl transition-all">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="passport-input"
          />
          <label htmlFor="passport-input" className="cursor-pointer space-y-4 block">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white">Upload User Photo for Passport Converter</span>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Includes interactive Zoom In/Out, Canvas Drag-to-Position, Auto Edge Color Matching, and guaranteed &lt; 80 KB size optimizer.
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Tool Workspace Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>35x45mm Passport Photo Studio</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={resetAll}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold transition-all border border-slate-700/60"
              >
                Reset All Filters
              </button>

              <button
                onClick={() => setSelectedImage(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold transition-all border border-slate-700/60"
              >
                Upload New Image
              </button>
            </div>
          </div>

          {/* Interactive Control Controls Drawer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Control Column 1: Zoom & Position */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <ZoomIn className="h-4 w-4" />
                <span>Zoom & Position</span>
              </div>

              {/* Zoom Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Zoom Level:</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{zoomScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.05}
                  value={zoomScale}
                  onChange={(e) => setZoomScale(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex gap-1.5 pt-1">
                  {[1.0, 1.25, 1.5, 2.0].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoomScale(z)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        zoomScale === z
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Pan Horizontal (X) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Horizontal Pan (X):</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{panX}px</span>
                </div>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  value={panX}
                  onChange={(e) => setPanX(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Pan Vertical (Y) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Vertical Pan (Y):</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{panY}px</span>
                </div>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  value={panY}
                  onChange={(e) => setPanY(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="text-[11px] text-gray-400 italic">
                💡 Tip: Click and drag directly on the canvas preview to position the photo!
              </div>
            </div>

            {/* Control Column 2: Background Filler & Color Presets */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
                <Palette className="h-4 w-4" />
                <span>Background Filler & Colors</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Select Background Color:</label>
                <div className="grid grid-cols-3 gap-2">
                  {BG_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setBgColor(preset.color)}
                      className={`flex items-center space-x-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                        bgColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'bg-slate-800 border-sky-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-gray-600 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Sample Edge Matching Color Button */}
              <div className="pt-1">
                <button
                  onClick={sampleEdgeColorAndSet}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all shadow-md"
                >
                  <Pipette className="h-4 w-4 text-sky-400" />
                  <span>★ Auto-Sample Edge BG Color</span>
                </button>
                {autoEdgeColor && (
                  <div className="text-[10px] text-gray-400 mt-1.5 text-center font-mono">
                    Extracted Edge Color: <span className="text-sky-300 font-bold">{autoEdgeColor}</span>
                  </div>
                )}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-xs text-gray-300 font-semibold">Custom Color:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-12 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Control Column 3: Fine Tuning & Compression */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                <Sliders className="h-4 w-4" />
                <span>Filters & Target Limit</span>
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Contrast:</span>
                  <span className="font-mono text-purple-400 font-extrabold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tilt / Rotation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Tilt Angle:</span>
                  <span className="font-mono text-purple-400 font-extrabold">{tilt}°</span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Auto Skin Smoother */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Skin Smoother:</span>
                  <span className="font-mono text-purple-400 font-extrabold">{smoother}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.5}
                  value={smoother}
                  onChange={(e) => setSmoother(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Target Max Size (KB) */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Max File Size Limit:</span>
                  <span className="font-mono text-emerald-400 font-extrabold">&lt; {maxKb} KB</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={5}
                  value={maxKb}
                  onChange={(e) => setMaxKb(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Canvas Editor & Final Export Download */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            {/* Interactive Canvas Preview */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center space-y-4 shadow-2xl relative">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-300">
                <Move className="h-4 w-4 text-indigo-400" />
                <span>Interactive Passport Canvas (35x45mm)</span>
              </div>

              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`w-52 h-64 object-contain rounded-2xl border-2 border-dashed border-indigo-500/50 shadow-2xl transition-shadow ${
                  isDragging ? 'cursor-grabbing border-indigo-400 scale-[1.02]' : 'cursor-grab'
                }`}
                style={{ backgroundColor: bgColor }}
                title="Click and drag to position photo inside frame"
              />

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Export Size:</span>
                <span className={`font-mono font-extrabold text-sm ${outputSizeKb <= maxKb ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {outputSizeKb} KB
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  ✓ Portal Ready (&lt; {maxKb} KB)
                </span>
              </div>
            </div>

            {/* Specifications & Export Action Button */}
            <div className="space-y-5">
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 text-xs backdrop-blur-xl">
                <div className="font-extrabold text-white flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Passport Portal Compliance Summary:</span>
                </div>
                <div className="text-gray-400 space-y-2 leading-relaxed">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>Dimensions:</span>
                    <span className="font-mono text-white font-bold">3.5 cm x 4.5 cm (35x45mm)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>Background Fill:</span>
                    <span className="font-mono text-sky-300 font-bold uppercase">{bgColor}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>Zoom Level:</span>
                    <span className="font-mono text-indigo-300 font-bold">{zoomScale.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Target Size Limit:</span>
                    <span className="font-mono text-emerald-400 font-bold">&lt; {maxKb} KB</span>
                  </div>
                </div>
              </div>

              {outputUrl && (
                <a
                  href={outputUrl}
                  download={`passport_photo_${Date.now()}.jpg`}
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-2xl shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Compliant Passport Photo ({outputSizeKb} KB)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
