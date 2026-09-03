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
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#FAF8F5] text-gray-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* CityAI / Osilion Soft Pastel Ambient Radial Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-1/3 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Navigation Bar */}
        <Navbar onOpenDashboard={() => setIsDashboardOpen(true)} />

        {/* Main Workspace Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative z-10">
          
          {/* CityAI Inspired Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-gray-200 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Toolip • 29 Everyday Utilities & Developer Tools</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Streamline Everyday Tasks with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600">
                Modern Client-Side Tools
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Fast, private everyday utilities built for office and personal productivity. No popups, no tracking — 100% full standalone pages.
            </p>

            {/* CityAI Inspired Pill Search Input Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passport photo, invoice, SVG editor, speech transcriber..."
                  className="w-full pl-5 pr-12 py-3.5 bg-white border border-gray-200/90 focus:border-indigo-500 rounded-full text-xs text-gray-900 placeholder-gray-400 focus:outline-none shadow-lg transition-all"
                />
                <button
                  className="absolute right-2 h-9 w-9 bg-gray-900 hover:bg-black rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Tracker Summary Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsDashboardOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-indigo-300 text-xs text-gray-700 hover:text-gray-900 transition-all shadow-xs"
              >
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold">CurrentContext Tracker:</span>
                <span className="font-bold text-emerald-600">{stats.completed} Completed</span>
                <span className="text-gray-300">•</span>
                <span className="font-bold text-amber-600">{stats.working} Working</span>
                <span className="text-gray-300">•</span>
                <span className="font-bold text-indigo-600">{stats.planned} Planned</span>
              </button>
            </div>
          </div>

          {/* Osilion Bento Box Showcase Grid (Featured Tools in Bright Pastel Containers) */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Featured Bento Box Workspace Tools</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Bento Card 1: Passport Photo Maker (Warm Lavender Tint) */}
              <Link
                href="/tools/passport-photo-maker"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-purple-100/70 via-white to-purple-50/50 border border-purple-200/90 hover:border-purple-400 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 space-y-4 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-200/80 text-purple-900 text-[10px] font-extrabold tracking-wider">
                    &lt; 80 KB GUARANTEED
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors">
                    Passport Photo Maker & Editor
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                    Live contrast, tilt angle, auto smoother filter, and guaranteed under 80 KB size optimizer.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>

              {/* Bento Card 2: SVG Code Editor (Soft Mint Tint) */}
              <Link
                href="/tools/svg-code-editor"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-emerald-100/70 via-white to-emerald-50/50 border border-emerald-200/90 hover:border-emerald-400 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 space-y-4 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold tracking-wider">
                    BI-DIRECTIONAL GLOW
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    SVG Code Editor & Preview
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                    Real-time SVG code renderer with repeatable element glow highlighting on code hover & preview click.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>

              {/* Bento Card 3: Enterprise Invoice Generator (Soft Sky Blue Tint) */}
              <Link
                href="/tools/invoice-generator"
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-sky-100/70 via-white to-sky-50/50 border border-sky-200/90 hover:border-sky-400 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 space-y-4 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-200/80 text-sky-900 text-[10px] font-extrabold tracking-wider">
                    1-PAGE PDF EXPORT
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-sky-700 transition-colors">
                    Enterprise Invoice Generator
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                    Top header logo, background logo watermark, domain URL, tax calculations, and 1-page pristine PDF export.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                  <span>Launch Standalone Workspace</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="pt-4">
            <CategoryFilter />
          </div>

          {/* All 29 Tools Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>All Standalone Utility Tools ({filteredTools.length})</span>
              </h2>

              {searchQuery && (
                <span className="text-xs font-semibold text-indigo-600">
                  Showing results for "{searchQuery}"
                </span>
              )}
            </div>

            {filteredTools.length === 0 ? (
              <div className="py-16 text-center text-gray-500 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <p className="text-sm font-medium">No tools found matching your search query.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-indigo-600 underline font-bold"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
