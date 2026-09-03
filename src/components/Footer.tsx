'use client';

import React from 'react';
import { Wrench, Heart, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-800 bg-gray-950/80 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-sm">Toolip — Everyday Internet Utilities</span>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Built with Next.js, Express.js & Tailwind CSS. Powered by <span className="font-mono text-sky-400">CurrentContext.tsx</span> status tracker.
          </p>

          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="hover:text-white cursor-pointer">19 Everyday Tools</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Client-Side Fast Processing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
