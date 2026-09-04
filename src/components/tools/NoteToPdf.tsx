'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  FileText,
  Download,
  Check,
  Palette,
  Eye,
  Sparkles,
  Printer,
  Type,
  Layers,
  RotateCcw,
  Wand2,
  Upload,
  Grid,
  FileCheck,
  Zap,
  Calculator,
} from 'lucide-react';

// Unicode Math Formatting Tables for Auto Math Structuring
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ', 'k': 'ᵏ', 'm': 'ᵐ', 't': 'ᵗ',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
};

export const formatMathText = (input: string): string => {
  if (!input) return '';

  return input
    .split('\n')
    .map((rawLine) => {
      let line = rawLine;

      // 1. Convert Fractions: \frac{a}{b}, /frac{a}{b}, \frac a b, /frac a b, frac(a,b)
      line = line.replace(/[\\/]?frac\s*\{([^}]+)\}\s*\{([^}]+)\}/gi, '($1 / $2)');
      line = line.replace(/[\\/]?frac\s+([^\s{}]+)\s+([^\s{}]+)/gi, '($1 / $2)');
      line = line.replace(/[\\/]?frac\s*\(([^,]+),\s*([^)]+)\)/gi, '($1 / $2)');

      // 2. Convert Roots: \sqrt[3]{x}, /sqrt{x}, \sqrt(x), sqrt(x)
      line = line.replace(/[\\/]?sqrt\s*\[([^\]]+)\]\s*\{([^}]+)\}/gi, '$1√($2)');
      line = line.replace(/[\\/]?sqrt\s*\{([^}]+)\}/gi, '√($1)');
      line = line.replace(/[\\/]?sqrt\s*\(([^)]+)\)/gi, '√($1)');

      // 3. Summations, Products & Integrals: \sum_{i=1}^{n}, /sum_{i=1}^n, \int_a^b, /int
      line = line.replace(/[\\/]?sum_\{([^}]+)\}\^\{([^}]+)\}/gi, '∑_($1)^($2)');
      line = line.replace(/[\\/]?sum_([^\s^]+)\^([^\s]+)/gi, '∑_$1^$2');
      line = line.replace(/[\\/]sum\b/gi, '∑');

      line = line.replace(/[\\/]?prod_\{([^}]+)\}\^\{([^}]+)\}/gi, '∏_($1)^($2)');
      line = line.replace(/[\\/]?prod_([^\s^]+)\^([^\s]+)/gi, '∏_$1^$2');
      line = line.replace(/[\\/]prod\b/gi, '∏');

      line = line.replace(/[\\/]iint\b/gi, '∬');
      line = line.replace(/[\\/]iiint\b/gi, '∭');
      line = line.replace(/[\\/]oint\b/gi, '∮');
      line = line.replace(/[\\/]?int_\{([^}]+)\}\^\{([^}]+)\}/gi, '∫_($1)^($2)');
      line = line.replace(/[\\/]?int_([^\s^]+)\^([^\s]+)/gi, '∫_$1^$2');
      line = line.replace(/[\\/]int\b/gi, '∫');

      // 4. Limits: \lim_{x \to 0}, /lim_{x -> 0}
      line = line.replace(/[\\/]?lim_\{([^}]+)\}/gi, 'lim ($1)');
      line = line.replace(/[\\/]?lim_([^\s]+)/gi, 'lim ($1)');

      // 5. Greek symbols (\alpha or /alpha)
      const greeks: Record<string, string> = {
        'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'Delta': 'Δ',
        'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ', 'iota': 'ι',
        'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ', 'nu': 'ν', 'xi': 'ξ',
        'pi': 'π', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ',
        'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω', 'Omega': 'Ω',
      };
      for (const [name, sym] of Object.entries(greeks)) {
        line = line.replace(new RegExp('[\\\\/]' + name + '(?![a-zA-Z])', 'g'), sym);
      }

      // 6. Math operators & symbols (\infty, /infty, \pm, /pm, etc. REQUIRE slash or operator syntax)
      line = line.replace(/[\\/](?:infty|inf)\b/gi, '∞');
      line = line.replace(/[\\/]pm\b|\+-/gi, '±');
      line = line.replace(/[\\/]mp\b|-\+/gi, '∓');
      line = line.replace(/[\\/]neq\b|!=/gi, '≠');
      line = line.replace(/[\\/]le\b|<=/gi, '≤');
      line = line.replace(/[\\/]ge\b|>=/gi, '≥');
      line = line.replace(/[\\/]approx\b|~=/gi, '≈');
      line = line.replace(/[\\/]to\b|->/gi, '→');
      line = line.replace(/[\\/]implies\b|=>/gi, '⇒');
      line = line.replace(/[\\/]cdot\b/gi, '·');
      line = line.replace(/[\\/]times\b/gi, '×');
      line = line.replace(/[\\/]div\b/gi, '÷');
      line = line.replace(/[\\/]partial\b/gi, '∂');
      line = line.replace(/[\\/](?:grad|nabla)\b/gi, '∇');

      // 7. Superscripts: x^{12} or x^2
      line = line.replace(/\^{([^}]+)}/g, (_, exp) => {
        return exp.split('').map((c: string) => SUPERSCRIPTS[c] || c).join('');
      });
      line = line.replace(/\^([0-9+\-nixyabkmt])/gi, (_, char) => SUPERSCRIPTS[char] || char);

      // 8. Subscripts: x_{12} or x_1
      line = line.replace(/_{([^}]+)}/g, (_, sub) => {
        return sub.split('').map((c: string) => SUBSCRIPTS[c] || c).join('');
      });
      line = line.replace(/_([0-9+\-aehijklmnoprstuvx])/gi, (_, char) => SUBSCRIPTS[char] || char);

      // 9. Strip math block delimiters $$, $, \[, \], /[, /]
      line = line.replace(/\$\$([^\$]+)\$\$/g, '$1');
      line = line.replace(/\$([^\$]+)\$/g, '$1');
      line = line.replace(/[\\/]\(([^\\]+)[\\/]\)/g, '$1');
      line = line.replace(/[\\/]\[([^\\]+)[\\/]\]/g, '$1');

      return line;
    })
    .join('\n');
};

export const sanitizePdfText = (text: string): string => {
  return text.replace(/[^\x00-\x7F\xA0-\xFF]/g, (char) => {
    const map: Record<string, string> = {
      '•': '* ', '–': '-', '—': '-', '“': '"', '”': '"', '‘': "'", '’': "'",
      '…': '...', '™': '(TM)', '©': '(C)', '®': '(R)', '°': ' deg',
      '√': 'sqrt', '∫': 'int', '∑': 'sum', '∏': 'prod', '∞': 'inf',
      '±': '+-', '≠': '!=', '≤': '<=', '≥': '>=', '≈': '~=', '→': '->', '⇒': '=>',
      '²': '^2', '³': '^3', '⁰': '^0', '¹': '^1', '⁴': '^4', '⁵': '^5',
      '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9', '⁺': '^+', '⁻': '^-', 'ⁿ': '^n', 'ˣ': '^x',
      '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4', '₅': '_5',
      '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9', 'ₙ': '_n', 'ᵢ': '_i', 'ₓ': '_x',
      'π': 'pi', 'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'Δ': 'Delta',
      'θ': 'theta', 'λ': 'lambda', 'μ': 'mu', 'σ': 'sigma', 'ω': 'omega', 'Ω': 'Omega',
    };
    return map[char] || ' ';
  });
};

// Helper function to split a text block into word-wrapped sub-lines based on max character width
export const wrapTextToSubLines = (text: string, maxChars: number): string[] => {
  if (!text) return [''];
  const rawLines = text.split('\n');
  const subLines: string[] = [];

  for (const line of rawLines) {
    if (line.length === 0) {
      subLines.push('');
    } else {
      let rem = line;
      while (rem.length > 0) {
        if (rem.length <= maxChars) {
          subLines.push(rem);
          rem = '';
        } else {
          let breakIdx = rem.lastIndexOf(' ', maxChars);
          if (breakIdx <= 0) breakIdx = maxChars; // Force split if a single word exceeds maxChars
          subLines.push(rem.substring(0, breakIdx));
          rem = rem.substring(breakIdx).trimStart();
        }
      }
    }
  }
  return subLines;
};

import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULT_TITLE = 'Executive Project Summary';
const DEFAULT_SUBTITLE = 'Toolip Utility Platform Architecture & Roadmap';
const DEFAULT_AUTHOR = 'Author & Team';
const DEFAULT_BODY = `1. Executive Overview:
Toolip features 32+ standalone client-side utility tools designed for high performance, zero data latency, and privacy compliance.

2. Core Technical Architecture:
• Framework: Next.js 14 App Router with TypeScript & Tailwind CSS.
• Client-Side Processing: PDF manipulation via pdf-lib, HTML5 Canvas image editing, Web Audio API frequency visualizer, and Web Speech API dictation.
• Standalone Workspaces: Each tool functions as an isolated single-page application with unique URL routes (/tools/[id]).

3. Multi-Page Automatic Pagination:
• Document notes that extend beyond page 1 automatically paginate into clean A4 pages (Page 1, Page 2, Page 3...).
• Page 1 displays the full document title, tagline, author metadata, and primary header stroke.
• Page 2 and subsequent pages display a compact top header bar (Document Title — Page N) with a thin accent divider line.

4. Ultra-Thin Sleek Footer Stamps:
• Every page features a minimal, ultra-thin 1-line footer stamp displaying platform attribution and dynamic page numbers.
• Footer stamps are positioned at the absolute bottom of each page.`;

export const NoteToPdf: React.FC = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [noteTitle, setNoteTitle, resetNoteTitle] = useLocalStorage<string>('toolip_notepdf_title', DEFAULT_TITLE);
  const [noteSubtitle, setNoteSubtitle, resetNoteSubtitle] = useLocalStorage<string>('toolip_notepdf_subtitle', DEFAULT_SUBTITLE);
  const [authorName, setAuthorName, resetAuthorName] = useLocalStorage<string>('toolip_notepdf_author', DEFAULT_AUTHOR);
  const [noteBody, setNoteBody, resetNoteBody] = useLocalStorage<string>('toolip_notepdf_body', DEFAULT_BODY);

  const resetAllNoteData = () => {
    resetNoteTitle();
    resetNoteSubtitle();
    resetAuthorName();
    resetNoteBody();
  };

  // Styling & Theme State
  const [theme, setTheme] = useState<'corporate' | 'emerald' | 'minimal' | 'midnight' | 'sunset'>('sunset');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<number>(11); // 6 to 24 px (Default compact 11px)
  const [lineSpacing, setLineSpacing] = useState<number>(1.4); // 1.0 to 2.5 (Default 1.4x)
  const [marginPadding, setMarginPadding] = useState<number>(32); // 10 to 60 px
  const [showFooterDate, setShowFooterDate] = useState<boolean>(true);
  const [autoMathFormatting, setAutoMathFormatting] = useState<boolean>(true);

  // Memoized Effective Note Text (Auto Math Structuring applied when enabled)
  const effectiveNoteBody = useMemo(() => {
    return autoMathFormatting ? formatMathText(noteBody) : noteBody;
  }, [noteBody, autoMathFormatting]);

  const insertSampleMathNote = () => {
    setNoteTitle('Advanced Mathematics & Formula Sheet');
    setNoteSubtitle('Auto-structured LaTeX equations, fractions, limits & physics laws');
    setNoteBody(
      `1. Executive Summary of Mathematical Physics:
Auto Math Formula Structuring parses LaTeX equations and math symbols into formatted notation.

2. Quadratic Equation & Discriminant:
• Formula: x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
• Discriminant: \\Delta = b^2 - 4ac
• Roots: x_1, x_2 = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}

3. Calculus & Gaussian Integrals:
• Gaussian Distribution: f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
• Euler's Identity: e^{i\\pi} + 1 = 0
• Summation of Squares: \\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}

4. Quantum & Relativistic Physics:
• Energy-Mass Equivalence: E = mc^2
• Wave Mechanics: \\psi(x,t) = A e^{i(kx - \\omega t)}
• Limit as x approaches 0: \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1`
    );
    setStatusMsg('✨ Inserted sample math note with formulas!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Custom Color State (overrides theme defaults when set)
  const [customPaperBg, setCustomPaperBg] = useState<string>('');
  const [customTitleColor, setCustomTitleColor] = useState<string>('');
  const [customSubtitleColor, setCustomSubtitleColor] = useState<string>('');
  const [customBodyColor, setCustomBodyColor] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Micro-PDF / N-Up Studio State
  const [microSource, setMicroSource] = useState<'note' | 'upload'>('note');
  const [gridFormat, setGridFormat] = useState<'16' | '12' | '9' | '8' | '4'>('16');
  const [microFontSize, setMicroFontSize] = useState<number>(4); // 1pt to 12pt (Default 4pt)
  const [uploadedPdfBytes, setUploadedPdfBytes] = useState<Uint8Array | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string>('');
  const [uploadedPdfPages, setUploadedPdfPages] = useState<number>(0);
  const [isGeneratingMicro, setIsGeneratingMicro] = useState<boolean>(false);
  const [microStatusMsg, setMicroStatusMsg] = useState<string>('');

  const previewSheetRef = useRef<HTMLDivElement | null>(null);

  // Document Color Themes Config
  const THEME_CONFIGS = {
    corporate: {
      name: 'Corporate Blue',
      headerBg: 'bg-indigo-600',
      accentColor: '#4f46e5',
      defaultPaperBg: '#ffffff',
      defaultTitle: '#0f172a',
      defaultSubtitle: '#4f46e5',
      defaultBody: '#1e293b',
      borderAccent: 'border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      isDark: false,
    },
    emerald: {
      name: 'Emerald Clean',
      headerBg: 'bg-emerald-600',
      accentColor: '#059669',
      defaultPaperBg: '#ecfdf5',
      defaultTitle: '#064e3b',
      defaultSubtitle: '#047857',
      defaultBody: '#065f46',
      borderAccent: 'border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isDark: false,
    },
    minimal: {
      name: 'Minimalist Light',
      headerBg: 'bg-slate-900',
      accentColor: '#0f172a',
      defaultPaperBg: '#ffffff',
      defaultTitle: '#0f172a',
      defaultSubtitle: '#475569',
      defaultBody: '#334155',
      borderAccent: 'border-slate-400',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      isDark: false,
    },
    midnight: {
      name: 'Midnight Dark',
      headerBg: 'bg-purple-600',
      accentColor: '#9333ea',
      defaultPaperBg: '#090d16',
      defaultTitle: '#ffffff',
      defaultSubtitle: '#c084fc',
      defaultBody: '#cbd5e1',
      borderAccent: 'border-purple-500',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800',
      isDark: true,
    },
    sunset: {
      name: 'Warm Sunset',
      headerBg: 'bg-amber-600',
      accentColor: '#d97706',
      defaultPaperBg: '#fffbeb',
      defaultTitle: '#78350f',
      defaultSubtitle: '#b45309',
      defaultBody: '#451a03',
      borderAccent: 'border-amber-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      isDark: false,
    },
  };

  const currentTheme = THEME_CONFIGS[theme];

  // Active Colors (custom or theme defaults)
  const activePaperBg = customPaperBg || currentTheme.defaultPaperBg;
  const activeTitleColor = customTitleColor || currentTheme.defaultTitle;
  const activeSubtitleColor = customSubtitleColor || currentTheme.defaultSubtitle;
  const activeBodyColor = customBodyColor || currentTheme.defaultBody;

  // Preset Paper Background Color Swatches
  const PAPER_BG_SWATCHES = [
    { label: 'Cream Sunset', hex: '#fffbeb' },
    { label: 'Clean Mint', hex: '#ecfdf5' },
    { label: 'Pure White', hex: '#ffffff' },
    { label: 'Midnight Dark', hex: '#090d16' },
    { label: 'Slate Dark', hex: '#0f172a' },
    { label: 'Soft Blush', hex: '#fff1f2' },
    { label: 'Sky Tint', hex: '#f0f9ff' },
  ];

  // Preset Text Color Swatches
  const COLOR_SWATCHES = [
    { label: 'Dark Slate', hex: '#0f172a' },
    { label: 'Pure White', hex: '#ffffff' },
    { label: 'Sunset Amber', hex: '#78350f' },
    { label: 'Emerald Dark', hex: '#064e3b' },
    { label: 'Indigo Deep', hex: '#312e81' },
    { label: 'Rose Dark', hex: '#881337' },
    { label: 'Sky Cyan', hex: '#0284c7' },
  ];

  // Font Family Mapping
  const FONT_CLASSES = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Helper to convert hex to RGB object for pdf-lib
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return rgb(isNaN(r) ? 0.1 : r, isNaN(g) ? 0.1 : g, isNaN(b) ? 0.1 : b);
  };

  // ✨ Auto Format Document Handler
  const autoFormatDocument = () => {
    // 1. Format text content
    const cleanedLines = noteBody
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines to double newlines
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        // Indent bullet items cleanly
        if (/^[-*•]\s+/.test(trimmed)) {
          return '• ' + trimmed.replace(/^[-*•]\s+/, '');
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          return trimmed;
        }
        return trimmed;
      });

    const formattedText = cleanedLines.join('\n');
    setNoteBody(formattedText);

    // 2. Optimize Font Size, Line Spacing, and Margins for optimal A4 layout
    const charCount = formattedText.length;
    if (charCount > 1800) {
      setFontSize(10);
      setLineSpacing(1.25);
      setMarginPadding(24);
    } else if (charCount > 1000) {
      setFontSize(11);
      setLineSpacing(1.35);
      setMarginPadding(28);
    } else {
      setFontSize(12);
      setLineSpacing(1.4);
      setMarginPadding(32);
    }

    setStatusMsg('✨ Document auto-formatted cleanly with optimized layout!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Automatic Multi-Page Pagination Engine with ACCURATE Height Accounting & Safety Buffer
  const paginatedPages = useMemo(() => {
    const cardWidth = 512;
    const cardHeight = 724;
    const pad = marginPadding;

    const footerHeight = showFooterDate ? 32 : 12;
    const page1HeaderHeight = (noteTitle ? 28 : 0) + (noteSubtitle ? 20 : 0) + 16 + 24;
    const pageNHeaderHeight = 36;

    const page1AvailableHeight = Math.max(160, cardHeight - (pad * 2) - page1HeaderHeight - footerHeight - 32);
    const pageNAvailableHeight = Math.max(240, cardHeight - (pad * 2) - pageNHeaderHeight - footerHeight - 32);

    const stepY = Math.max(12, Math.round(fontSize * lineSpacing));

    const page1MaxLines = Math.max(5, Math.floor(page1AvailableHeight / stepY));
    const pageNMaxLines = Math.max(8, Math.floor(pageNAvailableHeight / stepY));

    const printableWidth = Math.max(180, cardWidth - (pad * 2));
    const avgCharWidth = (fontFamily === 'mono' ? 0.6 : 0.52) * fontSize;
    const charsPerLine = Math.max(16, Math.floor(printableWidth / avgCharWidth));

    const allSubLines = wrapTextToSubLines(effectiveNoteBody, charsPerLine);

    const pages: string[][] = [];
    let currentSubLines: string[] = [];
    let maxLines = page1MaxLines;

    for (const subLine of allSubLines) {
      if (currentSubLines.length >= maxLines && currentSubLines.length > 0) {
        pages.push(currentSubLines);
        currentSubLines = [subLine];
        maxLines = pageNMaxLines;
      } else {
        currentSubLines.push(subLine);
      }
    }

    if (currentSubLines.length > 0) {
      pages.push(currentSubLines);
    }

    return pages.length > 0 ? pages : [['']];
  }, [effectiveNoteBody, noteTitle, noteSubtitle, fontFamily, fontSize, lineSpacing, marginPadding, showFooterDate]);

  // Clean Isolated Document PDF Printing Engine
  const printCleanPdfDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fontStyle =
      fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'mono'
          ? 'Courier New, monospace'
          : 'Inter, system-ui, sans-serif';

    const hexAccent = currentTheme.accentColor;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${noteTitle || 'Note Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: ${fontStyle};
              background-color: ${activePaperBg};
              color: ${activeBodyColor};
              font-size: ${fontSize}px;
              line-height: ${lineSpacing};
            }
            .document-container {
              width: 100%;
              box-sizing: border-box;
            }
            .header-bar {
              border-bottom: 2.5px solid ${hexAccent};
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .title {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 6px 0;
              color: ${activeTitleColor};
            }
            .subtitle {
              font-size: 13px;
              font-weight: 600;
              margin: 0 0 8px 0;
              color: ${activeSubtitleColor};
            }
            .meta-bar {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              opacity: 0.7;
              margin-bottom: 4px;
            }
            .content-body {
              white-space: pre-wrap;
              word-wrap: break-word;
              line-height: ${lineSpacing};
              font-size: ${fontSize}px;
            }
            .footer-stamp {
              border-top: 1px solid rgba(150, 150, 150, 0.3);
              padding-top: 6px;
              margin-top: 24px;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              opacity: 0.7;
              font-family: monospace;
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="header-bar">
              <h1 class="title">${noteTitle || 'Untitled Note'}</h1>
              ${noteSubtitle ? `<div class="subtitle">${noteSubtitle}</div>` : ''}
              <div class="meta-bar">
                <span>Author: ${authorName || 'Anonymous'}</span>
                <span>Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
              </div>
            </div>

            <div class="content-body">
              ${effectiveNoteBody}
            </div>

            ${showFooterDate
              ? `<div class="footer-stamp">
                  <span>Generated via Toolip Note</span>
                  <span>Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                </div>`
              : ''
            }
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export Multi-Page PDF Document using pdf-lib vector engine
  const generateVectorPdf = async () => {
    try {
      setIsGenerating(true);
      setStatusMsg('');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(
        fontFamily === 'serif'
          ? StandardFonts.TimesRoman
          : fontFamily === 'mono'
            ? StandardFonts.Courier
            : StandardFonts.Helvetica
      );
      const boldFont = await pdfDoc.embedFont(
        fontFamily === 'serif'
          ? StandardFonts.TimesRomanBold
          : fontFamily === 'mono'
            ? StandardFonts.CourierBold
            : StandardFonts.HelveticaBold
      );

      const titleRgb = hexToRgb(activeTitleColor);
      const subtitleRgb = hexToRgb(activeSubtitleColor);
      const bodyRgb = hexToRgb(activeBodyColor);
      const accentRgb = hexToRgb(currentTheme.accentColor);

      const pageW = 595.28;
      const pageH = 841.89;
      const pad = marginPadding;
      const printableWidth = pageW - pad * 2;

      const charWidth = (fontFamily === 'mono' ? 0.6 : 0.50) * fontSize;
      const maxCharsPerSubLine = Math.max(15, Math.floor(printableWidth / charWidth));

      const allSubLines = wrapTextToSubLines(effectiveNoteBody, maxCharsPerSubLine);

      const footerMargin = showFooterDate ? 36 : 16;
      const page1HeaderDrop = (noteTitle ? 28 : 0) + (noteSubtitle ? 18 : 0) + 14 + 20;
      const pageNHeaderDrop = 30;

      const page1StartY = pageH - pad - page1HeaderDrop;
      const page1MinY = pad + footerMargin + 10;

      const pageNStartY = pageH - pad - pageNHeaderDrop;
      const pageNMinY = pad + footerMargin + 10;

      const stepY = Math.max(12, Math.round(fontSize * lineSpacing));

      const pdfPage1MaxLines = Math.max(5, Math.floor((page1StartY - page1MinY) / stepY));
      const pdfPageNMaxLines = Math.max(8, Math.floor((pageNStartY - pageNMinY) / stepY));

      const pdfPagesSubLines: string[][] = [];
      let currentSubLines: string[] = [];
      let maxLinesForPage = pdfPage1MaxLines;

      for (const subLine of allSubLines) {
        if (currentSubLines.length >= maxLinesForPage && currentSubLines.length > 0) {
          pdfPagesSubLines.push(currentSubLines);
          currentSubLines = [subLine];
          maxLinesForPage = pdfPageNMaxLines;
        } else {
          currentSubLines.push(subLine);
        }
      }
      if (currentSubLines.length > 0) {
        pdfPagesSubLines.push(currentSubLines);
      }

      const totalPdfPages = pdfPagesSubLines.length;

      for (let pIdx = 0; pIdx < totalPdfPages; pIdx++) {
        const page = pdfDoc.addPage([pageW, pageH]);
        const pageNum = pIdx + 1;
        const isPage1 = pIdx === 0;
        let yCursor = pageH - pad;

        if (isPage1) {
          page.drawText(sanitizePdfText(noteTitle || 'Untitled Note'), {
            x: pad,
            y: yCursor,
            size: 20,
            font: boldFont,
            color: titleRgb,
          });
          yCursor -= 24;

          if (noteSubtitle) {
            page.drawText(sanitizePdfText(noteSubtitle), {
              x: pad,
              y: yCursor,
              size: 11,
              font: boldFont,
              color: subtitleRgb,
            });
            yCursor -= 18;
          }

          page.drawText(sanitizePdfText(`Author: ${authorName} | Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`), {
            x: pad,
            y: yCursor,
            size: 9,
            font,
            color: rgb(0.5, 0.55, 0.6),
          });
          yCursor -= 14;

          page.drawLine({
            start: { x: pad, y: yCursor },
            end: { x: pageW - pad, y: yCursor },
            thickness: 2,
            color: accentRgb,
          });
          yCursor -= 20;
        } else {
          page.drawText(sanitizePdfText(`${noteTitle || 'Untitled Note'} — Page ${pageNum}`), {
            x: pad,
            y: yCursor,
            size: 10,
            font: boldFont,
            color: accentRgb,
          });
          page.drawText(new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }), {
            x: pageW - pad - 80,
            y: yCursor,
            size: 9,
            font,
            color: rgb(0.5, 0.55, 0.6),
          });
          yCursor -= 12;

          page.drawLine({
            start: { x: pad, y: yCursor },
            end: { x: pageW - pad, y: yCursor },
            thickness: 1,
            color: accentRgb,
          });
          yCursor -= 18;
        }

        const subLinesForPage = pdfPagesSubLines[pIdx];
        for (const subLine of subLinesForPage) {
          page.drawText(sanitizePdfText(subLine || ' '), {
            x: pad,
            y: yCursor,
            size: Math.min(fontSize, 14),
            font,
            color: bodyRgb,
          });
          yCursor -= stepY;
        }

        if (showFooterDate) {
          page.drawLine({
            start: { x: pad, y: pad + 14 },
            end: { x: pageW - pad, y: pad + 14 },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });

          page.drawText('Generated via Toolip Note', {
            x: pad,
            y: pad + 4,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });

          page.drawText(`Page ${pageNum} of ${totalPdfPages}`, {
            x: pageW - pad - 70,
            y: pad + 4,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${(noteTitle || 'note_document').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      a.click();

      setStatusMsg(`✓ Multi-page PDF (${totalPdfPages} Pages) generated & downloaded!`);
    } catch (err: any) {
      console.error('PDF error:', err);
      setStatusMsg('Error generating PDF: ' + (err.message || 'PDF export issue'));
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAllColors = () => {
    setCustomPaperBg('');
    setCustomTitleColor('');
    setCustomSubtitleColor('');
    setCustomBodyColor('');
  };

  // Upload PDF Handler for N-Up Grid Conversion
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMicroStatusMsg('Error: Please select a valid .pdf file');
      return;
    }

    try {
      setMicroStatusMsg('Loading uploaded PDF file...');
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const pdfDoc = await PDFDocument.load(bytes);
      const count = pdfDoc.getPageCount();

      setUploadedPdfBytes(bytes);
      setUploadedPdfName(file.name);
      setUploadedPdfPages(count);
      setMicroStatusMsg(`✓ Uploaded "${file.name}" successfully (${count} pages).`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setMicroStatusMsg('Error parsing PDF: ' + (err.message || 'Invalid PDF file'));
    }
  };

  // N-Up Grid Specifications Config
  const GRID_SPECS = {
    '16': { cols: 4, rows: 4, label: '16-in-1 (4x4 Grid)', total: 16 },
    '12': { cols: 3, rows: 4, label: '12-in-1 (3x4 Grid)', total: 12 },
    '9': { cols: 3, rows: 3, label: '9-in-1 (3x3 Grid)', total: 9 },
    '8': { cols: 2, rows: 4, label: '8-in-1 (2x4 Grid)', total: 8 },
    '4': { cols: 2, rows: 2, label: '4-in-1 (2x2 Grid)', total: 4 },
  };

  // Memoized Micro-Cell Lines for Note Mode (word-wrapped so NO text is ever truncated with '...')
  const microCellLines = useMemo(() => {
    const spec = GRID_SPECS[gridFormat];
    const a4Width = 595.28;
    const a4Height = 841.89;
    const margin = 20;
    const gap = 8;

    const availableW = a4Width - margin * 2 - gap * (spec.cols - 1);
    const availableH = a4Height - margin * 2 - gap * (spec.rows - 1);

    const cellW = availableW / spec.cols;
    const cellH = availableH / spec.rows;

    const fontPt = microFontSize;
    const lineStep = fontPt * 1.25;
    const maxChars = Math.max(10, Math.floor((cellW - 6) / (fontPt * 0.55)));
    const maxPerCell = Math.max(3, Math.floor((cellH - 14) / lineStep));

    const allSubLines = wrapTextToSubLines(effectiveNoteBody, maxChars);

    const cells: string[][] = [];
    let currentCell: string[] = [];

    for (const subLine of allSubLines) {
      if (currentCell.length >= maxPerCell && currentCell.length > 0) {
        cells.push(currentCell);
        currentCell = [subLine];
      } else {
        currentCell.push(subLine);
      }
    }
    if (currentCell.length > 0) {
      cells.push(currentCell);
    }
    return cells;
  }, [effectiveNoteBody, gridFormat, microFontSize]);

  // Micro PDF Export Engine using pdf-lib (Supports Uploaded PDF Page Embedding & Note Text Grid)
  const generateMicroPdf = async () => {
    try {
      setIsGeneratingMicro(true);
      setMicroStatusMsg('');

      const spec = GRID_SPECS[gridFormat];
      const targetDoc = await PDFDocument.create();
      const font = await targetDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await targetDoc.embedFont(StandardFonts.HelveticaBold);

      const a4Width = 595.28;
      const a4Height = 841.89;
      const margin = 20; // 20pt paper margin
      const gap = 8; // 8pt gap between grid cells

      const availableW = a4Width - margin * 2 - gap * (spec.cols - 1);
      const availableH = a4Height - margin * 2 - gap * (spec.rows - 1);

      const cellW = availableW / spec.cols;
      const cellH = availableH / spec.rows;

      if (microSource === 'upload') {
        if (!uploadedPdfBytes) {
          setMicroStatusMsg('Please select and upload a PDF file first.');
          setIsGeneratingMicro(false);
          return;
        }

        const srcDoc = await PDFDocument.load(uploadedPdfBytes);
        const totalSrcPages = srcDoc.getPageCount();
        const totalSheets = Math.ceil(totalSrcPages / spec.total);

        for (let sheet = 0; sheet < totalSheets; sheet++) {
          const sheetPage = targetDoc.addPage([a4Width, a4Height]);

          for (let slot = 0; slot < spec.total; slot++) {
            const pageIndex = sheet * spec.total + slot;
            if (pageIndex >= totalSrcPages) break;

            const col = slot % spec.cols;
            const row = Math.floor(slot / spec.cols);

            const x = margin + col * (cellW + gap);
            // PDF origin is bottom-left
            const y = a4Height - margin - (row + 1) * cellH - row * gap;

            const [embeddedPage] = await targetDoc.embedPdf(srcDoc, [pageIndex]);
            const embedAspect = embeddedPage.width / embeddedPage.height;
            const cellAspect = cellW / cellH;

            let renderW = cellW;
            let renderH = cellH;
            let renderX = x;
            let renderY = y;

            if (embedAspect > cellAspect) {
              renderH = cellW / embedAspect;
              renderY = y + (cellH - renderH) / 2;
            } else {
              renderW = cellH * embedAspect;
              renderX = x + (cellW - renderW) / 2;
            }

            sheetPage.drawRectangle({
              x,
              y,
              width: cellW,
              height: cellH,
              borderWidth: 0.5,
              borderColor: rgb(0.3, 0.3, 0.3),
              color: rgb(0.99, 0.99, 0.99),
            });

            sheetPage.drawPage(embeddedPage, {
              x: renderX,
              y: renderY,
              width: renderW,
              height: renderH,
            });

            // Micro page number badge
            sheetPage.drawText(`P.${pageIndex + 1}`, {
              x: x + 3,
              y: y + 3,
              size: 6,
              font: boldFont,
              color: rgb(0.3, 0.3, 0.3),
            });
          }
        }

        const pdfBytes = await targetDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `micro_${gridFormat}in1_${(uploadedPdfName || 'document').replace(/\.pdf$/i, '')}.pdf`;
        a.click();
        setMicroStatusMsg(`✓ Micro PDF (${spec.label}) created successfully!`);
      } else {
        // Mode: From Note Text (sequential cell filling across multiple A4 sheets with 0 text truncation)
        const totalCells = microCellLines.length;
        const totalSheets = Math.max(1, Math.ceil(totalCells / spec.total));
        const activeRgb = hexToRgb(currentTheme.accentColor);

        for (let sheet = 0; sheet < totalSheets; sheet++) {
          const sheetPage = targetDoc.addPage([a4Width, a4Height]);

          for (let slot = 0; slot < spec.total; slot++) {
            const cellIdx = sheet * spec.total + slot;
            if (cellIdx >= totalCells && totalCells > 0) break;

            const col = slot % spec.cols;
            const row = Math.floor(slot / spec.cols);

            const x = margin + col * (cellW + gap);
            const y = a4Height - margin - (row + 1) * cellH - row * gap;

            // Draw clean straight border for cell box
            sheetPage.drawRectangle({
              x,
              y,
              width: cellW,
              height: cellH,
              borderWidth: 0.5,
              borderColor: rgb(0.3, 0.3, 0.3),
            });

            // Straight divider line under cell header title
            sheetPage.drawLine({
              start: { x, y: y + cellH - 10 },
              end: { x: x + cellW, y: y + cellH - 10 },
              thickness: 0.4,
              color: rgb(0.3, 0.3, 0.3),
            });

            sheetPage.drawText(`P.${cellIdx + 1} - ${noteTitle || 'Note'}`, {
              x: x + 3,
              y: y + cellH - 7.5,
              size: 5.5,
              font: boldFont,
              color: rgb(0.2, 0.2, 0.2),
            });

            const slotLines = microCellLines[cellIdx] || [];
            const fontPt = microFontSize;
            const lineStep = fontPt * 1.25;
            let microY = y + cellH - (fontPt + 6);

            for (const line of slotLines) {
              if (microY < y + 2.5) break;
              const isHeading = /^\d+\.|\b(OVERVIEW|ARCH|SPEC|NOTE|FORMULA)\b/i.test(line);
              sheetPage.drawText(sanitizePdfText(line) || ' ', {
                x: x + 3,
                y: microY,
                size: fontPt,
                font: isHeading ? boldFont : font,
                color: isHeading ? activeRgb : hexToRgb(activeBodyColor),
              });
              microY -= lineStep;
            }
          }
        }

        const pdfBytes = await targetDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `micro_${gridFormat}in1_${(noteTitle || 'note').toLowerCase().replace(/\s+/g, '_')}.pdf`;
        a.click();
        setMicroStatusMsg(`✓ Micro PDF (${spec.label}, ${totalSheets} Sheet${totalSheets > 1 ? 's' : ''}) generated & downloaded!`);
      }
    } catch (err: any) {
      console.error('Micro PDF error:', err);
      setMicroStatusMsg('Error generating Micro PDF: ' + (err.message || 'Generation failed'));
    } finally {
      setIsGeneratingMicro(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Control Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Note to PDF Side-by-Side Studio ({paginatedPages.length} A4 Pages)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={autoFormatDocument}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105"
            title="Auto-format text layout, spacing & indents for clean A4 pagination"
          >
            <Wand2 className="h-4 w-4 text-amber-300" />
            <span>Auto Format Document</span>
          </button>

          <button
            onClick={printCleanPdfDocument}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 transition-all shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Print Clean PDF</span>
          </button>

          <button
            onClick={generateVectorPdf}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? 'Exporting PDF...' : `Download PDF (${paginatedPages.length} Pages)`}</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Studio Layout (2 Columns on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Note Editor & Styling Controls */}
        <div className="space-y-5">
          {/* Note Metadata Inputs */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <FileText className="h-4 w-4" />
              <span>Document Details</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300">Document Title:</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Subtitle / Tagline:</label>
                <input
                  type="text"
                  value={noteSubtitle}
                  onChange={(e) => setNoteSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Author Name:</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Multiline Content Textarea */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Type className="h-4 w-4" />
                <span>Note Content Body</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={insertSampleMathNote}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[10px] font-extrabold flex items-center space-x-1 transition-all"
                  title="Insert sample math equations (Quadratic formula, Gaussian integral, Euler's identity, etc.)"
                >
                  <Calculator className="h-3 w-3 text-indigo-300" />
                  <span>Insert Sample Math</span>
                </button>

                <button
                  onClick={autoFormatDocument}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-amber-300 border border-purple-500/40 text-[10px] font-extrabold flex items-center space-x-1 transition-all"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Auto Format</span>
                </button>

                <button
                  onClick={resetAllNoteData}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 text-[10px] font-extrabold flex items-center space-x-1 transition-all"
                  title="Reset note text to initial template"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Note</span>
                </button>

                <span className="font-mono text-[10px] text-gray-400">
                  {noteBody.length} chars • {paginatedPages.length} A4 Pages
                </span>
              </div>
            </div>

            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={12}
              placeholder="Type your notes, meeting bullet points, or document draft here..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed font-mono whitespace-pre-wrap shadow-inner"
            />
          </div>

          {/* Document Theme & Custom Color Selectors */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Theme & Color Pickers</span>
              </span>

              {(customPaperBg || customTitleColor || customSubtitleColor || customBodyColor) && (
                <button
                  onClick={resetAllColors}
                  className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset All Colors</span>
                </button>
              )}
            </div>

            {/* Document Color Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Select Preset Theme:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(THEME_CONFIGS) as Array<keyof typeof THEME_CONFIGS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      resetAllColors();
                    }}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition-all ${theme === key
                      ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: THEME_CONFIGS[key].accentColor }}
                    />
                    <span className="truncate">{THEME_CONFIGS[key].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers Section */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-extrabold text-amber-300">Custom Color Pickers:</span>

              {/* 1. Paper Background Color Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-semibold">Document Paper Background:</span>
                  <div className="flex items-center space-x-2" suppressHydrationWarning>
                    {isMounted ? (
                      <input
                        type="color"
                        value={activePaperBg}
                        onChange={(e) => setCustomPaperBg(e.target.value)}
                        className="h-5 w-8 rounded cursor-pointer bg-transparent border-0"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="h-5 w-8 rounded border border-gray-600" style={{ backgroundColor: activePaperBg }} />
                    )}
                    <span className="font-mono text-[10px] text-gray-400" suppressHydrationWarning>{activePaperBg}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PAPER_BG_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      onClick={() => setCustomPaperBg(swatch.hex)}
                      className="h-5 w-5 rounded-full border border-gray-600 transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.label}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Title & Subtitle Text Color Picker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-semibold">Title & Subtitle Text Color:</span>
                  <div className="flex items-center space-x-2" suppressHydrationWarning>
                    {isMounted ? (
                      <input
                        type="color"
                        value={activeTitleColor}
                        onChange={(e) => {
                          setCustomTitleColor(e.target.value);
                          setCustomSubtitleColor(e.target.value);
                        }}
                        className="h-5 w-8 rounded cursor-pointer bg-transparent border-0"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="h-5 w-8 rounded border border-gray-600" style={{ backgroundColor: activeTitleColor }} />
                    )}
                    <span className="font-mono text-[10px] text-gray-400" suppressHydrationWarning>{activeTitleColor}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      onClick={() => {
                        setCustomTitleColor(swatch.hex);
                        setCustomSubtitleColor(swatch.hex);
                      }}
                      className="h-5 w-5 rounded-full border border-gray-600 transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.label}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Body Content Text Color Picker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-semibold">Body Content Text Color:</span>
                  <div className="flex items-center space-x-2" suppressHydrationWarning>
                    {isMounted ? (
                      <input
                        type="color"
                        value={activeBodyColor}
                        onChange={(e) => setCustomBodyColor(e.target.value)}
                        className="h-5 w-8 rounded cursor-pointer bg-transparent border-0"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="h-5 w-8 rounded border border-gray-600" style={{ backgroundColor: activeBodyColor }} />
                    )}
                    <span className="font-mono text-[10px] text-gray-400" suppressHydrationWarning>{activeBodyColor}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      onClick={() => setCustomBodyColor(swatch.hex)}
                      className="h-5 w-5 rounded-full border border-gray-600 transition-transform hover:scale-110 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-gray-300">Font Family:</label>
              <div className="flex gap-2">
                {[
                  { id: 'sans', label: 'Sans-Serif (Modern)' },
                  { id: 'serif', label: 'Serif (Classic)' },
                  { id: 'mono', label: 'Monospace (Code)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${fontFamily === f.id
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Font Size, Line Spacing & Page Margins */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Font Size:</span>
                  <span className="font-mono text-amber-400 font-extrabold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />

                {/* Font Size Presets */}
                <div className="flex gap-1 pt-1">
                  {[
                    { value: 5, label: '5pt Micro' },
                    { value: 8, label: '8pt Compact' },
                    { value: 11, label: '11pt Standard' },
                    { value: 14, label: '14pt Large' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setFontSize(preset.value)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${fontSize === preset.value
                        ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Line Spacing:</span>
                  <span className="font-mono text-amber-400 font-extrabold">{lineSpacing}x</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Page Margins */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">Page Margins:</span>
                  <span className="font-mono text-amber-400 font-extrabold">{marginPadding}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={marginPadding}
                  onChange={(e) => setMarginPadding(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Line Spacing Preset Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[11px] font-semibold text-gray-400">Line Spacing Presets:</span>
              <div className="flex gap-1.5">
                {[
                  { value: 1.2, label: '1.2x Tight' },
                  { value: 1.5, label: '1.5x Normal' },
                  { value: 1.8, label: '1.8x Relaxed' },
                  { value: 2.2, label: '2.2x Double' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setLineSpacing(preset.value)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${lineSpacing === preset.value
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options Toggles: Footer Stamp & Auto Math Structuring */}
            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="footer-toggle"
                  checked={showFooterDate}
                  onChange={(e) => setShowFooterDate(e.target.checked)}
                  className="h-3.5 w-3.5 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="footer-toggle" className="text-xs text-gray-300 font-semibold cursor-pointer">
                  Include Sleek Thin Footer Stamp (Dynamic Page Numbers)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="math-toggle"
                  checked={autoMathFormatting}
                  onChange={(e) => setAutoMathFormatting(e.target.checked)}
                  className="h-3.5 w-3.5 accent-purple-500 rounded cursor-pointer"
                />
                <label htmlFor="math-toggle" className="text-xs text-purple-300 font-extrabold cursor-pointer flex items-center space-x-1.5">
                  <Calculator className="h-3.5 w-3.5 text-purple-400" />
                  <span>Auto Math Formula Structuring (LaTeX & Equations)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Page A4 PDF Paper Sheet Preview (No Preview Scrollbars!) */}
        <div className="space-y-4 sticky top-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
              <Eye className="h-4 w-4 text-amber-400" />
              <span>Live Multi-Page A4 Sheet Preview</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center space-x-1">
              <Layers className="h-3 w-3" />
              <span>{paginatedPages.length} Pages</span>
            </span>
          </div>

          {/* Vertical Stack of A4 Page Cards (NO internal scrollbar per page!) */}
          <div className="space-y-6 max-h-[100vh] overflow-y-auto pr-1">
            {paginatedPages.map((pageLines, pageIdx) => {
              const isPage1 = pageIdx === 0;
              const pageNum = pageIdx + 1;
              const totalPages = paginatedPages.length;

              return (
                <div key={pageIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center shadow-2xl">
                  {/* Page Badge Tag */}
                  <div className="w-full flex justify-between items-center px-2 pb-2 text-[10px] font-mono text-gray-400">
                    <span className="font-extrabold text-amber-400 uppercase tracking-widest">
                      A4 PAGE {pageNum} OF {totalPages}
                    </span>
                    <span>{isPage1 ? 'Full Header' : 'Compact Header'}</span>
                  </div>

                  {/* Clean A4 Paper Sheet Card (NO internal scrollbar!) */}
                  <div
                    className={`w-full max-w-lg aspect-[210/297] rounded-xl shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden border ${FONT_CLASSES[fontFamily]}`}
                    style={{ padding: `${marginPadding}px`, backgroundColor: activePaperBg }}
                  >
                    {/* Header Block */}
                    {isPage1 ? (
                      /* Page 1 Header */
                      <div className="space-y-2 border-b-2 pb-3" style={{ borderColor: currentTheme.accentColor }}>
                        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight" style={{ color: activeTitleColor }}>
                          {noteTitle || 'Untitled Note Document'}
                        </h1>

                        {noteSubtitle && (
                          <div className="text-xs font-bold" style={{ color: activeSubtitleColor }}>
                            {noteSubtitle}
                          </div>
                        )}

                        <div className="text-[10px] opacity-70 font-mono flex justify-between" style={{ color: activeBodyColor }}>
                          <span>Author: <strong style={{ color: activeTitleColor }}>{authorName || 'Anonymous'}</strong></span>
                          <span suppressHydrationWarning>Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                    ) : (
                      /* Page 2+ Compact Header Bar */
                      <div className="border-b pb-1.5 mb-2 flex justify-between items-center text-[10px] font-mono font-bold" style={{ borderColor: currentTheme.accentColor, color: activeSubtitleColor }}>
                        <span>{noteTitle || 'Untitled Note'} — Page {pageNum}</span>
                        <span className="opacity-70" suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                      </div>
                    )}

                    {/* Note Content Lines for this page (No scrollbar!) */}
                    <div
                      className="flex-1 my-2 whitespace-pre-wrap overflow-hidden"
                      style={{ fontSize: `${fontSize}px`, color: activeBodyColor, lineHeight: lineSpacing }}
                    >
                      {pageLines.join('\n')}
                    </div>

                    {/* Ultra-Thin Sleek Bottom Footer Stamp */}
                    {showFooterDate && (
                      <div className="pt-2 border-t border-gray-400/20 flex items-center justify-between text-[9px] opacity-70 font-mono tracking-tight" style={{ color: activeBodyColor }}>
                        <span>Generated via Toolip Note</span>
                        <span className="font-bold">Page {pageNum} of {totalPages}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {statusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🔬 Separate Micro-PDF / N-Up Pocket Reference Studio (16 Pages in 1 A4 Sheet) */}
      <div className="pt-8 border-t border-slate-800 space-y-6">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 backdrop-blur-xl shadow-2xl">
          {/* Header Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Grid className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Micro-PDF / N-Up Pocket Reference Studio
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                  16-in-1 N-Up Grid
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Fit 16 (or 12/9/8/4) document pages onto a single A4 sheet for high-density micro cheat sheets & paper-saving prints.
              </p>
            </div>

            <button
              onClick={generateMicroPdf}
              disabled={isGeneratingMicro}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingMicro ? 'Processing Micro PDF...' : `Export Micro PDF (${GRID_SPECS[gridFormat].label})`}</span>
            </button>
          </div>

          {/* Options Grid (Source Selection, Grid Layout Format & Micro Font Size) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Mode Source Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Select Micro PDF Source:</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMicroSource('note')}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center space-x-2 transition-all ${microSource === 'note'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                >
                  <FileText className="h-4 w-4 text-purple-400" />
                  <div className="text-left">
                    <div>Current Note Text</div>
                    <div className="text-[10px] font-normal text-gray-400">Paginate note text into grid</div>
                  </div>
                </button>

                <button
                  onClick={() => setMicroSource('upload')}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center space-x-2 transition-all ${microSource === 'upload'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                >
                  <Upload className="h-4 w-4 text-amber-400" />
                  <div className="text-left">
                    <div>Upload PDF File</div>
                    <div className="text-[10px] font-normal text-gray-400">Tile external PDF pages</div>
                  </div>
                </button>
              </div>

              {/* Upload PDF Box (if Upload mode selected) */}
              {microSource === 'upload' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-semibold">Upload PDF to Tile:</span>
                    {uploadedPdfName && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {uploadedPdfPages} Pages Detected
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="w-full text-xs text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />

                  {uploadedPdfName && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-2">
                      <FileCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">Loaded: {uploadedPdfName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grid Format Layout Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                <Grid className="h-3.5 w-3.5 text-indigo-400" />
                <span>N-Up Grid Density Format:</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(GRID_SPECS) as Array<keyof typeof GRID_SPECS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setGridFormat(key as any)}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 ${gridFormat === key
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    <span className="text-amber-400 font-mono text-xs">{GRID_SPECS[key as keyof typeof GRID_SPECS].label}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {GRID_SPECS[key as keyof typeof GRID_SPECS].cols} cols × {GRID_SPECS[key as keyof typeof GRID_SPECS].rows} rows
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Font Size Drag Slider (1pt to 12pt) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-gray-300 flex items-center space-x-1.5">
                  <Type className="h-3.5 w-3.5 text-purple-400" />
                  <span>Micro Text Font Size:</span>
                </label>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                  {microFontSize} pt
                </span>
              </div>

              <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={microFontSize}
                  onChange={(e) => setMicroFontSize(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                <div className="flex flex-wrap gap-1 justify-between">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((pt) => (
                    <button
                      key={pt}
                      onClick={() => setMicroFontSize(pt)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${microFontSize === pt
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
                        }`}
                    >
                      {pt}pt
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Micro-PDF Grid Preview Sheet */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-gray-200 flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-amber-400" />
                <span>Live Micro-PDF A4 Sheet Preview ({GRID_SPECS[gridFormat].label})</span>
              </span>

              <span className="font-mono text-[10px] text-gray-400">
                {microSource === 'upload' && uploadedPdfPages > 0
                  ? `Tiles ${uploadedPdfPages} uploaded pages into ${Math.ceil(uploadedPdfPages / GRID_SPECS[gridFormat].total)} A4 Sheet(s)`
                  : `Tiles note text into ${GRID_SPECS[gridFormat].total} micro cells on 1 A4 Sheet (${microFontSize}pt Text)`}
              </span>
            </div>

            {/* A4 Sheet Card Rendering Micro Grid Cells */}
            <div className="flex justify-center">
              <div
                className="w-full max-w-lg aspect-[210/297] rounded-2xl shadow-2xl p-4 flex flex-col justify-between overflow-hidden border border-slate-700 transition-all"
                style={{ backgroundColor: activePaperBg }}
              >
                {/* Header title stamp on sheet */}
                <div className="border-b border-gray-400/30 pb-1.5 mb-2 flex justify-between items-center text-[9px] font-mono font-bold" style={{ color: activeTitleColor }}>
                  <span>TOOLIP MICRO-PDF STUDIO — {GRID_SPECS[gridFormat].label.toUpperCase()} ({microFontSize}PT TEXT)</span>
                  <span suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { dateStyle: 'short' })}</span>
                </div>

                {/* N-Up Grid Container */}
                <div
                  className="flex-1 grid gap-1.5 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SPECS[gridFormat].cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${GRID_SPECS[gridFormat].rows}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: GRID_SPECS[gridFormat].total }).map((_, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-400/80 rounded-none p-1 flex flex-col justify-between overflow-hidden text-[6px] font-mono leading-tight bg-white/40"
                    >
                      <div className="font-bold flex justify-between border-b border-gray-400/60 mb-0.5 text-[4px]" style={{ color: activeTitleColor }}>
                        <span>P.{idx + 1}</span>
                      </div>

                      <div className="flex-1 my-0.5 overflow-hidden font-mono" style={{ color: activeBodyColor }}>
                        {microSource === 'upload' ? (
                          idx < (uploadedPdfPages || 0) ? (
                            <div className="h-full flex flex-col justify-center items-center text-center p-0.5 bg-indigo-500/10 rounded-none">
                              <FileText className="h-3 w-3 text-indigo-600 mb-0.5" />
                              <span className="text-[5.5px] font-bold">PDF Page {idx + 1}</span>
                            </div>
                          ) : (
                            <span className="opacity-40 italic text-gray-400">[Empty Slot]</span>
                          )
                        ) : (
                          microCellLines[idx] && microCellLines[idx].length > 0 ? (
                            <div className="space-y-[1px]">
                              {microCellLines[idx].map((lineStr, lineIdx) => (
                                <p
                                  key={lineIdx}
                                  className="break-words whitespace-pre-wrap font-mono leading-tight"
                                  style={{ fontSize: `${Math.max(2.5, microFontSize * 0.85)}px` }}
                                >
                                  {lineStr || ' '}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="opacity-40 italic text-gray-400">[Empty Slot]</span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer stamp on micro sheet */}
                <div className="pt-1.5 mt-2 border-t border-gray-400/30 flex justify-between text-[8px] opacity-70 font-mono" style={{ color: activeBodyColor }}>
                  <span>Generated via Toolip Micro-PDF</span>
                  <span>1 Sheet • {GRID_SPECS[gridFormat].total} Micro Pages</span>
                </div>
              </div>
            </div>

            {microStatusMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>{microStatusMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
