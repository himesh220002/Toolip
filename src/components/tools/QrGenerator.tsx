'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Download, Copy, Check, Sparkles } from 'lucide-react';

export const QrGenerator: React.FC = () => {
  const [text, setText] = useState<string>('https://toolip.app');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(300);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    generateQr();
  }, [text, fgColor, bgColor, size]);

  const generateQr = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrDataUrl(url);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating QR code');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Controls & Inputs */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Target URL or Plain Text:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. https://github.com or WiFi SSID..."
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Preset Quick Links */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setText('WIFI:S:MyHomeWiFi;T:WPA;P:Password123;;')}
            className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-sky-300 hover:border-sky-500/30"
          >
            WiFi Preset
          </button>
          <button
            onClick={() => setText('mailto:hello@toolip.app?subject=Inquiry')}
            className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-sky-300 hover:border-sky-500/30"
          >
            Email Preset
          </button>
          <button
            onClick={() => setText('tel:+1234567890')}
            className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-sky-300 hover:border-sky-500/30"
          >
            Phone Preset
          </button>
        </div>

        {/* Color & Size Pickers */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Foreground Color:</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-300">{fgColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Background Color:</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-300">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>QR Dimension (px):</span>
            <span className="font-mono text-sky-400">{size}x{size} px</span>
          </div>
          <input
            type="range"
            min={150}
            max={600}
            step={25}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* QR Output & Download */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-950 border border-gray-800 rounded-2xl space-y-4">
        {qrDataUrl ? (
          <>
            <div className="p-4 rounded-2xl bg-white shadow-xl shadow-sky-500/10">
              <img src={qrDataUrl} alt="Generated QR Code" className="w-56 h-56 object-contain" />
            </div>

            <a
              href={qrDataUrl}
              download="qrcode_toolip.png"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download High-Res PNG</span>
            </a>
          </>
        ) : (
          <div className="text-xs text-gray-500">Enter text above to preview QR code</div>
        )}
      </div>
    </div>
  );
};
