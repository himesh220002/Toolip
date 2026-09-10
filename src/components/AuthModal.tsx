'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogIn, UserPlus, X, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = getApiBaseUrl();
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
          throw new Error('Backend server is waking up or unavailable. Please try again in a few seconds.');
        }
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${res.status}): ${res.statusText || 'Unexpected response'}`);
        }
      }

      if (!res.ok) {
        throw new Error(data.error || `${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
      }

      // Save token and user info
      localStorage.setItem('toolip_auth_token', data.token);
      localStorage.setItem('toolip_user_data', JSON.stringify(data.user));

      setSuccessMsg(mode === 'login' ? 'Successfully logged in!' : 'Account created successfully!');
      
      // Fire global event to notify Navbar and other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('toolip_auth_change'));
      }

      setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setPassword('');
        setSuccessMsg(null);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#0B0F19] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background ambient light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-tech font-bold text-lg text-white tracking-wide">
                {mode === 'login' ? 'Welcome Back' : 'Create Toolip Account'}
              </h2>
              <p className="font-mono text-xs text-white/50">
                {mode === 'login' ? 'Sign in to access your saved tools & sync' : 'Join Toolip to unlock real-time collaboration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-tech text-xs font-bold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-white/60 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 focus:border-cyan-500/50 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none transition"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] text-white/60 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 focus:border-cyan-500/50 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] text-white/60 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 focus:border-cyan-500/50 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-tech font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="px-6 py-4 bg-slate-900/40 border-t border-white/5 text-center font-mono text-xs text-white/50">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
