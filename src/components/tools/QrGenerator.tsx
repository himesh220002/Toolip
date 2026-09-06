'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Download, Copy, Check, Sparkles, Upload, Image as ImageIcon, Shield, Palette, Zap, Sliders } from 'lucide-react';

const PRESET_ICONS: Record<string, { label: string; svg: string; color: string }> = {
  Mail: {
    label: 'Mail / Email',
    color: '#38bdf8',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`
  },
  Phone: {
    label: 'Mobile Phone',
    color: '#34d399',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`
  },
  Website: {
    label: 'Website / Link',
    color: '#c084fc',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>`
  },
  Location: {
    label: 'Location Pin',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>`
  },
  Profile: {
    label: 'Profile / Contact',
    color: '#6366f1',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>`
  },
  Company: {
    label: 'Company / Office',
    color: '#f59e0b',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>`
  },
  WiFi: {
    label: 'WiFi Signal',
    color: '#10b981',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.85a10 10 0 0 1 14 0"/><path d="M8.5 16.88a5 5 0 0 1 7 0"/>
    </svg>`
  },
  Share: {
    label: 'Share / vCard',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="10.51" y2="6.99"/><line x1="15.41" x2="8.59" y1="17.01" y2="13.49"/>
    </svg>`
  },
  QRCode: {
    label: 'Scan QR Code',
    color: '#8b5cf6',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/>
    </svg>`
  },
  WhatsApp: {
    label: 'WhatsApp Message',
    color: '#25D366',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
    </svg>`
  },
  Instagram: {
    label: 'Instagram Social',
    color: '#E1306C',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>`
  },
  GitHub: {
    label: 'GitHub Code',
    color: '#f8fafc',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>`
  },
  LinkedIn: {
    label: 'LinkedIn Professional',
    color: '#0A66C2',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#0A66C2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>`
  },
  Payment: {
    label: 'Payment / Card',
    color: '#22c55e',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
    </svg>`
  },
  Security: {
    label: 'Security / Lock',
    color: '#ef4444',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`
  },
  Play: {
    label: 'Play Video',
    color: '#ea580c',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>`
  },
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
  Info: {
    label: 'Info Badge',
    color: '#3b82f6',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>`
  },
  Cart: {
    label: 'Shopping Cart',
    color: '#eab308',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>`
  },
  Cloud: {
    label: 'Cloud Sync',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    </svg>`
  },
  Coffee: {
    label: 'Coffee Cup',
    color: '#d97706',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
    </svg>`
  },
  Search: {
    label: 'Search Lens',
    color: '#a855f7',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>`
  },
  Download: {
    label: 'Download Arrow',
    color: '#3b82f6',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>`
  }
};

export const QrGenerator: React.FC = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [text, setText] = useState<string>('https://toolip.app');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#032326');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(360);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Padding & Corner Roundness Sliders
  const [qrPadding, setQrPadding] = useState<number>(30); // 30px
  const [qrBorderRadius, setQrBorderRadius] = useState<number>(34); // 34px
  const [eyeRadius, setEyeRadius] = useState<number>(10); // 10px (Corner eye roundness)

  // Logo Engraving State
  const [logoMode, setLogoMode] = useState<'none' | 'preset' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('Mail');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('');
  const [logoSizePercent, setLogoSizePercent] = useState<number>(24); // 15% to 35%
  const [logoShape, setLogoShape] = useState<'circle' | 'rounded' | 'square' | 'transparent'>('circle');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');
  const [iconColor, setIconColor] = useState<string>(''); // Center Icon Color Changer
  const [iconPadding, setIconPadding] = useState<number>(4); // 0px to 16px (Icon Inner Padding)

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    generateQrWithLogo();
  }, [text, fgColor, bgColor, size, qrPadding, qrBorderRadius, eyeRadius, logoMode, selectedPreset, uploadedLogoUrl, logoSizePercent, logoShape, logoBgColor, iconColor, iconPadding]);

  // Helper to draw Position Eye (7x7 modules) with custom corner roundness
  const drawPositionEye = (
    ctx: CanvasRenderingContext2D,
    pad: number,
    startCol: number,
    startRow: number,
    moduleSize: number,
    fg: string,
    bg: string,
    eyeR: number
  ) => {
    const x = pad + startCol * moduleSize;
    const y = pad + startRow * moduleSize;
    const outerW = 7 * moduleSize;
    const innerW = 5 * moduleSize;
    const innerOffset = 1 * moduleSize;
    const dotW = 3 * moduleSize;
    const dotOffset = 2 * moduleSize;

    // 1. Outer 7x7 Ring
    ctx.fillStyle = fg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x, y, outerW, outerW, Math.min(eyeR, outerW / 2));
    } else {
      ctx.rect(x, y, outerW, outerW);
    }
    ctx.fill();

    // 2. Inner 5x5 Cutout
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x + innerOffset, y + innerOffset, innerW, innerW, Math.max(0, eyeR - 2));
    } else {
      ctx.rect(x + innerOffset, y + innerOffset, innerW, innerW);
    }
    ctx.fill();

    // 3. Center 3x3 Dot
    ctx.fillStyle = fg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x + dotOffset, y + dotOffset, dotW, dotW, Math.max(0, eyeR - 4));
    } else {
      ctx.rect(x + dotOffset, y + dotOffset, dotW, dotW);
    }
    ctx.fill();
  };

  const generateQrWithLogo = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    try {
      // Create QR Matrix using QRCode library
      const qrMatrix = QRCode.create(text, { errorCorrectionLevel: 'H' });
      const moduleCount = qrMatrix.modules.size;

      const pad = qrPadding;
      const totalWidth = size + pad * 2;
      const totalHeight = size + pad * 2;
      const moduleSize = size / moduleCount;

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw Canvas Background with Exact User Corner Roundness & Outer Padding
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      if (qrBorderRadius > 0) {
        ctx.roundRect(0, 0, totalWidth, totalHeight, qrBorderRadius);
      } else {
        ctx.rect(0, 0, totalWidth, totalHeight);
      }
      ctx.fill();

      // Clip canvas to outer corner roundness so modules never spill over
      if (qrBorderRadius > 0) {
        ctx.clip();
      }

      // 2. Custom Draw 3 Position Eyes with Eye Roundness
      drawPositionEye(ctx, pad, 0, 0, moduleSize, fgColor, bgColor, eyeRadius); // Top-Left
      drawPositionEye(ctx, pad, moduleCount - 7, 0, moduleSize, fgColor, bgColor, eyeRadius); // Top-Right
      drawPositionEye(ctx, pad, 0, moduleCount - 7, moduleSize, fgColor, bgColor, eyeRadius); // Bottom-Left

      // 3. Draw Data Modules
      ctx.fillStyle = fgColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          // Skip 3 Position Eyes
          const isTopLeftEye = col < 7 && row < 7;
          const isTopRightEye = col >= moduleCount - 7 && row < 7;
          const isBottomLeftEye = col < 7 && row >= moduleCount - 7;
          if (isTopLeftEye || isTopRightEye || isBottomLeftEye) continue;

          if (qrMatrix.modules.get(row, col)) {
            const x = pad + col * moduleSize;
            const y = pad + row * moduleSize;
            // Draw module rectangle with slight overlap to prevent hairline seams
            ctx.fillRect(x, y, moduleSize + 0.4, moduleSize + 0.4);
          }
        }
      }

      // 4. Engrave Center Logo if enabled
      if (logoMode !== 'none') {
        let logoSrc = '';
        if (logoMode === 'preset' && PRESET_ICONS[selectedPreset]) {
          let svgRaw = PRESET_ICONS[selectedPreset].svg;
          // Apply custom Icon Color if set
          if (iconColor) {
            svgRaw = svgRaw
              .replace(/fill="((?!none)[^"]*)"/gi, `fill="${iconColor}"`)
              .replace(/stroke="((?!none)[^"]*)"/gi, `stroke="${iconColor}"`);
          }
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
              const centerX = pad + (size - logoDim) / 2;
              const centerY = pad + (size - logoDim) / 2;

              // Draw Center Background Mask Badge
              if (logoShape !== 'transparent') {
                ctx.fillStyle = logoBgColor;
                ctx.beginPath();
                if (logoShape === 'circle') {
                  ctx.arc(totalWidth / 2, totalHeight / 2, logoDim / 2 + 4, 0, Math.PI * 2);
                } else if (logoShape === 'rounded') {
                  const r = 12;
                  ctx.roundRect(centerX - 4, centerY - 4, logoDim + 8, logoDim + 8, r);
                } else {
                  ctx.fillRect(centerX - 4, centerY - 4, logoDim + 8, logoDim + 8);
                }
                ctx.fill();
              }

              // Draw Logo Graphic on top with custom Inner Padding
              const innerPad = iconPadding;
              ctx.drawImage(logoImg, centerX + innerPad, centerY + innerPad, Math.max(1, logoDim - innerPad * 2), Math.max(1, logoDim - innerPad * 2));
              resolve();
            };
            logoImg.onerror = () => resolve();
            logoImg.src = logoSrc;
          });
        }
      }

      ctx.restore();
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
                setEyeRadius(8);
                setQrBorderRadius(24);
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
                setEyeRadius(6);
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

        {/* QR Roundness & Outer Padding Sliders Panel */}
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-sky-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Sliders className="h-4 w-4 text-sky-400" />
              <span>QR Corner Roundness & Outer Padding Controls</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Outer Padding Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span className="font-semibold">Outer Padding:</span>
                <span className="font-mono text-sky-400 font-bold">{qrPadding}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={qrPadding}
                onChange={(e) => setQrPadding(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex gap-1">
                {[0, 10, 18, 30].map((p) => (
                  <button
                    key={p}
                    onClick={() => setQrPadding(p)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      qrPadding === p ? 'bg-sky-600 text-white border-sky-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p === 0 ? 'None (0px)' : `${p}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Outer Corner Roundness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span className="font-semibold">Outer Corner Radius:</span>
                <span className="font-mono text-sky-400 font-bold">{qrBorderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                value={qrBorderRadius}
                onChange={(e) => setQrBorderRadius(Number(e.target.value))}
                className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex gap-1">
                {[
                  { value: 0, label: '0px Sharp' },
                  { value: 16, label: '16px Soft' },
                  { value: 24, label: '24px Round' },
                  { value: 40, label: '40px Curved' },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setQrBorderRadius(r.value)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      qrBorderRadius === r.value ? 'bg-sky-600 text-white border-sky-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Position Eye Corner Roundness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span className="font-semibold">Position Eye Roundness:</span>
                <span className="font-mono text-emerald-400 font-bold">{eyeRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                value={eyeRadius}
                onChange={(e) => setEyeRadius(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex gap-1">
                {[
                  { value: 0, label: 'Square' },
                  { value: 6, label: 'Soft' },
                  { value: 10, label: 'Rounded' },
                  { value: 14, label: 'Smooth' },
                ].map((eR) => (
                  <button
                    key={eR.value}
                    onClick={() => setEyeRadius(eR.value)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      eyeRadius === eR.value ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {eR.label}
                  </button>
                ))}
              </div>
            </div>
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
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
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

          {/* Logo Size, Mask Shape & Inner Padding Settings */}
          {logoMode !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/80">
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

              {/* Icon Inner Padding Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Icon Padding:</span>
                  <span className="font-mono text-amber-400 font-bold">{iconPadding}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={16}
                  value={iconPadding}
                  onChange={(e) => setIconPadding(Number(e.target.value))}
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

          {/* Center Icon Color Changer Panel */}
          {logoMode === 'preset' && (
            <div className="space-y-2 pt-2 border-t border-gray-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-bold flex items-center space-x-1.5">
                  <Palette className="h-3.5 w-3.5 text-amber-400" />
                  <span>Center Icon Color Changer:</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIconColor(fgColor)}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-sky-300 text-[10px] font-bold border border-gray-700 transition-colors"
                  >
                    Match QR Color
                  </button>
                  <input
                    type="color"
                    value={iconColor || PRESET_ICONS[selectedPreset]?.color || fgColor}
                    onChange={(e) => setIconColor(e.target.value)}
                    className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-amber-400 font-bold">
                    {iconColor || PRESET_ICONS[selectedPreset]?.color || fgColor}
                  </span>
                </div>
              </div>

              {/* Icon Color Swatches */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  '#006241', '#ea580c', '#0284c7', '#6366f1',
                  '#ec4899', '#f43f5e', '#34d399', '#f59e0b',
                  '#ffffff', '#000000'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setIconColor(color)}
                    className={`h-5 w-5 rounded-full border transition-transform hover:scale-125 shadow-sm ${
                      iconColor === color ? 'border-amber-400 scale-110 ring-2 ring-amber-400/50' : 'border-gray-700'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Set icon color to ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color & Size Pickers */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold">QR Modules Color:</label>
            <div className="flex items-center space-x-2" suppressHydrationWarning>
              {isMounted ? (
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
                  suppressHydrationWarning
                />
              ) : (
                <div className="h-8 w-8 rounded border border-gray-700" style={{ backgroundColor: fgColor }} />
              )}
              <span className="text-xs font-mono text-gray-300" suppressHydrationWarning>{fgColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold">Background Color:</label>
            <div className="flex items-center space-x-2" suppressHydrationWarning>
              {isMounted ? (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
                  suppressHydrationWarning
                />
              ) : (
                <div className="h-8 w-8 rounded border border-gray-700" style={{ backgroundColor: bgColor }} />
              )}
              <span className="text-xs font-mono text-gray-300" suppressHydrationWarning>{bgColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Exact QR Output Preview Canvas & Download (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-5 shadow-2xl">
        {qrDataUrl ? (
          <>
            {/* Display Exact QR Image without artificial outer container padding */}
            <div className="flex items-center justify-center p-2 rounded-2xl transition-all">
              <img src={qrDataUrl} alt="Exact Engraved QR Code" className="max-w-full max-h-[380px] object-contain drop-shadow-2xl" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span>Exact Canvas Render • 100% Scannable</span>
              </div>
              <p className="text-[11px] text-gray-500">Downloaded PNG contains exact custom padding & corner roundness</p>
            </div>

            <a
              href={qrDataUrl}
              download={`qrcode_engraved_${Date.now()}.png`}
              className="flex items-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Download High-Res PNG</span>
            </a>
          </>
        ) : (
          <div className="text-xs text-gray-500 py-12">Enter text above to preview exact QR code</div>
        )}
      </div>
    </div>
  );
};
