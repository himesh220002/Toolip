'use client';

import React, { useState } from 'react';
import { useCurrentContext, ToolItem, ToolStatus } from '@/context/CurrentContext';
import { X, Info, Edit3 } from 'lucide-react';

import { PdfTools } from './tools/PdfTools';
import { ImageToPdf } from './tools/ImageToPdf';
import { JsonFormatter } from './tools/JsonFormatter';
import { MarkdownToHtml } from './tools/MarkdownToHtml';
import { FileConverter } from './tools/FileConverter';
import { NoteToPdf } from './tools/NoteToPdf';
import { TableToCsv } from './tools/TableToCsv';
import { SvgCodeEditor } from './tools/SvgCodeEditor';
import { PhotoCompressor } from './tools/PhotoCompressor';
import { QrGenerator } from './tools/QrGenerator';
import { TextToSpeech } from './tools/TextToSpeech';
import { SpeechToText } from './tools/SpeechToText';
import { PassportPhotoMaker } from './tools/PassportPhotoMaker';
import { SignatureGenerator } from './tools/SignatureGenerator';
import { AgeCalculator } from './tools/AgeCalculator';
import { EmiCalculator } from './tools/EmiCalculator';
import { UnitConverter } from './tools/UnitConverter';
import { PercentageCalculator } from './tools/PercentageCalculator';
import { CgpaConverter } from './tools/CgpaConverter';
import { ExpenseTracker } from './tools/ExpenseTracker';
import { WordCounter } from './tools/WordCounter';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { BillSplitter } from './tools/BillSplitter';
import { WaterCalculator } from './tools/WaterCalculator';
import { MeetingScheduler } from './tools/MeetingScheduler';
import { ResumeFormatter } from './tools/ResumeFormatter';
import { ChecklistMaker } from './tools/ChecklistMaker';
import { InvoiceGenerator } from './tools/InvoiceGenerator';
import { FormFiller } from './tools/FormFiller';

interface ToolViewerModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

export const ToolViewerModal: React.FC<ToolViewerModalProps> = ({ tool, onClose }) => {
  const { updateToolStatus, updateToolNotes } = useCurrentContext();
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>(tool?.notes || '');

  if (!tool) return null;

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'pdf-merger':
        return <PdfTools />;
      case 'image-to-pdf':
        return <ImageToPdf />;
      case 'json-formatter':
        return <JsonFormatter />;
      case 'markdown-to-html':
        return <MarkdownToHtml />;
      case 'file-converter':
        return <FileConverter />;
      case 'note-to-pdf':
        return <NoteToPdf />;
      case 'table-to-csv':
        return <TableToCsv />;
      case 'svg-code-editor':
        return <SvgCodeEditor />;
      case 'photo-reducer':
        return <PhotoCompressor />;
      case 'qr-generator':
        return <QrGenerator />;
      case 'text-to-speech':
        return <TextToSpeech />;
      case 'speech-to-text':
        return <SpeechToText />;
      case 'passport-photo-maker':
        return <PassportPhotoMaker />;
      case 'signature-generator':
        return <SignatureGenerator />;
      case 'age-calculator':
        return <AgeCalculator />;
      case 'loan-emi-calculator':
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
      default:
        return <div className="p-8 text-center text-gray-400">Tool component coming soon!</div>;
    }
  };

  const handleSaveNote = () => {
    updateToolNotes(tool.id, noteText);
    setIsEditingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">{tool.title}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-medium">
                {tool.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Tag Changer */}
            <select
              value={tool.status}
              onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-950 border border-gray-700 text-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="planned">Tag: Planned</option>
              <option value="working">Tag: Working</option>
              <option value="completed">Tag: Completed</option>
              <option value="review needed">Tag: Review Needed</option>
              <option value="upgrade needed">Tag: Upgrade Needed</option>
              <option value="upgraded">Tag: Upgraded</option>
              <option value="dropped">Tag: Dropped</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Developer Notes strip */}
        <div className="px-6 py-2 bg-gray-950/40 border-b border-gray-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-400">
            <Info className="h-3.5 w-3.5 text-sky-400" />
            {isEditingNote ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="px-2 py-0.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-200 focus:outline-none"
                />
                <button onClick={handleSaveNote} className="text-emerald-400 hover:underline">
                  Save Note
                </button>
              </div>
            ) : (
              <span className="italic">Context Note: {tool.notes || 'No note added.'}</span>
            )}
          </div>
          {!isEditingNote && (
            <button
              onClick={() => {
                setNoteText(tool.notes || '');
                setIsEditingNote(true);
              }}
              className="text-sky-400 hover:underline text-[11px] flex items-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit Note</span>
            </button>
          )}
        </div>

        {/* Main Active Tool Runner */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderToolComponent()}
        </div>

      </div>
    </div>
  );
};
