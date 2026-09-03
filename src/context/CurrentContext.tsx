'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ToolStatus =
  | 'planned'
  | 'working'
  | 'completed'
  | 'review needed'
  | 'upgrade needed'
  | 'upgraded'
  | 'dropped';

export type ToolCategory =
  | 'Document & File Utilities'
  | 'Image & Media Tools'
  | 'Calculators & Converters'
  | 'Everyday Office/Personal Helpers';

export interface ToolItem {
  id: string;
  title: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  status: ToolStatus;
  notes?: string;
  features: string[];
  updatedAt: string;
  seoKeywords: string[];
}

export const INITIAL_TOOLS: ToolItem[] = [
  // Document & File Utilities
  {
    id: 'pdf-merger',
    title: 'PDF Merger/Splitter',
    category: 'Document & File Utilities',
    description: 'Combine multiple PDF files into one, or split and extract specific page ranges.',
    iconName: 'FileText',
    status: 'completed',
    notes: 'Fully functional client-side merging and page splitting using pdf-lib.',
    features: ['Merge multiple PDFs', 'Split pages', 'Reorder & preview pages'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['pdf merge online', 'split pdf', 'combine pdf pages'],
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF Converter',
    category: 'Document & File Utilities',
    description: 'Convert PNG, JPG, or WEBP images into a formatted single or multi-page PDF.',
    iconName: 'FileType',
    status: 'completed',
    notes: 'Instant image to PDF rendering with page layout controls.',
    features: ['Supports JPG/PNG/WEBP', 'Margin & page orientation settings', 'Instant download'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['image to pdf', 'jpg to pdf converter', 'photo to pdf'],
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter & Validator',
    category: 'Document & File Utilities',
    description: 'Format, validate, prettify, or minify JSON data with instant error highlighting.',
    iconName: 'Code2',
    status: 'completed',
    notes: 'Includes dark mode syntax styling and copy functionality.',
    features: ['Prettify & Minify', 'Syntax Validation', 'Tree View & Copy'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['json formatter online', 'json validator', 'json beautifier'],
  },
  {
    id: 'markdown-to-html',
    title: 'Markdown to HTML Converter',
    category: 'Document & File Utilities',
    description: 'Live side-by-side Markdown editor converting notes into formatted HTML.',
    iconName: 'FileCode',
    status: 'completed',
    notes: 'Supports code blocks, headers, tables, and raw HTML preview.',
    features: ['Live dual-pane preview', 'Copy HTML output', 'Sanitized rendering'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['markdown to html', 'md converter', 'markdown parser'],
  },
  {
    id: 'file-converter',
    title: 'File Converter',
    category: 'Document & File Utilities',
    description: 'Convert document formats between DOCX, TXT, MD, and PDF.',
    iconName: 'RefreshCw',
    status: 'completed',
    notes: 'Client-side text and document converter.',
    features: ['DOCX to PDF', 'TXT to PDF', 'Instant download'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['file converter online', 'docx to pdf', 'txt to pdf'],
  },
  {
    id: 'note-to-pdf',
    title: 'Note to PDF',
    category: 'Document & File Utilities',
    description: 'Convert typed notes and rich text documents into clean PDF files instantly.',
    iconName: 'FileEdit',
    status: 'completed',
    notes: 'Generates formatted PDFs directly from browser notes.',
    features: ['Custom title & body', 'Instant PDF download', 'Privacy protected'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['note to pdf', 'notes pdf creator', 'text to pdf document'],
  },
  {
    id: 'table-to-csv',
    title: 'Table to CSV Converter',
    category: 'Document & File Utilities',
    description: 'Paste tab-separated or HTML tables to export as .CSV files for Excel.',
    iconName: 'Table',
    status: 'completed',
    notes: 'Parses TSV and raw tables into cleaned CSV format.',
    features: ['Excel CSV export', 'Auto-delimiter detection', 'Copy & download'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['table to csv', 'excel csv converter', 'tsv to csv'],
  },

  {
    id: 'svg-code-editor',
    title: 'SVG Code Editor & Interactive Preview',
    category: 'Document & File Utilities',
    description: 'Edit SVG code with real-time preview and bi-directional element glow highlighting between code and preview shapes.',
    iconName: 'Code2',
    status: 'completed',
    notes: 'Bi-directional click and hover glow highlighting connecting code lines with rendered SVG elements.',
    features: ['Real-Time SVG Preview', 'Bi-Directional Glow Highlighting', 'Template Presets & Download .SVG'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['svg code editor', 'svg preview online', 'interactive svg editor'],
  },
  // Image & Media Tools
  {
    id: 'passport-photo-maker',
    title: 'Passport Photo Maker & Editor',
    category: 'Image & Media Tools',
    description: 'Convert any photo to official 35x45mm passport size under 80KB with live contrast, tilt, crop, and auto-smoother.',
    iconName: 'Camera',
    status: 'completed',
    notes: 'Live HTML5 Canvas passport editor with contrast, tilt rotation, skin smoother, and strict 80KB file size target.',
    features: ['35x45mm Passport Format', 'Live Contrast & Tilt', 'Guaranteed < 80 KB export'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['passport photo maker', 'passport photo under 80kb', 'convert photo to passport size'],
  },
  {
    id: 'photo-reducer',
    title: 'Photo Size Reducer',
    category: 'Image & Media Tools',
    description: 'Compress image file sizes from 2MB down to 100KB without dropping visual quality.',
    iconName: 'Image',
    status: 'upgraded',
    notes: 'High-compression algorithm with live side-by-side preview.',
    features: ['Quality & resolution sliders', 'Massive size reduction', 'Fast download'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['compress image', 'reduce photo size', 'tinypng alternative'],
  },
  {
    id: 'qr-generator',
    title: 'QR Code Generator',
    category: 'Image & Media Tools',
    description: 'Generate high-resolution QR codes from URLs, plain text, email, or WiFi configs.',
    iconName: 'QrCode',
    status: 'completed',
    notes: 'Custom color themes, margin controls, and PNG download.',
    features: ['URL, Text, WiFi support', 'Custom colors & sizes', 'High-res PNG export'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['qr generator online', 'create qr code', 'free qr maker'],
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech Tool',
    category: 'Image & Media Tools',
    description: 'Convert written text into natural audio speech with voice, rate, pitch, and .WAV download.',
    iconName: 'Volume2',
    status: 'upgraded',
    notes: 'Added WAV audio file download feature.',
    features: ['Multiple accents/voices', 'Playback sliders', 'Download .WAV audio file'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['text to speech online', 'tts reader', 'download tts wav'],
  },
  {
    id: 'speech-to-text',
    title: 'Speech to Text Tool',
    category: 'Image & Media Tools',
    description: 'Transcribe microphone speech into text with a real-time sound frequency wave visualizer.',
    iconName: 'Mic',
    status: 'upgraded',
    notes: 'Integrated Web Audio API sound wave frequency spectrum canvas.',
    features: ['Real-time dictation', 'Live sound wave visualizer', 'Copy transcript'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['speech to text online', 'voice dictation', 'sound wave tracker'],
  },
  {
    id: 'signature-generator',
    title: 'Email Signature Generator',
    category: 'Image & Media Tools',
    description: 'Create professional HTML email signatures with avatars, job titles, and social links.',
    iconName: 'PenTool',
    status: 'completed',
    notes: 'Generates clean email HTML signature markup.',
    features: ['Live HTML preview', 'Custom color theme', '1-Click HTML Copy'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['signature generator', 'email signature builder', 'html signature'],
  },

  // Calculators & Converters
  {
    id: 'age-calculator',
    title: 'Age Calculator',
    category: 'Calculators & Converters',
    description: 'Calculate your exact age in years, months, days, hours, and minutes from Date of Birth.',
    iconName: 'Calendar',
    status: 'completed',
    notes: 'Handles leap years and exact calendar date deltas.',
    features: ['Exact years, months, days breakdown', 'Next birthday countdown', 'Total days/hours elapsed'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['age calculator', 'calculate age from dob', 'exact age online'],
  },
  {
    id: 'loan-emi-calculator',
    title: 'Loan EMI Calculator',
    category: 'Calculators & Converters',
    description: 'Calculate monthly loan EMIs, interest payable, SVG donut breakdown chart, and amortization schedule.',
    iconName: 'Calculator',
    status: 'upgraded',
    notes: 'Added SVG Donut Chart & Monthly Amortization Table.',
    features: ['Monthly EMI calculation', 'SVG Donut Chart', 'Monthly Amortization Schedule'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['loan emi calculator', 'home loan emi', 'amortization table'],
  },
  {
    id: 'unit-converter',
    title: 'Unit & Geometry Converter',
    category: 'Calculators & Converters',
    description: 'Convert storage bits/bytes, Mach/light speed, and calculate 2D/3D shape surface area & volume.',
    iconName: 'RefreshCw',
    status: 'upgraded',
    notes: 'Added bits, Mach/Light/Sound speeds, and 14 shape geometry surface area/volume finder.',
    features: ['Storage bits & bytes', 'Mach & Light speed', '14 Shape Area & Volume Finder'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['unit converter online', 'mach speed converter', 'surface area calculator'],
  },
  {
    id: 'percentage-calculator',
    title: 'Percentage Calculator',
    category: 'Calculators & Converters',
    description: 'Solve common percentage problems: X% of Y, percentage increase/decrease, and ratio.',
    iconName: 'Percent',
    status: 'completed',
    notes: '3-in-1 percentage math toolkit.',
    features: ['What is X% of Y', 'Percentage increase/decrease', 'X is what % of Y'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['percentage calculator', 'calculate percentage', 'percent change calculator'],
  },
  {
    id: 'cgpa-converter',
    title: 'CGPA to Percentage Converter',
    category: 'Calculators & Converters',
    description: 'Convert academic CGPA/GPA grade points to percentage according to CBSE or custom formulas.',
    iconName: 'GraduationCap',
    status: 'completed',
    notes: 'Pre-configured formulas for CBSE (multiplier 9.5), 10-point scale, and custom multipliers.',
    features: ['CBSE 9.5 multiplier', 'Custom grading scales', 'Division & Grade classification'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['cgpa to percentage', 'cbse cgpa converter', 'gpa to percent'],
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    category: 'Calculators & Converters',
    description: 'Track daily expenses, categorize items, and auto-summarize totals and budget split.',
    iconName: 'DollarSign',
    status: 'completed',
    notes: 'Interactive expense manager with category totals.',
    features: ['Expense categories', 'Auto totals summary', '1-Click deletion'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['expense tracker online', 'daily budget calculator', 'money tracker'],
  },

  // Everyday Office/Personal Helpers
  {
    id: 'word-counter',
    title: 'Word Counter & Typing Test',
    category: 'Everyday Office/Personal Helpers',
    description: 'Count words, characters, sentences, and test your typing speed WPM and accuracy in real-time.',
    iconName: 'AlignLeft',
    status: 'upgraded',
    notes: 'Added interactive Typing Speed Test card with WPM and accuracy timer.',
    features: ['Word & Character count', 'Typing Speed WPM Test', 'Live accuracy gauge'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['word counter online', 'typing speed test', 'wpm test online'],
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    category: 'Everyday Office/Personal Helpers',
    description: 'Generate cryptographically strong passwords with customizable length, symbols, and strength score.',
    iconName: 'Key',
    status: 'completed',
    notes: 'Uses window.crypto for secure random byte generation.',
    features: ['Custom length (6-64)', 'Uppercase, lowercase, numbers, symbols', 'One-click copy & strength gauge'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['password generator', 'strong password creator', 'random password generator'],
  },
  {
    id: 'bill-splitter',
    title: 'Portion-Based Bill Splitter',
    category: 'Everyday Office/Personal Helpers',
    description: 'Split group bills fairly with itemized member-to-item mapping and tip amount with % badge tag.',
    iconName: 'Users',
    status: 'upgraded',
    notes: 'Portion-based itemized bill mapping so members who take less don\'t overpay.',
    features: ['Portion-Based Item Mapping', 'Tip Amount + % Badge', 'Share split summary'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['bill split calculator', 'itemized bill splitter', 'portion expense split'],
  },
  {
    id: 'water-calculator',
    title: 'Water Intake Calculator',
    category: 'Everyday Office/Personal Helpers',
    description: 'Calculate your recommended daily hydration goal based on weight, activity level, and climate.',
    iconName: 'Droplets',
    status: 'completed',
    notes: 'Personalized fluid goal calculations in liters and glasses.',
    features: ['Weight & activity factoring', 'Liters & glass count output', 'Daily reminder tips'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['water intake calculator', 'daily water goal', 'hydration calculator'],
  },
  {
    id: 'meeting-scheduler',
    title: 'Meeting Scheduler',
    category: 'Everyday Office/Personal Helpers',
    description: 'Schedule meetings, generate shareable invite links, and export .ICS calendar files instantly.',
    iconName: 'CalendarClock',
    status: 'completed',
    notes: 'Generates .ICS calendar files for Google Calendar / Outlook.',
    features: ['Date & time picker', 'Export .ICS file', 'Shareable invite link'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['meeting scheduler', 'ics file generator', 'calendar invite maker'],
  },
  {
    id: 'resume-formatter',
    title: 'Resume Formatter',
    category: 'Everyday Office/Personal Helpers',
    description: 'Input structured resume sections and format clean professional resume previews with PDF export.',
    iconName: 'FileCheck',
    status: 'completed',
    notes: 'Format and print clean resumes.',
    features: ['Structured sections', 'Clean typography template', 'Print / Save PDF'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['resume formatter', 'resume builder free', 'cv pdf maker'],
  },
  {
    id: 'checklist-maker',
    title: 'Checklist Maker',
    category: 'Everyday Office/Personal Helpers',
    description: 'Create interactive project task checklists with tick boxes, progress bars, and persistence.',
    iconName: 'CheckSquare',
    status: 'completed',
    notes: 'Interactive project task list manager.',
    features: ['Progress percentage bar', 'Tick box completion', 'Project task list'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['checklist maker', 'task list generator', 'todo list online'],
  },
  {
    id: 'invoice-generator',
    title: 'Invoice Generator',
    category: 'Everyday Office/Personal Helpers',
    description: 'Create itemized freelancer and team invoices with tax calculations and print/PDF export.',
    iconName: 'FileSpreadsheet',
    status: 'completed',
    notes: 'Calculates subtotal, tax rate, and grand total with PDF print format.',
    features: ['Itemized invoice rows', 'Tax rate calculation', 'Print / PDF export'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['invoice generator', 'free invoice maker', 'freelancer invoice'],
  },
  {
    id: 'form-filler',
    title: 'Form Auto-Filler Store',
    category: 'Everyday Office/Personal Helpers',
    description: 'Save common personal/business information for 1-click auto-fill copying into web forms.',
    iconName: 'UserCheck',
    status: 'completed',
    notes: 'Store user profile data for rapid form filling.',
    features: ['1-Click field copy', 'Full profile copy', 'Local persistence'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['form filler tool', 'auto fill copy', 'profile data store'],
  },
  {
    id: 'sleep-calculator',
    title: 'Sleep Cycle Calculator',
    category: 'Calculators & Converters',
    description: 'Calculate 90-minute REM sleep cycles to find optimal bedtime or wake-up times.',
    iconName: 'Moon',
    status: 'completed',
    notes: 'Calculates 90-minute sleep cycles with 14-minute average fall-asleep offset.',
    features: ['Sleep NOW wake-up times', 'Target wake-up bedtime calculator', 'Optimal REM cycle breakdown'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['sleep calculator', 'sleep cycle calculator', 'rem sleep calculator'],
  },
  {
    id: 'tip-calculator',
    title: 'Tip & Bill Split Calculator',
    category: 'Calculators & Converters',
    description: 'Calculate tip percentages, total bill amount, and split cost per person instantly.',
    iconName: 'Percent',
    status: 'completed',
    notes: 'Quick tip percentage presets (10%, 15%, 18%, 20%, 25%) and diner split calculation.',
    features: ['Tip presets 10%-25%', 'Per diner split breakdown', 'Total bill calculation'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['tip calculator', 'calculate tip online', 'bill tip splitter'],
  },
  {
    id: 'html-to-pdf',
    title: 'HTML Code to PDF Converter',
    category: 'Document & File Utilities',
    description: 'Convert raw HTML code or uploaded .HTML files into clean, beautifully styled PDF documents.',
    iconName: 'FileCode',
    status: 'completed',
    notes: 'Live HTML code editor, template presets, and clean isolated PDF printing engine.',
    features: ['Live HTML Code Editor', '.HTML File Upload', 'Clean 1-Click PDF Export'],
    updatedAt: new Date().toISOString(),
    seoKeywords: ['html to pdf converter', 'convert html to pdf online', 'html code to pdf'],
  },
];

interface CurrentContextType {
  tools: ToolItem[];
  updateToolStatus: (id: string, newStatus: ToolStatus, note?: string) => void;
  updateToolNotes: (id: string, note: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  selectedToolId: string;
  setSelectedToolId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ToolStatus | 'all';
  setStatusFilter: (filter: ToolStatus | 'all') => void;
  stats: Record<ToolStatus | 'total', number>;
  resetToDefaults: () => void;
}

const CurrentContext = createContext<CurrentContextType | undefined>(undefined);

const STORAGE_KEY = 'toolip_tools_status_v3';

export const CurrentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedToolId, setSelectedToolId] = useState<string>('pdf-merger');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ToolStatus | 'all'>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTools(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load local tool state', e);
    }
  }, []);

  const saveState = (updated: ToolItem[]) => {
    setTools(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save tool state', e);
    }
  };

  const updateToolStatus = (id: string, newStatus: ToolStatus, note?: string) => {
    const updated = tools.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          notes: note !== undefined ? note : t.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveState(updated);
  };

  const updateToolNotes = (id: string, note: string) => {
    const updated = tools.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          notes: note,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveState(updated);
  };

  const resetToDefaults = () => {
    saveState(INITIAL_TOOLS);
  };

  const stats = tools.reduce(
    (acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    {
      planned: 0,
      working: 0,
      completed: 0,
      'review needed': 0,
      'upgrade needed': 0,
      upgraded: 0,
      dropped: 0,
      total: 0,
    } as Record<ToolStatus | 'total', number>
  );

  return (
    <CurrentContext.Provider
      value={{
        tools,
        updateToolStatus,
        updateToolNotes,
        activeCategory,
        setActiveCategory,
        selectedToolId,
        setSelectedToolId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        stats,
        resetToDefaults,
      }}
    >
      {children}
    </CurrentContext.Provider>
  );
};

export const useCurrentContext = () => {
  const context = useContext(CurrentContext);
  if (!context) {
    throw new Error('useCurrentContext must be used within a CurrentContextProvider');
  }
  return context;
};

export default CurrentContext;
