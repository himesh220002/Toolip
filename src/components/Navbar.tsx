'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentContext } from '@/context/CurrentContext';
import { Search, Crosshair, Shield, Hexagon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useCurrentContext();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top hazard accent line - keep as subtle brand accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange opacity-80" />

      <div className="relative bg-gunmetal-900/95 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />

        <div className="relative max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px] sm:h-[68px] gap-4">

            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 clip-chamfer bg-gradient-to-br from-halo-cyan to-halo-electric p-[1.5px] shadow-halo shrink-0">
                <div className="h-full w-full clip-chamfer bg-gunmetal-700 flex items-center justify-center">
                  <Crosshair className="h-5 w-5 text-halo-cyan" />
                </div>
              </div>
              <div className="leading-none">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[22px] sm:text-[24px] tracking-[0.04em] text-white leading-none">TOOLIP</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[8px] tracking-[0.18em] text-halo-cyan/80 border border-halo-cyan/20 bg-halo-cyan/10 px-2 py-0.5 clip-chamfer-sm font-bold">
                    <Hexagon className="h-2.5 w-2.5" /> UTILITY
                  </span>
                </div>
                <div className="font-mono text-[8px] tracking-[0.20em] font-bold text-white/40 mt-0.5 hidden sm:block">
                  31 TOOLS • READY TO USE
                </div>
              </div>
            </Link>

            {/* Center: Search */}
            <div className="flex-1 max-w-[560px] hidden md:flex items-center">
              <div className="relative flex-1 group">
                <div className="absolute -inset-[1px] clip-chamfer bg-gradient-to-r from-halo-cyan/40 via-white/5 to-vice-pink/30 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative clip-chamfer bg-[#0D1222] border border-white/[0.08] group-focus-within:border-halo-cyan/40 flex items-center h-10 overflow-hidden transition-colors">
                  <div className="pl-3 pr-2 text-white/25">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search — passport, SVG, invoice, PDF..."
                    className="flex-1 bg-transparent text-[13px] font-tech font-medium tracking-[0.02em] text-white placeholder:text-white/30 placeholder:font-mono placeholder:text-[11px] focus:outline-none pr-2"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mr-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 clip-chamfer-sm font-mono text-[10px] font-bold text-white/50 hover:text-white transition-colors"
                    >
                      CLR
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Mobile search + subtle status dot (lightweight) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex md:hidden items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-32 sm:w-40 pl-7 pr-2 py-2 bg-[#0D1222] border border-white/10 clip-chamfer-sm font-mono text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-halo-cyan/30"
                  />
                </div>
              </div>

              {/* Lightweight live dot - not a full tracker button */}
              <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.16em] font-bold text-white/30">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
