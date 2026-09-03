'use client';

import React, { useState } from 'react';
import { useCurrentContext, ToolStatus } from '@/context/CurrentContext';
import {
  Wrench,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDashboard }) => {
  const { searchQuery, setSearchQuery, stats } = useCurrentContext();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">Toolip</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  29 Standalone Tools
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block font-medium">Everyday Utilities & Developer Tools</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., pdf, passport photo, SVG, invoice)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-100/80 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Context Status Dashboard Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenDashboard}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-400 text-gray-700 hover:text-gray-900 text-xs font-semibold transition-all shadow-xs group"
            >
              <SlidersHorizontal className="h-4 w-4 text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden md:inline">Tag Tracker</span>
              <div className="flex items-center space-x-1 pl-1">
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold">
                  {stats.completed} Done
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
