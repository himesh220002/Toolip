'use client';

import React from 'react';
import Link from 'next/link';
import { ToolItem } from '@/context/CurrentContext';
import {
  FileText,
  FileType,
  Code2,
  FileCode,
  FileSpreadsheet,
  FileDigit,
  Image as ImageIcon,
  Minimize2,
  QrCode,
  Volume2,
  Mic,
  PenTool,
  Calendar,
  Calculator,
  Percent,
  GraduationCap,
  Wallet,
  Hash,
  Key,
  Users,
  Droplet,
  CalendarDays,
  FileCheck,
  CheckSquare,
  Receipt,
  UserCheck,
  Camera,
  ArrowUpRight,
  Moon,
  Sparkles,
  Layers,
  Zap,
  AlignLeft,
  Clock,
  Printer,
  Table,
  RefreshCw,
  Edit3,
  Crosshair,
  Hexagon,
  Shield,
  Network,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Network: <Network className="h-5 w-5 text-halo-cyan" />,
  Moon: <Moon className="h-5 w-5 text-halo-cyan" />,
  Camera: <Camera className="h-5 w-5 text-vice-pink" />,
  FileText: <FileText className="h-5 w-5 text-halo-cyan" />,
  FileType: <FileType className="h-5 w-5 text-halo-ice" />,
  Code2: <Code2 className="h-5 w-5 text-emerald-300" />,
  FileCode: <FileCode className="h-5 w-5 text-amber-300" />,
  FileSpreadsheet: <FileSpreadsheet className="h-5 w-5 text-teal-300" />,
  FileDigit: <FileDigit className="h-5 w-5 text-vice-pink" />,
  ImageIcon: <ImageIcon className="h-5 w-5 text-vice-pink" />,
  Minimize2: <Minimize2 className="h-5 w-5 text-violet-300" />,
  QrCode: <QrCode className="h-5 w-5 text-halo-cyan" />,
  Volume2: <Volume2 className="h-5 w-5 text-halo-electric" />,
  Mic: <Mic className="h-5 w-5 text-vice-pink" />,
  PenTool: <PenTool className="h-5 w-5 text-emerald-300" />,
  Calendar: <Calendar className="h-5 w-5 text-vice-orange" />,
  Calculator: <Calculator className="h-5 w-5 text-vice-neon" />,
  Percent: <Percent className="h-5 w-5 text-vice-orange" />,
  GraduationCap: <GraduationCap className="h-5 w-5 text-halo-cyan" />,
  Wallet: <Wallet className="h-5 w-5 text-teal-300" />,
  Hash: <Hash className="h-5 w-5 text-halo-ice" />,
  Key: <Key className="h-5 w-5 text-vice-neon" />,
  Users: <Users className="h-5 w-5 text-vice-pink" />,
  Droplet: <Droplet className="h-5 w-5 text-halo-electric" />,
  CalendarDays: <CalendarDays className="h-5 w-5 text-violet-300" />,
  FileCheck: <FileCheck className="h-5 w-5 text-emerald-300" />,
  CheckSquare: <CheckSquare className="h-5 w-5 text-vice-violet" />,
  Receipt: <Receipt className="h-5 w-5 text-teal-300" />,
  UserCheck: <UserCheck className="h-5 w-5 text-halo-ice" />,
  AlignLeft: <AlignLeft className="h-5 w-5 text-halo-cyan" />,
};

function getRarity(category: string) {
  switch (category) {
    case 'Document & File Utilities':
      return {
        label: 'DOCUMENT • FILES',
        sub: 'PDF • FILES • CONVERTERS',
        gradient: 'from-halo-cyan via-halo-electric to-vice-violet',
        glow: 'shadow-halo',
        badge: 'bg-halo-cyan text-gunmetal-900',
        accent: 'text-halo-cyan border-halo-cyan/30',
      };
    case 'Image & Media Tools':
      return {
        label: 'IMAGE • MEDIA',
        sub: 'PHOTO • QR • AUDIO',
        gradient: 'from-vice-pink via-vice-magenta to-vice-orange',
        glow: 'shadow-vice',
        badge: 'bg-vice-pink text-white',
        accent: 'text-vice-pink border-vice-pink/30',
      };
    case 'Calculators & Converters':
      return {
        label: 'CALC • CONVERTERS',
        sub: 'MATH • UNITS • FINANCE',
        gradient: 'from-vice-neon via-vice-orange to-amber-500',
        glow: 'shadow-[0_0_22px_rgba(255,230,0,0.35)]',
        badge: 'bg-vice-neon text-gunmetal-900',
        accent: 'text-vice-neon border-vice-neon/30',
      };
    default:
      return {
        label: 'OFFICE • EVERYDAY',
        sub: 'OFFICE • DAILY HELPERS',
        gradient: 'from-vice-violet via-indigo-500 to-halo-cyan',
        glow: 'shadow-[0_0_22px_rgba(124,58,237,0.35)]',
        badge: 'bg-vice-violet text-white',
        accent: 'text-violet-300 border-violet-300/30',
      };
  }
}

function getUsefulToolTag(tool: ToolItem): { text: string; icon: React.ReactNode } {
  switch (tool.id) {
    case 'pdf-merger':
      return { text: '100% PRIVATE PDF', icon: <Shield className="h-2.5 w-2.5" /> };
    case 'image-to-pdf':
      return { text: 'MULTI-PAGE STUDIO', icon: <Sparkles className="h-2.5 w-2.5" /> };
    case 'json-formatter':
      return { text: 'PRETTIFY & MINIFY', icon: <Code2 className="h-2.5 w-2.5" /> };
    case 'markdown-to-html':
      return { text: 'LIVE DUAL PANE', icon: <FileCode className="h-2.5 w-2.5" /> };
    case 'file-converter':
      return { text: 'DOCX • TXT • PDF', icon: <RefreshCw className="h-2.5 w-2.5" /> };
    case 'note-to-pdf':
      return { text: 'INSTANT PDF EXPORT', icon: <FileText className="h-2.5 w-2.5" /> };
    case 'html-to-pdf':
      return { text: 'PRINT ENGINE READY', icon: <Printer className="h-2.5 w-2.5" /> };
    case 'table-to-csv':
      return { text: 'EXCEL CSV EXPORT', icon: <Table className="h-2.5 w-2.5" /> };
    case 'svg-code-editor':
      return { text: 'BI-DIRECTIONAL GLOW', icon: <Code2 className="h-2.5 w-2.5" /> };
    case 'passport-photo-maker':
      return { text: '35x45MM • < 80 KB', icon: <Camera className="h-2.5 w-2.5" /> };
    case 'photo-reducer':
      return { text: '100KB HIGH-COMPRESS', icon: <Minimize2 className="h-2.5 w-2.5" /> };
    case 'qr-generator':
      return { text: 'HIGH-RES PNG', icon: <QrCode className="h-2.5 w-2.5" /> };
    case 'text-to-speech':
      return { text: '.WAV AUDIO EXPORT', icon: <Volume2 className="h-2.5 w-2.5" /> };
    case 'speech-to-text':
      return { text: 'REALTIME WAVEFORM', icon: <Mic className="h-2.5 w-2.5" /> };
    case 'signature-generator':
      return { text: 'HTML & CSS READY', icon: <PenTool className="h-2.5 w-2.5" /> };
    case 'age-calculator':
      return { text: 'EXACT DOB & LEAP YEAR', icon: <Calendar className="h-2.5 w-2.5" /> };
    case 'loan-emi-calculator':
      return { text: 'AMORTIZATION & CHART', icon: <Calculator className="h-2.5 w-2.5" /> };
    case 'unit-converter':
      return { text: '14 SHAPES & MACH SPEED', icon: <RefreshCw className="h-2.5 w-2.5" /> };
    case 'percentage-calculator':
      return { text: '3-IN-1 MATH TOOL', icon: <Percent className="h-2.5 w-2.5" /> };
    case 'cgpa-converter':
      return { text: 'CBSE 9.5 MULTIPLIER', icon: <GraduationCap className="h-2.5 w-2.5" /> };
    case 'expense-tracker':
      return { text: 'CATEGORY SUMMARY', icon: <Wallet className="h-2.5 w-2.5" /> };
    case 'word-counter':
      return { text: 'LIVE WPM & ACCURACY', icon: <AlignLeft className="h-2.5 w-2.5" /> };
    case 'password-generator':
      return { text: 'CRYPTO SECURE', icon: <Key className="h-2.5 w-2.5" /> };
    case 'bill-splitter':
      return { text: 'PORTION & TIP CALC', icon: <Users className="h-2.5 w-2.5" /> };
    case 'water-calculator':
      return { text: 'HYDRATION GOAL', icon: <Droplet className="h-2.5 w-2.5" /> };
    case 'meeting-scheduler':
      return { text: '.ICS & INVITE LINK', icon: <CalendarDays className="h-2.5 w-2.5" /> };
    case 'resume-formatter':
      return { text: 'CLEAN TYPOGRAPHY', icon: <FileCheck className="h-2.5 w-2.5" /> };
    case 'checklist-maker':
      return { text: 'PROGRESS BAR & PERSIST', icon: <CheckSquare className="h-2.5 w-2.5" /> };
    case 'invoice-generator':
      return { text: 'TAX & SUBTOTAL CALC', icon: <Receipt className="h-2.5 w-2.5" /> };
    case 'form-filler':
      return { text: '1-CLICK PROFILE AUTOFILL', icon: <UserCheck className="h-2.5 w-2.5" /> };
    case 'sleep-calculator':
      return { text: '90-MIN REM CYCLES', icon: <Moon className="h-2.5 w-2.5" /> };
    case 'mindmap':
    case 'tip-calculator':
      return { text: 'GRAPHML AUTO-SAVE', icon: <Network className="h-2.5 w-2.5" /> };
    default:
      if (tool.status === 'upgraded') {
        return { text: '🔥 UPGRADED', icon: <Zap className="h-2.5 w-2.5" /> };
      }
      return { text: '⚡ CLIENT-SIDE', icon: <Zap className="h-2.5 w-2.5" /> };
  }
}

interface ToolCardProps {
  tool: ToolItem;
  isSelected?: boolean;
  onSelect?: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const icon = ICON_MAP[tool.iconName] || <FileText className="h-5 w-5 text-halo-cyan" />;
  const rarity = getRarity(tool.category);
  const usefulTag = getUsefulToolTag(tool);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(tool);
    }
  };

  const renderThumbnailBanner = () => {
    if (tool.imageUrl) {
      return (
        <div className="w-full h-[176px] clip-chamfer-sm overflow-hidden border border-white/10 relative bg-black">
          <img src={tool.imageUrl} alt={tool.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-[1.02] duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-gunmetal-900 via-transparent to-transparent opacity-70" />
          <div className="absolute inset-0 halo-scanlines opacity-40" />
          <div className="absolute bottom-1.5 left-1.5 px-2 py-1 bg-black/75 backdrop-blur border border-white/10 clip-chamfer-sm flex items-center gap-1.5">
            <Hexagon className="h-3 w-3 text-halo-cyan" />
            <span className="font-mono text-[9px] tracking-[0.16em] font-bold text-white">{tool.title.toUpperCase()}</span>
          </div>
        </div>
      );
    }

    switch (tool.id) {
      case 'passport-photo-maker':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1A0A1F] via-[#141B2E] to-[#0F1A2E] border border-vice-pink/30 p-3 flex items-center justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-25" />
            <div className="h-full aspect-[35/45] clip-chamfer-sm bg-[#0B0F19] border-2 border-dashed border-vice-pink/40 p-2 flex flex-col items-center justify-center space-y-1.5 relative">
              <div className="h-12 w-12 clip-chamfer-sm bg-vice-pink/10 border border-vice-pink/30 flex items-center justify-center text-vice-pink">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-[9px] font-mono text-white font-bold bg-vice-pink px-1.5 py-0.5 clip-chamfer-sm">35×45MM</span>
            </div>
            <div className="flex-1 pl-3 space-y-2 text-xs relative z-10">
              <div className="flex items-center justify-between font-bold">
                <span className="text-white/60 font-mono text-[10px] tracking-[0.12em]">TARGET</span>
                <span className="font-mono text-halo-cyan font-extrabold bg-halo-cyan/10 border border-halo-cyan/20 px-1.5 py-0.5 clip-chamfer-sm text-[11px]">&lt; 80 KB</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-vice-pink via-vice-orange to-halo-cyan w-5/6" />
              </div>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">★ AUTO BG</span>
                <span className="px-1.5 py-0.5 bg-vice-pink/10 text-vice-pink font-mono text-[8px] font-bold border border-vice-pink/20 clip-chamfer-sm">SMOOTHER</span>
              </div>
            </div>
          </div>
        );

      case 'pdf-merger':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1628] via-[#101E36] to-[#0F1425] border border-halo-cyan/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-20" />
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5 relative z-10">
              <span className="font-tech font-bold text-[11px] tracking-[0.12em] text-white">PDF MERGER • SPLITTER</span>
              <span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">pdf-lib</span>
            </div>
            <div className="flex items-center justify-around py-1 relative z-10">
              <div className="h-[76px] w-[56px] clip-chamfer-sm bg-gunmetal-700 border border-halo-cyan/30 p-1 flex flex-col justify-between">
                <div className="h-1.5 bg-halo-cyan/60 w-full" />
                <div className="space-y-1">
                  <div className="h-1 bg-white/20 w-[60%]" />
                  <div className="h-1 bg-white/20 w-[80%]" />
                  <div className="h-1 bg-white/20 w-[70%]" />
                </div>
                <div className="font-mono text-[7px] text-white/40 text-center">Doc 1</div>
              </div>
              <span className="text-halo-cyan font-black">+</span>
              <div className="h-[76px] w-[56px] clip-chamfer-sm bg-gunmetal-700 border border-vice-pink/30 p-1 flex flex-col justify-between">
                <div className="h-1.5 bg-vice-pink/60 w-full" />
                <div className="space-y-1">
                  <div className="h-1 bg-white/20 w-[80%]" />
                  <div className="h-1 bg-white/20 w-[60%]" />
                </div>
                <div className="font-mono text-[7px] text-white/40 text-center">Doc 2</div>
              </div>
              <span className="text-emerald-400 font-black">→</span>
              <div className="h-[78px] w-[58px] clip-chamfer-sm bg-white p-1.5 border-2 border-emerald-400 flex flex-col justify-between shadow-lg">
                <div className="h-2 bg-emerald-600 w-full" />
                <div className="space-y-1">
                  <div className="h-1 bg-slate-300 w-[60%]" />
                  <div className="h-1 bg-slate-300 w-[80%]" />
                </div>
                <div className="font-mono text-[7px] text-gunmetal-900 font-bold text-center">Merged</div>
              </div>
            </div>
            <div className="flex justify-between font-mono text-[8px] font-bold text-white/40 relative z-10">
              <span>MERGE</span><span className="text-halo-cyan">SPLIT RANGES</span>
            </div>
          </div>
        );

      case 'image-to-pdf':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1A0F2E] via-[#141B2E] to-[#0F1425] border border-vice-violet/30 p-3 flex items-center justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="space-y-2 relative z-10">
              <div className="font-tech font-bold text-white text-sm leading-none">IMAGE → PDF</div>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-vice-pink/15 text-vice-pink font-mono text-[8px] font-bold border border-vice-pink/20 clip-chamfer-sm">PNG</span>
                <span className="px-1.5 py-0.5 bg-vice-violet/15 text-violet-300 font-mono text-[8px] font-bold border border-violet-500/20 clip-chamfer-sm">JPG</span>
                <span className="px-1.5 py-0.5 bg-halo-cyan/15 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">WEBP</span>
              </div>
              <div className="font-mono text-[9px] text-white/40">Margins • Orientation</div>
            </div>
            <div className="h-24 w-[68px] clip-chamfer-sm bg-white p-1.5 border-2 border-vice-violet flex flex-col justify-between relative z-10">
              <div className="h-8 bg-violet-100 border border-violet-300 flex items-center justify-center font-mono text-[8px] font-bold text-violet-700">IMG</div>
              <div className="h-1.5 bg-emerald-500 w-3/4" />
              <div className="font-mono text-[7px] text-gunmetal-900 font-bold text-center">Converted.pdf</div>
            </div>
          </div>
        );

      case 'json-formatter':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A1E] via-[#0F2628] to-[#0F1425] border border-emerald-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10">
              <span className="font-tech font-bold text-white text-xs tracking-[0.06em]">JSON • VALIDATOR</span>
              <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">✓ VALID</span>
            </div>
            <div className="p-2 bg-black/60 border border-emerald-400/20 clip-chamfer-sm font-mono text-[11px] text-halo-cyan leading-tight relative z-10">
              <div className="text-white/60">{'{'}</div>
              <div className="pl-3 text-emerald-300">"status": <span className="text-vice-orange">200</span>,</div>
              <div className="pl-3 text-emerald-300">"data": <span className="text-violet-300">[ "Toolip" ]</span></div>
              <div className="text-white/60">{'}'}</div>
            </div>
            <div className="flex justify-between font-mono text-[8px] font-bold text-emerald-300/70 relative z-10">
              <span>PRETTIFY</span><span className="text-halo-cyan">TREE VIEW</span>
            </div>
          </div>
        );

      case 'markdown-to-html':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1E1405] via-[#241A0A] to-[#0F1425] border border-amber-500/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10">
              <span className="font-tech font-bold text-white text-xs">MARKDOWN → HTML</span>
              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 font-mono text-[8px] font-bold border border-amber-500/20 clip-chamfer-sm">LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] relative z-10">
              <div className="p-2 bg-black/60 border border-amber-500/20 clip-chamfer-sm text-amber-300 leading-tight"># Title<br />- Item<br />**Bold**</div>
              <div className="p-2 bg-white clip-chamfer-sm text-gunmetal-900 leading-tight text-[9px]"><div className="font-bold text-vice-violet">Title</div><div>• Item</div><div className="font-bold">Bold</div></div>
            </div>
            <div className="flex justify-between font-mono text-[8px] font-bold text-amber-300/60 relative z-10"><span>.HTML</span><span className="text-emerald-400">PDF EXPORT</span></div>
          </div>
        );

      case 'file-converter':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1628] via-[#0F1E36] to-[#0F1425] border border-halo-cyan/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">FILE CONVERTER</span><span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">MULTI-FMT</span></div>
            <div className="flex items-center justify-center gap-2 relative z-10"><span className="px-2 py-1 bg-halo-cyan/15 border border-halo-cyan/30 clip-chamfer-sm text-halo-cyan font-mono text-xs font-bold">DOCX</span><span className="text-emerald-400 font-bold">→</span><span className="px-2 py-1 bg-vice-violet/15 border border-violet-500/30 clip-chamfer-sm text-violet-300 font-mono text-xs font-bold">PDF</span><span className="text-emerald-400 font-bold">→</span><span className="px-2 py-1 bg-vice-pink/15 border border-vice-pink/30 clip-chamfer-sm text-vice-pink font-mono text-xs font-bold">TXT</span></div>
            <div className="font-mono text-[9px] text-white/30 text-center relative z-10">INSTANT CONVERSION ENGINE</div>
          </div>
        );

      case 'note-to-pdf':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1428] via-[#0F1A2E] to-[#0F1425] border border-halo-cyan/30 p-3 flex items-center justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="space-y-2 relative z-10"><div className="font-tech font-bold text-white text-sm">NOTE → PDF</div><div className="font-mono text-[10px] text-halo-cyan">Typed Notes → PDF</div><div className="px-2 py-1 bg-halo-cyan/10 text-halo-cyan font-mono text-[9px] font-bold border border-halo-cyan/20 clip-chamfer-sm w-max">CUSTOM TITLE</div></div>
            <div className="h-24 w-[68px] clip-chamfer-sm bg-white p-1.5 border-2 border-halo-cyan flex flex-col justify-between relative z-10"><div className="h-2 bg-halo-cyan w-full" /><div className="space-y-1"><div className="h-1 bg-slate-300 w-full" /><div className="h-1 bg-slate-300 w-full" /><div className="h-1 bg-slate-300 w-3/4" /></div><div className="h-1.5 bg-emerald-500 w-1/2" /></div>
          </div>
        );

      case 'table-to-csv':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A18] via-[#0F2626] to-[#0F1425] border border-emerald-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">TABLE &lt;-&gt; CSV &gt;-&gt; JSON</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">EXCEL .CSV</span></div>
            <div className="p-2 bg-black/60 border border-emerald-400/20 clip-chamfer-sm font-mono text-[9px] text-emerald-300 relative z-10">
              <table className="w-full border-collapse">
                {/* Header */}
                <thead className="border-b border-white/5 text-white/40">
                  <tr>
                    <th className="text-left px-2 py-1">Name</th>
                    <th className="text-left px-2 py-1">Role</th>
                    <th className="text-left px-2 py-1">Email</th>
                    <th className="text-left px-2 py-1">Status</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="text-white">
                  <tr>
                    <td className="px-2 py-1">Alexen</td>
                    <td className="px-2 py-1">Eng</td>
                    <td className="px-2 py-1">abc@email.com</td>
                    <td className="px-2 py-1 text-emerald-400">✓ Active</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">Mathew</td>
                    <td className="px-2 py-1">Sale</td>
                    <td className="px-2 py-1">xyz@maile.com</td>
                    <td className="px-2 py-1 text-emerald-400">✓ Active</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between font-mono text-[8px] font-bold text-emerald-300/60 relative z-10"><span>TSV • HTML</span><span className="text-halo-cyan">1-CLICK EXPORT</span></div>
          </div>
        );

      case 'photo-reducer':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1A0F18] via-[#1E0F1E] to-[#0F1425] border border-vice-pink/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">PHOTO • COMPRESS</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">-96%</span></div>
            <div className="flex items-center justify-around relative z-10"><div className="text-center"><div className="font-mono text-[9px] text-white/40">BEFORE</div><div className="text-vice-pink font-mono font-bold">2.4 MB</div></div><span className="text-emerald-400 font-black">→</span><div className="text-center"><div className="font-mono text-[9px] text-white/40">AFTER</div><div className="text-emerald-400 font-mono font-bold">95 KB</div></div></div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10"><div className="h-full bg-gradient-to-r from-vice-pink to-emerald-400 w-3/4" /></div>
          </div>
        );

      case 'text-to-speech':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1628] via-[#0F1E36] to-[#0F1E3A] border border-halo-electric/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">TEXT → SPEECH</span><span className="px-1.5 py-0.5 bg-halo-electric/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-electric/20 clip-chamfer-sm">.WAV</span></div>
            <div className="flex flex-col gap-2 mx-2 justify-between relative z-10">
              <p className='text-sm'>Type Text With Special Characters Can Be Converted To Natural Sounding Speech In Few Seconds</p>
            </div>
            <div className="p-2 bg-black/60 border border-halo-electric/20 clip-chamfer-sm flex items-center justify-between relative z-10"><div className="flex items-center gap-2"><div className="h-7 w-7 clip-chamfer-sm bg-halo-electric/15 border border-halo-electric/20 flex items-center justify-center text-halo-cyan"><Volume2 className="h-3.5 w-3.5" /></div><div className="font-mono text-[9px]"><div className="font-bold text-white">NATURAL AI</div><div className="text-white/40">Rate 1.0x</div></div></div><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">WAV</span></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">MULTI-VOICE • PITCH CONTROL</div>
          </div>
        );

      case 'age-calculator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1E1400] via-[#241A05] to-[#0F1425] border border-vice-orange/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">DOB • AGE CALC</span><span className="px-1.5 py-0.5 bg-vice-orange/10 text-vice-orange font-mono text-[8px] font-bold border border-vice-orange/20 clip-chamfer-sm">DIAL</span></div>
            <div className="grid grid-cols-3 gap-1.5 text-center relative z-10"><div className="p-1.5 bg-black/60 clip-chamfer-sm border border-vice-orange/20"><div className="font-mono text-[8px] text-white/40">YRS</div><div className="text-vice-orange font-mono font-bold">26</div></div><div className="p-1.5 bg-black/60 clip-chamfer-sm border border-vice-orange/20"><div className="font-mono text-[8px] text-white/40">MOS</div><div className="text-vice-neon font-mono font-bold">04</div></div><div className="p-1.5 bg-black/60 clip-chamfer-sm border border-emerald-400/20"><div className="font-mono text-[8px] text-white/40">DAYS</div><div className="text-emerald-400 font-mono font-bold">18</div></div></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">NEXT BIRTHDAY • COUNTDOWN</div>
          </div>
        );

      case 'unit-converter':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1A28] via-[#0F2336] to-[#0F1425] border border-halo-cyan/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">UNIT • GEOMETRY</span><span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">MACH & BITS</span></div>
            <div className="flex items-center justify-around relative z-10"><div className="p-1.5 bg-black/60 clip-chamfer-sm border border-halo-cyan/20 text-center font-mono"><div className="text-[8px] text-white/40">SPEED</div><div className="text-halo-cyan font-bold text-xs">Mach 2.5</div></div><span className="text-emerald-400 font-bold">→</span><div className="p-1.5 bg-black/60 clip-chamfer-sm border border-vice-violet/20 text-center font-mono"><div className="text-[8px] text-white/40">Speed</div><div className="text-violet-300 font-bold text-xs">1666 knots</div></div></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">14 SHAPES • BIT CONVERTER</div>
          </div>
        );

      case 'expense-tracker':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-emerald-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">EXPENSE TRACKER</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">BUDGET</span></div>
            <div className="space-y-1 font-mono text-[11px] text-white/70 relative z-10"><div className="flex justify-between"><span>🍔 Food</span><span className="text-emerald-400">$240</span></div><div className="flex justify-between"><span>✈️ Travel</span><span className="text-halo-cyan">$180</span></div></div>
            <div className="flex justify-between items-center font-tech font-bold text-emerald-300 border-t border-white/5 pt-1.5 relative z-10"><span className="text-xs">TOTAL</span><span className="font-mono text-emerald-400">$420.00</span></div>
          </div>
        );

      case 'sleep-calculator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#120F28] via-[#1A1436] to-[#0F1425] border border-violet-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">SLEEP • REM CYCLE</span><span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 font-mono text-[8px] font-bold border border-violet-500/20 clip-chamfer-sm">90-MIN</span></div>
            <div className="flex items-center gap-2 p-2 bg-black/60 clip-chamfer-sm border border-violet-400/20 relative z-10"><Moon className="h-4 w-4 text-violet-300" /><div className="font-mono text-[10px]"><div className="font-bold text-white">SLEEP NOW → 06:30 AM</div><div className="text-violet-300">7.5 Hrs • REM</div></div></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">OPTIMAL WAKE WINDOW FINDER</div>
          </div>
        );

      case 'mindmap':
      case 'tip-calculator':
      case 'mind-map-editor':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-slate-950 border border-cyan-500/30 p-3 flex flex-col justify-between overflow-hidden relative group/mindmap">
            {/* Background Grid Pattern & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header Strip */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-tech font-bold text-white text-xs tracking-wider">MIND MAP • CANVAS</span>
              </div>
              <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300 font-mono text-[8px] font-bold border border-cyan-500/30 clip-chamfer-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                GRAPHML ENGINE
              </span>
            </div>

            {/* Interactive Mind Map Visual Graphic */}
            <div className="relative w-full h-[100px] flex items-center justify-center z-10">
              {/* Connecting Lines SVG */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Left Top: games */}
                <path d="M 35 50 C 28 50, 28 20, 24 20" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                {/* Left Bottom: collecting */}
                <path d="M 35 50 C 28 50, 28 80, 25 80" fill="none" stroke="#8b5cf6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {/* Right Top: books */}
                <path d="M 65 50 C 72 50, 72 20, 76 20" fill="none" stroke="#f59e0b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {/* Right Bottom: sport */}
                <path d="M 65 50 C 72 50, 72 80, 80 80" fill="none" stroke="#ff007f" strokeWidth="2" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* Central Root Node */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border-2 border-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 font-bold text-[11px] z-20 transition-transform group-hover/mindmap:scale-105">
                <span className="text-xs">🧠</span>
                <span className="font-mono text-cyan-200">hobbies</span>
                <span className="text-[7px] bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded border border-cyan-400/40 font-mono">ROOT</span>
              </div>

              {/* Sub Nodes */}
              {/* Top Left: games */}
              <div className="absolute left-5 top-2 px-2 py-0.5 bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md shadow-emerald-500/10">
                <span>🎮</span>
                <span>games</span>
                <span className="text-[7px] text-emerald-400 font-mono">👁️3</span>
              </div>

              {/* Bottom Left: collecting */}
              <div className="absolute left-8 bottom-2 px-2 py-0.5 bg-purple-950/90 border border-purple-400/60 text-purple-200 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md shadow-purple-500/10">
                <span>🎨</span>
                <span>collecting</span>
              </div>

              {/* Top Right: books */}
              <div className="absolute right-6 top-2 px-2 py-0.5 bg-amber-950/90 border border-amber-400/60 text-amber-200 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md shadow-amber-500/10">
                <span>📚</span>
                <span>books</span>
                <span className="text-[7px] text-amber-400 font-mono">👁️3</span>
              </div>

              {/* Bottom Right: sport */}
              <div className="absolute right-6 bottom-2 px-2 py-0.5 bg-pink-950/90 border border-pink-400/60 text-pink-200 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md shadow-pink-500/10">
                <span>⚽</span>
                <span>sport</span>
              </div>
            </div>

            {/* Footer Features */}
            <div className="flex justify-between items-center font-mono text-[8px] font-bold text-slate-400 relative z-10 pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                AUTO-SAVE
              </span>
              <span className="text-cyan-300 font-semibold">GRAPHML IMPORT/EXPORT</span>
            </div>
          </div>
        );

      case 'bill-splitter':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1A0F14] via-[#1E1218] to-[#0F1425] border border-vice-pink/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">BILL • PORTION</span><span className="px-1.5 py-0.5 bg-vice-pink/10 text-vice-pink font-mono text-[8px] font-bold border border-vice-pink/20 clip-chamfer-sm">ITEM MAP</span></div>
            <div className="p-2 bg-black/60 clip-chamfer-sm border border-vice-pink/20 space-y-1 font-mono text-[11px] relative z-10"><div className="flex justify-between text-white"><span>👤 Alex (2)</span><span className="text-vice-pink font-bold">$42.50</span></div><div className="flex justify-between text-white/50 text-[10px]"><span>👤 Sarah (1)</span><span className="text-white/60">$18.00</span></div></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">FAIR PORTION • GROUP MAP</div>
          </div>
        );

      case 'form-filler':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1628] via-[#0F1E36] to-[#0F1425] border border-halo-cyan/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">FORM • AUTO-FILL</span><span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">1-CLICK</span></div>
            <div className="p-2 bg-black/60 border border-halo-cyan/20 clip-chamfer-sm space-y-1 relative z-10"><div className="font-tech font-bold text-white text-[11px]">SAVED PROFILE</div><div className="flex flex-wrap gap-1 font-mono text-[8px]"><span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan border border-halo-cyan/20 clip-chamfer-sm">Name</span><span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 clip-chamfer-sm">Address</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 clip-chamfer-sm">Phone</span></div></div>
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10">LOCAL STORE • RAPID COPY</div>
          </div>
        );

      case 'checklist-maker':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0F1228] via-[#141636] to-[#0F1425] border border-vice-violet/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">CHECKLIST • OPS</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">75%</span></div>
            <div className="p-2 bg-black/60 border border-vice-violet/20 clip-chamfer-sm space-y-1 font-mono text-[11px] relative z-10"><div className="flex items-center gap-2 text-emerald-400 font-bold"><span>✓</span><span>Deploy Next.js</span></div><div className="flex items-center gap-2 text-emerald-400 font-bold"><span>✓</span><span>PDF Engine</span></div><div className="flex items-center gap-2 text-white/40"><span className="h-3 w-3 border border-white/20 clip-chamfer-sm" /><span>Inspection</span></div></div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10"><div className="h-full bg-gradient-to-r from-vice-violet to-emerald-400 w-3/4" /></div>
          </div>
        );

      case 'speech-to-text':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#1A0F14] via-[#1E1218] to-[#1A0F28] border border-vice-pink/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">VOICE • CAPTURE</span><span className="px-1.5 py-0.5 bg-vice-pink/10 text-vice-pink font-mono text-[8px] font-bold border border-vice-pink/20 clip-chamfer-sm">● MIC</span></div>
            <div className="space-y-2 relative z-10">
              <div className="h-20 w-full bg-black/60 clip-chamfer-sm border border-vice-pink/20 p-1 flex items-center gap-1 overflow-hidden">
                {[80, 70, 90, 80, 60, 40, 45, 80, 55, 95, 35, 75, 50, 85, 45, 80, 55, 95, 35, 75, 50, 85, 90, 80, 60, 40, 45, 80, 55, 95, 35].map((h, i) => (<div key={i} className="flex-1 bg-gradient-to-t from-halo-cyan via-vice-violet to-vice-pink" style={{ height: `${h}%` }} />))}
              </div>
              <div className="p-1.5 bg-black/60 border border-white/5 clip-chamfer-sm font-mono text-[8px] text-white/50 line-clamp-2">"Transcribe mic speech into precise text notes..."</div>
            </div>
            <div className="flex justify-between font-mono text-[8px] font-bold text-vice-pink relative z-10"><span>🎤 MIC SWITCH</span><span className="text-halo-cyan">AUDIO+T TXT</span></div>
          </div>
        );

      case 'signature-generator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#0A1628] via-[#0F1E36] to-[#0F1425] border border-halo-cyan/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">SIG • GENERATOR</span><span className="px-1.5 py-0.5 bg-halo-cyan/10 text-halo-cyan font-mono text-[8px] font-bold border border-halo-cyan/20 clip-chamfer-sm">HTML</span></div>
            <div className="p-2 bg-white clip-chamfer-sm text-gunmetal-900 flex items-center gap-2.5 relative z-10"><div className="h-9 w-9 clip-chamfer-sm bg-gradient-to-br from-vice-violet to-halo-cyan flex items-center justify-center text-white font-bold text-xs">JD</div><div className="font-mono text-[9px] leading-tight"><div className="font-bold text-gunmetal-900">Jane Doe</div><div className="text-vice-violet font-semibold">CTO</div><div className="text-black/40">jane@company.com</div></div></div>
            <div className="flex justify-between font-mono text-[8px] font-bold text-halo-cyan/60 relative z-10"><span>AVATAR • PHOTO</span><span className="text-emerald-400">HTML COPY</span></div>
          </div>
        );

      case 'loan-calculator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-emerald-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />
            <div className="flex justify-between items-center relative z-10"><span className="font-tech font-bold text-white text-xs">LOAN • EMI</span><span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">DONUT SVG</span></div>
            <div className="flex items-center justify-between p-2 bg-black/60 border border-emerald-400/20 clip-chamfer-sm relative z-10"><div><div className="font-mono text-[8px] text-white/40">MONTHLY EMI</div><div className="text-emerald-400 font-mono font-bold">$1,245</div><div className="font-mono text-[8px] text-white/30">Principal vs Interest</div></div><div className="relative h-10 w-10 flex items-center justify-center"><svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E2A4A" strokeWidth="4" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="70, 100" /></svg><span className="absolute font-mono text-[7px] font-bold text-white">70%</span></div></div>
            <div className="font-mono text-[8px] text-emerald-300/50 text-center relative z-10">AMORTIZATION TABLE</div>
          </div>
        );

      case 'invoice-generator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-emerald-400/30 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10 mb-1">
              <span className="font-tech font-bold text-white text-xs">INVOICE • GENERATOR</span>
              <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[8px] font-bold border border-emerald-400/20 clip-chamfer-sm">
                PREVIEW
              </span>
            </div>

            {/* Invoice Body */}
            <div className="flex-1 bg-white clip-chamfer-sm text-gunmetal-900 p-2 space-y-1 relative z-10 text-[9px] font-mono">
              <div className="flex justify-between font-bold text-vice-violet">
                <span>Acme Technologies Inc.</span>
                <span>#INV-2026-001</span>
              </div>

              <div className="text-black/70">
                <span className="font-bold">Client:</span> Apex Global Solutions
              </div>

              {/* Items */}
              <div className="flex justify-between">
                <span>Next.js Web App</span>
                <span>₹12,000</span>
              </div>
              <div className="flex justify-between">
                <span>Express.js API</span>
                <span>₹18,000</span>
              </div>

              {/* Totals */}
              <div className="border-t border-black/20 pt-1 mt-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹30,000</span></div>
                <div className="flex justify-between"><span>Tax (18%):</span><span>₹5,400</span></div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Total:</span><span>₹35,400</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="font-mono text-[8px] text-white/30 text-center relative z-10 mt-1">
              AUTO-GENERATED • PDF READY
            </div>
          </div>
        );




      case 'meeting-scheduler':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-emerald-400/30 p-4 flex flex-col gap-3 overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10">
              <span className="font-tech font-bold text-white text-sm">MEETING • SCHEDULER</span>
              <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/20 clip-chamfer-sm">
                ACTIVE
              </span>
            </div>

            {/* Meeting Details */}
            <div className="p-3 bg-cyan-900/40 clip-chamfer-sm text-gunmetal-900 space-y-2 relative z-10">
              <div className="font-bold text-vice-violet text-sm">Toolip Project Sync Meeting</div>
              <div className="font-mono text-[10px] text-white">Conference Room A • Passcode: 123456</div>

              {/* Tags */}
              <div className="flex gap-2 font-mono text-[9px] flex-wrap">
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">10/09/2026</span>
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">14:00 – 15:00 IST</span>
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">Google Meet</span>
              </div>

              {/* Agenda */}
              <div className="font-mono text-[9px] text-white">
                Agenda: Discuss upcoming tool enhancements.
              </div>
            </div>

            {/* Footer */}
            <div className="font-mono text-[9px] text-white/40 text-center relative z-10">
              AUTO-SYNC • QUICK INVITE • VIDEO LINK
            </div>
          </div>
        );

      case 'water-calculator':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-cyan-400/30 p-4 flex flex-row justify-between items-center overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />

            {/* Left Side: Text */}
            <div className="flex flex-col gap-2 relative z-10 text-white">
              <span className="font-tech font-bold text-sm">WATER • INTAKE</span>
              <span className="font-mono text-[10px] text-cyan-300">Daily Target: 2.80 L</span>
              <span className="font-mono text-[10px] text-cyan-300">Glass Count: 11</span>
              <span className="font-mono text-[10px] text-cyan-300">Base Weight Fluid: 2.45 L</span>
            </div>

            {/* Right Side: Bottle */}
            <div className="relative w-12 h-32 border-2 border-cyan-400 clip-chamfer-sm bg-black/30">
              {/* Fill Level */}
              <div className="absolute bottom-0 w-full bg-cyan-400" style={{ height: "70%" }} />
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/70">
                70%
              </span>
            </div>
          </div>
        );





      case 'resume-formatter':
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-[#081A16] via-[#0F2420] to-[#0F1425] border border-emerald-400/30 p-4 flex flex-col gap-3 overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-15" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10">
              <span className="font-tech font-bold text-white text-sm">RESUME • STUDIO</span>
              <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/20 clip-chamfer-sm">
                PDF EXPORT
              </span>
            </div>

            {/* Resume Body */}
            <div className="p-3 bg-white clip-chamfer-sm text-gunmetal-900 space-y-2 relative z-10">
              <div className="font-bold text-vice-violet text-sm">EXECUTIVE CV</div>
              <div className="font-mono text-[10px] text-black/50">Experience • Education • Skills</div>

              {/* Skills */}
              <div className="flex gap-2 font-mono text-[9px] flex-wrap">
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">React</span>
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">Next.js</span>
                <span className="px-2 py-0.5 bg-gunmetal-900 text-white clip-chamfer-sm">TypeScript</span>
              </div>
            </div>

            {/* Footer */}
            <div className="font-mono text-[9px] text-white/40 text-center relative z-10">
              AUTO-PARSER • QUICK PICKER
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-[176px] clip-chamfer-sm bg-gradient-to-br from-gunmetal-700 via-gunmetal-800 to-black border border-white/10 p-3 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 halo-scanlines opacity-10" />
            <div className="flex items-center justify-between relative z-10">
              <div className="h-10 w-10 clip-chamfer-sm bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60">{icon}</div>
              <span className="px-2 py-0.5 bg-white/5 text-white/40 font-mono text-[8px] font-bold border border-white/5 clip-chamfer-sm tracking-[0.14em]">{tool.category.toUpperCase().slice(0, 12)}</span>
            </div>
            <div className="relative z-10"><div className="font-tech font-bold text-white text-sm leading-tight">{tool.title}</div><div className="font-mono text-[10px] text-white/40 line-clamp-1">{tool.description}</div></div>
            <div className="flex justify-between items-center font-mono text-[9px] font-bold text-halo-cyan border-t border-white/5 pt-2 relative z-10"><span>→ OPEN</span><ArrowUpRight className="h-3 w-3" /></div>
          </div>
        );
    }
  };

  return (
    <Link
      href={`/tools/${tool.id}`}
      onClick={handleClick}
      className={`group relative clip-chamfer p-[0.5px] bg-gradient-to-br ${rarity.gradient}/10 ${rarity.glow}/10 hover:shadow-halo-strong transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col overflow-hidden`}
    >
      {/* Inner armor shell */}
      <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-700 via-gunmetal-800 to-gunmetal-900 flex flex-col overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 halo-scanlines opacity-[0.02] pointer-events-none" />
        <div className="absolute inset-0 vice-grain pointer-events-none opacity-10" />

        {/* Top requisition header strip - lightweight */}
        <div className="relative flex items-center justify-between px-3.5 py-2.5 bg-black/30 border-b border-white/[0.06] backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-5 clip-chamfer-sm bg-halo-cyan/15 border border-halo-cyan/25 flex items-center justify-center">
              <Crosshair className="h-3 w-3 text-halo-cyan" />
            </span>
            <div className="font-mono text-[9px] tracking-[0.16em] font-bold text-halo-cyan">{rarity.label}</div>
          </div>
          <div className={`px-2 py-1 clip-chamfer-sm font-mono text-[9px] tracking-[0.14em] font-black border ${rarity.badge} flex items-center gap-1.5 shadow-sm`}>
            {usefulTag.icon}
            <span>{usefulTag.text}</span>
          </div>
          {/* scan sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[scan_1.2s_linear_infinite]" />
          </div>
        </div>

        {/* Banner art */}
        <div className="p-2.5 pb-0">
          <div className="relative shimmer overflow-hidden">
            {renderThumbnailBanner()}
            {/* Halo corner brackets overlay on banner */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-halo-cyan/60 pointer-events-none group-hover:border-vice-pink transition-colors" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-halo-cyan/60 pointer-events-none group-hover:border-vice-pink transition-colors" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-halo-cyan/60 pointer-events-none group-hover:border-vice-pink transition-colors" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-halo-cyan/60 pointer-events-none group-hover:border-vice-pink transition-colors" />
          </div>
        </div>

        {/* Content block — lightweight, highly readable */}
        <div className="relative p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 clip-chamfer-sm bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-halo-cyan/10 group-hover:border-halo-cyan/30 transition-colors">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-tech font-bold text-[18px] leading-tight tracking-[0.02em] text-white group-hover:text-halo-cyan transition-colors line-clamp-2">
                  {tool.title}
                </h3>
                <p className="font-mono text-[12.5px] leading-[1.5] text-white/65 line-clamp-2 mt-1.5">
                  {tool.description}
                </p>
              </div>
            </div>
            <div className="h-8 w-8 clip-chamfer-sm bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-vice-pink group-hover:text-white group-hover:border-vice-pink transition-all shrink-0 mt-0.5">
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Feature pills — larger, clearer */}
          {/* {tool.features && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.06]">
              {tool.features.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/35 border border-white/10 clip-chamfer-sm font-mono text-[10.5px] tracking-[0.04em] font-bold text-white/75 group-hover:text-white group-hover:border-halo-cyan/20 transition-colors"
                >
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
                  {feat}
                </span>
              ))}
              <span className="ml-auto hidden sm:flex font-mono text-[10px] tracking-[0.12em] font-bold text-halo-cyan/60 items-center gap-1">
                <Hexagon className="h-3 w-3" /> OPEN
              </span>
            </div>
          )} */}
        </div>

        {/* Bottom accent */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${rarity.gradient} opacity-10`} />
      </div>
    </Link>
  );
};
