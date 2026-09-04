'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Shield,
  Lock,
  FileText,
  CheckCircle2,
  Search,
  Printer,
  ArrowLeft,
  RotateCcw,
  Sun,
  Moon,
  Crosshair,
  Hexagon,
  Eye,
  Copy,
  Check,
  Zap,
  ServerOff,
  Database
} from 'lucide-react';

interface Props {
  initialTab?: 'privacy' | 'terms';
}

export const TermsAndPrivacyContent: React.FC<Props> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const [isLightReadingMode, setIsLightReadingMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const privacySections = [
    {
      id: 'client-side-privacy',
      title: '1. Privacy Philosophy: 100% Client-Side Architecture',
      content: `Toolip is engineered around a strict "Client-Side First" architecture. Unlike traditional web applications that upload your inputs, text, files, and calculations to remote servers for processing, Toolip performs all tasks natively inside your local web browser.

Key guarantees:
• No Server Payload Uploads: Your PDFs, SVG edits, notes, financial data, and checklists never leave your computer or mobile device.
• Zero Data Mining: We do not analyze, index, train models on, or monetize your text or files.
• No Account Registration: You do not need to register, provide an email address, or log in to access any of our 31+ utilities.`
    },
    {
      id: 'local-storage-cache',
      title: '2. Local Cache & Browser Storage (LocalStorage)',
      content: `To ensure you do not lose your active work when refreshing or closing browser tabs, Toolip utilizes your browser's native localStorage API.

How it works:
• Data Persistence: When you type in tools (e.g. Note to PDF, Checklist Maker, Invoice Generator, Expense Tracker), your data is automatically mirrored to your browser's local cache key (e.g., toolip_invoice_data, toolip_checklist_items).
• Exclusive Device Ownership: This cached data is stored locally in your browser's application memory. It is inaccessible to external websites and is never transmitted to us.
• Reset Controls: Every tool that uses persistent storage features a prominent "Reset / Clear Saved Data" button, allowing you to instantly wipe cached entries from your machine whenever desired.`
    },
    {
      id: 'file-and-media-handling',
      title: '3. Handling of Uploaded Files & Media',
      content: `When using file processing utilities (such as Image to PDF, HTML to PDF conversion, or SVG Editing):

• Files are parsed using local JavaScript Web APIs (Canvas, FileReader, and WebAssembly where applicable).
• No temporary file creation occurs on any server.
• Converted files (e.g., rendered PDF documents) are compiled in browser RAM memory and triggered as immediate local file downloads.`
    },
    {
      id: 'cookies-and-analytics',
      title: '4. Zero Tracking Cookies & Analytics Policy',
      content: `Toolip operates with complete respect for user privacy:

• No Third-Party Tracking Pixels: We do not embed Google Analytics, Facebook Pixel, Hotjar, or advertising telemetry scripts.
• No Tracking Cookies: Toolip does not store profiling or advertising cookies in your browser.
• Static Web Hosting: Any standard HTTP requests sent when fetching website code assets (JS/CSS bundles) are subject only to basic static Web Host server logs (IP address and User-Agent) necessary for network delivery and DDoS mitigation.`
    },
    {
      id: 'user-data-rights',
      title: '5. Your Data Control & Total Deletion',
      content: `Because we hold none of your personal data on server databases, you retain 100% control over your data lifecycle at all times:

• Clearing Cache: You can clear all saved Toolip data by clicking the "Reset Data" button on any individual tool or by clearing your browser's site storage for Toolip.
• Instant Data Wipe: Clearing your browser cache permanently removes all saved drafts, checklists, templates, and history.`
    },
    {
      id: 'privacy-contact',
      title: '6. Privacy Questions & Open Source Verification',
      content: `If you have questions regarding Toolip's client-side security architecture or wish to audit our codebase, you are welcome to inspect our open source code repositories or contact our developer team at support@toolip.app.`
    }
  ];

  const termsSections = [
    {
      id: 'terms-overview',
      title: '1. Acceptance of Terms & Overview',
      content: `By accessing and using Toolip (referred to as "the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. Toolip provides a suite of 31+ web utilities and developer productivity applications free of charge for personal, professional, and commercial use.`
    },
    {
      id: 'acceptable-use',
      title: '2. Permitted & Acceptable Use',
      content: `You are granted a non-exclusive, worldwide, royalty-free license to use Toolip's tools for any lawful purpose.

You agree NOT to:
• Attempt to reverse engineer or disrupt the infrastructure delivering static assets.
• Use automated scraping or bot attacks to overload static asset distribution networks.
• Utilize generated tools or documents for unlawful, fraudulent, or malicious purposes.`
    },
    {
      id: 'intellectual-property',
      title: '3. Ownership & Generated Output Rights',
      content: `• Your Content Rights: You retain 100% full ownership, copyright, and intellectual property rights to any text, code, graphics, invoices, or PDF documents created using Toolip. We claim zero rights or royalties over your creations.
• Platform Rights: The design, interface code, brand logo, software logic, and asset components of Toolip are protected by copyright and intellectual property laws.`
    },
    {
      id: 'disclaimer-warranties',
      title: '4. Disclaimer of Warranties ("As-Is")',
      content: `Toolip is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.

While we strive for absolute accuracy across all tools (including EMI calculators, sleep cycle algorithms, CGPA converters, and tax splitters), Toolip makes no guarantees regarding error-free operational performance, mathematical infallibility, or suitability for critical financial or legal decisions. Users should independently verify calculations prior to official execution.`
    },
    {
      id: 'limitation-of-liability',
      title: '5. Limitation of Liability',
      content: `In no event shall Toolip, its developers, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of data, revenues, or productivity) arising from your use or inability to use the platform or its tools.`
    },
    {
      id: 'modifications-governing-law',
      title: '6. Service Modifications & Governing Law',
      content: `We reserve the right to add, update, modify, or deprecate individual tools at any time to improve system performance. These terms are governed by standard internet utility regulations and applicable copyright laws.`
    }
  ];

  const currentSections = activeTab === 'privacy' ? privacySections : termsSections;

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentSections;
    const q = searchQuery.toLowerCase();
    return currentSections.filter(
      (sec) => sec.title.toLowerCase().includes(q) || sec.content.toLowerCase().includes(q)
    );
  }, [currentSections, searchQuery]);

  const copySummary = () => {
    const text = `Toolip Privacy & Security Guarantee:
100% Client-Side Processing • Zero Server Uploads • Zero Tracking Cookies • LocalStorage Cache Control.
Read full policy at https://toolip.app/privacy`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gunmetal text-white selection:bg-halo-cyan selection:text-black">
      {/* Top brand bar accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">

        {/* Top Header Card */}
        <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-white/10 to-vice-pink/30 shadow-halo">
          <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] p-6 sm:p-8">
            <div className="absolute inset-0 hex-grid opacity-[0.04] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-halo-cyan hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Home
                  </Link>
                  <span className="text-white/20">•</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 clip-chamfer-sm font-mono text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                    <Shield className="h-3 w-3" /> 100% Client-Side Secured
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl tracking-wide text-white uppercase leading-none">
                  {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h1>
                <p className="font-mono text-xs text-white/50 tracking-wider">
                  Effective Date: September 2026 • Version 1.0 • Built for Ultra-Smooth Reading
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Reading Canvas Theme Switcher */}
                <button
                  onClick={() => setIsLightReadingMode(!isLightReadingMode)}
                  className={`flex items-center gap-2 px-3.5 py-2 clip-chamfer-sm border font-mono text-xs font-bold transition-all ${
                    isLightReadingMode
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                      : 'bg-gunmetal-700 border-white/20 text-white/70 hover:text-white'
                  }`}
                  title="Toggle Light Reading Mode"
                >
                  {isLightReadingMode ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-400" />
                      <span>Light Reading View</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-halo-cyan" />
                      <span>Dark Glass View</span>
                    </>
                  )}
                </button>

                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white clip-chamfer-sm font-mono text-xs font-bold transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>

                {/* Copy Summary */}
                <button
                  onClick={copySummary}
                  className="flex items-center gap-1.5 px-3 py-2 bg-halo-cyan/10 hover:bg-halo-cyan/20 border border-halo-cyan/30 text-halo-cyan clip-chamfer-sm font-mono text-xs font-bold transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {/* Quick Policy Switcher Tabs */}
            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-4 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider uppercase transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-halo-cyan text-gunmetal-900 shadow-halo'
                    : 'bg-white/[0.04] text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Shield className="h-4 w-4" /> Privacy Policy
              </button>

              <button
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-2 px-4 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider uppercase transition-all ${
                  activeTab === 'terms'
                    ? 'bg-halo-cyan text-gunmetal-900 shadow-halo'
                    : 'bg-white/[0.04] text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <FileText className="h-4 w-4" /> Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 clip-chamfer bg-gunmetal-800/60 border border-halo-cyan/20 space-y-1.5">
            <div className="flex items-center gap-2 text-halo-cyan font-mono text-xs font-bold uppercase">
              <ServerOff className="h-4 w-4" /> 0% Server Processing
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              All files, images, PDFs, and notes are rendered purely inside your device memory.
            </p>
          </div>

          <div className="p-4 clip-chamfer bg-gunmetal-800/60 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <Database className="h-4 w-4" /> Local Storage Only
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Tool drafts are saved locally in your browser cache so work is never lost on refresh.
            </p>
          </div>

          <div className="p-4 clip-chamfer bg-gunmetal-800/60 border border-vice-pink/20 space-y-1.5">
            <div className="flex items-center gap-2 text-vice-pink font-mono text-xs font-bold uppercase">
              <Eye className="h-4 w-4" /> No Analytics / Trackers
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              No tracking cookies, marketing pixels, or third-party behavioral profiling scripts.
            </p>
          </div>

          <div className="p-4 clip-chamfer bg-gunmetal-800/60 border border-amber-400/20 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
              <RotateCcw className="h-4 w-4" /> 1-Click Reset Control
            </div>
            <p className="font-mono text-xs text-white/60 leading-relaxed">
              Clear your saved templates and cached entries instantly on any tool whenever you want.
            </p>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="relative clip-chamfer bg-gunmetal-800/40 border border-white/10 p-3 flex items-center gap-3">
          <Search className="h-4 w-4 text-white/40 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search within ${activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} (e.g. storage, pdf, cookies, license)...`}
            className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-white/30 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/70 font-mono text-xs rounded clip-chamfer-sm"
            >
              Clear
            </button>
          )}
        </div>

        {/* Main Content Layout: Table of Contents + Reading Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Sticky Table of Contents Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="clip-chamfer bg-gunmetal-800/60 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-mono text-xs font-bold text-halo-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Hexagon className="h-3.5 w-3.5" /> Table of Contents
                </span>
                <span className="font-mono text-[10px] text-white/40">{filteredSections.length} Sections</span>
              </div>

              <nav className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {currentSections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => setActiveSection(sec.id)}
                      className={`block px-3 py-2 clip-chamfer-sm font-tech text-xs transition-all ${
                        isActive
                          ? 'bg-halo-cyan/20 border-l-2 border-halo-cyan text-halo-cyan font-bold pl-3.5'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {sec.title}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Data Privacy Reset Box */}
            <div className="clip-chamfer bg-gradient-to-br from-gunmetal-800 to-[#0A0F1D] border border-halo-cyan/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-halo-cyan font-mono text-xs font-bold uppercase">
                <Zap className="h-4 w-4" /> Browser LocalStorage
              </div>
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                Want to clear all cached settings and draft templates saved across Toolip tools on this device?
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all Toolip localStorage entries on this browser?')) {
                    localStorage.clear();
                    alert('All local storage entries for Toolip have been reset.');
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 clip-chamfer-sm font-mono text-xs font-bold transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear All LocalStorage Cache
              </button>
            </div>
          </div>

          {/* Right Column: Ultra-Light, Smooth Reading Canvas */}
          <div className="lg:col-span-8">
            <div
              className={`rounded-2xl transition-colors duration-300 p-6 sm:p-10 shadow-2xl border ${
                isLightReadingMode
                  ? 'bg-slate-50 text-slate-900 border-slate-200 shadow-slate-900/10'
                  : 'bg-gunmetal-800/80 text-gray-100 border-white/10 shadow-black/40'
              }`}
            >
              {filteredSections.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Search className={`h-8 w-8 mx-auto ${isLightReadingMode ? 'text-slate-400' : 'text-white/30'}`} />
                  <p className={`font-mono text-sm ${isLightReadingMode ? 'text-slate-600' : 'text-white/40'}`}>
                    No matching clauses found for "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="space-y-10 divide-y divide-slate-200/60 dark:divide-white/10">
                  {filteredSections.map((sec, idx) => (
                    <section
                      key={sec.id}
                      id={sec.id}
                      className={`scroll-mt-28 ${idx > 0 ? 'pt-8' : ''}`}
                    >
                      <h2
                        className={`text-lg sm:text-xl font-bold font-tech tracking-wide mb-4 flex items-center gap-2.5 ${
                          isLightReadingMode ? 'text-slate-900' : 'text-halo-cyan'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isLightReadingMode ? 'bg-halo-cyan' : 'bg-halo-cyan'}`} />
                        {sec.title}
                      </h2>

                      <div
                        className={`font-sans text-sm sm:text-[15px] leading-relaxed whitespace-pre-line tracking-normal ${
                          isLightReadingMode ? 'text-slate-700 font-medium' : 'text-gray-300'
                        }`}
                      >
                        {sec.content}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* Bottom Canvas Footer Guarantee */}
              <div
                className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
                  isLightReadingMode
                    ? 'border-slate-200 text-slate-500'
                    : 'border-white/10 text-white/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Toolip Privacy & Terms standard verified</span>
                </div>
                <div>Last updated: September 2026</div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
