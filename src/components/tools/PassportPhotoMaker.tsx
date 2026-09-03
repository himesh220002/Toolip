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
  Video,
  VideoOff,
  Square,
  X,
} from 'lucide-react';

export const PassportPhotoMaker: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('photo.jpg');

  // Camera Live Capture State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Zoom, Pan & Flip State
  const [zoomScale, setZoomScale] = useState<number>(1.0); // 0.5x to 3.0x
  const [panX, setPanX] = useState<number>(0); // -200 to 200 px
  const [panY, setPanY] = useState<number>(0); // -200 to 200 px
  const [isFlippedX, setIsFlippedX] = useState<boolean>(false);
  const [isFlippedY, setIsFlippedY] = useState<boolean>(false);

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

  // Camera Control Functions
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow webcam permissions or upload an image.');
    }
  };

  // Attach camera stream to video element as soon as React mounts the video node
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn('Video play error:', err));
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 1280;
    captureCanvas.height = video.videoHeight || 720;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);
    
    stopCamera();
    setSelectedImage(dataUrl);
    setOriginalFileName('webcam_snapshot.jpg');
    resetPositionAndZoom();
  };

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
    setIsFlippedX(false);
    setIsFlippedY(false);
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
    isFlippedX,
    isFlippedY,
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
      ctx.scale(isFlippedX ? -1 : 1, isFlippedY ? -1 : 1);

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
      {/* Upload Zone & Live Camera Launch Option */}
      {!selectedImage ? (
        <div className="space-y-4">
          {/* Live Camera Feed Modal Overlay / Container */}
          {isCameraActive ? (
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl flex flex-col items-center">
              <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
                  <Video className="h-4 w-4 animate-pulse" />
                  <span>Live Webcam Passport Capture</span>
                </div>

                <button
                  onClick={stopCamera}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video Stream Container with Passport Face Target Guide Overlay */}
              <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl bg-black overflow-hidden border-2 border-indigo-500/50 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch((err) => console.warn('Video play error:', err));
                    }
                  }}
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* SVG Passport Face & Eye Alignment Guide Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-2">
                  <svg className="w-full h-full max-w-[280px] max-h-[350px]" viewBox="0 0 200 260" fill="none">
                    {/* Glowing Emerald Oval Face Target */}
                    <ellipse
                      cx="100"
                      cy="110"
                      rx="62"
                      ry="82"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                    />
                    {/* Eye Level Line */}
                    <line x1="45" y1="95" x2="155" y2="95" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
                    {/* Vertical Center Line */}
                    <line x1="100" y1="25" x2="100" y2="230" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
                    {/* Shoulder Line Target Arc */}
                    <path d="M 20 250 Q 100 195 180 250" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.85" />
                    {/* Top Head Target Badge */}
                    <rect x="50" y="10" width="100" height="22" rx="6" fill="#0b0f19" stroke="#10b981" strokeWidth="1" />
                    <text x="100" y="25" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      ALIGN FACE & EYES
                    </text>
                  </svg>
                </div>
              </div>

              {/* Snap Action Button */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={capturePhotoFromCamera}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
                >
                  <Camera className="h-5 w-5" />
                  <span>📸 Snap & Use Passport Photo</span>
                </button>

                <button
                  onClick={stopCamera}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Live Webcam Capture Right Away */}
              <button
                onClick={startCamera}
                className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border-2 border-indigo-500/40 hover:border-indigo-400 text-center flex flex-col items-center justify-center space-y-3 shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Video className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    📷 Live Camera Capture Right Away
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Snap your portrait instantly with a live webcam face alignment overlay guide!
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md">
                  Launch Webcam Stream ➔
                </span>
              </button>

              {/* Option 2: Upload File Drop Zone */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-3xl p-8 text-center bg-slate-900/40 backdrop-blur-xl flex flex-col items-center justify-center transition-all">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="passport-input"
                />
                <label htmlFor="passport-input" className="cursor-pointer space-y-3 block w-full">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 text-gray-300 flex items-center justify-center shadow-lg">
                    <Upload className="h-7 w-7 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white">Upload Existing Photo</span>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Select JPG, PNG, or WEBP photo from your computer.
                    </p>
                  </div>
                  <span className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-800 text-gray-200 font-bold text-xs border border-slate-700">
                    Browse Files
                  </span>
                </label>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold text-center">
              {cameraError}
            </div>
          )}
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
                onClick={startCamera}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold transition-all flex items-center space-x-1.5"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Retake with Camera</span>
              </button>

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

              {/* Flip Controls */}
              <div className="pt-1 space-y-1.5">
                <label className="text-xs text-gray-300 font-semibold">Flip Photo (Mirror):</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFlippedX(!isFlippedX)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 ${
                      isFlippedX
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span>↔ Mirror (Flip H)</span>
                  </button>

                  <button
                    onClick={() => setIsFlippedY(!isFlippedY)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 ${
                      isFlippedY
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span>↕ Flip Vertical</span>
                  </button>
                </div>
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
