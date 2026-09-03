'use client';

import React from 'react';
import { Crosshair } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full mt-16 select-none">
      {/* Top angled Halo edge - central plateau */}
      <div className="relative h-4 w-full bg-[#1A1A1A] overflow-hidden hidden sm:block">
        <div
          className="absolute inset-0 bg-[#1A1A1A]"
          style={{
            clipPath: 'polygon(0 100%, 0 16px, 33% 16px, 35% 0, 65% 0, 67% 16px, 100% 16px, 100% 100%, 0 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent 40%)',
            clipPath: 'polygon(0 100%, 0 16px, 33% 16px, 35% 0, 65% 0, 67% 16px, 100% 16px, 100% 100%, 0 100%)',
          }}
        />
      </div>

      {/* Main footer body - Halo structure, Toolip identity */}
      <div className="bg-[#1A1A1A] border-t border-white/[0.04]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* BACK TO TOP */}
          <button
            onClick={scrollToTop}
            className="w-full flex flex-col items-center gap-1.5 py-5 sm:py-6 group"
          >
            <span className="text-halo-cyan text-[10px] leading-none group-hover:text-white transition-colors">▲</span>
            <span className="font-mono text-[10px] tracking-[0.22em] font-bold text-halo-cyan group-hover:text-white transition-colors">
              BACK TO TOP
            </span>
          </button>

          {/* Dotted divider 1 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-[7px] opacity-25">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="h-[2px] w-[2px] bg-white rounded-full" />
              ))}
            </div>
          </div>

          {/* FOLLOW US */}
          <div className="py-7 sm:py-8 text-center">
            <div className="font-mono text-[10px] tracking-[0.22em] font-bold text-white/45 mb-5">FOLLOW US</div>
            <div className="flex items-center justify-center gap-5 sm:gap-7 flex-wrap">
              <a href="#" aria-label="X" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="#" aria-label="TikTok" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V8.93a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.2 8.2 0 0 0 4.76 1.52V6.84a4.82 4.82 0 0 1-1-.15z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="20" height="18" viewBox="0 0 24 24" fill="none"><path d="M23 12s0-3.5-.45-5.18a2.5 2.5 0 0 0-1.76-1.76C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.79.46A2.5 2.5 0 0 0 1.45 6.82C1 8.5 1 12 1 12s0 3.5.45 5.18a2.5 2.5 0 0 0 1.76 1.76c2.19.46 8.79.46 8.79.46s6.6 0 8.79-.46a2.5 2.5 0 0 0 1.76-1.76C23 15.5 23 12 23 12z" fill="currentColor" /><path d="M10 15.5l5-3.5-5-3.5v7z" fill="#1A1A1A" /></svg>
              </a>
              <a href="#" aria-label="Discord" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.6 4.1a19.5 19.5 0 0 0-4.8-1.5.4.4 0 0 0-.4.2 14 14 0 0 0-.6 1.2A18 18 0 0 0 9.4 4c-.2-.4-.4-.9-.6-1.2a.4.4 0 0 0-.4-.2A19.5 19.5 0 0 0 3.6 4.1a.4.4 0 0 0-.2.3A19 19 0 0 0 2 18.1a.4.4 0 0 0 .1.3A19.7 19.7 0 0 0 8 21a.4.4 0 0 0 .4-.2l1-1.3a.4.4 0 0 0-.2-.6A13 13 0 0 1 7 18c0-.2.1-.4.3-.5l.6-.6a.4.4 0 0 1 .4 0 10.6 10.6 0 0 0 8 0 .4.4 0 0 1 .4 0l.6.6c.2.1.3.3.3.5a13 13 0 0 1-2.2 1c-.2 0-.4.2-.2.6l1 1.3c0 .2.2.4.4.2a19.7 19.7 0 0 0 5.9-2.6.4.4 0 0 0 .1-.3A19 19 0 0 0 20.8 4.4a.4.4 0 0 0-.2-.3zM9.7 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm4.9 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor"><path d="M6.5 18V9.8h2.7l.4-2.9H6.5V4.9c0-.8.3-1.4 1.6-1.4h1.3V.7S8.2.5 7 .5C4.5.5 2.9 2 2.9 4.6V6.9H0v2.9h2.9V18h3.6z"/></svg>
              </a>
              <a href="#" aria-label="Twitch" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 3l2 3v10h4l3 3h3l4-4V3H4z" /><path d="M13 8v5M17 8v5" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </a>
              <a href="#" aria-label="Bluesky" className="text-white hover:text-halo-cyan transition-colors">
                <svg width="18" height="16" viewBox="0 0 24 20" fill="currentColor"><path d="M12 9.5c-1.2-2.2-4.5-6.3-7.5-4.3C1.1 7.2 2 12.5 4.8 14c2.2 1.2 3.3-.3 4.2-1.7.3-.5 1.7-.5 2 0 .9 1.4 2 2.9 4.2 1.7 2.8-1.5 3.7-6.8.3-8.8-3-2-6.3 2.1-7.5 4.3z"/></svg>
              </a>
            </div>
          </div>

          {/* Dotted divider 2 */}
          <div className="flex justify-center pb-7 sm:pb-8">
            <div className="flex items-center gap-[7px] opacity-25">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="h-[2px] w-[2px] bg-white rounded-full" />
              ))}
            </div>
          </div>

          {/* Bottom brand row — Toolip only */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-7 sm:pb-8">
            {/* Left: Toolip */}
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 clip-chamfer bg-gradient-to-br from-halo-cyan to-halo-electric p-[1.5px] shadow-halo">
                <div className="h-full w-full clip-chamfer bg-[#1A1A1A] flex items-center justify-center">
                  <Crosshair className="h-5 w-5 text-halo-cyan" />
                </div>
              </div>
              <div className="leading-none">
                <div className="font-display text-[18px] tracking-[0.08em] text-white">TOOLIP</div>
                <div className="font-mono text-[8px] tracking-[0.18em] font-bold text-white/40">EVERYDAY UTILITIES • 31 TOOLS</div>
              </div>
              <span className="hidden sm:inline-flex ml-2 px-2 py-1 bg-white/[0.06] border border-white/10 clip-chamfer-sm font-mono text-[8px] tracking-[0.16em] font-bold text-white/40">
                CLIENT-SIDE • NO CLOUD
              </span>
            </div>

            {/* Right: Build meta */}
            <div className="flex flex-col sm:items-end items-center gap-1 text-center sm:text-right">
              <div className="font-mono text-[11px] tracking-[0.08em] font-bold text-white/60">
                © 2026 TOOLIP • BUILT WITH NEXT.JS & TAILWIND
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] text-white/30">
                ALL SYSTEMS NOMINAL • ZERO TELEMETRY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom legal bar — Toolip, not Microsoft */}
      <div className="bg-black border-t border-white/[0.06]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-white/50">
            <span className="h-5 w-5 rounded-full border border-white/15 flex items-center justify-center text-[10px]">◯</span>
            <span>United States - English</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-white/45 text-center">
            <a href="/progress" className="hover:text-halo-cyan transition-colors">Progress</a>
            <span className="opacity-20">•</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <span className="opacity-20">•</span>
            <span className="text-white/25">Toolip 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
