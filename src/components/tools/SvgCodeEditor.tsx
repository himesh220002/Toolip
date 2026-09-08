'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Grid,
  Maximize2,
  Upload,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Palette,
  FileCode,
  FileType,
  Scissors,
  Sliders,
  FileDown,
  Lock,
  X,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  NVIDIA_MODELS,
  getNvidiaApiKey,
  setNvidiaApiKey,
  getNvidiaSelectedModel,
  setNvidiaSelectedModel,
  generateSvgWithNvidia
} from '@/lib/nvidiaAi';

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

const COLOR_PRESETS = [
  '#38bdf8', '#818cf8', '#ec4899', '#f43f5e', '#34d399',
  '#fde047', '#fb923c', '#a855f7', '#ffffff', '#000000'
];

interface SvgLayerItem {
  id: number;
  tagName: string;
  idAttr: string;
  fill: string;
  stroke: string;
  hidden: boolean;
  rawHtml: string;
  lineNumber: number;
}

export const SvgCodeEditor: React.FC = () => {
  const [svgCode, setSvgCode, resetSvgCode] = useLocalStorage<string>('toolip_svg_code_v2', PRESET_SVGS['Badge']);
  const [hoveredShapeIdx, setHoveredShapeIdx] = useState<number | null>(null);
  const [codeGlowLineIdx, setCodeGlowLineIdx] = useState<number | null>(null);
  const [selectedLayerIdx, setSelectedLayerIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [cursorLine, setCursorLine] = useState<number>(0);
  const [canvasBg, setCanvasBg] = useState<'dark' | 'light' | 'checker'>('dark');
  const [noticeMsg, setNoticeMsg] = useState<string>('');

  // Saved SVGs Gallery State
  const [savedSvgs, setSavedSvgs] = useLocalStorage<{ id: string; name: string; code: string; createdAt: string }[]>(
    'toolip_saved_svg_gallery_v1',
    []
  );

  const handleSaveCurrentSvg = () => {
    if (!svgCode.trim()) return;
    const newEntry = {
      id: `svg_${Date.now()}`,
      name: `Vector ${savedSvgs.length + 1}`,
      code: svgCode,
      createdAt: new Date().toISOString(),
    };
    setSavedSvgs((prev) => [newEntry, ...prev]);
    setNoticeMsg('✓ Saved SVG graphic to your gallery below!');
    setTimeout(() => setNoticeMsg(''), 3000);
  };

  const handleLoadSavedSvg = (code: string) => {
    setSvgCode(code);
    setHoveredShapeIdx(null);
    setCodeGlowLineIdx(null);
    setSelectedLayerIdx(null);
    setNoticeMsg('✓ Loaded saved SVG into editor!');
    setTimeout(() => setNoticeMsg(''), 2500);
  };

  const handleDeleteSavedSvg = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSvgs((prev) => prev.filter((item) => item.id !== id));
    setNoticeMsg('Deleted SVG thumbnail from gallery');
    setTimeout(() => setNoticeMsg(''), 2500);
  };

  // Hydration state tracking
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // NVIDIA BYOK AI Logo Generator State
  const [isNvidiaAiModalOpen, setIsNvidiaAiModalOpen] = useState(false);
  const [nvidiaApiKeyInput, setNvidiaApiKeyInput] = useState(() => getNvidiaApiKey());
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState(() => getNvidiaSelectedModel());
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  const handleSaveNvidiaKey = (key: string) => {
    setNvidiaApiKey(key);
    setNvidiaApiKeyInput(key);
    setNoticeMsg(key.trim() ? '✓ Saved NVIDIA API Key to BYOK local storage' : 'Removed NVIDIA API Key');
    setTimeout(() => setNoticeMsg(''), 3000);
  };

  const handleSelectNvidiaModel = (modelId: string) => {
    setSelectedNvidiaModel(modelId);
    setNvidiaSelectedModel(modelId);
  };

  const handleGenerateAiSvg = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) {
      setAiErrorMsg('Please enter a description or prompt for the vector graphic');
      return;
    }
    if (!nvidiaApiKeyInput.trim()) {
      setAiErrorMsg('NVIDIA API Key required. Please enter your BYOK key (nvapi-...).');
      return;
    }

    setAiErrorMsg(null);
    setIsAiGenerating(true);

    try {
      handleSaveNvidiaKey(nvidiaApiKeyInput);
      const generatedSvg = await generateSvgWithNvidia(
        aiPrompt.trim(),
        nvidiaApiKeyInput.trim(),
        selectedNvidiaModel
      );

      setSvgCode(generatedSvg);
      setHoveredShapeIdx(null);
      setCodeGlowLineIdx(null);
      setSelectedLayerIdx(null);

      setNoticeMsg('✨ AI Vector Logo & Graphic successfully generated with NVIDIA NIM!');
      setTimeout(() => setNoticeMsg(''), 4000);
      setIsNvidiaAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      console.error('NVIDIA AI Generation error:', err);
      setAiErrorMsg(err.message || 'Failed to generate SVG with NVIDIA AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Pane Resizing & Drag Expand State
  const [editorHeight, setEditorHeight] = useLocalStorage<number>('toolip_svg_editor_height', 420);
  const [outputHeight, setOutputHeight] = useLocalStorage<number>('toolip_svg_output_height', 420);
  const [syncHeights, setSyncHeights] = useLocalStorage<boolean>('toolip_svg_sync_heights', true);
  const [cornerDragEnabled, setCornerDragEnabled] = useLocalStorage<boolean>('toolip_svg_corner_drag', true);
  const [showLayerSidebar, setShowLayerSidebar] = useLocalStorage<boolean>('toolip_svg_show_layers', true);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const codeLines = svgCode.split('\n');

  // Helper: Find exact 1-based line number in codeLines where an SVG element is defined
  const getElementLineNumber = useCallback((el: Element, lines: string[]): number => {
    const tagName = el.tagName.toLowerCase();
    const idAttr = el.getAttribute('id');
    const dAttr = el.getAttribute('d');
    const pointsAttr = el.getAttribute('points');
    const fillAttr = el.getAttribute('fill');
    const strokeAttr = el.getAttribute('stroke');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`<${tagName}`)) {
        if (idAttr && line.includes(`id="${idAttr}"`)) return i + 1;
        if (dAttr && line.includes(dAttr.substring(0, 12))) return i + 1;
        if (pointsAttr && line.includes(pointsAttr.substring(0, 12))) return i + 1;
        if (fillAttr && fillAttr !== 'none' && fillAttr !== 'inherited' && line.includes(fillAttr)) return i + 1;
        if (strokeAttr && strokeAttr !== 'none' && strokeAttr !== 'inherited' && line.includes(strokeAttr)) return i + 1;
      }
    }

    // Fallback: match by tag occurrence index
    const doc = el.ownerDocument;
    if (doc) {
      const sameTags = Array.from(doc.querySelectorAll(`svg ${tagName}`));
      const tagIdx = sameTags.indexOf(el);
      let matchCount = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`<${tagName}`)) {
          if (matchCount === tagIdx) return i + 1;
          matchCount++;
        }
      }
    }

    return 1;
  }, []);

  // Synchronize line numbers container scroll position with code textarea
  const handleScrollTextarea = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Jump to exact line number, focus & scroll editor + highlight
  const scrollToLine = useCallback((lineNum: number) => {
    setCursorLine(lineNum);
    setCodeGlowLineIdx(lineNum - 1);

    if (textareaRef.current) {
      const lines = svgCode.split('\n');
      let pos = 0;
      for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
        pos += lines[i].length + 1;
      }
      textareaRef.current.selectionStart = pos;
      textareaRef.current.selectionEnd = pos;
      textareaRef.current.focus();

      // Scroll editor (20px per line for leading-5)
      const lineHeight = 20;
      const scrollTopTarget = Math.max(0, (lineNum - 3) * lineHeight);
      textareaRef.current.scrollTop = scrollTopTarget;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTopTarget;
      }
    }
  }, [svgCode]);

  // Mouse & Touch Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent, pane: 'input' | 'output') => {
    e.preventDefault();
    const startY = e.clientY;
    const startEditorH = editorHeight;
    const startOutputH = outputHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      if (pane === 'input') {
        const newH = Math.max(200, Math.min(1400, startEditorH + deltaY));
        setEditorHeight(newH);
        if (syncHeights) setOutputHeight(newH);
      } else {
        const newH = Math.max(200, Math.min(1400, startOutputH + deltaY));
        setOutputHeight(newH);
        if (syncHeights) setEditorHeight(newH);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent, pane: 'input' | 'output') => {
    if (!e.touches[0]) return;
    const startY = e.touches[0].clientY;
    const startEditorH = editorHeight;
    const startOutputH = outputHeight;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches[0]) return;
      const deltaY = moveEvent.touches[0].clientY - startY;
      if (pane === 'input') {
        const newH = Math.max(200, Math.min(1400, startEditorH + deltaY));
        setEditorHeight(newH);
        if (syncHeights) setOutputHeight(newH);
      } else {
        const newH = Math.max(200, Math.min(1400, startOutputH + deltaY));
        setOutputHeight(newH);
        if (syncHeights) setEditorHeight(newH);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Parse SVG Layers & Groups with exact line numbers
  const layersList: SvgLayerItem[] = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) return [];

      const lines = svgCode.split('\n');
      const elements = Array.from(svgEl.querySelectorAll('circle, rect, polygon, path, text, ellipse, line, g'));
      return elements.map((el, idx) => {
        const lineNum = getElementLineNumber(el, lines);
        return {
          id: idx,
          tagName: el.tagName.toLowerCase(),
          idAttr: el.getAttribute('id') || `${el.tagName.toLowerCase()}_${idx + 1}`,
          fill: el.getAttribute('fill') || 'inherited',
          stroke: el.getAttribute('stroke') || 'inherited',
          hidden: el.getAttribute('display') === 'none' || el.getAttribute('visibility') === 'hidden',
          rawHtml: el.outerHTML,
          lineNumber: lineNum,
        };
      });
    } catch (e) {
      return [];
    }
  }, [svgCode, getElementLineNumber]);

  // Re-bind shape interaction listeners with exact line number matching
  useEffect(() => {
    if (!previewContainerRef.current) return;

    const svgElement = previewContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const shapes = Array.from(
      svgElement.querySelectorAll('circle, rect, polygon, path, text, ellipse, line, g')
    );

    shapes.forEach((shape, idx) => {
      const el = shape as HTMLElement;
      const shapeLineNum = getElementLineNumber(el, codeLines);

      el.style.cursor = 'pointer';
      el.style.transition = 'filter 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease';

      // Glow element if it matches active cursor line, hovered index, or selected layer
      const isTargeted =
        hoveredShapeIdx === idx ||
        cursorLine === shapeLineNum ||
        (selectedLayerIdx !== null && layersList[selectedLayerIdx]?.lineNumber === shapeLineNum);

      if (isTargeted) {
        el.style.filter = 'drop-shadow(0 0 16px #38bdf8) brightness(1.5)';
        el.style.stroke = '#38bdf8';
        el.style.strokeWidth = '3px';
      } else {
        el.style.filter = '';
        el.style.stroke = '';
        el.style.strokeWidth = '';
      }

      // Handle Preview shape click -> jump to exact line in code editor & glow
      el.onclick = (e) => {
        e.stopPropagation();

        el.style.filter = 'drop-shadow(0 0 25px #f43f5e) brightness(1.8)';
        setSelectedLayerIdx(idx);
        scrollToLine(shapeLineNum);

        setTimeout(() => {
          el.style.filter = '';
        }, 1200);
      };

      el.onmouseenter = () => {
        setHoveredShapeIdx(idx);
      };

      el.onmouseleave = () => {
        setHoveredShapeIdx(null);
      };
    });
  }, [svgCode, hoveredShapeIdx, cursorLine, selectedLayerIdx, codeLines, getElementLineNumber, layersList, scrollToLine]);

  // Toggle XML comment on current line or selection (Ctrl + / or Cmd + /)
  const toggleXmlComment = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const selectedText = text.substring(lineStart, lineEnd);
    const lines = selectedText.split('\n');

    const allCommented = lines.every((l) => {
      const trimmed = l.trim();
      return trimmed.startsWith('<!--') && trimmed.endsWith('-->');
    });

    let newLines: string[] = [];

    if (allCommented) {
      newLines = lines.map((l) => {
        return l.replace(/<!--\s?/, '').replace(/\s?-->/, '');
      });
    } else {
      newLines = lines.map((l) => {
        if (!l.trim()) return l;
        const match = l.match(/^(\s*)(.*)$/);
        if (!match) return `<!-- ${l} -->`;
        const [, indent, content] = match;
        if (content.startsWith('<!--') && content.endsWith('-->')) {
          return l;
        }
        return `${indent}<!-- ${content} -->`;
      });
    }

    const newSelectedText = newLines.join('\n');
    const newFullText = text.substring(0, lineStart) + newSelectedText + text.substring(lineEnd);

    setSvgCode(newFullText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = lineStart;
        textareaRef.current.selectionEnd = lineStart + newSelectedText.length;
        textareaRef.current.focus();
      }
    }, 10);

    setNoticeMsg(allCommented ? '✓ Removed XML comments' : '✓ Added XML comments (<!-- ... -->)');
    setTimeout(() => setNoticeMsg(''), 2500);
  }, [setSvgCode]);

  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      toggleXmlComment();
    }
  };

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

  // SVG Minifier / Compression
  const minifySvg = () => {
    let clean = svgCode
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/>\s+</g, '><') // remove whitespace between tags
      .replace(/\s+/g, ' ') // collapse multi-spaces
      .replace(/\s*([=><\/])\s*/g, '$1') // remove space around = > < /
      .trim();
    setSvgCode(clean);
    setNoticeMsg('✓ SVG markup minified and compressed!');
    setTimeout(() => setNoticeMsg(''), 3000);
  };

  // Expand Back / Beautify SVG Format
  const beautifySvg = () => {
    let indent = 0;
    const cleanXml = svgCode.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
    const reg = /(>)(<)(\/*)/g;
    const pad = '  ';
    const xmlLines = cleanXml.replace(reg, '$1\r\n$2$3').split('\r\n');

    let formatted = '';
    xmlLines.forEach((line) => {
      let indentChange = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indentChange = 0;
      } else if (line.match(/^<\/\w/)) {
        if (indent !== 0) indent -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>$/)) {
        indentChange = 1;
      }

      formatted += pad.repeat(indent) + line + '\n';
      indent += indentChange;
    });

    setSvgCode(formatted.trim());
    setNoticeMsg('✓ Expanded SVG into formatted indented code!');
    setTimeout(() => setNoticeMsg(''), 3000);
  };

  // Real-time SVGO Optimizer (Clean attributes, strip comments, round decimals)
  const optimizeSvg = () => {
    let clean = svgCode
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/xmlns:xlink="[^"]*"/g, '')
      .replace(/\s(data-name|version|id|class)="[^"]*"/g, '')
      .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
      .replace(/>\s+</g, '><')
      .trim();
    setSvgCode(clean);
    setNoticeMsg('✓ SVGO Engine: Stripped redundant attributes & compressed precision!');
    setTimeout(() => setNoticeMsg(''), 3500);
  };

  // Multi-Format Export Handler (PNG, JPG, WebP, PDF, SVG)
  const exportAsFormat = (format: 'png' | 'jpg' | 'webp' | 'pdf' | 'svg') => {
    if (format === 'svg') {
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vector_art_${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'jpg') {
          ctx.fillStyle = canvasBg === 'light' ? '#ffffff' : '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (format === 'pdf') {
          const imgData = canvas.toDataURL('image/png');
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head><title>Vector PDF Export</title></head>
                <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#fff;">
                  <img src="${imgData}" style="max-width:90%;max-height:90%;box-shadow:0 10px 30px rgba(0,0,0,0.2);" />
                  <script>window.onload=function(){window.print();setTimeout(function(){window.close();},750);}</script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        } else {
          const mimeType = format === 'webp' ? 'image/webp' : format === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `vector_render_${Date.now()}.${format}`;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err: any) {
      alert('Error exporting image format: ' + err.message);
    }
  };

  // External SVG File Import Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setNoticeMsg('Error: Please upload a valid .svg vector file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSvgCode(content);
        setNoticeMsg(`✓ Imported SVG "${file.name}" successfully!`);
        setTimeout(() => setNoticeMsg(''), 3500);
      }
    };
    reader.readAsText(file);
  };

  // Quick Layer Attribute Editor (Fill Color Swatch apply)
  const applyColorToLayer = (colorHex: string) => {
    if (selectedLayerIdx === null || !layersList[selectedLayerIdx]) {
      // Apply color to main SVG text fill
      setSvgCode((prev) => prev.replace(/fill="[^"]*"/, `fill="${colorHex}"`));
      return;
    }

    const targetLayer = layersList[selectedLayerIdx];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) return;

      const elements = Array.from(svgEl.querySelectorAll('circle, rect, polygon, path, text, ellipse, line, g'));
      if (elements[targetLayer.id]) {
        elements[targetLayer.id].setAttribute('fill', colorHex);
        setSvgCode(svgEl.outerHTML);
        setNoticeMsg(`✓ Updated fill color to ${colorHex} on <${targetLayer.tagName}> layer!`);
        setTimeout(() => setNoticeMsg(''), 2500);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-5">
      {/* Top Presets & Main Actions Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-2xl gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <FileType className="h-3.5 w-3.5 text-sky-400" /> Presets:
          </span>
          {Object.keys(PRESET_SVGS).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setSvgCode(PRESET_SVGS[preset]);
                setHoveredShapeIdx(null);
                setCodeGlowLineIdx(null);
                setSelectedLayerIdx(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              {preset}
            </button>
          ))}

          {/* Import External SVG File */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-400" />
            <span>Import SVG</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* NVIDIA BYOK AI Logo Generator */}
          <button
            onClick={() => setIsNvidiaAiModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            title="Generate custom vector logos and SVG graphics with NVIDIA BYOK AI"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-950 animate-pulse fill-current" />
            <span>NVIDIA AI Logo</span>
            <span className="px-1 py-0.2 text-[9px] bg-slate-950/20 text-slate-950 font-mono rounded font-black">BYOK</span>
          </button>

          {/* XML Comment Toggle (Ctrl + /) */}
          <button
            onClick={toggleXmlComment}
            title="Toggle XML Block Comment (Ctrl + /)"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-amber-300 font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Comment (Ctrl+/)</span>
          </button>

          {/* Minify / Expand Back Formatting Toggle */}
          <button
            onClick={minifySvg}
            title="Minify and compress SVG markup into compact string"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-300 font-semibold transition-colors"
          >
            <Scissors className="h-3.5 w-3.5 text-indigo-400" />
            <span>Minify</span>
          </button>

          <button
            onClick={beautifySvg}
            title="Expand back minified SVG into indented code lines"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-300 font-semibold transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Expand Back (Beautify)</span>
          </button>

          <button
            onClick={optimizeSvg}
            title="SVGO Engine: Clean attributes, comments & float precision"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-semibold transition-colors"
          >
            <Wrench className="h-3.5 w-3.5 text-amber-400" />
            <span>SVGO Optimize</span>
          </button>

          <button
            onClick={copyCode}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-sky-400" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={resetSvgCode}
            title="Reset SVG code back to default badge template"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400 font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          {/* Save to Gallery Button */}
          <button
            onClick={handleSaveCurrentSvg}
            title="Save current SVG to local 40x40px gallery thumbnails below"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400 rotate-180" />
            <span>Save SVG</span>
          </button>

          {/* Multi-Format Export Dropdown Menu */}
          <div className="flex items-center bg-indigo-600/30 border border-indigo-500/40 rounded-lg p-0.5">
            <span className="px-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Download className="h-3 w-3" /> Export:
            </span>
            {(['png', 'jpg', 'webp', 'pdf', 'svg'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => exportAsFormat(fmt)}
                className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase text-white hover:bg-indigo-600 transition-colors"
              >
                .{fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pane Height & Drag Expand Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-gray-900/80 border border-gray-800 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 font-semibold flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-sky-400" /> Pane Height:
          </span>
          {[
            { label: 'Compact', size: 300 },
            { label: 'Standard', size: 420 },
            { label: 'Tall', size: 600 },
            { label: 'Max', size: 800 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setEditorHeight(preset.size);
                setOutputHeight(preset.size);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                editorHeight === preset.size
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              {preset.label} ({preset.size}px)
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLayerSidebar}
              onChange={(e) => setShowLayerSidebar(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-sky-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-[11px] font-semibold text-purple-400">Layers Sidebar</span>
          </label>

          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncHeights}
              onChange={(e) => {
                setSyncHeights(e.target.checked);
                if (e.target.checked) setOutputHeight(editorHeight);
              }}
              className="rounded bg-gray-800 border-gray-700 text-sky-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-[11px]">Sync Panes</span>
          </label>

          <label className="flex items-center space-x-1.5 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cornerDragEnabled}
              onChange={(e) => setCornerDragEnabled(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-sky-500 focus:ring-0 h-3.5 w-3.5"
            />
            <span className="text-[11px] font-semibold text-sky-400">Bottom-Right Drag Expand</span>
          </label>
        </div>
      </div>

      {/* Inline NVIDIA AI Prompt & Model Control Bar (Right Below Pane Height) */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-slate-900 border border-emerald-500/30 rounded-2xl space-y-2 text-xs shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-4 w-4 animate-pulse fill-current" />
            </div>
            <span className="font-extrabold text-white text-xs tracking-tight flex items-center gap-1.5">
              NVIDIA AI Generator
              <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">BYOK</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Model Selector Dropdown */}
            <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-2 py-1 space-x-1">
              <span className="text-[10px] text-gray-400 font-bold">Model:</span>
              <select
                value={selectedNvidiaModel}
                onChange={(e) => handleSelectNvidiaModel(e.target.value)}
                className="bg-transparent text-emerald-300 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {NVIDIA_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-900 text-white">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Key Status & Edit Button */}
            <button
              onClick={() => setIsNvidiaAiModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-[11px] font-medium flex items-center space-x-1 cursor-pointer transition"
              title="Configure NVIDIA BYOK API Key"
            >
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>{mounted && nvidiaApiKeyInput ? 'Key Saved ⚙️' : 'Set Key 🔑'}</span>
            </button>
          </div>
        </div>

        {/* Prompt Input & Generate Action */}
        <form onSubmit={handleGenerateAiSvg} className="flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Type prompt for AI vector logo (e.g. 'Futuristic neon rocket emblem with blue gradient')..."
            className="flex-1 px-3.5 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition"
          />
          <button
            type="submit"
            disabled={isAiGenerating}
            className="px-4 py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isAiGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-slate-950 fill-current" />
                <span>Generate SVG</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-0.5">
          <span className="text-gray-500 font-semibold">Quick Prompts:</span>
          {[
            '🚀 Futuristic Rocket Emblem',
            '💡 Glowing Tech Startup Badge',
            '🛡️ Cyber Security Shield',
            '⚡ Neon Geometry Spinner',
          ].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setAiPrompt(pill)}
              className="px-2 py-0.5 rounded-md bg-gray-900/80 hover:bg-gray-800 text-emerald-300 border border-gray-800 transition cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4" />
          <span>{noticeMsg}</span>
        </div>
      )}

      {/* Bi-Directional Indicator & Quick Color Picker Bar */}
      <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center space-x-2">
          <Orbit className="h-4 w-4 text-sky-400 animate-spin transition-all duration-600" />
          <span>
            <strong>Bi-Directional Vector Glow:</strong> Click any shape in Preview or select a Layer to highlight element & line!
          </span>
        </span>

        {/* Quick Color Swatch Palette */}
        <div className="flex items-center space-x-1.5">
          <Palette className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-[10px] text-gray-400">Fill:</span>
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => applyColorToLayer(color)}
              className="h-4 w-4 rounded-full border border-gray-700 transition-transform hover:scale-125 shadow-xs"
              style={{ backgroundColor: color }}
              title={`Apply ${color} fill`}
            />
          ))}
        </div>
      </div>

      {/* Main Layout Grid (Source Code + Visual Canvas + Optional Layers Sidebar) */}
      <div className={`grid grid-cols-1 ${showLayerSidebar ? 'lg:grid-cols-12' : 'md:grid-cols-2'} gap-4 items-start`}>
        
        {/* Layer & Group Management Sidebar */}
        {showLayerSidebar && (
          <div className="lg:col-span-3 p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-purple-400 uppercase tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Layers ({layersList.length})</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500">DOM Tree</span>
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {layersList.length > 0 ? (
                layersList.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => {
                      setSelectedLayerIdx(layer.id);
                      scrollToLine(layer.lineNumber);
                    }}
                    className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer border transition-all ${
                      selectedLayerIdx === layer.id
                        ? 'bg-purple-950/80 border-purple-500/60 text-purple-200 font-bold shadow-md'
                        : 'bg-gray-950/60 border-gray-800/80 text-gray-300 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-sky-400 font-bold">
                        &lt;{layer.tagName}&gt;
                      </span>
                      <span className="truncate text-[11px]">{layer.idAttr}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-[9px] font-mono text-gray-500 mr-1">L{layer.lineNumber}</span>
                      {layer.fill !== 'inherited' && (
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-gray-600"
                          style={{ backgroundColor: layer.fill }}
                          title={`Fill: ${layer.fill}`}
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-gray-500 py-3 text-center">No shape layers detected</div>
              )}
            </div>
          </div>
        )}

        {/* Code Editor Pane */}
        <div className={`space-y-1 ${showLayerSidebar ? 'lg:col-span-5' : ''}`}>
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>SVG Source Code Editor:</span>
            <span className="text-[10px] font-mono text-sky-400">Line {cursorLine} / {codeLines.length}</span>
          </div>

          <div className="relative group">
            <div
              style={{ height: `${editorHeight}px` }}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl overflow-hidden font-mono text-xs flex shadow-inner"
            >
              {/* Code Line numbers (Synchronized Scroll via Ref) */}
              <div
                ref={lineNumbersRef}
                className="w-10 bg-gray-900 border-r border-gray-800 text-gray-600 text-right pr-2 py-3 select-none flex flex-col shrink-0 overflow-hidden font-mono leading-5"
              >
                {codeLines.map((_, idx) => {
                  const lineNum = idx + 1;
                  const isGlowing =
                    codeGlowLineIdx === idx ||
                    cursorLine === lineNum ||
                    (selectedLayerIdx !== null && layersList[selectedLayerIdx]?.lineNumber === lineNum);

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredShapeIdx(idx)}
                      onMouseLeave={() => setHoveredShapeIdx(null)}
                      onClick={() => scrollToLine(lineNum)}
                      className={`h-5 cursor-pointer text-[10px] transition-all flex items-center justify-end ${
                        isGlowing
                          ? 'text-rose-400 font-bold bg-rose-500/20 scale-105 border-l-2 border-rose-400'
                          : 'hover:text-sky-400'
                      }`}
                      title={`Click to jump to line ${lineNum}`}
                    >
                      {lineNum}
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
                onKeyDown={handleKeyDownTextarea}
                onScroll={handleScrollTextarea}
                className="flex-1 h-full p-3 bg-transparent text-emerald-300 focus:outline-none resize-none leading-5 overflow-auto whitespace-pre font-mono"
              />
            </div>

            {/* Custom Bottom-Right Corner Drag Handle */}
            {cornerDragEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'input')}
                onTouchStart={(e) => handleTouchStart(e, 'input')}
                title="Drag bottom-right corner to expand SVG code editor height"
                className="absolute bottom-2.5 right-2.5 p-1 rounded-br-lg rounded-tl-md bg-sky-950/90 hover:bg-sky-500 border border-sky-500/50 text-sky-400 hover:text-white cursor-se-resize shadow-lg transition-colors group-hover:opacity-100 flex items-center justify-center select-none z-10"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M14 14H11V12H14V14ZM14 10H7V8H14V10ZM14 6H3V4H14V6Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Rendered Visual Preview Canvas Pane */}
        <div className={`space-y-1 ${showLayerSidebar ? 'lg:col-span-4' : ''}`}>
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

          <div className="relative group">
            <div
              ref={previewContainerRef}
              style={{ height: `${outputHeight}px` }}
              className={`w-full p-6 border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner transition-colors ${
                canvasBg === 'light' ? 'bg-white' : 'bg-gray-950'
              }`}
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />

            {/* Custom Bottom-Right Corner Drag Handle */}
            {cornerDragEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'output')}
                onTouchStart={(e) => handleTouchStart(e, 'output')}
                title="Drag bottom-right corner to expand preview canvas height"
                className="absolute bottom-2.5 right-2.5 p-1 rounded-br-lg rounded-tl-md bg-emerald-950/90 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-400 hover:text-white cursor-se-resize shadow-lg transition-colors group-hover:opacity-100 flex items-center justify-center select-none z-10"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M14 14H11V12H14V14ZM14 10H7V8H14V10ZM14 6H3V4H14V6Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved SVGs Gallery Section (40x40px Flex Row Wrap Tiles) */}
      <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-2.5 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            <span className="font-extrabold text-white text-xs tracking-tight">
              Saved SVGs Gallery ({savedSvgs.length})
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Click 40×40px tile to load SVG code into editor</span>
          </div>

          <button
            onClick={handleSaveCurrentSvg}
            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-lg text-xs transition cursor-pointer flex items-center space-x-1"
          >
            <span>+ Save Current SVG</span>
          </button>
        </div>

        {savedSvgs.length === 0 ? (
          <div className="py-3 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-xl">
            No saved SVGs yet. Click "+ Save Current SVG" or "Save SVG" above to store 40×40px thumbnail tiles here!
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-2.5 pt-1">
            {savedSvgs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadSavedSvg(item.code)}
                className="group relative w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-lg bg-gray-950 border border-gray-700 hover:border-emerald-400 hover:scale-105 shadow-md transition-all cursor-pointer overflow-visible flex items-center justify-center p-1 shrink-0"
                title={`${item.name} - Click to load into editor`}
              >
                {/* SVG Mini Preview Render inside 40x40px tile */}
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: item.code }}
                />

                {/* Top-Right Corner Delete Trash Badge */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteSavedSvg(item.id, e)}
                  title="Delete saved SVG"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NVIDIA BYOK AI Logo Generator Modal Portal */}
      {isNvidiaAiModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      NVIDIA NIM AI Logo & Graphic Generator
                      <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-lg">BYOK</span>
                    </h3>
                    <p className="text-xs text-slate-400">Generate clean SVG vector logos & graphics with 3 NVIDIA NIM models</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNvidiaAiModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* NVIDIA BYOK API Key Section */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>NVIDIA API Key (BYOK)</span>
                    </label>
                    <a
                      href="https://build.nvidia.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get Key from build.nvidia.com ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={nvidiaApiKeyInput}
                      onChange={(e) => setNvidiaApiKeyInput(e.target.value)}
                      placeholder="nvapi-..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNvidiaKey(nvidiaApiKeyInput)}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>

                {/* 3 Models Dropdown Switch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>NVIDIA Model Selector (3 Models Supported)</span>
                    <span className="text-[10px] font-mono text-cyan-400">Selected: {selectedNvidiaModel}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {NVIDIA_MODELS.map((model) => {
                      const isSelected = selectedNvidiaModel === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => handleSelectNvidiaModel(model.id)}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 inline-block mb-1">
                              {model.badge}
                            </span>
                            <h4 className="text-xs font-black text-slate-100">{model.name}</h4>
                          </div>
                          <p className="text-[10px] leading-relaxed opacity-80">{model.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Text Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    Logo / Graphic Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Minimalist futuristic neon dragon logo with cyan and magenta gradients inside a dark circular emblem..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                  />

                  {/* Quick Suggestion Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Quick Prompts:</span>
                    {[
                      '🚀 Futuristic Rocket Emblem',
                      '💡 Glowing Tech Startup Badge',
                      '🛡️ Modern Cyber Security Shield',
                      '⚡ Neon Geometry Loading Spinner',
                    ].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setAiPrompt(pill)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[10px] font-semibold transition cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {aiErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0" />
                    <span>{aiErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNvidiaAiModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiSvg}
                  disabled={isAiGenerating}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Generating SVG Graphic with NVIDIA AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                      <span>Generate SVG Graphic</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
