'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Plus, Trash2, Copy, Download, Printer, Save, FolderOpen,
  ChevronUp, ChevronDown, Move, Image as ImageIcon, Type, Square,
  Wand2, Globe, Github, FileJson, ArrowLeft, Check, AlertTriangle, Layers,
  Presentation, FileText, X, CopyPlus, Undo2, Redo2, RotateCw,
  PanelLeft, PanelRight, ZoomIn, ZoomOut, Maximize,
} from 'lucide-react';
import { PptElement, PptLayoutId, PptSlide, PPT_H, PPT_W, uid } from '@/lib/pptTypes';
import { PPT_LAYOUTS, PPT_THEMES, buildSlide, blankContent, demoDecks, getTheme } from '@/lib/pptTemplates';
import { generatePptContent, tryFetchUrlText, PptAiProvider } from '@/lib/pptAi';
import { importDeckJsonFile, importPptxFile, importPdfFile, fileToImageSrc, rasterizeImageUrl } from '@/lib/pptImport';
import { exportSlidesToPptx, openSlidesPrintWindow } from '@/lib/pptExport';
import { getGeminiApiKey, setGeminiApiKey, CLOUD_GEMINI_MODELS } from '@/lib/geminiAi';
import { getNvidiaApiKey, setNvidiaApiKey, getNvidiaSelectedModel, setNvidiaSelectedModel, CLOUD_NVIDIA_MODELS } from '@/lib/nvidiaAi';

const LS_SLIDES = 'toolip_ppt_slides_v1';

const ALL_LAYOUTS: PptLayoutId[] = PPT_LAYOUTS.map((l) => l.id);

// Designer shape kit — clip-paths mirror the PPTX autoshape geometry
export const SHAPE_CLIP: Record<string, string> = {
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
};

export const SHAPE_KINDS = [
  { id: 'rect', label: '▭ Rect' },
  { id: 'circle', label: '● Circle' },
  { id: 'triangle', label: '▲ Triangle' },
  { id: 'pentagon', label: '⬠ Pentagon' },
  { id: 'hexagon', label: '⬡ Hexagon' },
  { id: 'star', label: '★ Star' },
  { id: 'line', label: '─ Line' },
] as const;

// shape paint shared by canvas + thumbnails (picture fill via el.src, like PPT picture-fill)
function shapePaint(el: PptElement): React.CSSProperties {
  const pic = el.src
    ? { backgroundImage: `url("${el.src}")`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const }
    : {};
  if (el.shape === 'line') return { background: el.bg, borderRadius: 2, ...pic };
  if (el.shape === 'circle') return { background: el.bg, borderRadius: 9999, ...pic };
  const clip = SHAPE_CLIP[el.shape || ''];
  if (clip) return { background: el.bg, clipPath: clip, ...pic };
  return { background: el.bg, borderRadius: el.borderRadius, ...pic };
}

interface CanvasElProps {
  el: PptElement;
  mini: boolean;
  isPrimary: boolean;
  inGroup: boolean;
  hov: boolean;
  onDown: (e: React.MouseEvent, el: PptElement) => void;
  onDbl: (e: React.MouseEvent, el: PptElement) => void;
}

// memoized: mousemove drags only re-render elements whose object actually changed
const CanvasEl = React.memo(
  function CanvasEl({ el, mini, isPrimary, inGroup, hov, onDown, onDbl }: CanvasElProps) {
    const base: React.CSSProperties = {
      left: el.x, top: el.y, width: el.w, height: el.h, position: 'absolute',
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      outline: isPrimary ? '2px solid #00E5FF' : inGroup ? '2px solid #A78BFA' : hov ? '2px dashed #00E5FF' : 'none',
      outlineOffset: 2, cursor: mini ? 'default' : 'move',
    };
    const down = mini ? undefined : (e: React.MouseEvent) => onDown(e, el);
    const dbl = mini ? undefined : (e: React.MouseEvent) => onDbl(e, el);
    if (el.type === 'text') {
      return (
        <div style={{ ...base, fontSize: el.fontSize, fontWeight: el.bold ? 800 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.color, textAlign: el.align, fontFamily: el.fontFamily, letterSpacing: el.letterSpacing, lineHeight: 1.25, whiteSpace: 'pre-wrap', overflow: 'hidden' }}
          onMouseDown={down} onDoubleClick={dbl} title={mini ? undefined : 'Drag to move • double-click to edit text'}>
          {el.text}
        </div>
      );
    }
    if (el.type === 'image') {
      return <img src={el.src} alt="" draggable={false} style={{ ...base, objectFit: 'cover', borderRadius: el.borderRadius }} onMouseDown={down} onDoubleClick={dbl} title={mini ? undefined : 'Drag to move • double-click for image URL'} />;
    }
    return <div style={{ ...base, ...shapePaint(el) }} onMouseDown={down} onDoubleClick={dbl} title={mini ? undefined : `${el.shape || 'shape'} — double-click for fill`} />;
  },
  (a, b) => a.el === b.el && a.isPrimary === b.isPrimary && a.inGroup === b.inGroup && a.hov === b.hov && a.mini === b.mini
);

interface ThumbProps {
  s: PptSlide;
  i: number;
  isActive: boolean;
  total: number;
  onSelect: (i: number) => void;
  onMove: (i: number, dir: number) => void;
  onInsert: (i: number) => void;
}

const SlideThumb = React.memo(function SlideThumb({ s, i, isActive, total, onSelect, onMove, onInsert }: ThumbProps) {
  return (
    <div onClick={() => onSelect(i)} className={`rounded-lg border overflow-hidden cursor-pointer ${isActive ? 'border-cyan-400' : 'border-gray-700 hover:border-gray-500'}`}>
      <div className="relative w-full aspect-video" style={{ background: s.bg }}>
        <div className="absolute inset-0 origin-top-left pointer-events-none" style={{ width: PPT_W, height: PPT_H, transform: `scale(${160 / PPT_W})` }}>
          {s.elements.map((el) => (
            <div key={el.id}>
              {el.type === 'text'
                ? <div style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h, fontSize: el.fontSize, fontWeight: el.bold ? 800 : 400, color: el.color, textAlign: el.align, fontFamily: el.fontFamily, lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'pre-wrap', transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined }}>{el.text}</div>
                : el.type === 'image'
                  ? <img src={el.src} alt="" style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h, objectFit: 'cover', borderRadius: el.borderRadius, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined }} />
                  : <div style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.shape === 'line' ? Math.max(el.h, 3) : el.h, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined, ...shapePaint(el) }} />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-1.5 py-1 bg-gray-950">
        <span className="text-[10px] font-bold text-gray-300 truncate">{i + 1}. {s.title}</span>
        <span className="text-[9px] font-mono text-cyan-400">{s.layout}</span>
      </div>
      <div className="flex items-center gap-1 px-1.5 py-1 bg-gray-950 border-t border-gray-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onMove(i, -1)} disabled={i === 0} title="Move slide up" className="flex-1 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-200 text-[10px] font-bold">▲</button>
        <button onClick={() => onMove(i, 1)} disabled={i === total - 1} title="Move slide down" className="flex-1 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-200 text-[10px] font-bold">▼</button>
        <button onClick={() => onInsert(i)} title="Insert blank slide below (same layout)" className="flex-1 py-1 bg-violet-900/60 hover:bg-violet-800 border border-violet-500/30 rounded text-violet-200 text-[10px] font-bold">＋ add below</button>
      </div>
    </div>
  );
});

export const PptGenerator: React.FC = () => {
  const [topic, setTopic] = useState('AI-powered fitness coaching app launch');
  const [numPages, setNumPages] = useState(6);
  const [chosenLayouts, setChosenLayouts] = useState<PptLayoutId[]>(['title-hero', 'split-bullets', 'stats-3', 'timeline', 'data-table', 'closing']);
  const [themeId, setThemeId] = useState('cream-modern');
  const [tab, setTab] = useState<'describe' | 'sources' | 'manual'>('describe');
  const [webUrl, setWebUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [contextText, setContextText] = useState('');
  const [provider, setProvider] = useState<PptAiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState(CLOUD_GEMINI_MODELS[0].id);
  const [tone, setTone] = useState('modern, confident, minimal');
  const [fileName, setFileName] = useState('toolip-presentation');
  const [manualTitles, setManualTitles] = useState<string[]>(['', '', '', '', '', '']);

  const [slides, setSlides] = useState<PptSlide[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  // multi-select: every id in the group; primary (edited in panel) = last clicked
  const [selIds, setSelIds] = useState<string[]>([]);
  const selId = selIds.length ? selIds[selIds.length - 1] : null;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState<null | 'json' | 'pptx' | 'pdf'>(null);
  const [importNotes, setImportNotes] = useState<string[] | null>(null);
  const [exportNotes, setExportNotes] = useState<string[] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [savedOk, setSavedOk] = useState(false);

  const dragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const draggingRef = useRef(false); // true between mousedown/mouseup: skip history snapshots mid-drag
  const slidesRef = useRef<PptSlide[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const pptxInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  // design-area navigation: fit-to-view base × user zoom, native scroll pans
  const [fitScale, setFitScale] = useState(0.7);
  const [zoom, setZoom] = useState(1);
  const scale = fitScale * zoom;
  const [showRail, setShowRail] = useState(true);
  const [showProps, setShowProps] = useState(true);

  // load persisted
  useEffect(() => {
    try {
      const k = provider === 'gemini' ? getGeminiApiKey() : getNvidiaApiKey();
      if (k) setApiKey(k);
      if (provider === 'nvidia') setModelId(getNvidiaSelectedModel());
    } catch { /* noop */ }
    try {
      const raw = localStorage.getItem(LS_SLIDES);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p) && p.length) { setSlides(p); setShowSetup(false); }
      }
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mirror for drag/history handlers; persist is debounced so mousemove drags stay at 60fps
  useEffect(() => {
    slidesRef.current = slides;
    const t = setTimeout(() => {
      try { localStorage.setItem(LS_SLIDES, JSON.stringify(slidesRef.current)); } catch { /* noop */ }
    }, 600);
    return () => clearTimeout(t);
  }, [slides]);

  // responsive fit-to-view base scale (user zoom multiplies on top)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const fit = () => setFitScale(Math.min(1, el.clientWidth / (PPT_W + 48), Math.max(320, el.clientHeight) / (PPT_H + 48)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showSetup, showRail, showProps]);

  // design-area wheel: Ctrl+scroll zooms to cursor, Shift+scroll pans ↔, plain scroll pans ↕
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setZoom((z) => {
          const nz = Math.min(3, Math.max(0.2, z * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
          const k = nz / z;
          requestAnimationFrame(() => {
            el.scrollLeft = (el.scrollLeft + mx) * k - mx;
            el.scrollTop = (el.scrollTop + my) * k - my;
          });
          return nz;
        });
      } else if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY || e.deltaX;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showSetup]);

  const active = slides[activeIdx] || null;
  const selected: PptElement | null = useMemo(
    () => active?.elements.find((e) => e.id === selId) || null,
    [active, selId]
  );

  const log = (m: string) => setLogs((p) => [...p.slice(-60), `${new Date().toLocaleTimeString()} ${m}`]);

  // keep chosenLayouts + manual titles in sync with numPages
  useEffect(() => {
    setChosenLayouts((prev) => {
      const next = [...prev];
      while (next.length < numPages) next.push(next.length === numPages - 1 ? 'closing' : 'split-bullets');
      return next.slice(0, numPages);
    });
    setManualTitles((prev) => {
      const next = [...prev];
      while (next.length < numPages) next.push('');
      return next.slice(0, numPages);
    });
  }, [numPages]);

  const setLayoutAt = (i: number, v: PptLayoutId) =>
    setChosenLayouts((p) => p.map((l, j) => (j === i ? v : l)));

  // page-type chips: tap to ADD a slot, tap again to REMOVE one slot.
  // Deck order = the per-slide chooser below; generation follows it exactly.
  const togglePageType = (l: PptLayoutId) => {
    const p = chosenLayouts;
    const idx = p.lastIndexOf(l);
    if (idx >= 0) {
      if (p.length <= 3) { setError('Keep at least 3 pages — add another type first.'); return; }
      const next = [...p];
      next.splice(idx, 1);
      setError(null);
      setChosenLayouts(next);
      setNumPages(next.length);
      return;
    }
    if (p.length >= 15) { setError('Max 15 pages per deck — remove a type first.'); return; }
    const next = [...p];
    // new content slots go before the trailing closing slide when there is one
    const at = next.length && next[next.length - 1] === 'closing' ? next.length - 1 : next.length;
    next.splice(at, 0, l);
    setError(null);
    setChosenLayouts(next);
    setNumPages(next.length);
  };

  const patchSlide = (idx: number, fn: (s: PptSlide) => PptSlide) =>
    setSlides((p) => p.map((s, i) => (i === idx ? fn(s) : s)));

  const patchEl = (elId: string, patch: Partial<PptElement>) => {
    if (!active) return;
    patchSlide(activeIdx, (s) => ({ ...s, elements: s.elements.map((e) => (e.id === elId ? { ...e, ...patch } : e)) }));
  };

  const patchEls = (ids: string[], patch: Partial<PptElement> | ((e: PptElement) => Partial<PptElement>)) => {
    if (!active || !ids.length) return;
    patchSlide(activeIdx, (s) => ({
      ...s,
      elements: s.elements.map((e) => (ids.includes(e.id) ? { ...e, ...(typeof patch === 'function' ? patch(e) : patch) } : e)),
    }));
  };

  const nudge = (dx: number, dy: number) => {
    if (!active || !selIds.length) return;
    patchEls(selIds, (e) => ({ x: Math.round(e.x + dx), y: Math.round(e.y + dy) }));
  };

  // layer order: later in the elements array paints on top (canvas, PPTX, PDF)
  const layerIndex = (id: string): number => active?.elements.findIndex((e) => e.id === id) ?? -1;

  const moveLayer = (id: string, dir: number) => {
    if (!active) return;
    patchSlide(activeIdx, (s) => {
      const arr = [...s.elements];
      const i = arr.findIndex((e) => e.id === id);
      if (i < 0) return s;
      const j = dir >= 99 ? arr.length - 1 : dir <= -99 ? 0 : Math.min(arr.length - 1, Math.max(0, i + dir));
      if (i === j) return s;
      const [el] = arr.splice(i, 1);
      arr.splice(j, 0, el);
      return { ...s, elements: arr };
    });
  };

  const selectSlide = useCallback((i: number) => { setActiveIdx(i); setSelIds([]); }, []);

  const moveSlide = useCallback((i: number, dir: number) => {
    setSlides((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setActiveIdx((a) => (a === i ? Math.min(slidesRef.current.length - 1, Math.max(0, i + dir)) : a));
  }, []);

  const insertSlideBelow = useCallback((i: number) => {
    const ref = slidesRef.current[i];
    if (!ref) return;
    const s = buildSlide(ref.layout, themeId, blankContent(ref.layout, defaultManualTitle(ref.layout, i + 1), i + 1), i + 1);
    setSlides((p) => [...p.slice(0, i + 1), s, ...p.slice(i + 1)]);
    setActiveIdx(i + 1);
    setSelIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId]);

  // ─── undo / redo (Ctrl+Z / Ctrl+Y) ───
  const historyRef = useRef<{ past: PptSlide[][]; future: PptSlide[][] }>({ past: [], future: [] });
  const applyingHistoryRef = useRef(false);
  const skipFirstSnapRef = useRef(true);

  useEffect(() => {
    if (skipFirstSnapRef.current) { skipFirstSnapRef.current = false; return; }
    if (applyingHistoryRef.current) { applyingHistoryRef.current = false; return; }
    if (draggingRef.current) return; // one snapshot lands on mouseup instead
    commitHistorySnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const commitHistorySnapshot = () => {
    try {
      const snap = JSON.parse(JSON.stringify(slidesRef.current)) as PptSlide[];
      if (JSON.stringify(snap).length > 6_000_000) {
        historyRef.current = { past: [], future: [] }; // deck too heavy for history
        return;
      }
      historyRef.current.past.push(snap);
      if (historyRef.current.past.length > 25) historyRef.current.past.shift();
      historyRef.current.future = [];
    } catch { /* ignore */ }
  };

  const doUndo = () => {
    const h = historyRef.current;
    if (h.past.length < 2) return;
    const cur = h.past.pop()!;
    h.future.push(cur);
    const prev = h.past[h.past.length - 1];
    applyingHistoryRef.current = true;
    setSlides(JSON.parse(JSON.stringify(prev)) as PptSlide[]);
    setSelIds([]);
    log('Undo.');
  };

  const doRedo = () => {
    const h = historyRef.current;
    const next = h.future.pop();
    if (!next) return;
    h.past.push(JSON.parse(JSON.stringify(next)) as PptSlide[]);
    applyingHistoryRef.current = true;
    setSlides(next);
    setSelIds([]);
    log('Redo.');
  };

  const canUndo = historyRef.current.past.length >= 2;
  const canRedo = historyRef.current.future.length > 0;

  // ─── duplicate selected element(s) ───
  const duplicateSelection = () => {
    if (!active || !selIds.length) return;
    const clones = active.elements
      .filter((e) => selIds.includes(e.id))
      .map((e) => ({
        ...e,
        id: uid(e.type === 'text' ? 't' : e.type === 'image' ? 'img' : 'box'),
        x: e.x + 16,
        y: e.y + 16,
      }));
    if (!clones.length) return;
    patchSlide(activeIdx, (s) => ({ ...s, elements: [...s.elements, ...clones] }));
    setSelIds(clones.map((c) => c.id));
    log(`Duplicated ${clones.length} element(s).`);
  };

  // arrow-key pixel move + undo/redo (native undo kept inside text fields)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/INPUT|TEXTAREA|SELECT/.test(t?.tagName || '')) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z' && !e.shiftKey) { doUndo(); e.preventDefault(); return; }
      if ((mod && key === 'y') || (mod && key === 'z' && e.shiftKey)) { doRedo(); e.preventDefault(); return; }
      if (!selected) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { nudge(-step, 0); e.preventDefault(); }
      if (e.key === 'ArrowRight') { nudge(step, 0); e.preventDefault(); }
      if (e.key === 'ArrowUp') { nudge(0, -step); e.preventDefault(); }
      if (e.key === 'ArrowDown') { nudge(0, step); e.preventDefault(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.x, selected?.y, activeIdx, slides]);

  const handleFetch = async (kind: 'web' | 'github') => {
    const url = kind === 'web' ? webUrl : githubUrl;
    if (!url.trim()) { setError('Paste a URL first.'); return; }
    setBusy(true); setError(null);
    try {
      log(`Fetching ${kind} URL...`);
      const text = await tryFetchUrlText(url.trim());
      setContextText((p) => `${p}\n\n--- ${kind.toUpperCase()} ${url} ---\n${text}`.slice(0, 9000));
      log(`Fetched ${(text.length / 1024).toFixed(1)} KB from ${kind} URL.`);
    } catch (e: any) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Describe what the PPT is about first.'); return; }
    setBusy(true); setError(null); setLogs([]);
    try {
      if (provider === 'gemini') setGeminiApiKey(apiKey);
      else if (provider === 'nvidia') { setNvidiaApiKey(apiKey); setNvidiaSelectedModel(modelId); }
      if (!apiKey.trim() && provider !== 'ollama') throw new Error(`${provider === 'gemini' ? 'Gemini' : 'NVIDIA'} API key required (BYOK). Paste it above — it stays in your browser.`);
      const content = await generatePptContent(
        { topic: topic.trim(), numPages, pageTypes: chosenLayouts, contextText, webUrl, githubUrl, tone },
        { provider, apiKey: apiKey.trim(), modelId, onLog: log }
      );
      const built = content.map((c, i) => buildSlide(chosenLayouts[i] || c.layout, themeId, c, i));
      setSlides(built); setActiveIdx(0); setSelIds([]); setShowSetup(false);
      log(`Deck ready: ${built.length} slides. Select any element to edit pixels/text/image.`);
    } catch (e: any) {
      setError(e.message || 'Generation failed');
      log(`FAILED: ${e.message}`);
    } finally { setBusy(false); }
  };

  const handleDemo = () => {
    const d = demoDecks(themeId);
    setSlides(d); setActiveIdx(0); setSelIds([]); setShowSetup(false);
    log('Loaded offline demo deck (no AI). Fully editable.');
  };

  const handleManualCreate = () => {
    setError(null);
    const built = chosenLayouts.map((layout, i) =>
      buildSlide(layout, themeId, blankContent(layout, manualTitles[i] || defaultManualTitle(layout, i), i), i)
    );
    setSlides(built); setActiveIdx(0); setSelIds([]); setShowSetup(false);
    log(`Manual deck ready: ${built.length} pre-structured slide(s). No AI used — edit everything.`);
  };

function defaultManualTitle(layout: PptLayoutId, i: number): string {
  switch (layout) {
    case 'title-hero': return 'Presentation Title';
    case 'split-bullets': return 'Key Points';
    case 'stats-3': return 'By the Numbers';
    case 'team-grid': return 'Our Team';
    case 'timeline': return 'Roadmap';
    case 'data-table': return 'Key Data';
    case 'quote-image': return 'Highlight';
    case 'closing': return 'Thank You';
    case 'mindmap': return 'Mind Map';
    case 'org-chart': return 'Team Structure';
    case 'tech-stack': return 'Tech Stack';
    case 'mindmap-radial': return 'Radial Map';
    case 'sdlc': return 'Build Process';
    case 'fullstack': return 'Architecture';
    default: return `Slide ${i + 1}`;
  }
}

  const addSlide = (layout: PptLayoutId) => {
    const s = buildSlide(layout, themeId, { layout, title: 'New slide', subtitle: 'Edit me', bullets: ['First point', 'Second point'] }, slides.length);
    setSlides((p) => [...p, s]); setActiveIdx(slides.length);
  };

  const applyThemeAll = (id: string) => {
    setThemeId(id);
    const th = getTheme(id);
    setSlides((p) => p.map((s) => ({ ...s, themeId: id, bg: th.bg })));
  };

  const handleImageUpload = async (f: File | undefined, elId: string) => {
    if (!f) return;
    try {
      patchEl(elId, { src: await fileToImageSrc(f) }); // SVGs auto-convert to PNG
    } catch {
      setError(`Could not read ${f.name} as an image.`);
    }
  };

  const handleExportPptx = async () => {
    if (!slides.length) return;
    setBusy(true); setExportNotes(null); setError(null);
    try {
      const warns = await exportSlidesToPptx(slides, fileName || 'toolip-presentation');
      if (warns.length) setExportNotes(warns);
      log(`PPTX downloaded${warns.length ? ' (with image warnings — see notes).' : '.'}`);
    }
    catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const handleExportPdf = () => {
    if (!slides.length) return;
    openSlidesPrintWindow(slides, fileName);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ fileName, themeId, slides }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${fileName}.ppt.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // ─── external drag & drop: files or image URLs from anywhere ───
  const canvasPoint = (clientX: number, clientY: number) => {
    const r = slideRef.current?.getBoundingClientRect();
    if (!r || !r.width) return { x: 340, y: 170 };
    return {
      x: Math.round(((clientX - r.left) / r.width) * PPT_W),
      y: Math.round(((clientY - r.top) / r.height) * PPT_H),
    };
  };

  const placeDroppedImages = (srcs: string[], pt: { x: number; y: number }) => {
    if (!srcs.length || !active) return;
    let i = 0;
    if (selected && selected.type === 'shape' && selected.shape !== 'line') {
      patchEl(selected.id, { src: srcs[0] });
      log(`Filled ${selected.shape || 'shape'} with dropped image.`);
      i = 1;
    }
    const rest = srcs.slice(i);
    if (rest.length) {
      const els = rest.map(
        (src, k) =>
          ({
            id: uid('img'),
            type: 'image',
            src,
            x: Math.max(8, Math.min(PPT_W - 288, pt.x - 140 + k * 28)),
            y: Math.max(8, Math.min(PPT_H - 208, pt.y - 100 + k * 28)),
            w: 280,
            h: 200,
            borderRadius: 8,
          } as PptElement)
      );
      patchSlide(activeIdx, (s) => ({ ...s, elements: [...s.elements, ...els] }));
      setSelIds(els.map((e) => e.id));
      log(`Added ${els.length} image(s) from drop.`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!active || busy || importing) return;
    const pt = canvasPoint(e.clientX, e.clientY);
    const files = Array.from(e.dataTransfer.files || [])
      .filter((f) => f.type.startsWith('image/') || /\.(svg|png|jpe?g|gif|webp|bmp)$/i.test(f.name))
      .slice(0, 6);
    const srcs: string[] = [];
    for (const f of files) {
      try {
        srcs.push(await fileToImageSrc(f));
      } catch {
        setError(`Could not read ${f.name} as an image.`);
      }
    }
    if (!srcs.length) {
      const uri = (e.dataTransfer.getData('text/uri-list') || '').split('\n').map((s) => s.trim()).find((s) => /^https?:\/\//i.test(s));
      const html = e.dataTransfer.getData('text/html') || '';
      const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      const url = uri || (m && m[1]);
      if (url) {
        try {
          srcs.push(await rasterizeImageUrl(url, 1400));
        } catch {
          srcs.push(url); // keep remote URL; export embeds it when allowed
        }
      }
    }
    if (!srcs.length) {
      setError('Drop image files (PNG / JPG / SVG / WebP) or drag an image in from another page.');
      return;
    }
    placeDroppedImages(srcs, pt);
  };

  const applyImported = (res: { slides: PptSlide[]; themeId?: string; fileName?: string; warnings: string[] }, label: string) => {
    setSlides(res.slides);
    if (res.themeId && PPT_THEMES.some((t) => t.id === res.themeId)) setThemeId(res.themeId);
    if (res.fileName) setFileName(res.fileName);
    setActiveIdx(0); setSelIds([]); setShowSetup(false);
    setImportNotes(res.warnings.length ? res.warnings : null);
    log(`${label}: loaded ${res.slides.length} slide(s). Click any element to edit.`);
  };

  const doImport = async (kind: 'json' | 'pptx' | 'pdf', f: File | undefined) => {
    if (!f || importing) return;
    setImporting(kind); setError(null); setImportNotes(null);
    try {
      if (kind === 'json') {
        applyImported(await importDeckJsonFile(f), 'Deck JSON');
      } else if (kind === 'pptx') {
        const th = getTheme(themeId);
        applyImported(await importPptxFile(f, themeId, th.text, log), 'PPTX');
      } else {
        applyImported(await importPdfFile(f, themeId, log), 'PDF');
      }
    } catch (e: any) {
      setError(e.message || `${kind.toUpperCase()} import failed.`);
    } finally {
      setImporting(null);
      if (jsonInputRef.current) jsonInputRef.current.value = '';
      if (pptxInputRef.current) pptxInputRef.current.value = '';
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // keep selected element chip visible in side panel
  useEffect(() => {
    if (selId) chipRefs.current[selId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selId, activeIdx]);

  const focusTextEditor = () => {
    requestAnimationFrame(() => textAreaRef.current?.focus({ preventScroll: false }));
  };

  const onCanvasMouse = (e: React.MouseEvent, el: PptElement) => {
    e.stopPropagation(); // container clears selection — without this single-click never sticks
    const additive = e.ctrlKey || e.metaKey;
    // resolve the group being dragged *before* state updates flush
    let group: string[];
    if (additive) {
      group = selIds.includes(el.id) ? selIds.filter((id) => id !== el.id) : [...selIds, el.id];
      setSelIds(group);
      if (!group.includes(el.id)) return; // ctrl-clicked off: deselect, no drag
    } else if (selIds.includes(el.id) && selIds.length > 1) {
      group = selIds; // drag existing group as-is
    } else {
      group = [el.id];
      setSelIds(group);
    }
    const members = new Map((active?.elements || []).filter((m) => group.includes(m.id)).map((m) => [m.id, { x: m.x, y: m.y }]));
    draggingRef.current = true;
    dragRef.current = { id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y };
    let raf = 0;
    let pending: { dx: number; dy: number } | null = null;
    const apply = () => {
      raf = 0;
      const d = dragRef.current;
      if (!d || !pending) return;
      const { dx, dy } = pending;
      pending = null;
      patchSlide(activeIdx, (s) => ({
        ...s,
        elements: s.elements.map((m) => {
          const o = members.get(m.id);
          return o ? { ...m, x: Math.round(o.x + dx), y: Math.round(o.y + dy) } : m;
        }),
      }));
    };
    const move = (ev: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      pending = {
        dx: (ev.clientX - d.sx) / (scale || 1),
        dy: (ev.clientY - d.sy) / (scale || 1),
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const up = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; apply(); }
      dragRef.current = null;
      draggingRef.current = false;
      commitHistorySnapshot(); // single undo step for the whole drag
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleDbl = (e: React.MouseEvent, el: PptElement) => {
    e.stopPropagation();
    setSelIds([el.id]);
    if (el.type === 'text') focusTextEditor();
  };

  const renderEl = (el: PptElement, mini = false) => (
    <CanvasEl
      key={el.id}
      el={el}
      mini={mini}
      isPrimary={el.id === selId && !mini}
      inGroup={selIds.includes(el.id) && el.id !== selId && !mini}
      hov={el.id === hoverId && !mini && !selIds.includes(el.id)}
      onDown={onCanvasMouse}
      onDbl={handleDbl}
    />
  );

  const modelsForProvider = provider === 'gemini'
    ? CLOUD_GEMINI_MODELS.map((m) => ({ id: m.id, name: m.name }))
    : CLOUD_NVIDIA_MODELS.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="space-y-4 text-sm">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2 font-bold text-white">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-base">PPT Generator — describe, design, edit pixels, export</span>
          {slides.length > 0 && <span className="px-2 py-0.5 text-[11px] font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-300 rounded-full">{slides.length} slides</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {slides.length > 0 && (
            <button onClick={() => setShowSetup((s) => !s)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold">
              {showSetup ? <><ArrowLeft className="h-3.5 w-3.5" /> Back to editor</> : <><Wand2 className="h-3.5 w-3.5" /> Setup / Regenerate</>}
            </button>
          )}
          <input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="file-name" className="px-2.5 py-1.5 text-xs bg-gray-950 border border-gray-700 rounded-lg text-white w-44 font-mono" />
          <button onClick={handleExportPptx} disabled={!slides.length || busy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold">
            <Download className="h-3.5 w-3.5" /> PPTX
          </button>
          <button onClick={handleExportPdf} disabled={!slides.length} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold">
            <Printer className="h-3.5 w-3.5" /> PDF
          </button>
          <span className="w-px h-6 bg-white/10 mx-0.5" title="Import existing files to edit" />
          <button onClick={() => jsonInputRef.current?.click()} disabled={!!importing} title="Import prebuilt deck JSON to edit" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-emerald-300 text-xs font-bold border border-gray-700">
            <FileJson className="h-3.5 w-3.5" /> {importing === 'json' ? '…' : 'JSON'}
          </button>
          <button onClick={() => pptxInputRef.current?.click()} disabled={!!importing} title="Import PowerPoint (.pptx) — text + images become editable" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-orange-300 text-xs font-bold border border-gray-700">
            <Presentation className="h-3.5 w-3.5" /> {importing === 'pptx' ? '…' : '.pptx'}
          </button>
          <button onClick={() => pdfInputRef.current?.click()} disabled={!!importing} title="Import PDF pages as slide backgrounds" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sky-300 text-xs font-bold border border-gray-700">
            <FileText className="h-3.5 w-3.5" /> {importing === 'pdf' ? '…' : '.pdf'}
          </button>
          <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={(e) => doImport('json', e.target.files?.[0])} />
          <input ref={pptxInputRef} type="file" accept=".pptx" className="hidden" onChange={(e) => doImport('pptx', e.target.files?.[0])} />
          <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => doImport('pdf', e.target.files?.[0])} />
        </div>
      </div>

      {/* import lives in the top bar now — notes stay dismissible below */}

      {(importNotes || exportNotes) && (
        <div className="p-3 bg-amber-950/50 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>Import / export notes</span>
            <button onClick={() => { setImportNotes(null); setExportNotes(null); }} className="text-amber-400 hover:text-amber-200"><X className="h-3.5 w-3.5" /></button>
          </div>
          {(importNotes || []).map((w, i) => <div key={`i${i}`}>• {w}</div>)}
          {(exportNotes || []).map((w, i) => <div key={`e${i}`}>• {w}</div>)}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} title="Dismiss" className="p-1 rounded hover:bg-rose-500/20 text-rose-300 shrink-0"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {(showSetup || !slides.length) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          {/* input wizard */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['describe', 'sources', 'manual'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tab === t ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {t === 'describe' ? '1 — Describe (AI)' : t === 'sources' ? '2 — Web / GitHub' : '3 — Manual (no AI)'}
                </button>
              ))}
            </div>

            {tab === 'describe' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs font-semibold">What is this PPT about? + what pages do you want?</label>
                  <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="e.g. Seed pitch for a chai delivery startup: problem, solution, traction, business model, team, ask" className="mt-1 w-full px-3 py-2 text-sm bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold">No. of pages: {numPages} <span className="text-gray-600">(max 15)</span></label>
                    <input type="range" min={3} max={15} value={numPages} onChange={(e) => setNumPages(Number(e.target.value))} className="w-full accent-cyan-500" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold">Tone</label>
                    <input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full px-2.5 py-1.5 text-xs bg-gray-950 border border-gray-700 rounded-lg text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Types of pages — tap ＋ to add a slide, tap again to remove ({chosenLayouts.length}/15 slots used)</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PPT_LAYOUTS.map((l) => {
                      const count = chosenLayouts.filter((x) => x === l.id).length;
                      return (
                        <button key={l.id} title={`${l.desc} — ${count ? `in deck ×${count}, tap to remove one` : 'tap to add'}`} onClick={() => togglePageType(l.id)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${count ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-gray-950 border-gray-700 text-gray-400'}`}>
                          {count ? `− ${l.name} ×${count}` : `＋ ${l.name}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Per-slide structure chooser (slide → layout)</label>
                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {chosenLayouts.map((l, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1">
                        <span className="font-mono text-[11px] text-cyan-400 font-bold w-8">S{i + 1}</span>
                        <select value={l} onChange={(e) => setLayoutAt(i, e.target.value as PptLayoutId)} className="flex-1 bg-transparent text-xs text-white focus:outline-none">
                          {ALL_LAYOUTS.map((id) => <option key={id} value={id} className="bg-gray-900">{PPT_LAYOUTS.find((x) => x.id === id)?.name}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Theme (5 pre-designs, modern first)</label>
                  <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {PPT_THEMES.map((t) => (
                      <button key={t.id} onClick={() => setThemeId(t.id)} className={`p-2 rounded-lg border text-left ${themeId === t.id ? 'border-cyan-400 bg-cyan-950/40' : 'border-gray-700 bg-gray-950'}`}>
                        <div className="h-8 rounded flex overflow-hidden">
                          <div className="flex-1" style={{ background: t.bg }} />
                          <div className="w-6" style={{ background: t.accent }} />
                        </div>
                        <div className="mt-1 text-[11px] font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-gray-500">{t.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : tab === 'sources' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300"><Globe className="h-3.5 w-3.5" /> Web URL</div>
                    <input value={webUrl} onChange={(e) => setWebUrl(e.target.value)} placeholder="https://..." className="w-full px-2 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                    <button onClick={() => handleFetch('web')} disabled={busy} className="text-[11px] font-bold text-sky-400 hover:text-sky-300">↓ Fetch page text</button>
                  </div>
                  <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300"><Github className="h-3.5 w-3.5" /> GitHub repo URL</div>
                    <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/user/repo" className="w-full px-2 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                    <button onClick={() => handleFetch('github')} disabled={busy} className="text-[11px] font-bold text-violet-300 hover:text-violet-200">↓ Fetch README page</button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Context text (pasted or fetched — AI grounds slides in this)</label>
                  <textarea value={contextText} onChange={(e) => setContextText(e.target.value)} rows={8} placeholder="Paste website copy, README, docs... or use Fetch buttons above (may fail on CORS — then paste manually)." className="mt-1 w-full px-3 py-2 text-xs bg-gray-950 border border-gray-700 rounded-lg text-gray-200 font-mono focus:outline-none focus:border-cyan-500" />
                  <div className="text-[11px] text-gray-500 mt-1">{(contextText.length / 1024).toFixed(1)} KB context</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-xs text-cyan-200">
                  Build your own deck from pre-designed structures — no AI, no API key. Pick a layout + title per slide, then edit everything on canvas.
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">No. of slides: {numPages} <span className="text-gray-600">(max 15)</span></label>
                  <input type="range" min={1} max={15} value={numPages} onChange={(e) => setNumPages(Number(e.target.value))} className="w-full accent-cyan-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Theme</label>
                  <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                    {PPT_THEMES.map((t) => (
                      <button key={t.id} title={t.name} onClick={() => setThemeId(t.id)} className={`h-9 rounded-lg border ${themeId === t.id ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-gray-700'}`} style={{ background: `linear-gradient(90deg, ${t.bg} 60%, ${t.accent} 60%)` }} />
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{PPT_THEMES.find((t) => t.id === themeId)?.name}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold">Slides — pre-structure + your title each</label>
                  <div className="mt-1.5 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {chosenLayouts.map((l, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5">
                        <span className="font-mono text-[11px] text-cyan-400 font-bold w-8 shrink-0">S{i + 1}</span>
                        <select value={l} onChange={(e) => setLayoutAt(i, e.target.value as PptLayoutId)} className="bg-gray-900 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none w-36 shrink-0">
                          {ALL_LAYOUTS.map((id) => <option key={id} value={id} className="bg-gray-900">{PPT_LAYOUTS.find((x) => x.id === id)?.name}</option>)}
                        </select>
                        <input value={manualTitles[i] || ''} onChange={(e) => setManualTitles((p) => p.map((t, j) => (j === i ? e.target.value : t)))} placeholder={defaultManualTitle(l, i)} className="flex-1 min-w-0 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleManualCreate} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold">
                  <Plus className="h-4 w-4" /> Create {numPages}-slide deck from pre-structures
                </button>
              </div>
            )}

            {/* AI provider (not needed for manual mode) */}
            {tab !== 'manual' && (
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-300">AI engine:</span>
                {(['gemini', 'nvidia', 'ollama'] as PptAiProvider[]).map((p) => (
                  <button key={p} onClick={() => { setProvider(p); if (p === 'gemini') setModelId(CLOUD_GEMINI_MODELS[0].id); if (p === 'nvidia') setModelId(getNvidiaSelectedModel()); if (p === 'ollama') setModelId('ollama/qwen2.5-coder:7b'); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${provider === p ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`}>{p.toUpperCase()}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 text-[11px] font-semibold">{provider === 'ollama' ? 'Model (local)' : 'Model'}</label>
                  {provider === 'ollama' ? (
                    <input value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="ollama/qwen2.5-coder:7b" className="mt-0.5 w-full px-2 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                  ) : (
                    <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="mt-0.5 w-full px-2 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded text-white">
                      {modelsForProvider.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  )}
                </div>
                {provider !== 'ollama' && (
                  <div>
                    <label className="text-gray-500 text-[11px] font-semibold">BYOK API key (stored locally)</label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={provider === 'gemini' ? 'AIza...' : 'nvapi-...'} className="mt-0.5 w-full px-2 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={handleGenerate} disabled={busy} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold">
                  <Sparkles className="h-4 w-4" /> {busy ? 'Generating...' : `Generate ${numPages}-slide deck with ${provider.toUpperCase()}`}
                </button>
                <button onClick={handleDemo} className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700">Try demo (no AI)</button>
              </div>
            </div>
            )}
          </div>

          {/* live log + help */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-cyan-400" /> How it works</div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Describe for AI, attach Web/GitHub URLs — or use Manual tab / Import strip for zero-AI decks.</li>
                <li>Pick page types + per-slide pre-structures (title, bullets, stats, team, timeline, table, quote, mindmap, radial map, org-chart, tech-stack, SDLC, full-stack, closing).</li>
                <li>Generate with Gemini / Nvidia / Ollama (BYOK) — or Create from pre-structures.</li>
                <li>Canvas ↔ side panel stay in sync: click, drag, double-click to edit, nudge by pixels.</li>
                <li>Download as <b className="text-white">.PPTX</b> (editable, canvas-exact) + <b className="text-white">PDF</b> (exact 16:9 pages).</li>
              </ol>
              <div className="mt-3 p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-[11px] text-gray-500">
                Tip: remote image URLs sometimes get blocked in PPTX export by CORS. For guaranteed export, use Upload (base64) in the image panel.
              </div>
            </div>
            <div className="p-4 bg-black/60 border border-gray-800 rounded-xl">
              <div className="text-[11px] font-mono font-bold text-gray-500 mb-2">GENERATION LOG</div>
              <div className="h-56 overflow-y-auto font-mono text-[11px] text-cyan-300/90 space-y-1">
                {logs.length === 0 && <div className="text-gray-600">No runs yet. Generate or load demo.</div>}
                {logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* editor */}
      {!showSetup && slides.length > 0 && active && (
        <div className={`grid grid-cols-1 gap-3 ${showRail && showProps ? 'xl:grid-cols-[200px_minmax(0,1fr)_300px]' : showRail ? 'xl:grid-cols-[200px_minmax(0,1fr)]' : showProps ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : 'xl:grid-cols-[minmax(0,1fr)]'}`}>
          {/* slides rail — collapsible for max design room */}
          {showRail && (
          <div className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 max-h-[72vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-gray-500">SLIDES</span>
              <div className="flex gap-1">
                <select onChange={(e) => { if (e.target.value) { addSlide(e.target.value as PptLayoutId); e.target.value = ''; } }} defaultValue="" className="text-[11px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-white">
                  <option value="" disabled>+ Add</option>
                  {ALL_LAYOUTS.map((id) => <option key={id} value={id}>{PPT_LAYOUTS.find((l) => l.id === id)?.name}</option>)}
                </select>
              </div>
            </div>
            {slides.map((s, i) => (
              <SlideThumb key={s.id} s={s} i={i} isActive={i === activeIdx} total={slides.length} onSelect={selectSlide} onMove={moveSlide} onInsert={insertSlideBelow} />
            ))}
          </div>
          )}

          {/* canvas */}
          <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Slide {activeIdx + 1} — {active.layout}</span>
                <select value={active.layout} onChange={(e) => {
                  const nl = e.target.value as PptLayoutId;
                  patchSlide(activeIdx, (s) => ({ ...s, layout: nl }));
                }} className="text-[11px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-white">
                  {ALL_LAYOUTS.map((id) => <option key={id} value={id}>{PPT_LAYOUTS.find((l) => l.id === id)?.name}</option>)}
                </select>
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(active.bg) ? active.bg : '#ffffff'} onChange={(e) => patchSlide(activeIdx, (s) => ({ ...s, bg: e.target.value }))} title="Slide background" className="h-7 w-9 bg-transparent cursor-pointer" />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { if (activeIdx > 0) setActiveIdx(activeIdx - 1); }} className="p-1.5 bg-gray-800 rounded text-gray-300"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (activeIdx < slides.length - 1) setActiveIdx(activeIdx + 1); }} className="p-1.5 bg-gray-800 rounded text-gray-300"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={doUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-1.5 bg-gray-800 rounded text-gray-300 disabled:opacity-30"><Undo2 className="h-3.5 w-3.5" /></button>
                <button onClick={doRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-1.5 bg-gray-800 rounded text-gray-300 disabled:opacity-30"><Redo2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => { const c = { ...active, id: uid('slide') }; setSlides((p) => [...p.slice(0, activeIdx + 1), c, ...p.slice(activeIdx + 1)]); }} title="Duplicate slide" className="p-1.5 bg-gray-800 rounded text-gray-300"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (slides.length <= 1) return; setSlides((p) => p.filter((_, i) => i !== activeIdx)); setActiveIdx(Math.max(0, activeIdx - 1)); }} title="Delete slide" className="p-1.5 bg-gray-800 rounded text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                <button onClick={exportJson} title="Save deck JSON" className="p-1.5 bg-gray-800 rounded text-emerald-300"><Save className="h-3.5 w-3.5" /></button>
                <label title="Load deck JSON" className="p-1.5 bg-gray-800 rounded text-sky-300 cursor-pointer"><FolderOpen className="h-3.5 w-3.5" /><input type="file" accept=".json" className="hidden" onChange={(e) => doImport('json', e.target.files?.[0])} /></label>
                <button onClick={() => setShowRail((s) => !s)} title={showRail ? 'Hide slides rail (more room)' : 'Show slides rail'} className={`p-1.5 rounded ${showRail ? 'bg-cyan-900/60 text-cyan-300' : 'bg-gray-800 text-gray-500'}`}><PanelLeft className="h-3.5 w-3.5" /></button>
                <button onClick={() => setShowProps((s) => !s)} title={showProps ? 'Hide properties (more room)' : 'Show properties'} className={`p-1.5 rounded ${showProps ? 'bg-cyan-900/60 text-cyan-300' : 'bg-gray-800 text-gray-500'}`}><PanelRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {/* zoom + pan bar */}
            <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider">ZOOM</span>
              <button onClick={() => setZoom((z) => Math.max(0.2, +(z / 1.2).toFixed(2)))} title="Zoom out" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white"><ZoomOut className="h-3.5 w-3.5" /></button>
              <button onClick={() => setZoom(1)} title="Reset to fit" className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-[11px] font-mono font-bold min-w-[52px]">{Math.round(zoom * 100)}%</button>
              <button onClick={() => setZoom((z) => Math.min(3, +(z * 1.2).toFixed(2)))} title="Zoom in" className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white"><ZoomIn className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setZoom(1); const el = viewportRef.current; if (el) { el.scrollTop = 0; el.scrollLeft = 0; } }} title="Fit slide to view" className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-[11px] font-bold"><Maximize className="h-3.5 w-3.5" /> Fit</button>
              <span className="text-[10px] font-mono text-gray-600 ml-1">Ctrl+scroll zooms • Shift+scroll pans ↔ • scroll pans ↕</span>
            </div>
            <div
              ref={viewportRef}
              className="w-full overflow-auto bg-black/40 rounded-lg border border-gray-700 relative"
              style={{ maxHeight: '68vh', minHeight: 320 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {dragOver && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-cyan-950/70 border-2 border-dashed border-cyan-400 rounded-lg pointer-events-none">
                  <div className="px-5 py-3 bg-black/70 rounded-xl text-center">
                    <div className="text-sm font-bold text-white">Drop images here — SVG / PNG / JPG / WebP</div>
                    <div className="text-[11px] text-cyan-300 mt-1">Tip: select a shape first and the photo fills it</div>
                  </div>
                </div>
              )}
              <div style={{ width: Math.ceil(PPT_W * scale) + 40, height: Math.ceil(PPT_H * scale) + 40, margin: '0 auto', padding: 20 }}>
                <div ref={slideRef} onMouseDown={() => setSelIds([])} style={{ width: PPT_W, height: PPT_H, transform: `scale(${scale})`, transformOrigin: 'top left', background: active.bg, position: 'relative', overflow: 'hidden', borderRadius: 6 }}>
                  {active.elements.map((el) => renderEl(el))}
                  {(() => {
                    const g = active.elements.filter((e) => selIds.includes(e.id));
                    if (g.length < 2) return null;
                    const bx = Math.min(...g.map((e) => e.x)) - 6;
                    const by = Math.min(...g.map((e) => e.y)) - 6;
                    const bw = Math.max(...g.map((e) => e.x + e.w)) - bx + 12;
                    const bh = Math.max(...g.map((e) => e.y + e.h)) - by + 12;
                    return (
                      <div style={{ position: 'absolute', left: bx, top: by, width: bw, height: bh, border: '1.5px dashed #A78BFA', borderRadius: 6, pointerEvents: 'none' }}>
                        <span style={{ position: 'absolute', top: -20, left: 0, fontSize: 11, fontWeight: 800, color: '#A78BFA', background: 'rgba(0,0,0,0.65)', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                          GROUP ×{g.length} — drag moves all
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span className="flex items-center gap-1"><Move className="h-3 w-3" /> click selects • drag moves • Ctrl+click groups • double-click edits • drop image files anywhere • Ctrl+scroll zooms</span>
              <span>canvas {PPT_W}×{PPT_H}px • export 10×5.625in</span>
            </div>
          </div>

          {/* properties — collapsible for max design room */}
          {showProps && (
          <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="text-[11px] font-mono font-bold text-gray-500">
              ELEMENTS ({active.elements.length}) — click selects • <span className="text-violet-300">Ctrl+click adds to group</span>{selIds.length > 1 && <span className="text-cyan-300"> • {selIds.length} grouped</span>}
            </div>
            <div className="flex flex-wrap gap-1 max-h-[500px] overflow-y-auto pr-0.5">
              {active.elements.map((el, ei) => {
                const isPrimary = el.id === selId;
                const inGroup = selIds.includes(el.id);
                const isHov = el.id === hoverId;
                return (
                  <button
                    key={el.id}
                    ref={(n) => { chipRefs.current[el.id] = n; }}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        setSelIds((p) => (p.includes(el.id) ? p.filter((id) => id !== el.id) : [...p, el.id]));
                      } else {
                        setSelIds(isPrimary && selIds.length === 1 ? [] : [el.id]);
                      }
                    }}
                    onMouseEnter={() => setHoverId(el.id)}
                    onMouseLeave={() => setHoverId((h) => (h === el.id ? null : h))}
                    title={`${el.type} @ x${Math.round(el.x)} y${Math.round(el.y)} — click to edit, Ctrl+click to group`}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${isPrimary ? 'bg-cyan-600 border-cyan-300 text-white ring-2 ring-cyan-300/50' : inGroup ? 'bg-violet-600/40 border-violet-400 text-violet-100' : isHov ? 'bg-gray-800 border-cyan-500/60 text-cyan-200' : 'bg-gray-950 border-gray-700 text-gray-400'}`}
                  >
                    <span className="font-mono text-[10px] opacity-70 mr-1">{ei + 1}</span>
                    {el.type === 'text' ? <span className="inline-flex items-center gap-1"><Type className="h-3 w-3" />{(el.text || '').split('\n')[0].slice(0, 14) || 'text'}</span>
                      : el.type === 'image' ? <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" />img {Math.round(el.x)},{Math.round(el.y)}</span>
                        : <span className="inline-flex items-center gap-1"><Square className="h-3 w-3" />{el.shape} {Math.round(el.x)},{Math.round(el.y)}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { const el: PptElement = { id: uid('t'), type: 'text', x: 120, y: 200, w: 400, h: 60, text: 'New text — edit me', fontSize: 20, bold: true, color: getTheme(active.themeId).text, align: 'left' }; patchSlide(activeIdx, (s) => ({ ...s, elements: [...s.elements, el] })); setSelIds([el.id]); }} className="flex-1 py-1.5 bg-gray-800 rounded text-[11px] font-bold text-white">+ Text</button>
              <button onClick={() => { const el: PptElement = { id: uid('img'), type: 'image', src: 'https://picsum.photos/seed/new/600/400', x: 560, y: 120, w: 280, h: 300, borderRadius: 6 }; patchSlide(activeIdx, (s) => ({ ...s, elements: [...s.elements, el] })); setSelIds([el.id]); }} className="flex-1 py-1.5 bg-gray-800 rounded text-[11px] font-bold text-white">+ Image</button>
              <button onClick={() => { const el = { id: uid('box'), type: 'shape', shape: 'rect', bg: getTheme(active.themeId).accent, x: 100, y: 400, w: 200, h: 50, borderRadius: 99 } as PptElement; patchSlide(activeIdx, (s) => ({ ...s, elements: [...s.elements, el] })); setSelIds([el.id]); }} className="flex-1 py-1.5 bg-gray-800 rounded text-[11px] font-bold text-white">+ Shape</button>
            </div>

            {!selected && <div className="p-3 bg-gray-950 border border-dashed border-gray-700 rounded-lg text-xs text-gray-500 text-center">Select any element on canvas or above to edit pixels, text & image URL.</div>}

            {selected && (
              <div className="space-y-3 p-3 bg-gray-950 border border-cyan-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">
                    {selected.type.toUpperCase()} properties
                    {selIds.length > 1 && <span className="ml-1.5 px-1.5 py-0.5 bg-violet-600/50 border border-violet-400/50 rounded text-[10px] text-violet-100">+{selIds.length - 1} grouped</span>}
                  </span>
                  <button onClick={() => { patchSlide(activeIdx, (s) => ({ ...s, elements: s.elements.filter((e) => !selIds.includes(e.id)) })); setSelIds([]); }} className="text-rose-400 text-[11px] font-bold flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete{selIds.length > 1 ? ` ${selIds.length}` : ''}</button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={duplicateSelection} className="flex items-center justify-center gap-1 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-[11px] font-bold text-white">
                    <CopyPlus className="h-3.5 w-3.5" /> Copy element{selIds.length > 1 ? `s (${selIds.length})` : ''}
                  </button>
                  <button onClick={() => patchEl(selected.id, { rotation: 0 })} className="flex items-center justify-center gap-1 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-[11px] font-bold text-white">
                    <RotateCw className="h-3.5 w-3.5" /> Reset rotation
                  </button>
                </div>

                {/* rotation */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 mb-1">Rotation: {Math.round(selected.rotation || 0)}°</div>
                  <div className="flex items-center gap-1.5">
                    <input type="range" min={-180} max={180} value={Math.round(selected.rotation || 0)} onChange={(e) => patchEl(selected.id, { rotation: Number(e.target.value) })} className="flex-1 accent-cyan-500" />
                    <input type="number" value={Math.round(selected.rotation || 0)} onChange={(e) => patchEl(selected.id, { rotation: Number(e.target.value) })} className="w-16 px-1.5 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {[-45, -15, 15, 45].map((d) => (
                      <button key={d} onClick={() => patchEl(selected.id, { rotation: Math.round((selected.rotation || 0) + d) })} className="py-1 bg-gray-800 hover:bg-gray-700 rounded text-white text-[11px] font-bold">{d > 0 ? `+${d}°` : `${d}°`}</button>
                    ))}
                  </div>
                </div>

                {/* pixel position */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 mb-1">Position (pixels on 960×540)</div>
                  {(['x', 'y', 'w', 'h'] as const).map((k) => (
                    <div key={k} className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 font-mono text-[11px] text-gray-500 uppercase">{k}</span>
                      <button onClick={() => patchEl(selected.id, { [k]: (selected[k] as number) - 1 })} className="px-2 py-1 bg-gray-800 rounded text-white font-bold">−</button>
                      <input type="number" value={selected[k] as number} onChange={(e) => patchEl(selected.id, { [k]: Number(e.target.value) })} className="flex-1 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                      <button onClick={() => patchEl(selected.id, { [k]: (selected[k] as number) + 1 })} className="px-2 py-1 bg-gray-800 rounded text-white font-bold">+</button>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 gap-1 mt-1.5">
                    <button onClick={() => nudge(-1, 0)} className="py-1 bg-gray-800 rounded text-white text-xs">←1</button>
                    <button onClick={() => nudge(1, 0)} className="py-1 bg-gray-800 rounded text-white text-xs">1→</button>
                    <button onClick={() => nudge(0, -1)} className="py-1 bg-gray-800 rounded text-white text-xs">↑1</button>
                    <button onClick={() => nudge(0, 1)} className="py-1 bg-gray-800 rounded text-white text-xs">↓1</button>
                  </div>
                </div>

                {selected.type === 'text' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400">Text segment (editable)</label>
                    <textarea ref={textAreaRef} value={selected.text || ''} onChange={(e) => patchEl(selected.id, { text: e.target.value })} rows={3} className="w-full px-2.5 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[11px] text-gray-500">Size: {selected.fontSize}px</label>
                        <input type="range" min={8} max={96} value={selected.fontSize || 16} onChange={(e) => patchEl(selected.id, { fontSize: Number(e.target.value) })} className="w-full accent-cyan-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500">Color</label>
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={/^#[0-9a-f]{6}$/i.test(selected.color || '') ? selected.color : '#111111'} onChange={(e) => patchEl(selected.id, { color: e.target.value })} className="h-8 w-10 bg-transparent cursor-pointer" />
                          <input value={selected.color || ''} onChange={(e) => patchEl(selected.id, { color: e.target.value })} className="flex-1 px-1.5 py-1 text-[11px] bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => patchEl(selected.id, { bold: !selected.bold })} className={`flex-1 py-1.5 rounded text-xs font-black ${selected.bold ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>B</button>
                      <button onClick={() => patchEl(selected.id, { italic: !selected.italic })} className={`flex-1 py-1.5 rounded text-xs italic ${selected.italic ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>I</button>
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button key={a} onClick={() => patchEl(selected.id, { align: a })} className={`flex-1 py-1.5 rounded text-[11px] font-bold ${selected.align === a ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>{a[0].toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                )}

                {selected.type === 'image' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><ImageIcon className="h-3 w-3 text-emerald-400" /> Image URL — drop link to replace</label>
                    <input value={selected.src || ''} onChange={(e) => patchEl(selected.id, { src: e.target.value })} placeholder="https://... image url" className="w-full px-2.5 py-1.5 text-[11px] bg-gray-900 border border-gray-700 rounded-lg text-sky-300 font-mono" />
                    {selected.src && <img src={selected.src} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-700" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />}
                    <label className="flex items-center justify-center gap-1.5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-[11px] font-bold text-white cursor-pointer">
                      <FolderOpen className="h-3.5 w-3.5" /> Upload instead (base64, export-safe)
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], selected.id)} />
                    </label>
                    <div>
                      <label className="text-[11px] text-gray-500">Corner radius: {selected.borderRadius || 0}px</label>
                      <input type="range" min={0} max={120} value={selected.borderRadius || 0} onChange={(e) => patchEl(selected.id, { borderRadius: Number(e.target.value) })} className="w-full accent-cyan-500" />
                    </div>
                  </div>
                )}

                {selected.type === 'shape' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400">Shape kind</label>
                    <div className="grid grid-cols-4 gap-1">
                      {SHAPE_KINDS.map((k) => (
                        <button key={k.id} onClick={() => patchEl(selected.id, { shape: k.id as PptElement['shape'] })} title={k.label} className={`py-1.5 rounded text-sm ${selected.shape === k.id ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                          {k.label.split(' ')[0]}
                        </button>
                      ))}
                      <button onClick={() => patchEl(selected.id, { shape: 'pill' })} title="Pill" className={`py-1.5 rounded text-[11px] font-bold ${selected.shape === 'pill' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}>PILL</button>
                    </div>
                    <label className="text-[11px] font-bold text-gray-400">Fill color</label>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={/^#[0-9a-f]{6}$/i.test(selected.bg || '') ? selected.bg : '#E85D3D'} onChange={(e) => patchEl(selected.id, { bg: e.target.value })} className="h-8 w-10 bg-transparent cursor-pointer" />
                      <input value={selected.bg || ''} onChange={(e) => patchEl(selected.id, { bg: e.target.value })} className="flex-1 px-1.5 py-1 text-[11px] bg-gray-900 border border-gray-700 rounded text-white font-mono" />
                    </div>
                    {(selected.shape === 'rect' || selected.shape === 'pill' || !selected.shape) && (
                      <div>
                        <label className="text-[11px] text-gray-500">Radius: {selected.borderRadius || 0}px</label>
                        <input type="range" min={0} max={120} value={selected.borderRadius || 0} onChange={(e) => patchEl(selected.id, { borderRadius: Number(e.target.value) })} className="w-full accent-cyan-500" />
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] text-gray-500">Opacity: {Math.round((selected.opacity ?? 1) * 100)}%</label>
                      <input type="range" min={10} max={100} value={Math.round((selected.opacity ?? 1) * 100)} onChange={(e) => patchEl(selected.id, { opacity: Number(e.target.value) / 100 })} className="w-full accent-cyan-500" />
                    </div>
                    {selected.shape !== 'line' && (
                      <div className="space-y-1.5 p-2 bg-gray-900 border border-gray-800 rounded-lg">
                        <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><ImageIcon className="h-3 w-3 text-emerald-400" /> Picture fill — photo inside this {selected.shape || 'shape'}</label>
                        {selected.src && <img src={selected.src} alt="" className="w-full h-20 object-cover rounded border border-gray-700" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />}
                        <input value={selected.src || ''} onChange={(e) => patchEl(selected.id, { src: e.target.value.trim() ? e.target.value : undefined })} placeholder="Paste image URL…" className="w-full px-2 py-1.5 text-[11px] bg-gray-950 border border-gray-700 rounded text-sky-300 font-mono" />
                        <div className="flex gap-1.5">
                          <label className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-[11px] font-bold text-white cursor-pointer">
                            <FolderOpen className="h-3 w-3" /> Upload
                            <input type="file" accept="image/*,.svg" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], selected.id)} />
                          </label>
                          {selected.src && (
                            <button onClick={() => patchEl(selected.id, { src: undefined })} className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-[11px] font-bold text-rose-300">Remove</button>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-600">Tip: select this shape, then drag any image file onto the canvas.</div>
                      </div>
                    )}
                  </div>
                )}

                {/* layer order — later in list paints on top, in canvas + exports */}
                <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1.5">
                  <div className="text-[11px] font-bold text-gray-400">Layer — send div up / down</div>
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => moveLayer(selected.id, -1)} title="Send backward" className="py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs font-bold">▼ Back</button>
                    <button onClick={() => moveLayer(selected.id, 1)} title="Bring forward" className="py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs font-bold">▲ Front</button>
                    <button onClick={() => moveLayer(selected.id, -99)} title="Send to back" className="py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs font-bold">⤓ Last</button>
                    <button onClick={() => moveLayer(selected.id, 99)} title="Bring to front" className="py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs font-bold">⤒ First</button>
                  </div>
                  <div className="text-[10px] font-mono text-gray-600">layer {layerIndex(selected.id) + 1} of {active.elements.length} • higher = painted on top</div>
                </div>
              </div>
            )}

            <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1.5">
              <div className="text-[11px] font-bold text-gray-400">Apply theme to all slides</div>
              <div className="flex gap-1">
                {PPT_THEMES.map((t) => (
                  <button key={t.id} title={t.name} onClick={() => applyThemeAll(t.id)} className={`flex-1 h-7 rounded border ${themeId === t.id ? 'border-cyan-400' : 'border-gray-700'}`} style={{ background: `linear-gradient(90deg, ${t.bg} 60%, ${t.accent} 60%)` }} />
                ))}
              </div>
            </div>

            <button onClick={() => { setSavedOk(true); setTimeout(() => setSavedOk(false), 2000); }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 text-xs font-bold text-gray-200">
              {savedOk ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Auto-saved locally</> : <><FileJson className="h-3.5 w-3.5" /> Draft auto-saves to browser</>}
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
