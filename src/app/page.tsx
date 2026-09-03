'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentContext } from '@/context/CurrentContext';
import { Navbar } from '@/components/Navbar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ToolCard } from '@/components/ToolCard';
import { StatusDashboard } from '@/components/StatusDashboard';
import { Footer } from '@/components/Footer';
import { Sparkles, Layers, SlidersHorizontal, ArrowUpRight, Search, Camera, Code2, Receipt, FileText, Users, Mic, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { tools, activeCategory, searchQuery, setSearchQuery, stats } = useCurrentContext();
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  // Filter tools based on search query and category tab
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
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Aura Glass Radiant Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div>
        {/* Navigation Bar */}
        <Navbar onOpenDashboard={() => setIsDashboardOpen(true)} />

        {/* Main Workspace Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative z-10">

          {/* CityAI Inspired Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-300 text-xs font-semibold shadow-lg backdrop-blur-xl">
              {/* <Sparkles className="h-4 w-4 text-indigo-400" /> */}
              <span>Toolip • 31 Everyday Utilities & Developer Tools</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Streamline Everyday Tasks <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
                Modern Tools
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Fast, private everyday utilities built for office and personal productivity.
            </p>

            {/* CityAI Inspired Pill Search Input Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passport photo, invoice, SVG editor, speech transcriber..."
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none shadow-2xl transition-all backdrop-blur-xl"
                />
                <button
                  className="absolute right-2 h-9 w-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 hover:scale-105 rounded-full flex items-center justify-center text-white shadow-lg transition-transform"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Tracker Summary Bar */}
            {/* <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsDashboardOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-xs text-gray-300 hover:text-white transition-all shadow-md backdrop-blur-xl"
              >
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold">CurrentContext Tracker:</span>
                <span className="font-bold text-emerald-400">{stats.completed} Completed</span>
                <span className="text-gray-600">•</span>
                <span className="font-bold text-amber-400">{stats.working} Working</span>
                <span className="text-gray-600">•</span>
                <span className="font-bold text-indigo-400">{stats.planned} Planned</span>
              </button>
            </div> */}
          </div>

          {/* Osilion Bento Box Showcase Grid (Featured Tools) */}
          {/* <div className="space-y-4 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Featured Bento Box Workspace Tools</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                href="/tools/passport-photo-maker"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/80 to-slate-900 border border-purple-500/30 hover:border-purple-400 transition-all shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 space-y-4 overflow-hidden backdrop-blur-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tracking-wider border border-purple-500/30">
                    &lt; 80 KB GUARANTEED
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    Passport Photo Maker & Editor
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed font-normal">
                    Live contrast, tilt angle, auto smoother filter, and guaranteed under 80 KB size optimizer.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>

              <Link
                href="/tools/svg-code-editor"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/80 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 space-y-4 overflow-hidden backdrop-blur-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-wider border border-emerald-500/30">
                    BI-DIRECTIONAL GLOW
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    SVG Code Editor & Preview
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed font-normal">
                    Real-time SVG code renderer with repeatable element glow highlighting on code hover & preview click.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>

              <Link
                href="/tools/invoice-generator"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-sky-900/40 via-sky-950/80 to-slate-900 border border-sky-500/30 hover:border-sky-400 transition-all shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 space-y-4 overflow-hidden backdrop-blur-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shadow-md">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-extrabold tracking-wider border border-sky-500/30">
                    1-PAGE PDF EXPORT
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-sky-300 transition-colors">
                    Enterprise Invoice Generator
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed font-normal">
                    Top header logo, background logo watermark, domain URL, tax calculations, and 1-page pristine PDF export.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            </div>
          </div> */}

          {/* Category Filter Pills Bar */}
          <div className="pt-4">
            <CategoryFilter />
          </div>

          {/* All 31 Tools Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>All Standalone Utility Tools ({filteredTools.length})</span>
              </h2>

              {searchQuery && (
                <span className="text-xs font-semibold text-indigo-400">
                  Showing results for "{searchQuery}"
                </span>
              )}
            </div>

            {filteredTools.length === 0 ? (
              <div className="py-16 text-center text-gray-400 bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl">
                <p className="text-sm font-medium">No tools found matching your search query.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-indigo-400 underline font-bold"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Status Tracker Dashboard Modal */}
      <StatusDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
}
