'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentContext } from '@/context/CurrentContext';
import { Navbar } from '@/components/Navbar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ToolCard } from '@/components/ToolCard';
import { Footer } from '@/components/Footer';
import {
  Search,
  Crosshair,
  Layers,
  Hexagon,
  ArrowUpRight,
  Camera,
  Code2,
  Receipt,
  Box,
  Sun,
} from 'lucide-react';

export default function Home() {
  const { tools, activeCategory, searchQuery, setSearchQuery, stats } = useCurrentContext();

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      activeCategory === 'All' || tool.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.seoKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-gunmetal/85 text-white selection:bg-vice-pink selection:text-white">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-vice-pink/8 rounded-full blur-[130px]" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-vice-violet/8 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-halo-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* HERO — lightweight */}
          <div className="relative clip-chamfer-lg p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-vice-pink/25 to-vice-orange/30">
            <div className="relative clip-chamfer-lg bg-gradient-to-br from-gunmetal-700 via-gunmetal-800 to-[#080C18] overflow-hidden">
              <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />
              <div className="absolute -top-20 right-[-6%] w-[600px] h-[420px] bg-gradient-to-br from-vice-pink/12 via-vice-orange/8 to-transparent blur-[60px] rounded-full pointer-events-none" />

              <div className="relative grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-6 lg:gap-8 p-5 sm:p-7 lg:p-8">
                {/* Left */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-mono text-[9px] tracking-[0.18em] font-black">
                      <Hexagon className="h-3 w-3" /> ONLINE • READY
                    </span>
                    <span className="hidden sm:inline font-mono text-[9px] tracking-[0.16em] font-bold text-white/30">
                      {stats.total} TOOLS • CLIENT-SIDE
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="font-display leading-[0.85] tracking-[0.01em]">
                      <span className="block text-[40px] sm:text-[58px] lg:text-[68px] text-white">ARM YOUR</span>
                      <span className="block text-[40px] sm:text-[58px] lg:text-[68px] bg-clip-text text-transparent bg-gradient-to-r from-vice-pink via-vice-orange to-vice-neon">
                        WORKFLOW
                      </span>
                    </h1>
                    <p className="font-tech font-semibold text-[13px] sm:text-[14px] tracking-[0.18em] text-white/50">
                      32 INSTANT UTILITIES — FAST • PRIVATE • READY
                    </p>
                  </div>

                  <p className="font-mono text-[13px] leading-relaxed text-white/55 max-w-[560px] border-l-2 border-halo-cyan/20 pl-3 sm:pl-4">
                    No cloud. No tracking. Just fast PDF, image, calc & office tools — ready to use.
                  </p>

                  {/* Search - clean */}
                  <div className="relative group max-w-[620px]">
                    <div className="absolute -inset-[1px] clip-chamfer bg-gradient-to-r from-halo-cyan/30 to-vice-pink/20 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative clip-chamfer bg-[#0A0F1F] border border-white/10 group-focus-within:border-halo-cyan/40 flex items-center h-[52px] overflow-hidden">
                      <Search className="h-4 w-4 text-white/20 ml-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tools — passport, SVG, invoice, PDF..."
                        className="flex-1 bg-transparent px-3 font-tech font-medium text-[14px] text-white placeholder:text-white/25 placeholder:font-mono placeholder:text-[11px] focus:outline-none"
                      />
                      <button className="hidden sm:flex items-center gap-1.5 mr-1.5 px-4 py-2.5 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-tech font-black text-xs tracking-[0.10em]">
                        <Search className="h-3.5 w-3.5" /> SEARCH
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right — simple sunset card */}
                <div className="space-y-3 lg:pl-2">
                  <div className="relative clip-chamfer overflow-hidden border border-white/10 bg-black">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1A0A1E] via-[#2A0E3A] to-[#FF2E97]/15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FF7A00]/20 via-transparent to-transparent" />
                    <div className="absolute top-5 right-5 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-vice-neon via-vice-orange to-vice-pink opacity-90" />
                    <div className="absolute bottom-10 left-0 right-0 h-12 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '22px 22px', transform: 'perspective(200px) rotateX(62deg)', transformOrigin: 'bottom' }} />

                    <div className="relative p-5 sm:p-6">
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-black/50 border border-white/10 clip-chamfer-sm">
                        <Sun className="h-3 w-3 text-vice-neon" />
                        <span className="font-mono text-[8px] tracking-[0.16em] font-black text-white">FEATURED • POPULAR</span>
                      </div>
                      <div className="mt-4 flex items-end gap-3">
                        <span className="font-display text-[62px] sm:text-[68px] leading-[0.8] text-white">32</span>
                        <div className="pb-1.5">
                          <div className="font-display text-[20px] sm:text-[22px] leading-none tracking-[0.06em] text-white">TOOLS</div>
                          <div className="font-mono text-[10px] tracking-[0.16em] font-bold text-vice-neon">READY TO USE</div>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex justify-between px-4 py-2 bg-black/60 border-t border-white/10">
                      <span className="font-mono text-[7px] tracking-[0.14em] font-bold text-white/25">PRIVATE • FAST • CLIENT-SIDE</span>
                      <span className="font-mono text-[7px] tracking-[0.14em] font-bold text-halo-cyan">ONLINE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'passport-photo-maker', label: 'PASSPORT', icon: Camera, sub: '< 80 KB' },
                      { id: 'svg-code-editor', label: 'SVG EDITOR', icon: Code2, sub: 'GLOW LINK' },
                      { id: 'invoice-generator', label: 'INVOICE', icon: Receipt, sub: '1-PAGE PDF' },
                    ].map((f) => (
                      <Link key={f.id} href={`/tools/${f.id}`} className="group relative clip-chamfer-sm bg-gunmetal-800 border border-white/10 hover:border-halo-cyan/30 p-2.5 flex flex-col gap-2 transition-colors">
                        <div className="h-7 w-7 clip-chamfer-sm bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 group-hover:text-halo-cyan transition-colors">
                          <f.icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-tech font-bold text-[10px] tracking-[0.06em] text-white">{f.label}</div>
                          <div className="font-mono text-[8px] font-bold text-white/30">{f.sub}</div>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[8px] font-bold text-halo-cyan/60">
                          OPEN <ArrowUpRight className="h-3 w-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CategoryFilter />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-tech font-bold text-sm tracking-[0.10em] text-white flex items-center gap-2">
                <span className="h-7 w-7 clip-chamfer bg-halo-cyan/10 border border-halo-cyan/20 flex items-center justify-center text-halo-cyan"><Layers className="h-4 w-4" /></span>
                ALL TOOLS <span className="font-mono text-xs font-black text-halo-cyan bg-halo-cyan/10 border border-halo-cyan/20 px-1.5 py-0.5 clip-chamfer-sm">{String(filteredTools.length).padStart(2, '0')}</span>
              </h2>
              <span className="hidden sm:flex font-mono text-[8px] tracking-[0.14em] font-bold text-white/20 items-center gap-1.5"><Box className="h-3 w-3" /> GRID VIEW</span>
            </div>

            {filteredTools.length === 0 ? (
              <div className="clip-chamfer bg-gunmetal-800/50 border border-white/10 p-10 text-center space-y-3">
                <p className="font-tech font-bold text-white">NO TOOLS FOUND</p>
                <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-mono text-xs font-black">CLEAR SEARCH</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
