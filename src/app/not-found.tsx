import React from 'react';
import Link from 'next/link';
import { Crosshair, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gunmetal text-white flex flex-col items-center justify-center p-6 text-center space-y-6 selection:bg-halo-cyan selection:text-black">
      <div className="h-[2px] fixed top-0 left-0 right-0 bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />

      <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-vice-pink/50 via-halo-cyan/30 to-transparent max-w-lg w-full">
        <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#0A0D1A] p-8 space-y-6">
          <div className="mx-auto h-16 w-16 clip-chamfer bg-vice-pink/10 border border-vice-pink/30 flex items-center justify-center text-vice-pink shadow-halo">
            <Crosshair className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs font-bold text-vice-pink tracking-[0.2em] uppercase">
              ERROR 404 • ROUTE UNMAPPED
            </div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-white">
              PAGE NOT FOUND
            </h1>
            <p className="font-mono text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
              The utility route or tool requested does not exist or has been relocated.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-halo-cyan text-gunmetal-900 font-mono text-xs font-black tracking-[0.14em] clip-chamfer-sm hover:bg-halo-cyan/90 transition-colors uppercase"
            >
              <Home className="h-4 w-4" /> Return to Tools
            </Link>
            <Link
              href="/faq"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs font-bold text-white clip-chamfer-sm transition-colors uppercase"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
