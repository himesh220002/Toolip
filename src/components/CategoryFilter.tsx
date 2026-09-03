'use client';

import React from 'react';
import { useCurrentContext, ToolCategory } from '@/context/CurrentContext';
import { FileText, Image as ImageIcon, Calculator, HelpCircle, Layers, Crosshair } from 'lucide-react';

const CATEGORIES: { name: string; icon: React.ReactNode }[] = [
  { name: 'All', icon: <Layers className="h-3.5 w-3.5" /> },
  { name: 'Document & File Utilities', icon: <FileText className="h-3.5 w-3.5" /> },
  { name: 'Image & Media Tools', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { name: 'Calculators & Converters', icon: <Calculator className="h-3.5 w-3.5" /> },
  { name: 'Everyday Office/Personal Helpers', icon: <HelpCircle className="h-3.5 w-3.5" /> },
];

export const CategoryFilter: React.FC = () => {
  const { activeCategory, setActiveCategory, tools } = useCurrentContext();

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return tools.length;
    return tools.filter((t) => t.category === catName).length;
  };

  return (
    <div className="relative">
      {/* Halo data header above tabs */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-halo-cyan/60" />
          <span className="font-mono text-[9px] tracking-[0.22em] font-bold text-halo-cyan">FILTER // CATEGORY</span>
          <span className="hidden sm:inline font-mono text-[8px] tracking-[0.14em] text-white/25">— SELECT LOADOUT CATEGORY TO FILTER DECK</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[8px] tracking-[0.14em] font-bold text-white/20">
          <Crosshair className="h-3 w-3 text-halo-cyan/50" />
          <span>ARMORY GRID ACTIVE</span>
        </div>
      </div>

      <div className="relative bg-gunmetal-800/50 backdrop-blur-xl border border-white/[0.06] clip-chamfer p-1.5 sm:p-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-1 sm:pb-0 snap-x">
          {CATEGORIES.map(({ name, icon }) => {
            const isActive = activeCategory === name;
            const count = getCategoryCount(name);
            const shortName = name === 'All' ? 'ALL SYSTEMS' : name.toUpperCase();

            return (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`group relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 clip-chamfer-sm border text-[11px] sm:text-xs font-bold tracking-[0.06em] whitespace-nowrap transition-all snap-start shrink-0
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-halo-cyan to-halo-electric text-gunmetal-900 border-halo-cyan shadow-halo'
                      : 'bg-[#0D1222] text-white/65 border-white/[0.07] hover:border-vice-pink/30 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                {/* Halo tick corner when active */}
                {isActive && <span className="absolute top-1 right-1 h-1 w-1 bg-gunmetal-900 rounded-full" />}

                <span
                  className={`h-6 w-6 sm:h-7 sm:w-7 clip-chamfer-sm flex items-center justify-center border shrink-0 transition-colors
                  ${isActive ? 'bg-gunmetal-900/15 border-gunmetal-900/20 text-gunmetal-900' : 'bg-white/[0.04] border-white/10 text-white/50 group-hover:text-vice-pink group-hover:border-vice-pink/30'}`}
                >
                  {icon}
                </span>

                <span className={`font-tech leading-none hidden sm:block ${isActive ? 'text-gunmetal-900' : ''}`}>
                  {shortName}
                </span>
                {/* mobile shortened labels */}
                <span className={`font-tech leading-none sm:hidden text-[10px] ${isActive ? 'text-gunmetal-900' : ''}`}>
                  {name === 'Document & File Utilities' ? 'DOCUMENT' : name === 'Image & Media Tools' ? 'MEDIA' : name === 'Calculators & Converters' ? 'CALC' : name === 'Everyday Office/Personal Helpers' ? 'OFFICE' : 'ALL'}
                </span>

                <span
                  className={`ml-1 px-1.5 sm:px-2 py-0.5 clip-chamfer-sm font-mono text-[10px] font-bold border
                  ${isActive ? 'bg-gunmetal-900 text-halo-cyan border-gunmetal-900/20' : 'bg-white/5 text-white/40 border-white/5 group-hover:text-vice-pink group-hover:border-vice-pink/20'}`}
                >
                  {String(count).padStart(2, '0')}
                </span>

                {/* bottom active line vice */}
                {isActive && <span className="absolute -bottom-[1px] left-2 right-2 h-[2px] bg-vice-pink shadow-[0_0_8px_#FF2E97]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
