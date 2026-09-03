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

  // Renders visual preview banner thumbnails showing what each tool does
  const renderThumbnailBanner = () => {
    switch (tool.id) {
      case 'passport-photo-maker':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-purple-900/60 border border-purple-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-purple-400/60 transition-colors">
            <div className="h-full aspect-[35/45] rounded-lg bg-slate-800 border-2 border-dashed border-purple-400/60 p-1 flex flex-col items-center justify-center space-y-1 shadow-md">
              <div className="h-8 w-8 rounded-full bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-[8px] font-mono text-purple-300 font-bold">35x45mm</span>
            </div>

            <div className="flex-1 pl-3 space-y-1 text-[14px]">
              <div className="flex items-center justify-between text-purple-200 font-bold">
                <span>Format:</span>
                <span className="font-mono text-emerald-400">&lt; 80 KB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 w-4/5 rounded-full" />
              </div>
              <div className="text-[9px] text-gray-400 flex items-center justify-between">
                <span>Contrast/Tilt</span>
                <span className="text-purple-300 font-mono">Auto Edge</span>
              </div>
            </div>
          </div>
        );

      case 'invoice-generator':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-sky-950/80 via-slate-900 to-sky-900/60 border border-sky-500/30 p-2.5 flex flex-col justify-between overflow-hidden relative group-hover:border-sky-400/60 transition-colors">
            <div className="flex items-center justify-between border-b border-sky-800/50 pb-1">
              <div className="flex items-center space-x-1">
                <Receipt className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-[10px] font-bold text-white">INVOICE #1042</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                1-PAGE PDF
              </span>
            </div>

            <div className="space-y-1 text-[9px] font-mono text-gray-300">
              <div className="flex justify-between">
                <span>Web Dev Services</span>
                <span>$1,250.00</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (18%)</span>
                <span>$225.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-sky-300 pt-1 border-t border-sky-800/40">
              <span>Grand Total:</span>
              <span className="text-emerald-400 font-mono font-extrabold">$1,475.00</span>
            </div>
          </div>
        );

      case 'svg-code-editor':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-900/60 border border-emerald-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-emerald-400/60 transition-colors">
            <div className="font-mono text-[14px] text-emerald-300 space-y-0.5 max-w-[55%] truncate">
              <div className="text-gray-400">&lt;svg viewBox="0 0 100"&gt;</div>
              <div className="text-emerald-400 font-bold pl-2">&lt;circle r="40" /&gt;</div>
              <div className="text-sky-300 pl-2">&lt;path d="M10..." /&gt;</div>
              <div className="text-gray-400">&lt;/svg&gt;</div>
            </div>

            <div className="h-16 w-16 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center shadow-lg relative">
              <svg className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        );

      case 'html-to-pdf':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-indigo-400/60 transition-colors">
            <div className="font-mono text-[14px] text-sky-300 space-y-1">
              <div className="text-indigo-400 font-bold">&lt;!DOCTYPE html&gt;</div>
              <div className="text-purple-300">&lt;style&gt;body&#123;...&#125;&lt;/style&gt;</div>
              <div className="text-emerald-400">&lt;h1&gt;PDF Export&lt;/h1&gt;</div>
            </div>

            <div className="h-16 w-14 rounded-lg bg-white p-1.5 border border-indigo-400 flex flex-col justify-between shadow-xl">
              <div className="h-2 bg-indigo-600 rounded-sm w-3/4" />
              <div className="space-y-1">
                <div className="h-1 bg-slate-300 rounded-sm w-full" />
                <div className="h-1 bg-slate-300 rounded-sm w-5/6" />
                <div className="h-1 bg-slate-300 rounded-sm w-4/6" />
              </div>
              <div className="h-1.5 bg-emerald-500 rounded-sm w-1/2" />
            </div>
          </div>
        );

      case 'speech-to-text':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-900/60 border border-rose-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-rose-400/60 transition-colors">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Mic className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-[10px]">
                <div className="font-bold text-white">Live Equalizer</div>
                <div className="text-rose-300 font-mono text-[9px]">Transcribing...</div>
              </div>
            </div>

            {/* Sound Wave Equalizer Graphic */}
            <div className="flex items-end space-x-1 h-12 pr-1">
              {[40, 75, 30, 90, 60, 100, 45, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-rose-500 to-pink-400 rounded-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        );

      case 'loan-emi-calculator':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-teal-900/60 border border-teal-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-teal-400/60 transition-colors">
            <div className="space-y-1 text-[10px]">
              <div className="font-bold text-white">EMI Breakdown</div>
              <div className="text-teal-300 font-mono font-bold text-xs">$1,432 / mo</div>
              <div className="text-gray-400 text-[9px]">Principal vs Interest</div>
            </div>

            {/* Mini Donut Chart SVG */}
            <div className="h-16 w-16 relative flex items-center justify-center">
              <svg className="h-14 w-14 rotate-[-90deg]" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-400"
                  strokeDasharray="65, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray="35, 100"
                  strokeDashoffset="-65"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        );

      case 'qr-generator':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-cyan-900/60 border border-cyan-500/30 p-2.5 flex items-center justify-between overflow-hidden relative group-hover:border-cyan-400/60 transition-colors">
            <div className="space-y-1 text-[10px]">
              <div className="font-bold text-white">QR Generator</div>
              <div className="text-cyan-300 font-mono text-[9px]">URL / Text / WiFi</div>
              <div className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] w-max font-bold">
                High-Res PNG
              </div>
            </div>

            <div className="h-16 w-16 rounded-xl bg-white p-1.5 border border-cyan-400 flex flex-col justify-between shadow-lg">
              <div className="grid grid-cols-4 gap-1 h-full">
                <div className="bg-slate-900 rounded-xs col-span-2 row-span-2" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs col-span-2 row-span-2" />
                <div className="bg-slate-900 rounded-xs" />
              </div>
            </div>
          </div>
        );

      case 'meeting-scheduler':
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/60 border border-purple-500/30 p-2.5 flex flex-col justify-between overflow-hidden relative group-hover:border-purple-400/60 transition-colors">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white">Meeting Scheduler</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[9px]">
                🔑 Passcode Active
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-[9px] text-gray-300">
              <span className="px-2 py-0.5 bg-blue-600/30 border border-blue-500/40 rounded text-blue-300 font-bold">Meet</span>
              <span className="px-2 py-0.5 bg-sky-600/30 border border-sky-500/40 rounded text-sky-300 font-bold">Zoom</span>
              <span className="px-2 py-0.5 bg-purple-600/30 border border-purple-500/40 rounded text-purple-300 font-bold">Slack</span>
              <span className="px-2 py-0.5 bg-indigo-600/30 border border-indigo-500/40 rounded text-indigo-300 font-bold">Discord</span>
            </div>
          </div>
        );

      default:
        // Generic modern glass preview banner for other tools
        return (
          <div className="w-full h-60 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-3 flex items-center justify-between overflow-hidden relative group-hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{tool.title}</div>
                <div className="text-[10px] text-indigo-300 font-mono">{tool.category}</div>
              </div>
            </div>
            <div className="h-7 w-7 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
        );
    }
  };

  return (
    <Link
      href={`/tools/${tool.id}`}
      onClick={handleClick}
      className="group relative p-5 bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/60 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden backdrop-blur-xl space-y-4"
    >
      {/* Visual Tool Thumbnail Banner */}
      {renderThumbnailBanner()}

      <div className="space-y-3">
        {/* Top Header & Launcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors tracking-tight line-clamp-1">
              {tool.title}
            </h3>
          </div>

          <div className="h-7 w-7 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-gray-400 group-hover:text-indigo-300 group-hover:border-indigo-400/50 group-hover:bg-indigo-500/20 transition-all flex-shrink-0">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">
          {tool.description}
        </p>
      </div>

      {/* Feature Tags Footer */}
      {tool.features && (
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5">
          {tool.features.slice(0, 2).map((feat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-gray-400 text-[10px] font-mono group-hover:text-gray-200 transition-colors"
            >
              {feat}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
