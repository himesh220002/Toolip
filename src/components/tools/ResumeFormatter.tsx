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
  const [name, setName, resetName] = useLocalStorage<string>('toolip_resume_name', 'Alex Johnson');
  const [title, setTitle, resetTitle] = useLocalStorage<string>('toolip_resume_title', 'Senior Full Stack Software Engineer');
  const [email, setEmail, resetEmail] = useLocalStorage<string>('toolip_resume_email', 'alex.johnson@example.com');
  const [phone, setPhone, resetPhone] = useLocalStorage<string>('toolip_resume_phone', '+1 (555) 345-6789');
  const [location, setLocation, resetLocation] = useLocalStorage<string>('toolip_resume_location', 'San Francisco, CA');
  const [linkedin, setLinkedin, resetLinkedin] = useLocalStorage<string>('toolip_resume_linkedin', 'linkedin.com/in/alexjohnson');
  const [github, setGithub, resetGithub] = useLocalStorage<string>('toolip_resume_github', 'github.com/alexjohnson');
  const [website, setWebsite, resetWebsite] = useLocalStorage<string>('toolip_resume_website', '');

  const [summary, setSummary, resetSummary] = useLocalStorage<string>(
    'toolip_resume_summary',
    'Results-driven Software Engineer with 6+ years of experience specializing in Next.js, TypeScript, and high-performance web applications. Proven track record of scaling consumer platforms to 1M+ users and reducing backend latency by 35% through microservices architecture. Passionate about clean code, system design, and mentoring engineering teams.'
  );

  const [experience, setExperience, resetExperience] = useLocalStorage<string>(
    'toolip_resume_exp',
    'Senior Full Stack Developer — TechCorp Inc. | San Francisco, CA (2022 — Present)\n• Spearheaded Next.js frontend architecture serving 1M+ monthly active users; improved Lighthouse performance score from 72 to 96\n• Architected Express.js microservices and PostgreSQL optimization, reducing p95 latency by 35% and infra cost by 22%\n• Led and mentored a cross-functional team of 6 engineers; introduced CI/CD pipelines cutting deployment time by 60%\n\nSoftware Engineer — WebSolutions Co. | Remote (2019 — 2022)\n• Built responsive web applications and RESTful API integrations for 15+ enterprise clients\n• Automated testing and deployment workflows, improving release reliability by 40%\n• Collaborated with product and design to ship 3 major product releases on schedule'
  );

  const [education, setEducation, resetEducation] = useLocalStorage<string>(
    'toolip_resume_edu',
    'B.S. in Computer Science — University of Technology | San Francisco, CA (2015 — 2019)\n• Graduated First Class Honors — GPA 3.8 / 4.0; Dean’s List (2016 — 2019)\n• Relevant Coursework: Data Structures, Algorithms, Distributed Systems, Machine Learning'
  );

  const [projects, setProjects, resetProjects] = useLocalStorage<string>(
    'toolip_resume_projects',
    'Toolip — Everyday Utilities Platform (2026)\n• Developed a privacy-first utilities suite with 29 client-side tools (file conversion, image optimization, finance calculators)\n• Engineered Web Audio API frequency visualizer and pdf-lib powered document pipeline; 100% client-side, zero data upload\n\nOpenSource — Performance Toolkit\n• Published 2 technical articles on web performance (12k+ reads); speaker at local JS meetup'
  );

  const [techSkills, setTechSkills, resetTechSkills] = useLocalStorage<string>(
    'toolip_resume_techskills',
    'React, Next.js, TypeScript, JavaScript (ES6+), Node.js, Express.js, PostgreSQL, Tailwind CSS, Docker, Git, REST APIs, System Design'
  );

  const [softSkills, setSoftSkills, resetSoftSkills] = useLocalStorage<string>(
    'toolip_resume_softskills',
    'Technical Leadership, System Design, Agile / Scrum, Code Review & Mentorship, Problem Solving'
  );

  const [achievements, setAchievements, resetAchievements] = useLocalStorage<string>(
    'toolip_resume_achievements',
    '• 1st Place — Global Hackathon 2024 (500+ teams)\n• AWS Certified Solutions Architect — Associate (2023)\n• Published: “Optimizing Next.js for 1M Users” — Medium, 12k+ claps'
  );

  const [languages, setLanguages, resetLanguages] = useLocalStorage<string>(
    'toolip_resume_languages',
    'English (Native), Spanish (Fluent), Hindi (Conversational)'
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
    const plain = `${name}\n${title}\n${email} | ${phone} | ${location} | ${linkedin} ${github ? '| ' + github : ''}\n\nPROFESSIONAL SUMMARY\n${summary}\n\nWORK EXPERIENCE\n${experience}\n\nEDUCATION\n${education}\n\nPROJECTS\n${projects}\n\nTECHNICAL SKILLS\n${techSkills}\n\nSOFT SKILLS\n${softSkills}\n\nACHIEVEMENTS & CERTIFICATIONS\n${achievements}\n\nLANGUAGES\n${languages}`;
    navigator.clipboard.writeText(plain);
    setCopiedPlain(true);
    setTimeout(() => setCopiedPlain(false), 2000);
  };

  const handlePrint = () => {
    const element = document.getElementById('printable-resume');
    if (!element) return;

    // Try pop-up print window first (best A4 fidelity with full theme)
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      // Fallback: use browser print with isolation CSS (already in <style> @media print)
      window.print();
      return;
    }

    const fontFamily =
      fontMode === 'serif'
        ? `'Merriweather', Georgia, 'Times New Roman', serif`
        : `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

    // Clone all parent <style> and <link rel="stylesheet"> so Tailwind / globals carry over, plus CDN fallback
    const parentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => (el as HTMLElement).outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume_${name.trim().toLowerCase().replace(/\s+/g, '_') || 'resume'}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <!-- Tailwind CDN ensures all utility classes (text-[14px], bg-white, flex, etc.) render in print window -->
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet">
          ${parentStyles}
          <style>
            @page { margin: 10mm 12mm; size: A4 portrait; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            html, body { margin: 0; padding: 0; background: #ffffff !important; color: #0f172a; font-family: ${fontFamily}; }
            a { color: inherit; text-decoration: none; }
            ul { margin: 0; padding-left: 18px; }
            li { margin-bottom: 3px; }
            /* Ensure A4 preview box itself has no extra shadow/border in print */
            #printable-resume { box-shadow: none !important; border: none !important; border-radius: 0 !important; max-width: none !important; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="bg-white text-[#0f172a]">
          <div style="max-width: 800px; margin: 0 auto; padding: 12px 8px; background: white;">
            ${element.outerHTML}
          </div>
          <script>
            // Wait for Tailwind CDN + fonts to apply before printing, so entire theme (colors, spacing, icons) loads
            const doPrint = () => setTimeout(() => { window.print(); window.close(); }, 900);
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(doPrint);
            } else {
              window.onload = doPrint;
            }
            // Fallback if CDN is slow
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

  const SectionHeading: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => {
    if (template === 'classic') {
      return (
        <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5 mb-3 mt-6 first:mt-0">
          {icon && <span className="text-gray-500">{icon}</span>}
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

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          @page { margin: 10mm 12mm; size: A4 portrait; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #printable-resume, #printable-resume * { visibility: visible !important; }
          #printable-resume { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: none !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
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

          {/* Education */}
          <div ref={refEducation} className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 scroll-mt-4">
            <label className="text-[11px] font-black tracking-[0.14em] uppercase text-white flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-emerald-400" /> Education</label>
            <textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={4} placeholder="B.S. Computer Science — University (2015 — 2019)" className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed font-mono text-[13px]" />
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
                  <div className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] text-gray-600 font-medium leading-none ${template === 'classic' ? 'justify-center' : 'justify-start'}`}>
                    {email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3 text-gray-400" />{email}</span>}
                    {phone && <><span className="text-gray-300">•</span><span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3 text-gray-400" />{phone}</span></>}
                    {location && <><span className="text-gray-300">•</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gray-400" />{location}</span></>}
                    {linkedin && <><span className="text-gray-300">•</span><span className="inline-flex items-center gap-1.5"><Linkedin className="h-3 w-3 text-gray-400" />{linkedin.replace(/^https?:\/\//, '')}</span></>}
                    {github && <><span className="text-gray-300">•</span><span className="inline-flex items-center gap-1.5"><Github className="h-3 w-3 text-gray-400" />{github.replace(/^https?:\/\//, '')}</span></>}
                    {website && <><span className="text-gray-300">•</span><span className="inline-flex items-center gap-1.5"><Globe className="h-3 w-3 text-gray-400" />{website.replace(/^https?:\/\//, '')}</span></>}
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

                {/* Experience — Distinct Tiers: Role vs Company vs Location vs Dates vs Details */}
                {ExpEntries.length > 0 && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refExperience)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading icon={<Briefcase className="h-3.5 w-3.5" />}>Work Experience</SectionHeading>
                    <div className="space-y-0">
                      {ExpEntries.map((entry, idx) => {
                        const isLast = idx === ExpEntries.length - 1;
                        return (
                          <div key={idx} className={`relative ${!isLast ? 'pb-5 mb-5 border-b border-gray-200' : ''}`}>
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 hidden sm:block" style={{ backgroundColor: template === 'modern' ? `${accentCfg.hex}22` : '#e2e8f0', display: template === 'executive' ? 'none' : undefined }} />
                            <div className="sm:pl-5">
                              {/* Row 1: Role + Dates badge — distinct hierarchy */}
                              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                <h4 className="text-[14px] font-black leading-tight tracking-tight text-gray-900 pr-2">{entry.role}</h4>
                                {entry.dates && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border whitespace-nowrap shrink-0 shadow-sm" style={{
                                    backgroundColor: template === 'modern' ? `${accentCfg.hex}12` : '#f1f5f9',
                                    borderColor: template === 'modern' ? `${accentCfg.hex}30` : '#cbd5e1',
                                    color: template === 'modern' ? accentCfg.hex : '#0f172a'
                                  }}>
                                    <Calendar className="h-3 w-3 opacity-70" />{entry.dates}
                                  </span>
                                )}
                              </div>
                              {/* Row 2: Company + Location — clearly separate from Role (smaller, accent) */}
                              {(entry.company || entry.location) && (
                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                                  {entry.company && <span className="inline-flex items-center gap-1 font-bold" style={{ color: template === 'modern' ? accentCfg.hex : '#334155' }}><Building2 className="h-3.5 w-3.5 opacity-70" />{entry.company}</span>}
                                  {entry.company && entry.location && <span className="h-1 w-1 rounded-full bg-gray-400" />}
                                  {entry.location && <span className="inline-flex items-center gap-1 text-gray-500 font-medium"><MapPin className="h-3 w-3 text-gray-400" />{entry.location}</span>}
                                </div>
                              )}
                              {/* Bullets: Details — visually lighter, smaller, indented vs header */}
                              {entry.bullets.length > 0 ? (
                                <ul className="mt-3 ml-4 space-y-1.5 list-disc marker:text-gray-300">
                                  {entry.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-500 pl-1">{b}</li>)}
                                </ul>
                              ) : null}
                            </div>
                            <div className="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full bg-white border-[2.5px] hidden sm:block shadow-sm" style={{ borderColor: template === 'modern' ? accentCfg.hex : '#64748b' }} />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Projects — Name vs Subtitle vs Dates distinction */}
                {projects && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refProjects)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading icon={<Code2 className="h-3.5 w-3.5" />}>Featured Projects</SectionHeading>
                    <div className="space-y-5">
                      {ProjectBlocks.map((block, idx) => {
                        const { name: projName, subtitle, dates } = parseProjectHeading(block.heading);
                        const isLast = idx === ProjectBlocks.length - 1;
                        return (
                          <div key={idx} className={`relative sm:pl-4 ${!isLast ? 'pb-5 border-b border-gray-100' : ''}`}>
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 hidden sm:block" style={{ backgroundColor: '#e5e7eb', display: template === 'executive' ? 'none' : undefined }} />
                            <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-gray-400 hidden sm:block" />
                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                              <h4 className="text-[13px] font-extrabold leading-tight text-gray-900">{projName}</h4>
                              {dates && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold tracking-wide uppercase whitespace-nowrap"><Calendar className="h-3 w-3 opacity-70" />{dates}</span>}
                            </div>
                            {subtitle && <p className="mt-1 text-[11.5px] font-semibold text-gray-500 flex items-center gap-1"><ExternalLink className="h-3 w-3 opacity-60" />{subtitle}</p>}
                            {block.bullets.length > 0 && (
                              <ul className="mt-2.5 ml-4 space-y-1.5 list-disc marker:text-gray-400">
                                {block.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-600 pl-1">{b}</li>)}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Education — Degree vs School vs Location vs Dates */}
                {EduEntries.length > 0 && (
                  <section className="group relative">
                    <button onClick={() => scrollTo(refEducation)} className="absolute -right-2 top-6 p-1.5 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all print:hidden"><Pencil className="h-3 w-3 text-gray-600" /></button>
                    <SectionHeading icon={<GraduationCap className="h-3.5 w-3.5" />}>Education</SectionHeading>
                    <div className="space-y-0">
                      {EduEntries.map((entry, idx) => {
                        const isLast = idx === EduEntries.length - 1;
                        return (
                          <div key={idx} className={`relative ${!isLast ? 'pb-5 mb-5 border-b border-gray-200' : ''}`}>
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 hidden sm:block" style={{ backgroundColor: template === 'modern' ? `${accentCfg.hex}22` : '#e2e8f0', display: template === 'executive' ? 'none' : undefined }} />
                            <div className="sm:pl-5">
                              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                <h4 className="text-[14px] font-black leading-tight text-gray-900 pr-2">{entry.degree}</h4>
                                {entry.dates && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border whitespace-nowrap shrink-0 shadow-sm" style={{ backgroundColor: template === 'modern' ? `${accentCfg.hex}12` : '#f0fdf4', borderColor: template === 'modern' ? `${accentCfg.hex}30` : '#a7f3d0', color: template === 'modern' ? accentCfg.hex : '#065f46' }}><Calendar className="h-3 w-3 opacity-70" />{entry.dates}</span>}
                              </div>
                              {(entry.school || entry.location) && (
                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]">
                                  {entry.school && <span className="inline-flex items-center gap-1 font-bold" style={{ color: template === 'modern' ? accentCfg.hex : '#1e293b' }}><Building2 className="h-3.5 w-3.5 opacity-70" />{entry.school}</span>}
                                  {entry.school && entry.location && <span className="h-1 w-1 rounded-full bg-gray-400" />}
                                  {entry.location && <span className="inline-flex items-center gap-1 text-gray-500 font-medium"><MapPin className="h-3 w-3 text-gray-400" />{entry.location}</span>}
                                </div>
                              )}
                              {entry.bullets.length > 0 && (
                                <ul className="mt-3 ml-4 space-y-1.5 list-disc marker:text-gray-300">
                                  {entry.bullets.map((b, i) => <li key={i} className="text-[11.5px] leading-[1.65] text-gray-500 pl-1">{b}</li>)}
                                </ul>
                              )}
                            </div>
                            <div className="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full bg-white border-[2.5px] hidden sm:block shadow-sm" style={{ borderColor: template === 'modern' ? accentCfg.hex : '#64748b' }} />
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
