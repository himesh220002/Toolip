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
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Moon: <Moon className="h-5 w-5 text-purple-400" />,
  Camera: <Camera className="h-5 w-5 text-purple-400" />,
  FileText: <FileText className="h-5 w-5 text-indigo-400" />,
  FileType: <FileType className="h-5 w-5 text-indigo-400" />,
  Code2: <Code2 className="h-5 w-5 text-emerald-400" />,
  FileCode: <FileCode className="h-5 w-5 text-amber-400" />,
  FileSpreadsheet: <FileSpreadsheet className="h-5 w-5 text-teal-400" />,
  FileDigit: <FileDigit className="h-5 w-5 text-rose-400" />,
  ImageIcon: <ImageIcon className="h-5 w-5 text-pink-400" />,
  Minimize2: <Minimize2 className="h-5 w-5 text-purple-400" />,
  QrCode: <QrCode className="h-5 w-5 text-cyan-400" />,
  Volume2: <Volume2 className="h-5 w-5 text-blue-400" />,
  Mic: <Mic className="h-5 w-5 text-rose-400" />,
  PenTool: <PenTool className="h-5 w-5 text-emerald-400" />,
  Calendar: <Calendar className="h-5 w-5 text-orange-400" />,
  Calculator: <Calculator className="h-5 w-5 text-emerald-400" />,
  Percent: <Percent className="h-5 w-5 text-amber-400" />,
  GraduationCap: <GraduationCap className="h-5 w-5 text-indigo-400" />,
  Wallet: <Wallet className="h-5 w-5 text-teal-400" />,
  Hash: <Hash className="h-5 w-5 text-sky-400" />,
  Key: <Key className="h-5 w-5 text-yellow-400" />,
  Users: <Users className="h-5 w-5 text-rose-400" />,
  Droplet: <Droplet className="h-5 w-5 text-blue-400" />,
  CalendarDays: <CalendarDays className="h-5 w-5 text-purple-400" />,
  FileCheck: <FileCheck className="h-5 w-5 text-emerald-400" />,
  CheckSquare: <CheckSquare className="h-5 w-5 text-indigo-400" />,
  Receipt: <Receipt className="h-5 w-5 text-teal-400" />,
  UserCheck: <UserCheck className="h-5 w-5 text-sky-400" />,
  AlignLeft: <AlignLeft className="h-5 w-5 text-indigo-400" />,
};

interface ToolCardProps {
  tool: ToolItem;
  isSelected?: boolean;
  onSelect?: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const icon = ICON_MAP[tool.iconName] || <FileText className="h-5 w-5 text-sky-400" />;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(tool);
    }
  };

  // Tailored visual preview banners for all tools (with custom image fallback support)
  const renderThumbnailBanner = () => {
    // If a custom image URL is provided in the tool item, render custom image!
    if (tool.imageUrl) {
      return (
        <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-800 relative group-hover:border-indigo-500/50 transition-colors shadow-lg">
          <img src={tool.imageUrl} alt={tool.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-indigo-300 border border-slate-700">
            {tool.title}
          </div>
        </div>
      );
    }

    switch (tool.id) {
      case 'passport-photo-maker':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-purple-900/80 border border-purple-500/40 p-3.5 flex items-center justify-between overflow-hidden relative group-hover:border-purple-400/70 transition-colors shadow-lg">
            <div className="h-full aspect-[35/45] rounded-xl bg-slate-800 border-2 border-dashed border-purple-400/60 p-2 flex flex-col items-center justify-center space-y-1.5 shadow-xl relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 border border-purple-400/50 flex items-center justify-center text-purple-200">
                <Camera className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-extrabold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
                35x45mm
              </span>
            </div>

            <div className="flex-1 pl-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-300">Target Size:</span>
                <span className="font-mono text-emerald-400 font-extrabold">&lt; 80 KB</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Contrast & Tilt</span>
                  <span className="text-sky-300 font-mono">Zoom / Pan</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 w-5/6 rounded-full" />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  ★ Auto Edge BG
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Smoother
                </span>
              </div>
            </div>
          </div>
        );

      case 'pdf-merger':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/80 border border-indigo-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-indigo-400/70 transition-colors shadow-lg">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-1.5">
              <span className="text-xs font-bold text-white">PDF MERGER & SPLITTER</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                Client-Side pdf-lib
              </span>
            </div>

            <div className="flex items-center justify-around py-1">
              <div className="h-20 w-16 rounded-lg bg-slate-800 border border-indigo-400/60 p-1 flex flex-col justify-between shadow-md">
                <div className="h-2 bg-indigo-500 rounded-xs w-full" />
                <div className='h-1 bg-gray-300 rounded-xl w-[60%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[30%]'></div>

                <div className="text-[8px] font-mono text-gray-400 text-center">Doc 1.pdf</div>
              </div>
              <span className="text-lg font-bold text-indigo-400">+</span>
              <div className="h-20 w-16 rounded-lg bg-slate-800 border border-purple-400/60 p-1 flex flex-col justify-between shadow-md">
                <div className="h-2 bg-purple-500 rounded-xs w-full" />
                <div className='h-1 bg-gray-300 rounded-xl w-[40%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[30%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className="text-[8px] font-mono text-gray-400 text-center">Doc 2.pdf</div>
              </div>
              <span className="text-lg font-bold text-emerald-400">➔</span>
              <div className="h-20 w-16 rounded-lg bg-white p-1.5 border-2 border-emerald-400 flex flex-col justify-between shadow-xl">
                <div className="h-2.5 bg-emerald-600 rounded-xs w-full" />
                <div className='h-1 bg-gray-300 rounded-xl w-[60%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[80%]'></div>
                <div className='h-1 bg-gray-300 rounded-xl w-[70%]'></div>
                <div className="text-[8px] font-mono text-slate-900 font-extrabold text-center">Merged.pdf</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-indigo-300">
              <span>Merge Multiple PDFs</span>
              <span className="text-emerald-400 font-mono">Split Page Ranges</span>
            </div>
          </div>
        );

      case 'image-to-pdf':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/80 border border-purple-500/40 p-3.5 flex items-center justify-between overflow-hidden relative group-hover:border-purple-400/70 transition-colors shadow-lg">
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">Image to PDF Converter</div>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 rounded">PNG</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 rounded">JPG</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 rounded">WEBP</span>
              </div>
              <div className="text-[10px] text-gray-400">Custom Margins & Orientation</div>
            </div>

            <div className="h-28 w-20 rounded-xl bg-white p-2 border-2 border-purple-400 flex flex-col justify-between shadow-2xl">
              <div className="h-10 bg-purple-100 border border-purple-300 rounded flex items-center justify-center text-purple-600 font-bold text-[10px]">
                🖼️ Image
              </div>
              <div className="h-2 bg-emerald-500 rounded-sm w-3/4" />
              <div className="text-[8px] font-mono text-slate-800 font-bold text-center">Converted.pdf</div>
            </div>
          </div>
        );

      case 'json-formatter':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-emerald-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">JSON Formatter & Validator</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                ✓ Valid JSON
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl font-mono text-xs text-sky-300 space-y-1">
              <div>&#123;</div>
              <div className="pl-3 text-emerald-400">"status": <span className="text-amber-400">200</span>,</div>
              <div className="pl-3 text-emerald-400">"data": <span className="text-purple-300">[ "Toolip", "Utility" ]</span></div>
              <div>&#125;</div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-300">
              <span>Prettify & Minify</span>
              <span className="text-sky-300 font-mono">Syntax Highlight Tree</span>
            </div>
          </div>
        );

      case 'markdown-to-html':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-orange-950/80 border border-amber-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-amber-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Markdown to HTML & PDF</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                Live Render
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded-xl border border-amber-500/30 text-amber-300 leading-tight">
                # Title<br />
                - Item 1<br />
                **Bold**
              </div>
              <div className="p-2 bg-white rounded-xl text-slate-900 leading-tight text-[10px]">
                <div className="font-bold text-indigo-700">Title</div>
                <div>• Item 1</div>
                <div className="font-bold">Bold Text</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-amber-300">
              <span>Export .HTML File</span>
              <span className="text-emerald-400 font-mono">1-Click PDF Export</span>
            </div>
          </div>
        );

      case 'file-converter':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/80 border border-blue-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-blue-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Document File Converter</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold text-[10px]">
                Multi-Format
              </span>
            </div>

            <div className="flex items-center justify-center space-x-3 py-2">
              <span className="px-3 py-1.5 bg-blue-600/30 border border-blue-400/50 rounded-xl text-blue-300 font-bold text-xs">DOCX</span>
              <span className="text-emerald-400 font-bold text-sm">➔</span>
              <span className="px-3 py-1.5 bg-purple-600/30 border border-purple-400/50 rounded-xl text-purple-300 font-bold text-xs">PDF</span>
              <span className="text-emerald-400 font-bold text-sm">➔</span>
              <span className="px-3 py-1.5 bg-sky-600/30 border border-sky-400/50 rounded-xl text-sky-300 font-bold text-xs">TXT</span>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Instant Document Conversion Engine
            </div>
          </div>
        );

      case 'note-to-pdf':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-sky-950/80 border border-indigo-500/40 p-3.5 flex items-center justify-between overflow-hidden relative group-hover:border-indigo-400/70 transition-colors shadow-lg">
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white text-sm">Note to PDF Creator</div>
              <div className="text-indigo-300 font-mono text-[11px]">Typed Notes ➔ PDF</div>
              <div className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] w-max font-bold border border-indigo-500/30">
                Custom Title & Body
              </div>
            </div>

            <div className="h-28 w-20 rounded-xl bg-white p-2 border-2 border-indigo-400 flex flex-col justify-between shadow-2xl">
              <div className="h-3 bg-indigo-600 rounded-xs w-full" />
              <div className="space-y-1">
                <div className="h-1 bg-slate-300 rounded-xs w-full" />
                <div className="h-1 bg-slate-300 rounded-xs w-full" />
                <div className="h-1 bg-slate-300 rounded-xs w-3/4" />
              </div>
              <div className="h-2 bg-emerald-500 rounded-xs w-1/2" />
            </div>
          </div>
        );

      case 'table-to-csv':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-emerald-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Table to CSV Converter</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                Excel Ready .CSV
              </span>
            </div>

            <div className="p-2 bg-slate-950 border border-emerald-500/30 rounded-xl font-mono text-[10px] text-emerald-300 space-y-1">
              <div className="flex justify-between border-b border-slate-800 pb-0.5 text-gray-400">
                <span>Name</span>
                <span>Role</span>
                <span>Status</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Alex</span>
                <span>Eng</span>
                <span className="text-emerald-400">✓ Active</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Mathew</span>
                <span>Sale</span>
                <span className="text-emerald-400">✓ Active</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-300">
              <span>TSV & HTML Table Support</span>
              <span className="text-sky-300 font-mono">1-Click CSV Export</span>
            </div>
          </div>
        );

      case 'photo-reducer':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-pink-950/90 via-slate-900 to-purple-950/80 border border-pink-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-pink-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Photo Size Reducer</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                -96% Smaller
              </span>
            </div>

            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-[10px] text-gray-400">Original</div>
                <div className="text-rose-400 font-mono font-extrabold text-sm">2.4 MB</div>
              </div>
              <span className="text-emerald-400 font-extrabold text-base">➔</span>
              <div className="text-center">
                <div className="text-[10px] text-gray-400">Compressed</div>
                <div className="text-emerald-400 font-mono font-extrabold text-sm">95 KB</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Quality Slider</span>
                <span className="text-pink-300 font-mono">Side-by-Side Preview</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-emerald-400 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        );

      case 'text-to-speech':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-blue-950/90 via-slate-900 to-cyan-950/80 border border-blue-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-blue-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Text to Speech Reader</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold text-[10px]">
                .WAV Download
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div className="text-[10px]">
                  <div className="font-bold text-white">Natural Speech AI</div>
                  <div className="text-gray-400 font-mono">Rate 1.0x • Pitch 1.0</div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold rounded">
                Download .WAV
              </span>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Multiple Accent Voices & Audio Controls
            </div>
          </div>
        );

      case 'age-calculator':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-orange-950/90 via-slate-900 to-amber-950/80 border border-orange-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-orange-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">DOB Age Calculator</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono font-bold text-[10px]">
                Birthday Dial
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-950 rounded-xl border border-orange-500/30">
                <div className="text-[10px] text-gray-400">Years</div>
                <div className="text-orange-400 font-mono font-extrabold text-sm">26</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-orange-500/30">
                <div className="text-[10px] text-gray-400">Months</div>
                <div className="text-amber-400 font-mono font-extrabold text-sm">4</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-orange-500/30">
                <div className="text-[10px] text-gray-400">Days</div>
                <div className="text-emerald-400 font-mono font-extrabold text-sm">18</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Next Birthday Countdown & Elapsed Hours
            </div>
          </div>
        );

      case 'unit-converter':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-sky-950/90 via-slate-900 to-indigo-950/80 border border-sky-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-sky-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Unit & 14 Shapes Geometry</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px]">
                Mach & Bits
              </span>
            </div>

            <div className="flex items-center justify-around text-xs">
              <div className="p-2 bg-slate-950 rounded-xl border border-sky-500/30 text-center font-mono">
                <div className="text-[9px] text-gray-400">Speed</div>
                <div className="text-sky-300 font-bold">Mach 2.5</div>
              </div>
              <span className="text-emerald-400 font-bold">➔</span>
              <div className="p-2 bg-slate-950 rounded-xl border border-indigo-500/30 text-center font-mono">
                <div className="text-[9px] text-gray-400">3D Shape</div>
                <div className="text-indigo-300 font-bold">Sphere Vol</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              14 Shape Surface Area & Storage Bit Converter
            </div>
          </div>
        );

      case 'expense-tracker':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-emerald-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Daily Expense Tracker</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                Budget Summary
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-gray-300">
              <div className="flex justify-between">
                <span>🍔 Food & Dining</span>
                <span className="text-emerald-400">$240.00</span>
              </div>
              <div className="flex justify-between">
                <span>✈️ Travel & Fuel</span>
                <span className="text-sky-400">$180.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-emerald-300 border-t border-slate-800 pt-1.5">
              <span>Total Spent:</span>
              <span className="text-emerald-400 font-mono font-extrabold">$420.00</span>
            </div>
          </div>
        );

      case 'sleep-calculator':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/80 border border-purple-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-purple-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Sleep REM Cycle Calculator</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                90-Min REM
              </span>
            </div>

            <div className="flex items-center space-x-2 p-2 bg-slate-950 rounded-xl border border-purple-500/30 text-xs">
              <Moon className="h-5 w-5 text-purple-400" />
              <div>
                <div className="font-bold text-white text-xs">Sleep NOW ➔ Wake at:</div>
                <div className="text-purple-300 font-mono text-[11px]">6:30 AM (7.5 Hrs Sleep)</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Optimal Bedtime & Wake-Up Window Finder
            </div>
          </div>
        );

      case 'tip-calculator':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-yellow-950/80 border border-amber-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-amber-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Tip & Bill Splitter</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                Tip Presets 15%-25%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-950 rounded-xl border border-amber-500/30">
                <div className="text-[9px] text-gray-400">Total Tip</div>
                <div className="text-amber-400 font-mono font-bold text-xs">$18.00</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-amber-500/30">
                <div className="text-[9px] text-gray-400">Total Bill</div>
                <div className="text-sky-400 font-mono font-bold text-xs">$138.00</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-amber-500/30">
                <div className="text-[9px] text-gray-400">Per Person</div>
                <div className="text-emerald-400 font-mono font-bold text-xs">$69.00</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Fast Diner Splitter with Tip Presets
            </div>
          </div>
        );

      case 'bill-splitter':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-rose-950/90 via-slate-900 to-purple-950/80 border border-rose-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-rose-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Portion-Based Bill Splitter</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
                Item Mapping
              </span>
            </div>

            <div className="p-2 bg-slate-950 rounded-xl border border-rose-500/30 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-white">
                <span>👤 Alex (2 Items)</span>
                <span className="text-rose-300 font-bold">$42.50</span>
              </div>
              <div className="flex justify-between text-gray-400 text-[10px]">
                <span>👤 Sarah (1 Item)</span>
                <span className="text-gray-300">$18.00</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Fair Portion Itemized Group Bill Mapping
            </div>
          </div>
        );

      case 'form-filler':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-sky-950/90 via-slate-900 to-indigo-950/80 border border-sky-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-sky-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Form Auto-Filler Store</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px]">
                1-Click Copy
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-sky-500/30 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-white text-[11px]">Saved Profile: Personal Info</div>
              <div className="flex flex-wrap gap-1 text-[9px]">
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded border border-sky-500/30 font-mono">Copy Name</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-mono">Copy Address</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-mono">Copy Phone</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Local Profile Data Store for Rapid Form Copy
            </div>
          </div>
        );

      case 'checklist-maker':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-indigo-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Project Checklist Maker</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                75% Complete
              </span>
            </div>

            <div className="p-2 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-1 text-[11px]">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <span>✓</span>
                <span>Deploy Next.js App Router</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <span>✓</span>
                <span>Configure Clean PDF Engine</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="h-3 w-3 border border-gray-600 rounded" />
                <span>Final Visual Inspection</span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-3/4 rounded-full" />
            </div>
          </div>
        );

      case 'speech-to-text':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-rose-950/90 via-slate-900 to-purple-950/80 border border-rose-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-rose-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Speech to Text & Voice Recorder</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/30">
                ● Live Mic
              </span>
            </div>

            {/* Simulated Frequency Wave Visualizer & Transcribed Text */}
            <div className="space-y-2">
              <div className="h-8 w-full bg-slate-950 rounded-xl border border-rose-500/30 p-1 flex items-center justify-between gap-1 overflow-hidden">
                {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-sky-400 via-indigo-500 to-rose-500 rounded-xs"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[9.5px] text-gray-300 line-clamp-2">
                "Transcribe microphone speech into precise text notes with voice recording export..."
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-rose-300 font-mono">
              <span>🎤 Hardware Mic Switcher</span>
              <span className="text-sky-300">Download Audio + TXT</span>
            </div>
          </div>
        );

      case 'signature-generator':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-sky-950/90 via-slate-900 to-indigo-950/80 border border-sky-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-sky-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Email Signature Generator</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px]">
                HTML Signature
              </span>
            </div>

            {/* Email Signature Visual Card */}
            <div className="p-2.5 bg-white rounded-xl text-slate-900 space-y-1.5 shadow-md flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-extrabold text-xs shadow-inner flex-shrink-0">
                JD
              </div>
              <div className="text-[10px] space-y-0.5 leading-tight flex-1">
                <div className="font-extrabold text-slate-900">Jane Doe</div>
                <div className="text-indigo-600 font-semibold">Chief Technology Officer</div>
                <div className="text-gray-500 text-[9px] font-mono">jane@company.com • +1 555-0199</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-sky-300 font-mono">
              <span>Avatar Upload & Photo Filler</span>
              <span className="text-emerald-400">1-Click HTML Copy</span>
            </div>
          </div>
        );

      case 'loan-calculator':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-emerald-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Loan EMI Calculator</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                SVG Donut Chart
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-950 border border-emerald-500/30 rounded-xl">
              <div className="space-y-1">
                <div className="text-[9px] text-gray-400">Monthly EMI</div>
                <div className="text-emerald-400 font-mono font-extrabold text-base">$1,245.50</div>
                <div className="text-[9px] text-gray-400 font-mono">Principal vs Interest</div>
              </div>
              {/* SVG Donut Chart Preview */}
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="h-12 w-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="70, 100"
                  />
                </svg>
                <span className="absolute text-[8px] font-mono text-white font-bold">70%</span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-300 font-mono text-center">
              Full Amortization Schedule Table & Export
            </div>
          </div>
        );

      case 'resume-formatter':
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3.5 flex flex-col justify-between overflow-hidden relative group-hover:border-emerald-400/70 transition-colors shadow-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Resume Auto-Parser & Studio</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                Isolated PDF Export
              </span>
            </div>

            <div className="p-2 bg-white rounded-xl text-slate-900 space-y-1 shadow-md text-[10px]">
              <div className="font-bold text-indigo-700 text-xs">EXECUTIVE CV RESUME</div>
              <div className="text-gray-600">Work Experience • Education • Technical Skills</div>
              <div className="flex gap-1 text-[8px] font-mono">
                <span className="px-1 bg-slate-100 rounded">React</span>
                <span className="px-1 bg-slate-100 rounded">Next.js</span>
                <span className="px-1 bg-slate-100 rounded">TypeScript</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-300 font-mono text-center">
              Smart Auto-Parser & Quick Picker Side Panel
            </div>
          </div>
        );

      default:
        // Generic modern visual glass banner preview
        return (
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden relative group-hover:border-indigo-500/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                {icon}
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-[10px] font-mono font-bold border border-slate-700">
                {tool.category}
              </span>
            </div>

            <div>
              <div className="text-base font-extrabold text-white">{tool.title}</div>
              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{tool.description}</div>
            </div>

            <div className="flex justify-between items-center text-xs text-indigo-300 font-semibold border-t border-slate-800/80 pt-2">
              <span>Launch Standalone Workspace</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        );
    }
  };

  return (
    <Link
      href={`/tools/${tool.id}`}
      onClick={handleClick}
      className="group relative p-5 bg-gradient-to-br from-slate-50 via-blue-100 to-slate-100 border border-slate-800/90 hover:border-indigo-500/60 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden backdrop-blur-xl space-y-4"
    >
      {/* Visual Tool Thumbnail Banner */}
      {renderThumbnailBanner()}

      <div className="space-y-2.5">
        {/* Top Header & Launcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-14 w-14 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-115 transition-transform">
              {icon}
            </div>
            <h3 className="text-lg font-extrabold text-black group-hover:text-indigo-900 transition-colors tracking-tight line-clamp-1">
              {tool.title}
            </h3>
          </div>

          <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-gray-400 group-hover:text-indigo-300 group-hover:border-indigo-400/50 group-hover:bg-indigo-500/20 transition-all flex-shrink-0">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed font-normal">
          {tool.description}
        </p>
      </div>

      {/* Feature Tags Footer */}
      {tool.features && (
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5">
          {tool.features.slice(0, 2).map((feat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700/50 text-gray-100 text-[10px] font-mono group-hover:text-gray-200 transition-colors"
            >
              {feat}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
