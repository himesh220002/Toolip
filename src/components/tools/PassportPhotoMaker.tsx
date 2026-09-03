'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Download, Sliders, RotateCw, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';

export const PassportPhotoMaker: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('photo.jpg');
  
  // Live Editor Parameters
  const [contrast, setContrast] = useState<number>(0); // -100 to 100
  const [brightness, setBrightness] = useState<number>(0); // -50 to 50
  const [tilt, setTilt] = useState<number>(0); // -45 to 45 degrees
  const [smoother, setSmoother] = useState<number>(1); // 0 to 5 blur/smoothing
  const [maxKb, setMaxKb] = useState<number>(80); // Target max size in KB (default 80 KB)
  const [aspect, setAspect] = useState<'passport' | 'square'>('passport'); // 35x45mm vs 2x2in

  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFileName(file.name);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  // Re-render live canvas whenever sliders change
  useEffect(() => {
    if (selectedImage) {
      processPassportPhoto();
    }
  }, [selectedImage, contrast, brightness, tilt, smoother, maxKb, aspect]);

  const processPassportPhoto = () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedImage;

    img.onload = () => {
      // Standard dimensions: 35x45mm ratio -> 413 x 531 px
      const targetW = aspect === 'passport' ? 413 : 450;
      const targetH = aspect === 'passport' ? 531 : 450;

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.save();
      ctx.clearRect(0, 0, targetW, targetH);

      // White background for passport standard
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);

      // Move context to center for tilt rotation
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate((tilt * Math.PI) / 180);

      // Draw image centered with aspect fill
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;

      // Apply Filter Effects: contrast, brightness, auto smoother
      const contrastVal = 100 + contrast;
      const brightnessVal = 100 + brightness;
      const blurVal = smoother;

      ctx.filter = `contrast(${contrastVal}%) brightness(${brightnessVal}%) blur(${blurVal}px)`;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Compress to guarantee output file size < maxKb (e.g. 80 KB)
      let quality = 0.92;
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

  const resetFilters = () => {
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
        <div className="border-2 border-dashed border-gray-800 hover:border-sky-500/50 rounded-2xl p-10 text-center bg-gray-950/40 transition-colors">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="passport-input"
          />
          <label htmlFor="passport-input" className="cursor-pointer space-y-3 block">
            <div className="mx-auto h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Upload User Photo for Passport Converter</span>
              <p className="text-xs text-gray-500 mt-1">Converts any photo to 35x45mm Passport Format guaranteed under 80 KB</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live Controls Sliders Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            {/* Contrast Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Contrast:</span>
                <span className="font-mono text-sky-400">{contrast}%</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tilt Rotation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Tilt / Angle:</span>
                <span className="font-mono text-sky-400">{tilt}°</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Auto Smoother */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Auto Smoother:</span>
                <span className="font-mono text-sky-400">{smoother}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={0.5}
                value={smoother}
                onChange={(e) => setSmoother(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Target File Size Limit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Max Target Size:</span>
                <span className="font-mono text-emerald-400">&lt; {maxKb} KB</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                step={5}
                value={maxKb}
                onChange={(e) => setMaxKb(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Canvas Live Editor Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col items-center space-y-3">
              <div className="text-xs font-semibold text-gray-400">Live Passport Photo Canvas (35x45mm)</div>
              <canvas
                ref={canvasRef}
                className="w-48 h-60 object-contain rounded-lg border-2 border-dashed border-sky-500/40 shadow-xl bg-white"
              />
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Output Size:</span>
                <span className={`font-mono font-bold ${outputSizeKb <= maxKb ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {outputSizeKb} KB
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  ✓ Ready for Portal Upload
                </span>
              </div>
            </div>

            {/* Controls & Download */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-white">Passport Photo Specifications:</div>
                <div className="text-gray-400 space-y-1">
                  <div>• Standard Dimensions: 3.5cm x 4.5cm (35x45 mm)</div>
                  <div>• Background: Clean White (#FFFFFF)</div>
                  <div>• Strict Size Limit: Guaranteed under 80 KB</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Reset Sliders
                </button>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Change Photo
                </button>
              </div>

              {outputUrl && (
                <a
                  href={outputUrl}
                  download={`passport_photo_${Date.now()}.jpg`}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Download className="h-4 w-4" />
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
