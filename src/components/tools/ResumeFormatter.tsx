'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Printer,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Copy,
  Check,
  Sparkles,
  Zap,
  Upload,
  RotateCcw,
  FileText,
  Eye,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  User,
  Download,
  Palette,
  Type,
  ShieldCheck,
  Pencil,
  ChevronDown,
  ChevronUp,
  Wand2,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ───────────────────────────────────────────────────────────────────────────────
// Professional Templates & Theme Definitions
// ───────────────────────────────────────────────────────────────────────────────
type ResumeTemplate = 'classic' | 'modern' | 'executive';
type AccentColor = 'slate' | 'navy' | 'teal' | 'burgundy';

const ACCENT_MAP: Record<AccentColor, { hex: string; bg: string; lightBg: string; border: string; text: string }> = {
  slate: { hex: '#0f172a', bg: 'bg-slate-900', lightBg: 'bg-slate-50', border: 'border-slate-900', text: 'text-slate-900' },
  navy: { hex: '#1e3a5f', bg: 'bg-[#1e3a5f]', lightBg: 'bg-[#f0f4f8]', border: 'border-[#1e3a5f]', text: 'text-[#1e3a5f]' },
  teal: { hex: '#115e59', bg: 'bg-teal-800', lightBg: 'bg-teal-50', border: 'border-teal-800', text: 'text-teal-800' },
  burgundy: { hex: '#7f1d1d', bg: 'bg-red-900', lightBg: 'bg-red-50', border: 'border-red-900', text: 'text-red-900' },
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers: parse blocks into structured render + visual distinction
// ───────────────────────────────────────────────────────────────────────────────
const parseBlocks = (text: string): { heading: string; bullets: string[] }[] => {
  if (!text.trim()) return [];
  const rawEntries = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return rawEntries.map((entry) => {
    const lines = entry
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return { heading: '', bullets: [] };
    const heading = lines[0];
    const bullets = lines.slice(1).map((l) => l.replace(/^[•\-–—*]\s*/, '').trim()).filter(Boolean);
    return { heading, bullets };
  });
};

// Smart split: Role — Company | Location (Dates)  → distinct fields for visual hierarchy
const parseExperienceHeading = (raw: string) => {
  let dates = '';
  let location = '';
  let remainder = raw.trim();

  // 1) Dates in parentheses at end: (2022 — Present) or (2019 – 2022)
  const parenDates = remainder.match(/\(([^)]+)\)\s*$/);
  if (parenDates) {
    dates = parenDates[1].trim();
    remainder = remainder.slice(0, parenDates.index).trim().replace(/[|,]\s*$/, '').trim();
  } else {
    // trailing bare dates without parens: ... 2022 — Present
    const bareDates = remainder.match(/(19|20)\d{2}\s*[—–\-]\s*(Present|Current|Now|(19|20)\d{2})\s*$/i);
    if (bareDates) {
      dates = bareDates[0].trim();
      remainder = remainder.slice(0, bareDates.index).trim().replace(/[|,—–\-]\s*$/, '').trim();
    }
  }

  // 2) Location after last | or · (if it looks like City, ST)
  if (remainder.includes('|')) {
    const parts = remainder.split('|');
    const last = parts[parts.length - 1].trim();
    if (last.includes(',') || /Remote|Hybrid|On-site/i.test(last)) {
      location = parts.pop()!.trim();
      remainder = parts.join('|').trim();
    }
  } else if (remainder.includes('·') && remainder.split('·').length > 1) {
    const parts = remainder.split('·');
    const last = parts[parts.length - 1].trim();
    if (last.includes(',') || /Remote/i.test(last)) {
      location = parts.pop()!.trim();
      remainder = parts.join('·').trim();
    }
  }

  // 3) Role — Company  (try multiple separators)
  let role = remainder;
  let company = '';
  const seps = [' — ', ' – ', ' —', '– ', ' - ', ' @ ', ' at ', ' • ', ' · ', ' | '];
  for (const sep of seps) {
    if (remainder.includes(sep)) {
      const idx = remainder.indexOf(sep);
      role = remainder.slice(0, idx).trim();
      company = remainder.slice(idx + sep.length).trim();
      break;
    }
  }
  if (!company && remainder.includes('—')) {
    const idx = remainder.indexOf('—');
    role = remainder.slice(0, idx).trim();
    company = remainder.slice(idx + 1).trim();
  }
  // Also split " - " fallback that may be location-like inside company
  if (!location && company.includes(' - ')) {
    const cParts = company.split(' - ');
    if (cParts.length === 2 && cParts[1].includes(',') || cParts[1].includes('NY') || cParts[1].includes('CA')) {
      location = cParts[1].trim();
      company = cParts[0].trim();
    }
  }

  return { role: role || raw, company, location, dates, raw };
};

const parseEducationHeading = (raw: string) => {
  const exp = parseExperienceHeading(raw);
  return { degree: exp.role, school: exp.company, location: exp.location, dates: exp.dates, raw };
};

const parseProjectHeading = (raw: string) => {
  let dates = '';
  let remainder = raw.trim();
  const parenDates = remainder.match(/\(([^)]+)\)\s*$/);
  if (parenDates) {
    dates = parenDates[1].trim();
    remainder = remainder.slice(0, parenDates.index).trim();
  }
  let name = remainder;
  let subtitle = '';
  for (const sep of [' — ', ' – ', ' - ', ' | ', ' · ']) {
    if (remainder.includes(sep)) {
      const idx = remainder.indexOf(sep);
      name = remainder.slice(0, idx).trim();
      subtitle = remainder.slice(idx + sep.length).trim();
      break;
    }
  }
  if (!subtitle && remainder.includes('—')) {
    const idx = remainder.indexOf('—');
    name = remainder.slice(0, idx).trim();
    subtitle = remainder.slice(idx + 1).trim();
  }
  return { name: name || raw, subtitle, dates, raw };
};

// ── Fix: detect multi-line headers & split merged jobs inside one block
// User often pastes as:
//   Role
//   Company - Location
//   June 2023 – Present
//   • detail...
// But parseBlocks treats lines 2-3 as bullets, making second job "Marketing Assistant" look like a bullet detail.
// These helpers detect and split.
const isDateLine = (s: string) => {
  const t = s.trim();
  if (t.length > 40) return false;
  return /(19|20)\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current/i.test(t) && /[—–\-]|to|Present|Current|\d/.test(t);
};
const isCompanyLine = (s: string) => {
  const t = s.trim();
  if (t.length > 55) return false;
  if (t.startsWith('•') || t.startsWith('-') || t.startsWith('*')) return false;
  // company lines often have " - ", " | ", comma, or suffix like Inc/Co/LLC/Media/Brand/University/School
  return / - | \| |, |Inc\.|LLC|Co\.|Corp|Media|Brand|University|College|School|Academy|Tech|Solutions|Apex|Local/i.test(t) || (t.includes(',') && t.length < 40);
};
const isProbableRoleLine = (s: string) => {
  const t = s.trim().replace(/^[•\-–—*]\s*/, '');
  if (t.length > 45 || t.length < 3) return false;
  if (/^(Managed|Created|Collaborated|Assisted|Tracked|Responded|Developed|Engineered|Built|Designed|Led|Spearheaded|Architected|Graduated|Relevant|Coursework|Published)/i.test(t)) return false;
  // role/degree lines are Title Case and short (1-5 words) like "Marketing Assistant" or "B.A. in Communications"
  const words = t.split(/\s+/);
  if (words.length >= 1 && words.length <= 6) {
    // Has at least 2 capitalized words or contains degree keywords
    if (/B\.A\.|B\.S\.|M\.A\.|M\.S\.|MBA|Ph\.D|Bachelor|Master|Associate|Coordinator|Assistant|Engineer|Developer|Manager|Director|Intern|Analyst/i.test(t)) return true;
    const caps = words.filter((w) => /^[A-Z]/.test(w)).length;
    return caps >= 1 && !t.endsWith('.') && !t.includes('  ');
  }
  return false;
};

type ExpEntry = { role: string; company: string; location: string; dates: string; bullets: string[] };
type EduEntry = { degree: string; school: string; location: string; dates: string; bullets: string[] };

const buildExpEntries = (blocks: { heading: string; bullets: string[] }[]): ExpEntry[] => {
  const entries: ExpEntry[] = [];
  for (const block of blocks) {
    // First, try to interpret block.heading + first bullets as header continuation
    let heading = block.heading.trim();
    let bullets = [...block.bullets];
    let company = '';
    let location = '';
    let dates = '';

    // If heading is single-line but bullets[0] looks like company, absorb it
    // Do this before generic heading parse so multi-line headers work
    const peekCompany = bullets[0] || '';
    const peekDate = bullets[1] || '';
    const headingLooksComplete = heading.includes('—') || heading.includes('|') || heading.includes('(');
    if (!headingLooksComplete) {
      if (peekCompany && isCompanyLine(peekCompany)) {
        const parsedCompanyLine = peekCompany;
        // split "Apex Media - New York, NY" => company + location
        if (parsedCompanyLine.includes(' - ')) {
          const [c, l] = parsedCompanyLine.split(' - ');
          company = c.trim();
          location = l.trim();
        } else if (parsedCompanyLine.includes('|')) {
          const [c, l] = parsedCompanyLine.split('|');
          company = c.trim();
          location = l.trim();
        } else if (parsedCompanyLine.includes(',')) {
          // try to guess company vs location: last comma segment is location if it has state code
          const lastComma = parsedCompanyLine.lastIndexOf(',');
          if (lastComma > 0) {
            const maybeLoc = parsedCompanyLine.slice(parsedCompanyLine.lastIndexOf(' - ') > 0 ? parsedCompanyLine.lastIndexOf(' - ') + 3 : 0).trim();
            // simpler: if the line contains " - " it's company - location already handled, else treat whole as company
            if (parsedCompanyLine.includes(' - ')) {
              // already handled
            } else {
              // Check if it's purely location like "New York, NY" – but company line in example is "Apex Media - New York, NY" which we handled
              company = parsedCompanyLine;
            }
          } else {
            company = parsedCompanyLine;
          }
        } else {
          company = parsedCompanyLine;
        }
        bullets.shift();
        // After consuming company, check next for dates
        if (bullets[0] && isDateLine(bullets[0])) {
          dates = bullets.shift()!.trim();
        }
      } else if (bullets[0] && isDateLine(bullets[0])) {
        dates = bullets.shift()!.trim();
      }
    }

    // Now parse the heading itself for any remaining inline company/location/dates
    const parsedHead = parseExperienceHeading(heading);
    let role = parsedHead.role;
    if (!company) company = parsedHead.company;
    if (!location) location = parsedHead.location;
    if (!dates) dates = parsedHead.dates;
    // If heading was just role and we extracted company/location/dates from bullets, keep them

    // Now bullets may contain merged second job(s) without blank-line split.
    // Split bullets into current job's details vs next job starts.
    let currentBullets: string[] = [];
    let i = 0;
    while (i < bullets.length) {
      const cur = bullets[i].trim();
      // Detect start of next job inside bullets: a role line followed by company line and date line
      // Also handle inline heading like "B.S. in CS — University | Location (2020)" which already contains — | ( )
      const nextIsCompany = bullets[i + 1] && isCompanyLine(bullets[i + 1]);
      const nextNextIsDate = bullets[i + 2] && isDateLine(bullets[i + 2]);
      const curIsRole = isProbableRoleLine(cur);
      const curIsInlineHeading = curIsRole && (cur.includes('—') || cur.includes(' – ') || cur.includes('|') || cur.includes('(') || / — | \| /.test(cur));

      if (curIsRole && (nextIsCompany || nextNextIsDate || curIsInlineHeading)) {
        // Flush current entry
        entries.push({ role, company, location, dates, bullets: [...currentBullets] });
        // Start new entry
        role = cur.replace(/^[•\-–—*]\s*/, '').trim();
        bullets.splice(i, 1); // remove role line from bullets stream, we'll handle company/date below
        // Re-evaluate company/date for new entry from next bullets
        company = '';
        location = '';
        dates = '';
        if (bullets[i] && isCompanyLine(bullets[i])) {
          const compLine = bullets[i].trim();
          if (compLine.includes(' - ')) {
            const [c, l] = compLine.split(' - ');
            company = c.trim();
            location = l.trim();
          } else if (compLine.includes('|')) {
            const [c, l] = compLine.split('|');
            company = c.trim();
            location = l.trim();
          } else {
            company = compLine;
          }
          bullets.splice(i, 1);
        }
        if (bullets[i] && isDateLine(bullets[i])) {
          dates = bullets[i].trim();
          bullets.splice(i, 1);
        }
        currentBullets = [];
        continue; // don't increment i, re-check current position
      } else {
        // Normal detail bullet
        currentBullets.push(cur);
        i++;
      }
    }
    entries.push({ role, company, location, dates, bullets: currentBullets.filter(Boolean) });
  }
  return entries.filter((e) => e.role || e.bullets.length > 0);
};

const buildEduEntries = (blocks: { heading: string; bullets: string[] }[]): EduEntry[] => {
  // Reuse the robust work-splitter for education too — it handles both:
  //  - Proper education: "B.A. in Communications" → "State University - New York, NY" → "Graduated: May 2021"
  //  - Polluted case where education textarea was overwritten with work data (2 jobs) → split into 2 distinct cards
  // We keep the same 4-tier hierarchy: Degree (14px black) vs School/Location (11.5px accent) vs Dates pill vs Details (11.5px gray)
  const expLike = buildExpEntries(blocks);
  return expLike.map((e) => ({
    degree: e.role,
    school: e.company,
    location: e.location,
    dates: e.dates,
    bullets: e.bullets,
  }));
};

// ───────────────────────────────────────────────────────────────────────────────
// Component — Easy Editable Edition
// ───────────────────────────────────────────────────────────────────────────────
export const ResumeFormatter: React.FC = () => {
  const [template, setTemplate] = useLocalStorage<ResumeTemplate>('toolip_resume_template', 'classic');
  const [accent, setAccent] = useLocalStorage<AccentColor>('toolip_resume_accent', 'slate');
  const [fontMode, setFontMode] = useLocalStorage<'sans' | 'serif'>('toolip_resume_font', 'sans');

  // Resume Data State with Local Storage Persistence
  const [name, setName, resetName] = useLocalStorage<string>('toolip_resume_name', 'Himesh Satyam');
  const [title, setTitle, resetTitle] = useLocalStorage<string>('toolip_resume_title', 'Full-Stack Software Engineer');
  const [email, setEmail, resetEmail] = useLocalStorage<string>('toolip_resume_email', 'satyamhimesh@gmail.com');
  const [phone, setPhone, resetPhone] = useLocalStorage<string>('toolip_resume_phone', '+91 8105542318');
  const [location, setLocation, resetLocation] = useLocalStorage<string>('toolip_resume_location', 'Katihar, Bihar, India');
  const [linkedin, setLinkedin, resetLinkedin] = useLocalStorage<string>('toolip_resume_linkedin', 'linkedin.com/in/himesh-satyam');
  const [github, setGithub, resetGithub] = useLocalStorage<string>('toolip_resume_github', 'github.com/himesh220002');
  const [website, setWebsite, resetWebsite] = useLocalStorage<string>('toolip_resume_website', 'cyphertech.online');

  const [summary, setSummary, resetSummary] = useLocalStorage<string>(
    'toolip_resume_summary',
    'Full-Stack Software Engineer with 3+ years of independent product development (Jan 2023 – Present) and internship experience, specializing in React, Next.js, Node.js, PostgreSQL, MongoDB and Python. Built and deployed 30+ client-side utilities and 3 major AI/full-stack platforms using REST APIs, JWT authentication and database design, with hands-on system design and deployment on Vercel/Netlify. Proven ability to design, build and ship scalable products end-to-end — from API architecture and RAG pipelines (embeddings, vector search, LLMs) to production delivery.'
  );

  const [experience, setExperience, resetExperience] = useLocalStorage<string>(
    'toolip_resume_exp',
    'Independent Software Engineer / Product Builder — Self-Employed | Remote (Jan 2023 – Present)\n• Designed, developed and deployed 8+ production full-stack applications using Next.js, React, Node.js, Express, PostgreSQL and MongoDB, implementing REST APIs, JWT authentication and database-backed workflows\n• Built Toolip — 30+ client-side utilities (file conversion, image optimization, finance calculators) using Next.js, React and Tailwind CSS with 100% client-side execution, zero telemetry and responsive dark UI, deployed on Vercel\n• Engineered InputChat — AI orchestration platform using Next.js, React, Node.js and NVIDIA inference endpoints, supporting hybrid local + cloud LLM execution with modular orchestration for scalability\n• Developed CodeForge — RAG pipeline integrating Python, embeddings, semantic chunking, vector storage, vector search and reranking to improve query accuracy for code/document retrieval\n\nIntern — Technologics | Bangalore, India (Apr 2022 – May 2022)\n• Assisted in software development and project documentation, gaining exposure to real-world IT workflows and agile practices\n• Contributed to development tasks using modern stacks, collaborating with senior engineers on project deliverables'
  );

  const [education, setEducation, resetEducation] = useLocalStorage<string>(
    'toolip_resume_edu',
    'Bachelor of Engineering in Computer Science & Engineering — SJCIT | 2023\n• Completed coursework 2017–2022, degree awarded Jan 2023 (SJCIT, Visvesvaraya Technological University)\n• Relevant Coursework: Data Structures & Algorithms, Object-Oriented Programming, Database Management, System Design'
  );

  const [projects, setProjects, resetProjects] = useLocalStorage<string>(
    'toolip_resume_projects',
    'InputChat — Local/Global Model Orchestration (2024)\n• Unified platform for running downloaded models alongside NVIDIA endpoint models using Next.js, React, Node.js and REST APIs\n• Enabled hybrid AI workflows by combining local inference with cloud endpoints, supporting scalable LLM execution\n• Designed with modular orchestration for scalability and developer usability, implementing system design and API architecture\n\nToolip — Everyday Utilities Suite (2024)\n• Built 30+ client-side tools including file conversion, image optimization and finance calculators using Next.js, React, Node.js and Tailwind CSS\n• Engineered with privacy-first design (100% client-side, zero telemetry), handling file processing entirely in browser\n• Delivered responsive, dark-themed UI consistent across utilities, deployed on Vercel with optimized performance\n\nCodeForge — RAG Pipeline (2024)\n• Developed retrieval-augmented generation pipeline integrating Python, embeddings, vector search, vector storage and LLMs\n• Implemented semantic chunking, vector storage and reranking for improved query accuracy, enhancing retrieval precision\n• Created intelligent code/document query workflows with suggestions for refinement, demonstrating AI engineering depth'
  );

  const [techSkills, setTechSkills, resetTechSkills] = useLocalStorage<string>(
    'toolip_resume_techskills',
    'JavaScript, TypeScript, Python, SQL, HTML, CSS, React, Next.js, Tailwind CSS, Node.js, Express, REST APIs, JWT, PostgreSQL, MongoDB, Database Design, Indexing, PyTorch, RAG, Embeddings, Vector Search, Semantic Chunking, LLMs, Streamlit, ResNet50, Vercel, Netlify, AWS, GCP, Docker, Git, GitHub Actions, CI/CD, Linux'
  );

  const [softSkills, setSoftSkills, resetSoftSkills] = useLocalStorage<string>(
    'toolip_resume_softskills',
    'System Design, API Design, Object-Oriented Programming, Data Structures & Algorithms, Scalability, Problem Solving, Agile / Scrum, Code Review'
  );

  const [achievements, setAchievements, resetAchievements] = useLocalStorage<string>(
    'toolip_resume_achievements',
    '• GitHub: github.com/himesh220002 — 3 major open-source AI/full-stack platforms (InputChat, Toolip, CodeForge)\n• Portfolio: cyphertech.online — Live production deployments on Vercel/Netlify\n• Full-Stack Development — Udemy (comprehensive)\n• Python Programming — Udemy | Unity 3D with C# — Udemy'
  );

  const [languages, setLanguages, resetLanguages] = useLocalStorage<string>(
    'toolip_resume_languages',
    'English (Professional), Hindi (Native)'
  );

  const [showFooter, setShowFooter, resetShowFooter] = useLocalStorage<boolean>('toolip_resume_show_footer', true);

  const resetAllResume = () => {
    resetName();
    resetTitle();
    resetEmail();
    resetPhone();
    resetLocation();
    resetLinkedin();
    resetGithub();
    resetWebsite();
    resetSummary();
    resetExperience();
    resetEducation();
    resetProjects();
    resetTechSkills();
    resetSoftSkills();
    resetAchievements();
    resetLanguages();
    resetShowFooter();
  };

  // Quick Picker & Parser
  const [rawInputText, setRawInputText] = useState<string>('');
  const [extractedBlocks, setExtractedBlocks] = useState<{ title: string; text: string }[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [showParser, setShowParser] = useState<boolean>(false);

  // Refs for easy jump-to-edit from preview
  const refContact = useRef<HTMLDivElement>(null);
  const refSummary = useRef<HTMLDivElement>(null);
  const refExperience = useRef<HTMLDivElement>(null);
  const refEducation = useRef<HTMLDivElement>(null);
  const refProjects = useRef<HTMLDivElement>(null);
  const refSkills = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ref.current?.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'ring-offset-gray-900');
    setTimeout(() => ref.current?.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'ring-offset-gray-900'), 1200);
  };

  const accentCfg = ACCENT_MAP[accent];

  const stats = useMemo(() => {
    const wordCount = [summary, experience, education, projects, techSkills, achievements]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const hasEmail = /\S+@\S+\.\S+/.test(email);
    const hasPhone = phone.replace(/\D/g, '').length >= 7;
    const pagesEst = wordCount < 450 ? 1 : wordCount < 800 ? 2 : Math.ceil(wordCount / 450);
    return { wordCount, hasEmail, hasPhone, pagesEst };
  }, [summary, experience, education, projects, techSkills, achievements, email, phone]);

  const parseRawResumeText = (rawText: string) => {
    setRawInputText(rawText);
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const blocks: { title: string; text: string }[] = [];
    let currentSection = 'General';
    let currentLines: string[] = [];
    const isHeading = (line: string) => {
      const upper = line.toUpperCase();
      if (line.length > 60) return false;
      return (
        upper === 'SUMMARY' ||
        upper === 'PROFESSIONAL SUMMARY' ||
        upper === 'PROFILE' ||
        upper.includes('WORK EXPERIENCE') ||
        upper.includes('EXPERIENCE') ||
        upper.includes('EMPLOYMENT') ||
        upper.includes('WORK HISTORY') ||
        upper === 'EDUCATION' ||
        upper.includes('PROJECTS') ||
        upper.includes('SKILLS') ||
        upper.includes('TECHNICAL SKILLS') ||
        upper.includes('ACHIEVEMENTS') ||
        upper.includes('CERTIFICATIONS') ||
        upper === 'LANGUAGES' ||
        upper.includes('AWARDS')
      );
    };
    lines.forEach((line) => {
      if (isHeading(line)) {
        if (currentLines.length > 0) blocks.push({ title: currentSection, text: currentLines.join('\n') });
        currentSection = line;
        currentLines = [];
      } else currentLines.push(line);
    });
    if (currentLines.length > 0) blocks.push({ title: currentSection, text: currentLines.join('\n') });

    if (blocks.length === 1 && blocks[0].title === 'General' && rawText.length > 300) {
      const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) setEmail(emailMatch[0]);
      const phoneMatch = rawText.match(/(\+?[\d\s\-\(\)]{9,})/);
      if (phoneMatch && phoneMatch[1].replace(/\D/g, '').length >= 10) setPhone(phoneMatch[1].trim());
    } else {
      setExtractedBlocks(blocks);
      blocks.forEach((block) => {
        const t = block.title.toUpperCase();
        if (t.includes('SUMMARY') || t.includes('PROFILE')) setSummary(block.text);
        else if (t.includes('EXPERIENCE') || t.includes('WORK') || t.includes('EMPLOY')) setExperience(block.text);
        else if (t.includes('EDUCATION')) setEducation(block.text);
        else if (t.includes('PROJECT')) setProjects(block.text);
        else if (t.includes('SKILL')) setTechSkills(block.text);
        else if (t.includes('ACHIEV') || t.includes('CERTIF') || t.includes('AWARD')) setAchievements(block.text);
        else if (t.includes('LANGUAGE')) setLanguages(block.text);
      });
    }
    setExtractedBlocks(blocks);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => parseRawResumeText(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const copyPlainResume = () => {
    const clean = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const line1 = [`Email: ${email}`, `Phone: ${phone}`, `Location: ${location}`].filter((s) => !s.endsWith(': ') && s.split(': ')[1]?.trim()).join(' | ');
    const line2 = [
      linkedin ? `LinkedIn: ${clean(linkedin)}` : '',
      github ? `GitHub: ${clean(github)}` : '',
      website ? `Portfolio: ${clean(website)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    const plain = `${name}\n${title}\n${line1}${line2 ? '\n' + line2 : ''}\n\nPROFESSIONAL SUMMARY\n${summary}\n\nWORK EXPERIENCE\n${experience}\n\nEDUCATION\n${education}\n\nPROJECTS\n${projects}\n\nTECHNICAL SKILLS\n${techSkills}\n\nSOFT SKILLS\n${softSkills}\n\nACHIEVEMENTS & CERTIFICATIONS\n${achievements}\n\nLANGUAGES\n${languages}`;
    navigator.clipboard.writeText(plain);
    setCopiedPlain(true);
    setTimeout(() => setCopiedPlain(false), 2000);
  };

  const handlePrint = () => {
    const element = document.getElementById('printable-resume');
    if (!element) return;

    // Use a dedicated print window that clones the parent's compiled CSS.
    // This keeps fonts/sizes pixel-perfect to the preview (same Tailwind
    // build, same Google Fonts) while avoiding the visibility:hidden
    // isolation that was rendering blank in some browsers.
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      // Pop-up blocked → fallback to native print (relies on @media print)
      const doPrint = () => window.print();
      if (document.fonts && (document.fonts as any).ready) {
        (document.fonts as any).ready.then(() => setTimeout(doPrint, 100));
      } else {
        setTimeout(doPrint, 100);
      }
      return;
    }

    // Clone every <style> and <link rel="stylesheet"> from the parent
    // document so the compiled Tailwind utilities (text-[14px], etc.) and
    // globals are available verbatim — no CDN drift.
    const parentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => (el as HTMLElement).outerHTML)
      .join('\n');

    const safeName = name.trim().toLowerCase().replace(/\s+/g, '_') || 'resume';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Resume_${safeName}</title>
          ${parentStyles}
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { margin: 10mm 12mm; size: A4 portrait; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; background-image: none !important; }
            body::before, body::after, html::before, html::after { display: none !important; background: none !important; }
            /* Kill Toolip's dark page background and decorative layers that leaked via cloned globals */
            .hex-grid, .vice-grain, .halo-scanlines, .halo-scanlines::before, .vice-grain::after, .hex-grid::before { display: none !important; background: none !important; }
            /* Keep the resume card centered on white A4, no shadow/border shrink */
            #printable-resume { max-width: 800px !important; margin: 0 auto !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; background: #ffffff !important; }
            #printable-resume > div { background: #ffffff !important; }
          </style>
        </head>
        <body class="bg-white">
          <div style="padding: 12px; background: #ffffff;">
            ${element.outerHTML}
          </div>
          <script>
            const doPrint = () => setTimeout(() => { window.print(); window.close(); }, 600);
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(doPrint);
            } else {
              window.onload = doPrint;
            }
            setTimeout(doPrint, 1800);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Auto-fix polluted education that was overwritten with work data (see user screenshot: EDUCATION showing Digital Marketing Coordinator + Apex Media)
  // This handles stale localStorage from before hierarchy fix — resets to clean education example if duplicate detected
  useEffect(() => {
    if (
      education &&
      experience &&
      education.trim() === experience.trim() &&
      /Digital Marketing Coordinator|Apex Media|Marketing Assistant|Local Brand Co\./.test(education)
    ) {
      resetEducation();
    }
    // Also fix summary that was polluted with education text (screenshot 1: SUMMARY showed B.A. in Communications)
    if (summary && /B\.A\. in Communications|State University.*Graduated/i.test(summary) && !summary.includes('Results-driven') && !summary.includes('Software Engineer')) {
      // Only reset if summary looks like isolated education line and not proper summary
      if (summary.trim().split('\n').length <= 2 && summary.length < 120) {
        resetSummary();
      }
    }
  }, []);

  // One-time migration: old demo (Alex Johnson / TechCorp) → new Himesh Satyam ATS-90+ master resume
  // If user still has the legacy demo data, auto-upgrade to the improved resume so preview matches the 75→90+ review
  useEffect(() => {
    const isLegacyDemo =
      name === 'Alex Johnson' &&
      email === 'alex.johnson@example.com' &&
      title === 'Senior Full Stack Software Engineer';
    const isLegacyExp = experience.includes('TechCorp Inc.') || experience.includes('WebSolutions Co.');
    const isLegacyEdu = education.includes('University of Technology') && education.includes('2015 — 2019');
    if (isLegacyDemo || isLegacyExp || isLegacyEdu) {
      resetAllResume();
    }
  }, []);

  const SectionHeading: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon: _icon, children }) => {
    if (template === 'classic') {
      return (
        <div className="border-b border-gray-300 pb-1.5 mb-3 mt-6 first:mt-0">
          <h3 className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-gray-900">{children}</h3>
        </div>
      );
    }
    if (template === 'modern') {
      return (
        <div className="flex items-center gap-2.5 border-b-2 pb-1.5 mb-3 mt-6 first:mt-0" style={{ borderColor: accentCfg.hex }}>
          <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: accentCfg.hex }} />
          <h3 className="text-[11px] font-extrabold tracking-[0.16em] uppercase" style={{ color: accentCfg.hex }}>{children}</h3>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
        <div className="h-px flex-1 bg-gray-300" />
        <h3 className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-800 px-2">{children}</h3>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
    );
  };

  const rawExpBlocks = parseBlocks(experience);
  const rawEduBlocks = parseBlocks(education);
  const ProjectBlocks = parseBlocks(projects);
  const ExpEntries = buildExpEntries(rawExpBlocks);
  const EduEntries = buildEduEntries(rawEduBlocks);
  const AchievementLines = achievements.split('\n').map((l) => l.replace(/^[•\-–—*]\s*/, '').trim()).filter(Boolean);
  const skillList = techSkills.split(',').map((s) => s.trim()).filter(Boolean);
  const softSkillList = softSkills.split(',').map((s) => s.trim()).filter(Boolean);

  // Ensure Inter + Merriweather are loaded in the main document so preview and native print share the exact same fonts (fixes sans-vs-serif drift)
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('link[href*="fonts.googleapis.com"][href*="Inter"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700;900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          @page { margin: 10mm 12mm; size: A4 portrait; }
          html, body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden !important; }
          #printable-resume, #printable-resume * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Keep print container identical to on-screen preview: same max-width, no shadow/border shrink, same padding */
          #printable-resume { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 800px !important; margin: 0 auto !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          /* Prevent Tailwind's responsive padding from shifting in print */
          #printable-resume > div { padding: 28px 32px !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* ─── Top Bar: Template & Actions ─── */}
      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-300">Resume Design</span>
            <span className="hidden sm:inline text-[10px] text-gray-500">&nbsp;• click any section on preview to edit</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'classic', label: 'ATS Classic', icon: ShieldCheck },
              { id: 'modern', label: 'Modern', icon: Layers },
              { id: 'executive', label: 'Executive', icon: Award },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as ResumeTemplate)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive ? 'bg-white text-gray-900 border-white shadow-md' : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                  {t.id === 'classic' && isActive && <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] rounded font-black tracking-widest">ATS</span>}
                </button>
              );
            })}
            <div className="h-6 w-px bg-gray-800 mx-1 hidden sm:block" />
            <div className="flex items-center gap-1 p-1 bg-gray-950 border border-gray-800 rounded-lg">
              <button onClick={() => setFontMode('sans')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 ${fontMode === 'sans' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Type className="h-3 w-3" /> Sans</button>
              <button onClick={() => setFontMode('serif')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 ${fontMode === 'serif' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`} style={{ fontFamily: 'Merriweather, serif' }}>Serif</button>
            </div>
            {template === 'modern' && (
              <div className="flex items-center gap-1 p-1 bg-gray-950 border border-gray-800 rounded-lg">
                {(Object.keys(ACCENT_MAP) as AccentColor[]).map((c) => (
                  <button key={c} onClick={() => setAccent(c)} className={`h-6 w-6 rounded-md border-2 transition-all ${accent === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`} style={{ backgroundColor: ACCENT_MAP[c].hex }} title={c} />
                ))}
              </div>
            )}
            {/* Footer toggle switch */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg">
              <span className="text-[11px] font-bold tracking-wide uppercase text-gray-400">Footer</span>
              <button
                onClick={() => setShowFooter(!showFooter)}
                role="switch"
                aria-checked={showFooter}
                title={showFooter ? 'Hide resume footer (References line)' : 'Show resume footer'}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showFooter ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showFooter ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
              <span className={`text-[11px] font-bold ${showFooter ? 'text-violet-300' : 'text-gray-500'}`}>{showFooter ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-[11px]">
          <div className="flex items-center gap-2 text-emerald-200 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Easy edit — all fields visible • Live preview → click ✎ to jump</span>
            <span className="sm:hidden">Easy edit — click ✎ on preview to edit</span>
            <span className="hidden lg:inline h-3 w-px bg-emerald-800" />
            <span className="hidden lg:inline text-emerald-300/80">{stats.wordCount} words • ~{stats.pagesEst} page{stats.pagesEst > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={copyPlainResume} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[11px] font-semibold transition-colors">
              {copiedPlain ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}{copiedPlain ? 'Copied' : 'Copy Text'}
            </button>
            <button onClick={resetAllResume} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-rose-950/50 border border-gray-800 hover:border-rose-800 text-gray-400 hover:text-rose-300 text-[11px] font-semibold transition-colors">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Layout: Easy Editor (left) + Live Preview (right) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-4 items-start print:hidden">
        {/* LEFT — All Fields Visible, No Tabs */}
        <div className="space-y-3 xl:sticky xl:top-2 xl:overflow-y-auto xl:pr-1 xl:pb-2 custom-scrollbar">
          {/* Smart Import — Collapsible, not a tab */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowParser(!showParser)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-violet-300">
                <Wand2 className="h-4 w-4" /> Smart Import <span className="text-[10px] font-normal normal-case text-gray-500 hidden sm:inline">— paste existing resume to auto-fill</span>
              </span>
              <span className="flex items-center gap-2">
                {extractedBlocks.length > 0 && <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] font-bold rounded-full border border-violet-500/30">{extractedBlocks.length} blocks</span>}
                {showParser ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </span>
            </button>
            {showParser && (
              <div className="p-3 pt-0 space-y-3 border-t border-gray-800">
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">Paste raw text or upload file</span>
                  <label className="cursor-pointer text-[11px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-emerald-300 rounded-lg font-semibold flex items-center gap-1.5 border border-gray-700">
                    <Upload className="h-3 w-3" /> Upload .txt
                    <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  value={rawInputText}
                  onChange={(e) => parseRawResumeText(e.target.value)}
                  placeholder="Paste your resume here… e.g. SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS — auto-detects and fills fields below."
                  rows={6}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none font-mono leading-relaxed"
                />
                {extractedBlocks.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {extractedBlocks.map((block, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-violet-300 font-bold text-[10px] tracking-wide uppercase">{block.title}</span>
                          <button onClick={() => copySnippet(block.text)} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                            {copiedSnippet === block.text ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}{copiedSnippet === block.text ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-gray-400 text-[11px] line-clamp-2 font-mono leading-relaxed">{block.text}</p>
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => setSummary(block.text)} className="px-2 py-0.5 bg-gray-900 hover:bg-violet-600 text-gray-400 hover:text-white text-[10px] rounded-lg font-semibold border border-gray-800 transition-colors">→ Summary</button>
                          <button onClick={() => setExperience(block.text)} className="px-2 py-0.5 bg-gray-900 hover:bg-violet-600 text-gray-400 hover:text-white text-[10px] rounded-lg font-semibold border border-gray-800 transition-colors">→ Experience</button>
                          <button onClick={() => setEducation(block.text)} className="px-2 py-0.5 bg-gray-900 hover:bg-violet-600 text-gray-400 hover:text-white text-[10px] rounded-lg font-semibold border border-gray-800 transition-colors">→ Education</button>
                          <button onClick={() => setTechSkills(block.text)} className="px-2 py-0.5 bg-gray-900 hover:bg-violet-600 text-gray-400 hover:text-white text-[10px] rounded-lg font-semibold border border-gray-800 transition-colors">→ Skills</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 text-center py-2 border border-dashed border-gray-800 rounded-xl bg-gray-950/50">Paste text with headings like <span className="font-mono text-gray-400">EXPERIENCE</span> to see quick-assign blocks here.</p>
                )}
              </div>
            )}
          </div>

          {/* Contact — always visible */}
          <div ref={refContact} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-3 scroll-mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-sky-400" /> Contact & Header</h3>
              <span className="text-[10px] text-gray-500">✎ Click preview to jump here</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: 'Full Name', value: name, setter: setName, placeholder: 'Alex Johnson' },
                { label: 'Title', value: title, setter: setTitle, placeholder: 'Senior Software Engineer' },
                { label: 'Email', value: email, setter: setEmail, placeholder: 'alex@example.com' },
                { label: 'Phone', value: phone, setter: setPhone, placeholder: '+1 (555) 000-0000' },
                { label: 'Location', value: location, setter: setLocation, placeholder: 'San Francisco, CA' },
                { label: 'LinkedIn', value: linkedin, setter: setLinkedin, placeholder: 'linkedin.com/in/you' },
                { label: 'GitHub', value: github, setter: setGithub, placeholder: 'github.com/you' },
                { label: 'Website', value: website, setter: setWebsite, placeholder: 'yourname.com (optional)' },
              ].map((f) => (
                <div key={f.label} className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wide uppercase text-gray-400">{f.label}</label>
                  <input
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-2.5 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div ref={refSummary} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 scroll-mt-4">
            <label className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-violet-400" /> Professional Summary</label>
            <p className="text-[11px] text-gray-500">2–4 lines: years, core stack, biggest impact. Keep keyword-rich for ATS.</p>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Results-driven Software Engineer with 6+ years..." className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed" />
          </div>

          {/* Experience — large, easy to edit */}
          <div ref={refExperience} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 scroll-mt-4">
            <label className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-blue-400" /> Work Experience</label>
            <p className="text-[11px] text-gray-500">One block per job: <span className="font-mono text-gray-400">Title — Company | Location (Year — Present)</span> + <span className="font-mono text-gray-400">•</span> bullets. Separate jobs with blank line.</p>
            <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={10} placeholder={"Senior Full Stack Developer — TechCorp Inc. | San Francisco, CA (2022 — Present)\n• Spearheaded Next.js architecture serving 1M+ users...\n• Reduced latency by 35%..."} className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed font-mono text-[13px]" />
          </div>

          {/* Projects */}
          <div ref={refProjects} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 scroll-mt-4">
            <label className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5 text-amber-400" /> Featured Projects</label>
            <textarea value={projects} onChange={(e) => setProjects(e.target.value)} rows={5} placeholder="Toolip — Utilities Platform (2026)&#10;• Built 29 client-side tools..." className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed font-mono text-[13px]" />
          </div>

          {/* Skills */}
          <div ref={refSkills} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-3 scroll-mt-4">
            <h3 className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-violet-400" /> Skills & Extras</h3>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wide uppercase text-gray-400">Technical Skills — comma separated</label>
                <textarea value={techSkills} onChange={(e) => setTechSkills(e.target.value)} rows={2} className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 resize-none" />
                <div className="flex flex-wrap gap-1">
                  {skillList.slice(0, 10).map((s, i) => <span key={i} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-300">{s}</span>)}
                  {skillList.length > 10 && <span className="text-[10px] text-gray-500">+{skillList.length - 10}</span>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wide uppercase text-gray-400">Soft Skills — comma separated</label>
                <textarea value={softSkills} onChange={(e) => setSoftSkills(e.target.value)} rows={2} className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wide uppercase text-gray-400 flex items-center gap-1"><Award className="h-3 w-3 text-amber-400" /> Achievements & Certifications</label>
                  <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 resize-none font-mono text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wide uppercase text-gray-400 flex items-center gap-1"><Globe className="h-3 w-3 text-sky-400" /> Languages</label>
                  <textarea value={languages} onChange={(e) => setLanguages(e.target.value)} rows={2} className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-sky-500/50 resize-none" />
                </div>
              </div>
              {/* Footer toggle in editor for easy discoverability */}
              <div className="flex items-center justify-between p-2.5 bg-gray-950 border border-gray-800 rounded-xl">
                <span className="text-[11px] font-bold tracking-wide uppercase text-gray-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-gray-500" /> Resume Footer
                  <span className="text-[10px] font-normal normal-case text-gray-500 hidden sm:inline">— References line</span>
                </span>
                <button
                  onClick={() => setShowFooter(!showFooter)}
                  role="switch"
                  aria-checked={showFooter}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showFooter ? 'bg-violet-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showFooter ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Education — below Skills per request */}
          <div ref={refEducation} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 scroll-mt-4">
            <label className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-emerald-400" /> Education</label>
            <textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={4} placeholder="Bachelor of Engineering in Computer Science & Engineering — SJCIT | 2023" className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed font-mono text-[13px]" />
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-black text-sm shadow-lg transition-colors"><Download className="h-4 w-4" /> Download PDF</button>
            <button onClick={copyPlainResume} className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-semibold text-sm flex items-center gap-2">{copiedPlain ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}{copiedPlain ? 'Copied' : 'Copy Text'}</button>
          </div>
        </div>

        {/* RIGHT — Live Preview, sticky on desktop, clickable to edit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Live Preview</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-gray-900 border border-gray-800 rounded-full text-[10px] font-semibold normal-case tracking-normal text-gray-500">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Print-ready A4
              </span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-gray-500"><Pencil className="h-3 w-3" /> Click ✎ to edit</div>
          </div>

          <div className="flex justify-center p-2 sm:p-3 bg-[#e2e8f0] rounded-2xl border border-gray-800">
            <div
              id="printable-resume"
              className="w-full max-w-[800px] bg-white text-[#0f172a] shadow-2xl border border-gray-200 rounded-xl overflow-hidden"
              style={{
                fontFamily:
                  fontMode === 'serif'
                    ? "'Merriweather', Georgia, 'Times New Roman', serif"
                    : "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              {template === 'modern' && <div className="h-1.5 w-full" style={{ backgroundColor: accentCfg.hex }} />}
              {template === 'executive' && <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />}

              <div className="px-7 sm:px-8 py-7 sm:py-8">
                {/* Header — clickable */}
                <header className={`group relative ${template === 'classic' ? 'text-center' : 'text-left'}`}>
                  <button onClick={() => scrollTo(refContact)} title="Edit contact & header" className="absolute -right-2 -top-1 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden">
                    <Pencil className="h-3 w-3 text-gray-600" />
                  </button>
                  <h1 className="font-black tracking-tight leading-none text-[#0f172a]" style={{ fontSize: '30px', letterSpacing: '-0.02em' }}>{name || 'Your Name'}</h1>
                  <p className="mt-1.5 font-semibold uppercase tracking-[0.18em] text-[11px]" style={{ color: template === 'modern' ? accentCfg.hex : '#475569' }}>{title || 'Professional Title'}</p>
                  {/* ATS-safe contact lines — plain labeled separators, no icons/symbols that confuse parsers */}
                  <div className={`mt-3 space-y-1 text-[10.5px] leading-relaxed ${template === 'classic' ? 'text-center' : 'text-left'}`}>
                    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-700 font-medium ${template === 'classic' ? 'justify-center' : 'justify-start'}`}>
                      {email && <span>Email: {email}</span>}
                      {email && phone && <span className="text-gray-400 font-normal">|</span>}
                      {phone && <span>Phone: {phone}</span>}
                      {phone && location && <span className="text-gray-400 font-normal">|</span>}
                      {location && <span>Location: {location}</span>}
                    </div>
                    {(linkedin || github || website) && (
                      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-700 font-medium ${template === 'classic' ? 'justify-center' : 'justify-start'}`}>
                        {linkedin && <span>LinkedIn: {linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
                        {linkedin && (github || website) && <span className="text-gray-400 font-normal">|</span>}
                        {github && <span>GitHub: {github.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
                        {github && website && <span className="text-gray-400 font-normal">|</span>}
                        {website && <span>Portfolio: {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 h-px w-full bg-gray-200" />
                  {template === 'modern' && <div className="mt-px h-px w-full" style={{ backgroundColor: `${accentCfg.hex}14` }} />}
                </header>

                {/* Summary */}
                {summary && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refSummary)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading icon={<User className="h-3.5 w-3.5" />}>Professional Summary</SectionHeading>
                    <p className="text-[11.5px] leading-[1.7] text-gray-700 text-justify hyphens-auto">{summary}</p>
                  </section>
                )}

                {/* Experience — ATS-safe: no decorative O/☐/icons, plain • separators */}
                {ExpEntries.length > 0 && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refExperience)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading>Work Experience</SectionHeading>
                    <div className="space-y-6">
                      {ExpEntries.map((entry, idx) => {
                        const isLast = idx === ExpEntries.length - 1;
                        return (
                          <div key={idx} className="space-y-0">
                            {/* Row 1: Role + Dates — plain text badge, no Calendar icon */}
                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                              <h4 className="text-[14px] font-black leading-tight tracking-tight text-gray-900 pr-2">{entry.role}</h4>
                              {entry.dates && (
                                <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border whitespace-nowrap shrink-0" style={{
                                  backgroundColor: template === 'modern' ? `${accentCfg.hex}10` : '#f1f5f9',
                                  borderColor: template === 'modern' ? `${accentCfg.hex}30` : '#cbd5e1',
                                  color: template === 'modern' ? accentCfg.hex : '#0f172a'
                                }}>
                                  {entry.dates}
                                </span>
                              )}
                            </div>
                            {/* Row 2: Company • Location — plain • separator, no Building2/MapPin icons */}
                            {(entry.company || entry.location) && (
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                                {entry.company && <span className="font-bold" style={{ color: template === 'modern' ? accentCfg.hex : '#334155' }}>{entry.company}</span>}
                                {entry.company && entry.location && <span className="text-gray-400">•</span>}
                                {entry.location && <span className="text-gray-500 font-medium">{entry.location}</span>}
                              </div>
                            )}
                            {/* Details: plain • bullets (no decorative symbols) */}
                            {entry.bullets.length > 0 ? (
                              <ul className="mt-3 ml-5 space-y-1.5 list-disc marker:text-gray-400">
                                {entry.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-500 pl-1">{b}</li>)}
                              </ul>
                            ) : null}
                            {!isLast && <div className="h-px bg-gray-200 mt-6" />}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Projects — plain text, no decorative icons */}
                {projects && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refProjects)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading>Featured Projects</SectionHeading>
                    <div className="space-y-6">
                      {ProjectBlocks.map((block, idx) => {
                        const { name: projName, subtitle, dates } = parseProjectHeading(block.heading);
                        const isLast = idx === ProjectBlocks.length - 1;
                        return (
                          <div key={idx} className="space-y-0">
                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                              <h4 className="text-[13px] font-extrabold leading-tight text-gray-900">{projName}</h4>
                              {dates && <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap">{dates}</span>}
                            </div>
                            {subtitle && <p className="mt-1 text-[11.5px] font-semibold text-gray-500">{subtitle}</p>}
                            {block.bullets.length > 0 && (
                              <ul className="mt-2.5 ml-5 space-y-1.5 list-disc marker:text-gray-400">
                                {block.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-600 pl-1">{b}</li>)}
                              </ul>
                            )}
                            {!isLast && <div className="h-px bg-gray-200 mt-6" />}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Skills */}
                <section className="group relative">
                  <button onClick={() => scrollTo(refSkills)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                  <SectionHeading icon={<Layers className="h-3.5 w-3.5" />}>Skills</SectionHeading>
                  <div className="space-y-3">
                    {skillList.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5">Technical</div>
                        {template === 'classic' || template === 'executive' ? (
                          <p className="text-[11.5px] leading-[1.6] text-gray-700">{skillList.join('  •  ')}</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {skillList.map((sk, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-medium border" style={{ backgroundColor: `${accentCfg.hex}0D`, borderColor: `${accentCfg.hex}20`, color: accentCfg.hex }}>{sk}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {softSkillList.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5">Professional Strengths</div>
                        <p className="text-[11.5px] leading-[1.6] text-gray-700">{softSkillList.join('  •  ')}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Education — plain • separators, no O/☐ icons — placed below Skills per request */}
                {EduEntries.length > 0 && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refEducation)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading>Education</SectionHeading>
                    <div className="space-y-6">
                      {EduEntries.map((entry, idx) => {
                        const isLast = idx === EduEntries.length - 1;
                        return (
                          <div key={idx} className="space-y-0">
                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                              <h4 className="text-[14px] font-black leading-tight text-gray-900 pr-2">{entry.degree}</h4>
                              {entry.dates && <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border whitespace-nowrap shrink-0" style={{ backgroundColor: template === 'modern' ? `${accentCfg.hex}10` : '#f0fdf4', borderColor: template === 'modern' ? `${accentCfg.hex}30` : '#a7f3d0', color: template === 'modern' ? accentCfg.hex : '#065f46' }}>{entry.dates}</span>}
                            </div>
                            {(entry.school || entry.location) && (
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                                {entry.school && <span className="font-bold" style={{ color: template === 'modern' ? accentCfg.hex : '#1e293b' }}>{entry.school}</span>}
                                {entry.school && entry.location && <span className="text-gray-400">•</span>}
                                {entry.location && <span className="text-gray-500 font-medium">{entry.location}</span>}
                              </div>
                            )}
                            {entry.bullets.length > 0 && (
                              <ul className="mt-3 ml-5 space-y-1.5 list-disc marker:text-gray-400">
                                {entry.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-500 pl-1">{b}</li>)}
                              </ul>
                            )}
                            {!isLast && <div className="h-px bg-gray-200 mt-6" />}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Achievements & Languages */}
                {achievements && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refSkills)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading icon={<Award className="h-3.5 w-3.5" />}>Achievements & Certifications</SectionHeading>
                    <ul className="ml-4 space-y-1 list-disc marker:text-gray-400">
                      {AchievementLines.map((line, i) => <li key={i} className="text-[11.5px] leading-[1.6] text-gray-700 pl-1">{line}</li>)}
                    </ul>
                  </section>
                )}
                {languages && (
                  <section>
                    <SectionHeading icon={<Globe className="h-3.5 w-3.5" />}>Languages</SectionHeading>
                    <p className="text-[11.5px] leading-[1.6] text-gray-700">{languages}</p>
                  </section>
                )}

                {showFooter && (
                  <div className="mt-8 pt-3 border-t border-gray-100 flex justify-between items-center text-[9px] tracking-widest uppercase font-semibold text-gray-400">
                    <span>References available upon request</span>
                    <span className="hidden sm:inline">Toolip • Private • No upload</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-black text-sm tracking-wide shadow-xl border border-gray-200 transition-colors"><Download className="h-4 w-4" /><span>Download PDF — Print-ready A4</span></button>
            <button onClick={copyPlainResume} className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 font-semibold text-sm transition-colors">{copiedPlain ? <Check className="h-4 w-4 text-emerald-400" /> : <FileText className="h-4 w-4" />}{copiedPlain ? 'Copied!' : 'Copy as Plain Text (ATS)'}</button>
          </div>
          <p className="text-center text-[11px] text-gray-500 leading-relaxed px-2">All fields are live — no save button needed. Click ✎ on any preview section to jump to its editor. Keep to 1 page (~450 words) for best results.</p>
        </div>
      </div>
    </div>
  );
};
