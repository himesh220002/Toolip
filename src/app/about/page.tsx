import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Crosshair, Hexagon, Zap, ServerOff, CheckCircle2, ArrowLeft, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Toolip — 100% Client-Side Privacy & Utility Philosophy',
  description: 'Learn about Toolip: a high-performance web utility platform built around 100% client-side privacy, zero server uploads, and instant browser execution.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gunmetal text-white selection:bg-halo-cyan selection:text-black">
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />
      <Navbar />

      <main className="flex-1 max-w-[1180px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Hero */}
        <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-white/10 to-vice-pink/30 shadow-halo">
          <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] p-6 sm:p-10 space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-halo-cyan hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 clip-chamfer-sm font-mono text-[9px] font-bold uppercase">
                Zero Telemetry Architecture
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl tracking-wide uppercase text-white leading-none">
              About Toolip
            </h1>
            <p className="font-tech text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed">
              Everyday utility tools should solve immediate problems without demanding sign-ups, subscriptions, or uploading your confidential files to remote cloud servers.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="clip-chamfer bg-gunmetal-800/60 border border-halo-cyan/20 p-6 space-y-3">
            <div className="h-10 w-10 clip-chamfer-sm bg-halo-cyan/10 border border-halo-cyan/30 flex items-center justify-center text-halo-cyan">
              <ServerOff className="h-5 w-5" />
            </div>
            <h3 className="font-tech font-bold text-lg text-white">100% Client-Side Processing</h3>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              All PDF rendering, image conversions, SVG editing, and math calculations execute natively inside your browser DOM.
            </p>
          </div>

          <div className="clip-chamfer bg-gunmetal-800/60 border border-emerald-500/20 p-6 space-y-3">
            <div className="h-10 w-10 clip-chamfer-sm bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-tech font-bold text-lg text-white">Zero Tracking & No Sign-ups</h3>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              No tracking cookies, no advertising pixels, and no mandatory account registrations. Instant utility access for everyone.
            </p>
          </div>

          <div className="clip-chamfer bg-gunmetal-800/60 border border-vice-pink/20 p-6 space-y-3">
            <div className="h-10 w-10 clip-chamfer-sm bg-vice-pink/10 border border-vice-pink/30 flex items-center justify-center text-vice-pink">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-tech font-bold text-lg text-white">Sub-Millisecond Speed</h3>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Because tools run locally on your device hardware, operations execute instantaneously with zero network latency.
            </p>
          </div>
        </div>

        {/* Detailed Philosophy Story */}
        <div className="clip-chamfer bg-gunmetal-800/40 border border-white/10 p-6 sm:p-10 space-y-6">
          <h2 className="font-display text-2xl text-white uppercase tracking-wider">
            Why We Built Toolip
          </h2>
          <div className="font-sans text-sm sm:text-[15px] text-gray-300 space-y-4 leading-relaxed">
            <p>
              Most online converters, PDF utilities, and formatting tools on the web today suffer from major drawbacks: intrusive ad popups, forced account walls, file size restrictions, and privacy risks caused by uploading private documents to external servers.
            </p>
            <p>
              Toolip was created to deliver a clean, cyber-aesthetic, single-destination platform containing 31+ essential tools that work offline in memory. Whether you are formatting JSON for API integration, creating passport photos under 80 KB, converting images to PDF, or splitting group restaurant bills, Toolip handles everything directly on your computer.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
