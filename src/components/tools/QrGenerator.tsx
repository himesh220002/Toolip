'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Download, Copy, Check, Sparkles, Upload, Image as ImageIcon, Shield, Palette, Zap } from 'lucide-react';

const PRESET_ICONS: Record<string, { label: string; svg: string; color: string }> = {
  Starbucks: {
    label: 'Starbucks Emblem',
    color: '#006241',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#006241"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="3"/>
      <path d="M50 18 L55 32 L70 32 L58 41 L62 55 L50 46 L38 55 L42 41 L30 32 L45 32 Z" fill="#ffffff"/>
      <path d="M 32 60 Q 50 82 68 60 Q 50 72 32 60 Z" fill="#ffffff"/>
      <circle cx="38" cy="45" r="3" fill="#ffffff"/>
      <circle cx="62" cy="45" r="3" fill="#ffffff"/>
    </svg>`
  },
  Location: {
    label: 'Location Pin',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`
  },
  Phone: {
    label: 'Mobile Phone',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
      <path d="M12 18h.01"/>
    </svg>`
  },
  Play: {
    label: 'Play Video',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="#ea580c" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>`
  },
  Info: {
    label: 'Info Badge',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>`
  },
  Cart: {
    label: 'Shopping Cart',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>`
  },
  WiFi: {
    label: 'WiFi Signal',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20h.01"/>
      <path d="M2 8.82a15 15 0 0 1 20 0"/>
      <path d="M5 12.85a10 10 0 0 1 14 0"/>
      <path d="M8.5 16.88a5 5 0 0 1 7 0"/>
    </svg>`
  },
  Cloud: {
    label: 'Cloud Sync',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    </svg>`
  },
  Coffee: {
    label: 'Coffee Cup',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" x2="6" y1="2" y2="4"/>
      <line x1="10" x2="10" y1="2" y2="4"/>
      <line x1="14" x2="14" y1="2" y2="4"/>
    </svg>`
  },
  Search: {
    label: 'Search Lens',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>`
  },
  Download: {
    label: 'Download Arrow',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>`
  }
};

export const QrGenerator: React.FC = () => {
  const [text, setText] = useState<string>('https://toolip.app');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#006241');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(360);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Logo Engraving State
  const [logoMode, setLogoMode] = useState<'none' | 'preset' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('Starbucks');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('');
  const [logoSizePercent, setLogoSizePercent] = useState<number>(24); // 15% to 35%
  const [logoShape, setLogoShape] = useState<'circle' | 'rounded' | 'square' | 'transparent'>('circle');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    generateQrWithLogo();
  }, [text, fgColor, bgColor, size, logoMode, selectedPreset, uploadedLogoUrl, logoSizePercent, logoShape, logoBgColor]);

  const generateQrWithLogo = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Generate Base QR Code with High Error Correction Level 'H' (allows 30% center mask)
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      // 2. Engrave Logo in Center if logo mode is enabled
      if (logoMode !== 'none') {
        let logoSrc = '';
        if (logoMode === 'preset' && PRESET_ICONS[selectedPreset]) {
          const svgRaw = PRESET_ICONS[selectedPreset].svg;
          logoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svgRaw)}`;
        } else if (logoMode === 'upload' && uploadedLogoUrl) {
          logoSrc = uploadedLogoUrl;
        }

        if (logoSrc) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            logoImg.onload = () => {
              const logoDim = Math.floor(size * (logoSizePercent / 100));
              const centerX = (size - logoDim) / 2;
              const centerY = (size - logoDim) / 2;

              // Draw Center Background Mask Badge
              if (logoShape !== 'transparent') {
                ctx.fillStyle = logoBgColor;
                ctx.beginPath();
                if (logoShape === 'circle') {
                  ctx.arc(size / 2, size / 2, logoDim / 2 + 4, 0, Math.PI * 2);
                } else if (logoShape === 'rounded') {
                  const r = 12;
                  ctx.roundRect(centerX - 4, centerY - 4, logoDim + 8, logoDim + 8, r);
                } else {
                  ctx.fillRect(centerX - 4, centerY - 4, logoDim + 8, logoDim + 8);
                }
                ctx.fill();
              }

              // Draw Logo Graphic on top
              const pad = 4;
              ctx.drawImage(logoImg, centerX + pad, centerY + pad, logoDim - pad * 2, logoDim - pad * 2);
              resolve();
            };
            logoImg.onerror = () => resolve();
            logoImg.src = logoSrc;
          });
        }
      }

      setQrDataUrl(canvas.toDataURL('image/png'));
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating QR code');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUploadedLogoUrl(dataUrl);
        setLogoMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Controls & Styling (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* QR Content Input */}
        <div className="space-y-1 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
            <QrIcon className="h-4 w-4" />
            <span>Target URL or Plain Text</span>
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. https://starbucks.com or WiFi SSID..."
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <button
              onClick={() => {
                setText('https://starbucks.com');
                setFgColor('#006241');
                setLogoMode('preset');
                setSelectedPreset('Starbucks');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900"
            >
              ☕ Starbucks QR Preset
            </button>
            <button
              onClick={() => {
                setText('WIFI:S:MyHomeWiFi;T:WPA;P:Password123;;');
                setFgColor('#ea580c');
                setLogoMode('preset');
                setSelectedPreset('WiFi');
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-950/80 border border-orange-500/40 text-orange-300 font-bold hover:bg-orange-900"
            >
              📶 WiFi QR Preset
            </button>
            <button
              onClick={() => setText('mailto:hello@toolip.app?subject=Inquiry')}
              className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white"
            >
              ✉️ Email Preset
            </button>
          </div>
        </div>

        {/* Logo / Icon Engraving Options Panel */}
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Center Logo & Icon Engraving</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              Error Correction Level H (30%)
            </span>
          </div>

          {/* Logo Source Mode Selector */}
          <div className="flex items-center gap-2">
            {[
              { id: 'preset', label: 'Preset SVG Icons' },
              { id: 'upload', label: 'Upload Own Logo' },
              { id: 'none', label: 'No Engraved Logo' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLogoMode(m.id as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  logoMode === m.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Preset Icon Grid */}
          {logoMode === 'preset' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-gray-300 font-semibold">Select Built-In Vector Icon:</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Object.keys(PRESET_ICONS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPreset(key)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedPreset === key
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                    title={PRESET_ICONS[key].label}
                  >
                    <div
                      className="h-6 w-6 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: PRESET_ICONS[key].svg }}
                    />
                    <span className="text-[9px] font-semibold truncate w-full text-center">{key}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload Custom Logo Zone */}
          {logoMode === 'upload' && (
            <div className="space-y-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-xl bg-gray-950 border-2 border-dashed border-gray-800 hover:border-amber-500/50 text-gray-300 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="h-5 w-5 text-amber-400" />
                <span>{uploadedLogoUrl ? '✓ Custom Logo Loaded (Click to Change)' : 'Click to Upload Custom PNG, JPG, or SVG Logo'}</span>
              </button>
            </div>
          )}

          {/* Logo Size & Mask Shape Settings */}
          {logoMode !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800/80">
              {/* Logo Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Logo Size:</span>
                  <span className="font-mono text-amber-400 font-bold">{logoSizePercent}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={32}
                  value={logoSizePercent}
                  onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Logo Mask Shape */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300">Mask Shape:</label>
                <select
                  value={logoShape}
                  onChange={(e) => setLogoShape(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="circle">Circle Mask</option>
                  <option value="rounded">Rounded Box</option>
                  <option value="square">Square Box</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>

              {/* Mask Background Color */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300">Mask Bg Color:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={logoBgColor}
                    onChange={(e) => setLogoBgColor(e.target.value)}
                    className="h-7 w-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-300">{logoBgColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Color & Size Pickers */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold">QR Modules Color:</label>
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
            <label className="text-xs text-gray-400 font-semibold">Background Color:</label>
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
      </div>

      {/* Right Column: Live QR Preview Canvas & Download (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-5 shadow-2xl">
        {qrDataUrl ? (
          <>
            <div className="p-5 rounded-3xl bg-white shadow-2xl shadow-emerald-500/10 border border-gray-200">
              <img src={qrDataUrl} alt="Engraved QR Code" className="w-64 h-64 object-contain" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span>100% Scannable • Engraved Logo Centre</span>
              </div>
              <p className="text-[11px] text-gray-500">Includes Error Correction Level H for maximum reliability</p>
            </div>

            <a
              href={qrDataUrl}
              download={`qrcode_engraved_${Date.now()}.png`}
              className="flex items-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Download Engraved QR PNG</span>
            </a>
          </>
        ) : (
          <div className="text-xs text-gray-500 py-12">Enter text above to preview engraved QR code</div>
        )}
      </div>
    </div>
  );
};
