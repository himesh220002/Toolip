'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrentContext } from '@/context/CurrentContext';
import { Search, Hexagon, LogOut, ChevronDown, UserCheck, LogIn, UserPlus } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useCurrentContext();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const syncUser = useCallback(() => {
    try {
      const userStr = localStorage.getItem('toolip_user_data');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed && !parsed.isGuest) {
          setUser(parsed);
          return;
        }
      }
      setUser(null);
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    syncUser();

    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent;
      const mode = customEvent.detail?.mode || 'login';
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    };

    window.addEventListener('toolip_auth_change', syncUser);
    window.addEventListener('storage', syncUser);
    window.addEventListener('toolip_open_auth', handleOpenAuth);

    return () => {
      window.removeEventListener('toolip_auth_change', syncUser);
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('toolip_open_auth', handleOpenAuth);
    };
  }, [syncUser]);

  const handleLogout = () => {
    localStorage.removeItem('toolip_auth_token');
    localStorage.removeItem('toolip_user_data');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('toolip_auth_change'));
      if (window.location.search.includes('room=')) {
        window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
        window.location.reload();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top hazard accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange opacity-80" />

      <div className="relative bg-gunmetal-900/95 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-visible">
        <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />

        <div className="relative max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px] sm:h-[68px] gap-4">

            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
              <div className="relative h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center shrink-0">
                <Image
                  src="/images/Tooliplogo.svg"
                  alt="Toolip Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="leading-none">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[22px] sm:text-[24px] tracking-[0.04em] text-white leading-none">TOOLIP</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[8px] tracking-[0.18em] text-halo-cyan/80 border border-halo-cyan/20 bg-halo-cyan/10 px-2 py-0.5 clip-chamfer-sm font-bold">
                    <Hexagon className="h-2.5 w-2.5" /> UTILITY
                  </span>
                </div>
                <div className="font-mono text-[8px] tracking-[0.20em] font-bold text-white/40 mt-0.5 hidden sm:block">
                  34 TOOLS • READY TO USE
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

            {/* Right: Mobile search & User Profile / Login Action */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex md:hidden items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-28 sm:w-40 pl-7 pr-2 py-2 bg-[#0D1222] border border-white/10 clip-chamfer-sm font-mono text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-halo-cyan/30"
                  />
                </div>
              </div>

              {/* Logged-In User Profile with Hover Dropdown */}
              {user ? (
                <div className="relative group flex items-center pl-3 border-l border-white/10">
                  <button className="flex items-center gap-2 py-1.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition cursor-pointer shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-tech font-bold text-xs text-white max-w-[120px] truncate hidden sm:inline">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
                  </button>

                  {/* Hover Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-[99999] min-w-[220px]">
                    <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 text-slate-100 space-y-3 backdrop-blur-xl">
                      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-white truncate">{user.name}</div>
                          <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" /> SIGNED IN
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out & Unload Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 py-1.5 px-3 sm:px-4 bg-gradient-to-r from-cyan-500/15 via-halo-cyan/20 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl font-tech font-bold text-xs text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] transition cursor-pointer group"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="tracking-wide">LOG IN</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-xl font-tech font-bold text-xs text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-white/50" />
                    <span>SIGN UP</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-1.5 ml-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                    <span className="font-mono text-[9px] tracking-[0.16em] font-bold text-white/30">ONLINE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
};

