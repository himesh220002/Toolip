'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentContext, ToolStatus, ToolItem } from '@/context/CurrentContext';
import { ArrowLeft, Tag, Share2, Check, Crosshair, Shield, Hexagon, Activity, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { ToolSeoSection } from '@/components/ToolSeoSection';
import { getToolSeoData } from '@/lib/seoData';
import { Footer } from '@/components/Footer';

// Tool Components Imports
import { PdfTools } from '@/components/tools/PdfTools';
import { ImageToPdf } from '@/components/tools/ImageToPdf';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { MarkdownToHtml } from '@/components/tools/MarkdownToHtml';
import { FileConverter } from '@/components/tools/FileConverter';
import { NoteToPdf } from '@/components/tools/NoteToPdf';
import { TableToCsv } from '@/components/tools/TableToCsv';
import { SvgCodeEditor } from '@/components/tools/SvgCodeEditor';
import { PassportPhotoMaker } from '@/components/tools/PassportPhotoMaker';
import { PhotoCompressor } from '@/components/tools/PhotoCompressor';
import { QrGenerator } from '@/components/tools/QrGenerator';
import { TextToSpeech } from '@/components/tools/TextToSpeech';
import { SpeechToText } from '@/components/tools/SpeechToText';
import { SignatureGenerator } from '@/components/tools/SignatureGenerator';
import { AgeCalculator } from '@/components/tools/AgeCalculator';
import { EmiCalculator } from '@/components/tools/EmiCalculator';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { PercentageCalculator } from '@/components/tools/PercentageCalculator';
import { CgpaConverter } from '@/components/tools/CgpaConverter';
import { ExpenseTracker } from '@/components/tools/ExpenseTracker';
import { WordCounter } from '@/components/tools/WordCounter';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { BillSplitter } from '@/components/tools/BillSplitter';
import { WaterCalculator } from '@/components/tools/WaterCalculator';
import { MeetingScheduler } from '@/components/tools/MeetingScheduler';
import { ResumeFormatter } from '@/components/tools/ResumeFormatter';
import { ChecklistMaker } from '@/components/tools/ChecklistMaker';
import { InvoiceGenerator } from '@/components/tools/InvoiceGenerator';
import { FormFiller } from '@/components/tools/FormFiller';
import { SleepCalculator } from '@/components/tools/SleepCalculator';
import { TipCalculator } from '@/components/tools/TipCalculator';
import { HtmlToPdf } from '@/components/tools/HtmlToPdf';
import { LoanCalculator } from '@/components/tools/LoanCalculator';
import { MindMapEditor } from '@/components/tools/MindMapEditor';

const STATUS_TAGS: { value: ToolStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'working', label: 'Working' },
  { value: 'completed', label: 'Completed' },
  { value: 'review needed', label: 'Review Needed' },
  { value: 'upgrade needed', label: 'Upgrade Needed' },
  { value: 'upgraded', label: 'Upgraded' },
  { value: 'dropped', label: 'Dropped' },
];

interface Props {
  toolId: string;
  initialTool?: ToolItem;
}

export const ToolDetailClient: React.FC<Props> = ({ toolId, initialTool }) => {
  const { tools, updateToolStatus } = useCurrentContext();
  const tool = tools.find((t) => t.id === toolId) || initialTool;
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState<boolean>(false);

  // Lock document scroll when expanded
  React.useEffect(() => {
    if (isWorkspaceExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isWorkspaceExpanded]);

  // Press Esc to exit expanded workspace mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWorkspaceExpanded) {
        setIsWorkspaceExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWorkspaceExpanded]);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gunmetal text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 clip-chamfer bg-vice-pink/10 border border-vice-pink/30 flex items-center justify-center text-vice-pink">
          <Crosshair className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl tracking-[0.08em] text-vice-pink">NOT FOUND</h1>
        <p className="font-mono text-sm text-white/40 max-w-md">
          Tool "{toolId}" not found in the collection.
        </p>
        <Link href="/" className="px-5 py-2.5 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-mono text-xs font-black tracking-[0.14em]">
          ← RETURN TO TOOLS
        </Link>
      </div>
    );
  }

  const seoData = getToolSeoData(tool.id, tool.title, tool.description, tool.category);

  const copyShareableUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const renderComponent = () => {
    switch (tool.id) {
      case 'pdf-merger': return <PdfTools />;
      case 'image-to-pdf': return <ImageToPdf />;
      case 'json-formatter': return <JsonFormatter />;
      case 'markdown-to-html':
      case 'markdown-html': return <MarkdownToHtml />;
      case 'file-converter': return <FileConverter />;
      case 'note-to-pdf': return <NoteToPdf />;
      case 'html-to-pdf': return <HtmlToPdf />;
      case 'table-to-csv': return <TableToCsv />;
      case 'svg-code-editor': return <SvgCodeEditor />;
      case 'passport-photo-maker': return <PassportPhotoMaker />;
      case 'photo-reducer': return <PhotoCompressor />;
      case 'qr-generator': return <QrGenerator />;
      case 'text-to-speech': return <TextToSpeech />;
      case 'speech-to-text': return <SpeechToText />;
      case 'signature-generator': return <SignatureGenerator />;
      case 'age-calculator': return <AgeCalculator />;
      case 'emi-calculator': return <EmiCalculator />;
      case 'unit-converter': return <UnitConverter />;
      case 'percentage-calculator': return <PercentageCalculator />;
      case 'cgpa-converter': return <CgpaConverter />;
      case 'expense-tracker': return <ExpenseTracker />;
      case 'word-counter': return <WordCounter />;
      case 'password-generator': return <PasswordGenerator />;
      case 'bill-splitter': return <BillSplitter />;
      case 'water-calculator': return <WaterCalculator />;
      case 'meeting-scheduler': return <MeetingScheduler />;
      case 'resume-formatter': return <ResumeFormatter />;
      case 'checklist-maker': return <ChecklistMaker />;
      case 'invoice-generator': return <InvoiceGenerator />;
      case 'form-filler': return <FormFiller />;
      case 'sleep-calculator': return <SleepCalculator />;
      case 'tip-calculator':
      case 'mind-map-editor': return <MindMapEditor isExpanded={isWorkspaceExpanded} />;
      case 'loan-calculator':
      case 'loan-emi-calculator': return <LoanCalculator />;
      default: return <div className="p-8 text-center font-mono text-sm text-white/40">Component loading — please wait.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gunmetal/85 text-gray-100 flex flex-col selection:bg-vice-pink selection:text-white">
      {/* Accent hairline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />

      {/* Header - Halo command bar */}
      <header className="sticky top-0 z-40 bg-gunmetal-900/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />
        <div className="relative max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs min-w-0">
              <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-halo-cyan/10 border border-white/10 hover:border-halo-cyan/30 clip-chamfer-sm font-mono text-[11px] tracking-[0.12em] font-bold text-white/70 hover:text-halo-cyan transition-colors shrink-0">
                <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">TOOLS</span>
              </Link>
              <span className="hidden sm:block text-white/15">/</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] font-bold text-white/30 truncate">
                <Hexagon className="h-3 w-3 text-halo-cyan/50" /> {tool.category.toUpperCase()}
              </span>
              <span className="hidden sm:block text-white/15">/</span>
              <span className="font-tech font-bold text-sm sm:text-base tracking-[0.04em] text-white truncate max-w-[160px] sm:max-w-md">{tool.title.toUpperCase()}</span>
              <span className="hidden lg:inline-flex px-1.5 py-0.5 bg-emerald-400/10 border border-emerald-400/20 clip-chamfer-sm font-mono text-[8px] tracking-[0.14em] font-bold text-emerald-300">● ONLINE</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-white/30" />
                <select
                  value={tool.status}
                  onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
                  className="bg-gunmetal-800 border border-white/10 clip-chamfer-sm px-2.5 py-1.5 font-mono text-xs font-bold tracking-[0.08em] text-white focus:outline-none focus:border-halo-cyan/40 cursor-pointer"
                >
                  {STATUS_TAGS.map((st) => (
                    <option key={st.value} value={st.value} className="bg-gunmetal-900">{st.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={copyShareableUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gunmetal-800 hover:bg-vice-pink hover:text-white border border-white/10 hover:border-vice-pink clip-chamfer-sm font-mono text-xs font-bold tracking-[0.10em] text-white/70 transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'COPIED' : 'SHARE'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Briefing header — Tool overview */}
        <div className="relative clip-chamfer-lg p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-vice-pink/30 to-vice-violet/40 shadow-halo">
          <div className="relative clip-chamfer-lg bg-gradient-to-br from-gunmetal-700 via-gunmetal-800 to-gunmetal-900 overflow-hidden">
            <div className="absolute inset-0 hex-grid opacity-[0.04] pointer-events-none" />
            <div className="absolute inset-0 vice-grain opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-halo-cyan/40 to-transparent" />
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-halo-cyan/40 hidden sm:block pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-vice-pink/40 hidden sm:block pointer-events-none" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-mono text-[9px] tracking-[0.18em] font-black">
                      <Crosshair className="h-3 w-3" /> TOOL OVERVIEW
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 clip-chamfer-sm font-mono text-[9px] tracking-[0.14em] font-bold text-white/50">
                      <Shield className="h-3 w-3 text-halo-cyan" /> {tool.category.toUpperCase()}
                    </span>
                  </div>

                  <h1 className="font-display text-[32px] sm:text-5xl lg:text-[54px] leading-[0.9] tracking-[0.01em] text-white">
                    {tool.title.toUpperCase()}
                  </h1>
                  <p className="font-tech font-medium text-[15px] sm:text-[17px] lg:text-[18px] leading-relaxed text-white/70 max-w-3xl border-l-2 border-halo-cyan/30 pl-4 sm:pl-5">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] font-bold text-white/30 pt-1">
                    <Activity className="h-3 w-3 text-emerald-400" /> ID: {tool.id.toUpperCase()} • STATUS: {tool.status.toUpperCase()}
                  </div>
                </div>

                {tool.features && (
                  <div className="lg:w-[380px] shrink-0">
                    <div className="font-mono text-[10px] tracking-[0.18em] font-bold text-halo-cyan mb-3 flex items-center gap-2">
                      <span className="h-px w-6 bg-halo-cyan/40" /> CAPABILITIES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feat, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-2 bg-black/30 border border-white/10 clip-chamfer-sm font-mono text-[11px] tracking-[0.06em] font-bold text-white/80">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" /> {feat.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between px-4 sm:px-6 py-2 bg-black/30 border-t border-white/10 font-mono text-[8px] tracking-[0.14em] font-bold text-white/20">
              <span>READY TO USE — CLIENT-SIDE & PRIVATE</span>
              <span className="hidden sm:inline text-halo-cyan/50">▶ OPEN TO BEGIN</span>
            </div>
          </div>
        </div>

        {/* Workspace - Halo terminal */}
        <div className={
          isWorkspaceExpanded
            ? "fixed top-[60px] inset-x-[10px] bottom-0 z-50 bg-[#0A0F1F] flex flex-col m-0 p-0 rounded-none border-t border-l border-r border-white/10 shadow-2xl overflow-hidden"
            : "relative clip-chamfer p-[1.5px] bg-gradient-to-br from-white/10 via-white/5 to-transparent"
        }>
          <div className={`relative bg-[#0A0F1F] overflow-hidden flex flex-col ${isWorkspaceExpanded ? 'h-full w-full rounded-none flex-1 min-h-0' : 'clip-chamfer'}`}>
            {/* Terminal header */}
            <div className={`flex items-center justify-between bg-gunmetal-900 border-b border-white/10 shrink-0 transition-all ${
              isWorkspaceExpanded ? 'px-3 sm:px-4 py-1.5 min-h-[36px]' : 'px-4 sm:px-6 py-3.5'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`clip-chamfer-sm bg-halo-cyan/15 border border-halo-cyan/30 flex items-center justify-center text-halo-cyan transition-all ${
                  isWorkspaceExpanded ? 'h-6 w-6' : 'h-8 w-8'
                }`}>
                  <Zap className={isWorkspaceExpanded ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </div>
                <div>
                  <div className={`font-tech font-bold tracking-[0.12em] text-white ${
                    isWorkspaceExpanded ? 'text-xs' : 'text-sm'
                  }`}>
                    {isWorkspaceExpanded ? 'TOOL WORKSPACE // ACTIVE' : 'TOOL WORKSPACE // ACTIVE'}
                  </div>
                  <div className={`font-mono tracking-[0.12em] font-bold text-white/40 ${
                    isWorkspaceExpanded ? 'text-[9px] hidden sm:block' : 'text-[10px]'
                  }`}>
                    CLIENT-SIDE • ZERO TELEMETRY • INSTANT
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.14em] font-bold text-white/30">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" /> ONLINE
                </div>

                <button
                  onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
                  title={isWorkspaceExpanded ? 'Minimize Workspace (Esc)' : 'Expand Workspace to Full Screen'}
                  className={`flex items-center gap-1.5 bg-white/[0.06] hover:bg-halo-cyan/20 border border-white/15 hover:border-halo-cyan/50 clip-chamfer-sm text-white/90 hover:text-halo-cyan transition-all cursor-pointer shadow-sm ${
                    isWorkspaceExpanded ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'
                  }`}
                >
                  {isWorkspaceExpanded ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5 text-vice-pink" />
                      <span className="font-bold tracking-widest">MINIMIZE</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5 text-halo-cyan" />
                      <span className="font-bold tracking-widest">EXPAND</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actual tool — dark armor surface so selectors stay visible */}
            <div className={`bg-[#080C18] text-white [&_select]:bg-gunmetal-800 [&_select]:text-white [&_select]:border-white/10 [&_input]:text-white [&_label]:text-white/60 ${
              isWorkspaceExpanded
                ? 'flex-1 overflow-y-auto p-[20px] flex flex-col min-h-0'
                : 'p-4 sm:p-6 lg:p-8 min-h-[460px]'
            }`}>
              <div className={`max-w-none text-[15px] leading-relaxed [&_p]:text-[15px] [&_h3]:text-lg [&_h2]:text-xl ${isWorkspaceExpanded ? 'flex-1 flex flex-col min-h-0' : ''}`}>
                {renderComponent()}
              </div>
            </div>

            {/* Terminal footer */}
            <div className="px-4 sm:px-6 py-2 bg-gunmetal-900 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[8px] tracking-[0.14em] font-bold text-white/25 shrink-0">
              <span>▶ DONE — YOUR DATA STAYS ON YOUR DEVICE • NO UPLOAD {isWorkspaceExpanded && '• PRESS ESC TO EXIT FULLSCREEN'}</span>
              <Link href="/" className="text-halo-cyan hover:text-white transition-colors">← RETURN TO TOOLS</Link>
            </div>
          </div>
        </div>

        {/* SEO Guide & JSON-LD FAQ Section */}
        <ToolSeoSection seoData={seoData} toolTitle={tool.title} />
      </main>

      {/* Global Site Footer */}
      <Footer />
    </div>
  );
};
