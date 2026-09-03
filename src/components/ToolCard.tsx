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
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Camera: <Camera className="h-6 w-6 text-purple-400" />,
  FileText: <FileText className="h-6 w-6 text-sky-400" />,
  FileType: <FileType className="h-6 w-6 text-indigo-400" />,
  Code2: <Code2 className="h-6 w-6 text-emerald-400" />,
  FileCode: <FileCode className="h-6 w-6 text-amber-400" />,
  FileSpreadsheet: <FileSpreadsheet className="h-6 w-6 text-teal-400" />,
  FileDigit: <FileDigit className="h-6 w-6 text-rose-400" />,
  ImageIcon: <ImageIcon className="h-6 w-6 text-pink-400" />,
  Minimize2: <Minimize2 className="h-6 w-6 text-purple-400" />,
  QrCode: <QrCode className="h-6 w-6 text-cyan-400" />,
  Volume2: <Volume2 className="h-6 w-6 text-blue-400" />,
  Mic: <Mic className="h-6 w-6 text-rose-400" />,
  PenTool: <PenTool className="h-6 w-6 text-emerald-400" />,
  Calendar: <Calendar className="h-6 w-6 text-orange-400" />,
  Calculator: <Calculator className="h-6 w-6 text-emerald-400" />,
  Percent: <Percent className="h-6 w-6 text-amber-400" />,
  GraduationCap: <GraduationCap className="h-6 w-6 text-indigo-400" />,
  Wallet: <Wallet className="h-6 w-6 text-teal-400" />,
  Hash: <Hash className="h-6 w-6 text-sky-400" />,
  Key: <Key className="h-6 w-6 text-yellow-400" />,
  Users: <Users className="h-6 w-6 text-rose-400" />,
  Droplet: <Droplet className="h-6 w-6 text-blue-400" />,
  CalendarDays: <CalendarDays className="h-6 w-6 text-purple-400" />,
  FileCheck: <FileCheck className="h-6 w-6 text-emerald-400" />,
  CheckSquare: <CheckSquare className="h-6 w-6 text-indigo-400" />,
  Receipt: <Receipt className="h-6 w-6 text-teal-400" />,
  UserCheck: <UserCheck className="h-6 w-6 text-sky-400" />,
};

interface ToolCardProps {
  tool: ToolItem;
  isSelected?: boolean;
  onSelect?: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const icon = ICON_MAP[tool.iconName] || <FileText className="h-6 w-6 text-sky-400" />;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(tool);
    }
  };

  return (
    <Link
      href={`/tools/${tool.id}`}
      onClick={handleClick}
      className="group relative p-6 bg-white border border-gray-200/90 hover:border-indigo-400/80 rounded-3xl transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      <div className="space-y-4">
        {/* Top Icon & Direct Page Launcher */}
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">
            {tool.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Feature Tags Footer */}
      {tool.features && (
        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-1.5 mt-4">
          {tool.features.slice(0, 2).map((feat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-mono group-hover:text-gray-900 transition-colors"
            >
              {feat}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
