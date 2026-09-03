'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentContext, ToolStatus } from '@/context/CurrentContext';
import { ArrowLeft, Edit3, Save, Tag, Sparkles, CheckCircle2, ChevronRight, Share2, Copy, Check } from 'lucide-react';

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

const STATUS_TAGS: { value: ToolStatus; label: string; bg: string; text: string }[] = [
  { value: 'planned', label: 'Planned', bg: 'bg-purple-500/20 border-purple-500/30', text: 'text-purple-300' },
  { value: 'working', label: 'Working', bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-300' },
  { value: 'completed', label: 'Completed', bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-300' },
  { value: 'review needed', label: 'Review Needed', bg: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-300' },
  { value: 'upgrade needed', label: 'Upgrade Needed', bg: 'bg-rose-500/20 border-rose-500/30', text: 'text-rose-300' },
  { value: 'upgraded', label: 'Upgraded', bg: 'bg-teal-500/20 border-teal-500/30', text: 'text-teal-300' },
  { value: 'dropped', label: 'Dropped', bg: 'bg-gray-500/20 border-gray-500/30', text: 'text-gray-400' },
];

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.id as string;

  const { tools, updateToolStatus, updateToolNotes } = useCurrentContext();
  const tool = tools.find((t) => t.id === toolId);

  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>(tool?.notes || '');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-rose-400">Tool Not Found</h1>
        <p className="text-gray-400 max-w-md text-sm">
          The utility tool "{toolId}" could not be found or has been relocated.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/25"
        >
          ← Return to All Tools
        </Link>
      </div>
    );
  }

  const currentTagObj = STATUS_TAGS.find((st) => st.value === tool.status) || STATUS_TAGS[2];

  const handleSaveNotes = () => {
    updateToolNotes(tool.id, noteText);
    setIsEditingNotes(false);
  };

  const copyShareableUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const renderComponent = () => {
    switch (tool.id) {
      case 'pdf-merger':
        return <PdfTools />;
      case 'image-to-pdf':
        return <ImageToPdf />;
      case 'json-formatter':
        return <JsonFormatter />;
      case 'markdown-to-html':
      case 'markdown-html':
        return <MarkdownToHtml />;
      case 'file-converter':
        return <FileConverter />;
      case 'note-to-pdf':
        return <NoteToPdf />;
      case 'table-to-csv':
        return <TableToCsv />;
      case 'svg-code-editor':
        return <SvgCodeEditor />;
      case 'passport-photo-maker':
        return <PassportPhotoMaker />;
      case 'photo-reducer':
        return <PhotoCompressor />;
      case 'qr-generator':
        return <QrGenerator />;
      case 'text-to-speech':
        return <TextToSpeech />;
      case 'speech-to-text':
        return <SpeechToText />;
      case 'signature-generator':
        return <SignatureGenerator />;
      case 'age-calculator':
        return <AgeCalculator />;
      case 'emi-calculator':
        return <EmiCalculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'cgpa-converter':
        return <CgpaConverter />;
      case 'expense-tracker':
        return <ExpenseTracker />;
      case 'word-counter':
        return <WordCounter />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'bill-splitter':
        return <BillSplitter />;
      case 'water-calculator':
        return <WaterCalculator />;
      case 'meeting-scheduler':
        return <MeetingScheduler />;
      case 'resume-formatter':
        return <ResumeFormatter />;
      case 'checklist-maker':
        return <ChecklistMaker />;
      case 'invoice-generator':
        return <InvoiceGenerator />;
      case 'form-filler':
        return <FormFiller />;
      case 'sleep-calculator':
        return <SleepCalculator />;
      case 'tip-calculator':
        return <TipCalculator />;
      case 'html-to-pdf':
        return <HtmlToPdf />;
      case 'loan-calculator':
      case 'loan-emi-calculator':
        return <LoanCalculator />;
      default:
        return (
          <div className="p-8 text-center text-gray-400 text-sm">
            Component preview under active implementation.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Glassmorphic Navigation Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-indigo-400 font-bold border border-slate-800 transition-all shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Tools</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 font-medium hidden sm:inline">{tool.category}</span>
          <span className="text-gray-600 hidden sm:inline">/</span>
          <span className="font-extrabold text-white truncate max-w-[200px] sm:max-w-xs">{tool.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Tag Selector */}
          <div className="flex items-center space-x-1.5">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={tool.status}
              onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
              className={`bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer text-gray-200 shadow-md`}
            >
              {STATUS_TAGS.map((st) => (
                <option key={st.value} value={st.value} className="bg-slate-900 text-gray-200">
                  Tag: {st.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={copyShareableUrl}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all shadow-md"
            title="Copy shareable page URL"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied URL!' : 'Share Tool'}</span>
          </button>
        </div>
      </header>

      {/* Main Tool Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tool Header Card (CityAI / Litlow Workspace Aesthetic) */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden space-y-4 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>{tool.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{tool.title}</h1>
              <p className="text-sm text-gray-400 max-w-3xl leading-relaxed font-normal">{tool.description}</p>
            </div>

            {/* Feature Badges */}
            {tool.features && (
              <div className="flex flex-wrap gap-1.5">
                {tool.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-gray-300 text-[11px] font-mono font-medium"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Context Notes Drawer */}
          {/* <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex-1 flex items-start space-x-2">
              <span className="text-indigo-400 font-bold">Context Note:</span>
              {isEditingNotes ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 shadow-md"
                  >
                    <Save className="h-3 w-3" />
                    <span>Save</span>
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 italic font-medium">{tool.notes || 'No developer context notes recorded.'}</span>
              )}
            </div>

            {!isEditingNotes && (
              <button
                onClick={() => {
                  setNoteText(tool.notes || '');
                  setIsEditingNotes(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 text-[11px]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Note</span>
              </button>
            )}
          </div> */}
        </div>

        {/* Dedicated Tool Interactive Full-Page Workspace Component */}
        <div className="p-6 sm:p-8 bg-slate-900/80 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
}
