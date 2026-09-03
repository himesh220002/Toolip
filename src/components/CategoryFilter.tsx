'use client';

import React from 'react';
import { useCurrentContext, ToolCategory } from '@/context/CurrentContext';
import { FileText, Image as ImageIcon, Calculator, HelpCircle, Layers } from 'lucide-react';

const CATEGORIES: { name: string; icon: React.ReactNode }[] = [
  { name: 'All', icon: <Layers className="h-4 w-4" /> },
  { name: 'Document & File Utilities', icon: <FileText className="h-4 w-4" /> },
  { name: 'Image & Media Tools', icon: <ImageIcon className="h-4 w-4" /> },
  { name: 'Calculators & Converters', icon: <Calculator className="h-4 w-4" /> },
  { name: 'Everyday Office/Personal Helpers', icon: <HelpCircle className="h-4 w-4" /> },
];

export const CategoryFilter: React.FC = () => {
  const { activeCategory, setActiveCategory, tools } = useCurrentContext();

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return tools.length;
    return tools.filter((t) => t.category === catName).length;
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map(({ name, icon }) => {
        const isActive = activeCategory === name;
        const count = getCategoryCount(name);

        return (
          <button
            key={name}
            onClick={() => setActiveCategory(name)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-gray-400 hover:text-white border border-slate-800/80 shadow-xs'
            }`}
          >
            {icon}
            <span>{name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-gray-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
