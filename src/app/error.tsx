'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Toolip Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gunmetal text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="h-[2px] fixed top-0 left-0 right-0 bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />

      <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-rose-500/50 via-halo-cyan/30 to-transparent max-w-lg w-full">
        <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#0A0D1A] p-8 space-y-6">
          <div className="mx-auto h-16 w-16 clip-chamfer bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs font-bold text-rose-400 tracking-[0.2em] uppercase">
              ERROR 500 • RUNTIME EXCEPTION
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-white">
              SOMETHING WENT WRONG
            </h1>
            <p className="font-mono text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
              An unexpected client runtime exception occurred. Your local cache remains safely intact.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-halo-cyan text-gunmetal-900 font-mono text-xs font-black tracking-[0.14em] clip-chamfer-sm hover:bg-halo-cyan/90 transition-colors uppercase"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs font-bold text-white clip-chamfer-sm transition-colors uppercase"
            >
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
