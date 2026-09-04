'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Eye,
  Download,
  Copy,
  Check,
  Orbit,
  Sparkles,
  Layers,
  RotateCcw,
  Image as ImageIcon,
  Wrench,
  Grid
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PRESET_SVGS: Record<string, string> = {
  Badge: `<svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="90" fill="url(#grad1)" />
  <rect x="50" y="50" width="100" height="100" rx="20" fill="#ffffff" opacity="0.2" />
  <polygon points="100,40 120,80 165,85 130,115 140,160 100,135 60,160 70,115 35,85 80,80" fill="#fde047" />
  <text x="100" y="185" font-size="14" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">TOOLIP BADGE</text>
</svg>`,
  Illustration: `<svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="85" fill="#0f172a" stroke="#38bdf8" stroke-width="4" />
  <rect x="40" y="70" width="120" height="80" rx="12" fill="#1e293b" stroke="#818cf8" stroke-width="3" />
  <circle cx="100" cy="110" r="25" fill="#ec4899" />
  <path d="M 60 140 Q 100 90 140 140" fill="none" stroke="#34d399" stroke-width="5" stroke-linecap="round" />
</svg>`,
  Icon: `<svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 100 20 L 170 60 L 170 140 L 100 180 L 30 140 L 30 60 Z" fill="#3b82f6" opacity="0.9" />
  <circle cx="100" cy="100" r="40" fill="#f43f5e" />
  <rect x="85" y="85" width="30" height="30" fill="#ffffff" rx="6" />
</svg>`,
  Spinner: `<svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" stroke-width="16" />
  <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="#00e5ff" stroke-width="16" stroke-linecap="round" />
  <circle cx="100" cy="100" r="30" fill="#ec4899" />
</svg>`
};

export const SvgCodeEditor: React.FC = () => {
  const [svgCode, setSvgCode, resetSvgCode] = useLocalStorage<string>('toolip_svg_code_v2', PRESET_SVGS['Badge']);
  const [hoveredShapeIdx, setHoveredShapeIdx] = useState<number | null>(null);
  const [codeGlowLineIdx, setCodeGlowLineIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [cursorLine, setCursorLine] = useState<number>(0);
  const [canvasBg, setCanvasBg] = useState<'dark' | 'light' | 'checker'>('dark');
  const [noticeMsg, setNoticeMsg] = useState<string>('');

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const codeLines = svgCode.split('\n');

  // Re-bind shape interaction listeners whenever SVG code or hovered index updates
  useEffect(() => {
    if (!previewContainerRef.current) return;

    const svgElement = previewContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const shapes = Array.from(
      svgElement.querySelectorAll('circle, rect, polygon, path, text, ellipse, line, g')
    );

    shapes.forEach((shape, idx) => {
      const el = shape as HTMLElement;
      el.style.cursor = 'pointer';
      el.style.transition = 'filter 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease';

      // Apply hover / focus glow if code line corresponds to shape index
      if (hoveredShapeIdx === idx || cursorLine === idx + 1) {
        el.style.filter = 'drop-shadow(0 0 14px #38bdf8) brightness(1.5)';
        el.style.stroke = '#38bdf8';
        el.style.strokeWidth = '3px';
      } else {
        el.style.filter = '';
        el.style.stroke = '';
        el.style.strokeWidth = '';
      }

      // Handle Preview shape click -> trigger repeatable code glow
      el.onclick = (e) => {
        e.stopPropagation();

        // Temporary intense pulse
        el.style.filter = 'drop-shadow(0 0 25px #f43f5e) brightness(1.8)';
        setCodeGlowLineIdx(idx);

        // Reset glow state after 1.2s to allow infinite repeatable clicks
        setTimeout(() => {
          el.style.filter = '';
          setCodeGlowLineIdx(null);
        }, 1200);
      };

      // Handle Mouse over shape -> trigger code line highlight
      el.onmouseenter = () => {
        setHoveredShapeIdx(idx);
      };

      el.onmouseleave = () => {
        setHoveredShapeIdx(null);
      };
    });
  }, [svgCode, hoveredShapeIdx, cursorLine]);

  // Track cursor position in code editor to glow shape
  const handleTextareaSelection = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const lineNum = text.substring(0, selStart).split('\n').length;
    setCursorLine(lineNum);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG Minifier / Cleanup
  const minifySvg = () => {
    let clean = svgCode
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/>\s+</g, '><') // remove whitespace between tags
      .trim();
    setSvgCode(clean);
    setNoticeMsg('✓ SVG markup minified and cleaned!');
    setTimeout(() => setNoticeMsg(''), 3000);
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vector_art_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert SVG to PNG Image and Download
  const downloadPng = () => {
    try {
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 500;
        canvas.height = img.height || 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `vector_render_${Date.now()}.png`;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      alert('Error rendering PNG export.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-xl gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400 font-semibold">Load Template:</span>
          {Object.keys(PRESET_SVGS).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setSvgCode(PRESET_SVGS[preset]);
                setHoveredShapeIdx(null);
                setCodeGlowLineIdx(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Minify SVG */}
          <button
            onClick={minifySvg}
            title="Minify SVG markup and strip comments"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Minify SVG</span>
          </button>

          {/* Copy SVG Code */}
          <button
            onClick={copyCode}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 text-xs font-semibold"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy SVG'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={resetSvgCode}
            title="Reset SVG code back to default badge template"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          {/* Download PNG */}
          <button
            onClick={downloadPng}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Export PNG</span>
          </button>

          {/* Download SVG */}
          <button
            onClick={downloadSvg}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .SVG</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* Bi-Directional Indicator Strip */}
      <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <Orbit className="h-4 w-4 text-sky-400 animate-spin transition-all duration-600" />
          <span>
            <strong>Bi-Directional Vector Glow:</strong> Click any shape in Preview to glow Code line • Hover code line to highlight Preview shape!
          </span>
        </span>
        {(codeGlowLineIdx !== null || hoveredShapeIdx !== null) && (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold animate-pulse">
            ★ Active Glow: Line #{(codeGlowLineIdx !== null ? codeGlowLineIdx : (hoveredShapeIdx || 0)) + 1}
          </span>
        )}
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code Editor Pane */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>SVG Source Code Editor:</span>
            <span className="text-[10px] font-mono text-sky-400">Line {cursorLine} / {codeLines.length}</span>
          </div>

          <div className="relative h-96 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden font-mono text-xs flex">
            {/* Code Line numbers & Touch triggers */}
            <div className="w-10 bg-gray-900 border-r border-gray-800 text-gray-600 text-right pr-2 py-3 select-none flex flex-col">
              {codeLines.map((_, idx) => {
                const isGlowing = codeGlowLineIdx === idx || hoveredShapeIdx === idx || cursorLine === idx + 1;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredShapeIdx(idx)}
                    onMouseLeave={() => setHoveredShapeIdx(null)}
                    onClick={() => {
                      setHoveredShapeIdx(idx);
                      setCodeGlowLineIdx(idx);
                      setTimeout(() => setCodeGlowLineIdx(null), 1200);
                    }}
                    className={`h-5 cursor-pointer text-[10px] transition-all ${isGlowing
                      ? 'text-rose-400 font-bold bg-rose-500/20 scale-105 border-l-2 border-rose-400'
                      : 'hover:text-sky-400'
                      }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              onKeyUp={handleTextareaSelection}
              onClick={handleTextareaSelection}
              className="flex-1 h-full p-3 bg-transparent text-emerald-300 focus:outline-none resize-none leading-5 overflow-auto whitespace-pre font-mono"
            />
          </div>
        </div>

        {/* Real-time Rendered Visual Preview Pane */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>Real-Time Visual Preview Canvas:</span>
            <div className="flex items-center space-x-1 text-[10px]">
              <span className="text-gray-500">Bg:</span>
              <button
                onClick={() => setCanvasBg('dark')}
                className={`px-1.5 py-0.5 rounded ${canvasBg === 'dark' ? 'bg-sky-500 text-white font-bold' : 'bg-gray-800 text-gray-400'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setCanvasBg('light')}
                className={`px-1.5 py-0.5 rounded ${canvasBg === 'light' ? 'bg-sky-500 text-white font-bold' : 'bg-gray-800 text-gray-400'}`}
              >
                Light
              </button>
            </div>
          </div>

          <div
            ref={previewContainerRef}
            className={`w-full h-96 p-6 border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner transition-colors ${
              canvasBg === 'light' ? 'bg-white' : 'bg-gray-950'
            }`}
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </div>
      </div>
    </div>
  );
};
