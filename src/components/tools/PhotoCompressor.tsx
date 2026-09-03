'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Download, Sparkles, Check, RefreshCw } from 'lucide-react';

export const PhotoCompressor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    originalSize: number;
  } | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [compressedResult, setCompressedResult] = useState<{
    url: string;
    size: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setSelectedImage({
        file,
        preview,
        originalSize: file.size,
      });
      setCompressedResult(null);
    }
  };

  const compressImage = () => {
    if (!selectedImage) return;

    setIsCompressing(true);
    const img = new Image();
    img.src = selectedImage.preview;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = selectedImage.file.type === 'image/png' ? 'image/jpeg' : selectedImage.file.type;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCompressedResult({
                url,
                size: blob.size,
              });
            }
            setIsCompressing(false);
          },
          mimeType,
          quality / 100
        );
      }
    };
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-800 hover:border-sky-500/50 rounded-2xl p-10 text-center bg-gray-950/40 transition-colors">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageSelect}
            className="hidden"
            id="compress-input"
          />
          <label htmlFor="compress-input" className="cursor-pointer space-y-3 block">
            <div className="mx-auto h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Upload Image to Compress</span>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP - Reduce size for email & uploads</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Compression Quality:</span>
                <span className="font-mono text-sky-400">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Max Width (px):</span>
                <span className="font-mono text-sky-400">{maxWidth}px</span>
              </div>
              <select
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value={1920}>1920px (Full HD)</option>
                <option value={1280}>1280px (HD Standard)</option>
                <option value={800}>800px (Medium Web)</option>
                <option value={600}>600px (Small Thumbnail)</option>
              </select>
            </div>
          </div>

          {/* Side-by-side Image Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>Original Image:</span>
                <span className="text-rose-400 font-mono">{formatSize(selectedImage.originalSize)}</span>
              </div>
              <img
                src={selectedImage.preview}
                alt="original"
                className="h-56 w-full object-contain rounded-lg border border-gray-800 bg-gray-900"
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>Compressed Output:</span>
                {compressedResult && (
                  <span className="text-emerald-400 font-mono">
                    {formatSize(compressedResult.size)} (Saved{' '}
                    {(
                      ((selectedImage.originalSize - compressedResult.size) /
                        selectedImage.originalSize) *
                      100
                    ).toFixed(0)}
                    %)
                  </span>
                )}
              </div>
              {compressedResult ? (
                <img
                  src={compressedResult.url}
                  alt="compressed"
                  className="h-56 w-full object-contain rounded-lg border border-gray-800 bg-gray-900"
                />
              ) : (
                <div className="h-56 flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-lg text-gray-600 text-xs space-y-2">
                  <Sparkles className="h-6 w-6 text-gray-600" />
                  <span>Click "Compress Photo" to generate</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={compressImage}
              disabled={isCompressing}
              className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isCompressing ? 'Compressing...' : 'Compress Photo Now'}</span>
            </button>

            {compressedResult && (
              <a
                href={compressedResult.url}
                download={`compressed_${selectedImage.file.name}`}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            )}

            <button
              onClick={() => {
                setSelectedImage(null);
                setCompressedResult(null);
              }}
              className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
