'use client';

import React, { useState } from 'react';
import { Printer, User, Briefcase, GraduationCap, Award, Globe, Mail, Phone, MapPin, Linkedin, Github, Code, Sparkles, Languages, Upload, Copy, Check, FileText, ArrowRight, Zap, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const ResumeFormatter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'summary' | 'exp' | 'edu' | 'skills' | 'parser'>('parser');

  // Resume Data State with Local Storage Persistence
  const [name, setName, resetName] = useLocalStorage<string>('toolip_resume_name', 'Alex Johnson');
  const [title, setTitle, resetTitle] = useLocalStorage<string>('toolip_resume_title', 'Senior Full Stack Software Engineer');
  const [email, setEmail, resetEmail] = useLocalStorage<string>('toolip_resume_email', 'alex.johnson@example.com');
  const [phone, setPhone, resetPhone] = useLocalStorage<string>('toolip_resume_phone', '+1 (555) 345-6789');
  const [location, setLocation, resetLocation] = useLocalStorage<string>('toolip_resume_location', 'San Francisco, CA');
  const [linkedin, setLinkedin, resetLinkedin] = useLocalStorage<string>('toolip_resume_linkedin', 'linkedin.com/in/alexjohnson');
  const [github, setGithub, resetGithub] = useLocalStorage<string>('toolip_resume_github', 'github.com/alexjohnson');

  const [summary, setSummary, resetSummary] = useLocalStorage<string>(
    'toolip_resume_summary',
    'Results-driven Software Engineer with 6+ years of experience specializing in Next.js, Express.js, TypeScript, and high-performance Web Applications. Proven track record of scaling consumer web platforms and optimizing web performance.'
  );

  const [experience, setExperience, resetExperience] = useLocalStorage<string>(
    'toolip_resume_exp',
    'Senior Full Stack Developer — TechCorp Inc. (2022 – Present)\n• Spearheaded Next.js frontend architecture serving 1M+ active monthly users.\n• Architected Express.js microservices reducing backend latency by 35%.\n• Managed a cross-functional team of 6 engineers.\n\nSoftware Engineer — WebSolutions Co. (2019 – 2022)\n• Built responsive web tools and RESTful API integrations.\n• Automated CI/CD build pipelines reducing deployment times.'
  );

  const [education, setEducation, resetEducation] = useLocalStorage<string>(
    'toolip_resume_edu',
    'B.S. in Computer Science — University of Technology (2015 – 2019)\nGraduated with First Class Honors (GPA: 3.8 / 4.0)'
  );

  const [projects, setProjects, resetProjects] = useLocalStorage<string>(
    'toolip_resume_projects',
    'Toolip Everyday Utilities Platform (2026)\n• Developed an everyday utilities web app with 29 client-side tools.\n• Integrated Web Audio API frequency visualizer & pdf-lib converters.'
  );

  const [techSkills, setTechSkills, resetTechSkills] = useLocalStorage<string>(
    'toolip_resume_techskills',
    'React, Next.js, TypeScript, JavaScript (ES6+), Express.js, Node.js, Tailwind CSS, PostgreSQL, Docker, Git'
  );

  const [softSkills, setSoftSkills, resetSoftSkills] = useLocalStorage<string>(
    'toolip_resume_softskills',
    'Technical Leadership, Problem Solving, Agile / Scrum, Code Review, System Design'
  );

  const [achievements, setAchievements, resetAchievements] = useLocalStorage<string>(
    'toolip_resume_achievements',
    '• 1st Place Winner — Global Hackathon 2024\n• Certified AWS Solutions Architect\n• Published 2 Technical Articles on Web Performance'
  );

  const [languages, setLanguages, resetLanguages] = useLocalStorage<string>(
    'toolip_resume_languages',
    'English (Native / Professional), Spanish (Fluent), Hindi (Conversational)'
  );

  const resetAllResume = () => {
    resetName();
    resetTitle();
    resetEmail();
    resetPhone();
    resetLocation();
    resetLinkedin();
    resetGithub();
    resetSummary();
    resetExperience();
    resetEducation();
    resetProjects();
    resetTechSkills();
    resetSoftSkills();
    resetAchievements();
    resetLanguages();
  };

  // Quick Picker Side Panel State
  const [rawInputText, setRawInputText] = useState<string>('');
  const [extractedBlocks, setExtractedBlocks] = useState<{ title: string; text: string }[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Heuristic Smart Resume Parser
  const parseRawResumeText = (rawText: string) => {
    setRawInputText(rawText);
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const blocks: { title: string; text: string }[] = [];

    let currentSection = 'General Bio';
    let currentLines: string[] = [];

    lines.forEach((line) => {
      const upper = line.toUpperCase();
      if (
        upper.includes('SUMMARY') ||
        upper.includes('PROFILE') ||
        upper.includes('EXPERIENCE') ||
        upper.includes('WORK HISTORY') ||
        upper.includes('EDUCATION') ||
        upper.includes('PROJECTS') ||
        upper.includes('SKILLS') ||
        upper.includes('ACHIEVEMENTS') ||
        upper.includes('LANGUAGES')
      ) {
        if (currentLines.length > 0) {
          blocks.push({ title: currentSection, text: currentLines.join('\n') });
        }
        currentSection = line;
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    });

    if (currentLines.length > 0) {
      blocks.push({ title: currentSection, text: currentLines.join('\n') });
    }

    setExtractedBlocks(blocks);

    // Auto assign recognized sections
    blocks.forEach((block) => {
      const t = block.title.toUpperCase();
      if (t.includes('SUMMARY') || t.includes('PROFILE')) {
        setSummary(block.text);
      } else if (t.includes('EXPERIENCE') || t.includes('WORK HISTORY')) {
        setExperience(block.text);
      } else if (t.includes('EDUCATION')) {
        setEducation(block.text);
      } else if (t.includes('PROJECTS')) {
        setProjects(block.text);
      } else if (t.includes('SKILL')) {
        setTechSkills(block.text);
      } else if (t.includes('ACHIEVEM')) {
        setAchievements(block.text);
      } else if (t.includes('LANGUAGE')) {
        setLanguages(block.text);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseRawResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handlePrint = () => {
    const element = document.getElementById('printable-resume');
    if (!element) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume_${name.toLowerCase().replace(/\s+/g, '_')}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              margin: 8mm;
              size: A4 portrait;
            }
            body {
              background: #ffffff !important;
              color: #111827 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body class="bg-white text-gray-900">
          <div style="padding: 15px; background: white;">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Editor Section Tabs */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('parser')}
          className={`flex-1 min-w-[130px] py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center space-x-1 ${
            activeTab === 'parser' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>★ Smart Auto-Parser</span>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'info' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          1. Contact Info
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'summary' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          2. Summary & Exp
        </button>
        <button
          onClick={() => setActiveTab('edu')}
          className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'edu' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          3. Edu & Projects
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 min-w-[110px] py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'skills' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          4. Skills & Extras
        </button>

        <button
          onClick={resetAllResume}
          title="Reset resume back to sample profile"
          className="px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-gray-400 hover:text-rose-400 hover:bg-gray-800 flex items-center space-x-1 shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Smart Auto-Parser & Quick Picker Side Panel Tab */}
      {activeTab === 'parser' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          {/* Left: Input Text or File Upload */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-sky-400">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Paste Raw Resume Text or Upload File:</span>
              </span>
              <label className="cursor-pointer text-[10px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-lg font-semibold flex items-center space-x-1">
                <Upload className="h-3 w-3" />
                <span>Upload TXT / DOC</span>
                <input type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              value={rawInputText}
              onChange={(e) => parseRawResumeText(e.target.value)}
              placeholder="Paste raw resume text here (e.g. WORK EXPERIENCE: ..., EDUCATION: ...). Toolip will auto-parse section blocks and populate form fields!"
              rows={10}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-emerald-300 focus:outline-none resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Right: Quick Picker Side Panel with 1-Click Assignment */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3 overflow-hidden flex flex-col h-full">
            <div className="text-xs font-semibold text-gray-300 flex justify-between items-center">
              <span className="flex items-center space-x-1 text-purple-400">
                <Zap className="h-4 w-4" />
                <span>Quick Picker Side Panel ({extractedBlocks.length} Blocks)</span>
              </span>
              <span className="text-[10px] text-gray-500">1-Click Assign to Fields</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-72 pr-1">
              {extractedBlocks.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-lg">
                  Paste resume text on the left to activate Quick Picker snippets!
                </div>
              ) : (
                extractedBlocks.map((block, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between items-center text-sky-400 font-bold text-[11px]">
                      <span>{block.title}</span>
                      <button
                        onClick={() => copySnippet(block.text)}
                        className="text-[10px] text-gray-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedSnippet === block.text ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSnippet === block.text ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-gray-300 text-[11px] line-clamp-2 font-mono">{block.text}</p>
                    
                    {/* Quick Assign Buttons */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        onClick={() => setSummary(block.text)}
                        className="px-2 py-0.5 bg-gray-800 hover:bg-sky-600 text-sky-300 hover:text-white text-[9px] rounded font-semibold transition-colors"
                      >
                        → Summary
                      </button>
                      <button
                        onClick={() => setExperience(block.text)}
                        className="px-2 py-0.5 bg-gray-800 hover:bg-sky-600 text-sky-300 hover:text-white text-[9px] rounded font-semibold transition-colors"
                      >
                        → Experience
                      </button>
                      <button
                        onClick={() => setEducation(block.text)}
                        className="px-2 py-0.5 bg-gray-800 hover:bg-sky-600 text-sky-300 hover:text-white text-[9px] rounded font-semibold transition-colors"
                      >
                        → Education
                      </button>
                      <button
                        onClick={() => setTechSkills(block.text)}
                        className="px-2 py-0.5 bg-gray-800 hover:bg-sky-600 text-sky-300 hover:text-white text-[9px] rounded font-semibold transition-colors"
                      >
                        → Skills
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor Form Inputs */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Professional Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Phone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">LinkedIn URL:</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-gray-300 font-semibold">GitHub / Portfolio URL:</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Professional Summary:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Work Experience:</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={6}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed font-mono"
            />
          </div>
        </div>
      )}

      {activeTab === 'edu' && (
        <div className="space-y-4 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Education & Degrees:</label>
            <textarea
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Featured Projects:</label>
            <textarea
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-300 font-semibold">Technical / Hard Skills (comma-separated):</label>
              <textarea
                value={techSkills}
                onChange={(e) => setTechSkills(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-300 font-semibold">Soft Skills (comma-separated):</label>
              <textarea
                value={softSkills}
                onChange={(e) => setSoftSkills(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-300 font-semibold">Achievements & Certifications:</label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-300 font-semibold">Languages Spoken:</label>
              <textarea
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Formatted Executive Resume Preview */}
      <div id="printable-resume" className="p-8 bg-white text-gray-900 rounded-2xl shadow-2xl space-y-5 print:p-0 print:shadow-none border border-gray-200">
        {/* Resume Header */}
        <div className="border-b-2 border-sky-600 pb-4 space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{name}</h1>
          <h2 className="text-sm font-bold text-sky-600 uppercase tracking-widest">{title}</h2>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600 pt-1 font-medium">
            {email && <span>📧 {email}</span>}
            {phone && <span>📞 {phone}</span>}
            {location && <span>📍 {location}</span>}
            {linkedin && <span>🔗 {linkedin}</span>}
            {github && <span>💻 {github}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
              Professional Summary
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed pt-0.5">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
              Work Experience
            </h3>
            <pre className="text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed pt-0.5">{experience}</pre>
          </div>
        )}

        {/* Projects */}
        {projects && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
              Featured Projects
            </h3>
            <pre className="text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed pt-0.5">{projects}</pre>
          </div>
        )}

        {/* Education */}
        {education && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
              Education
            </h3>
            <pre className="text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed pt-0.5">{education}</pre>
          </div>
        )}

        {/* Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {techSkills && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1 pt-1">
                {techSkills.split(',').map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-900 rounded text-[10px] font-medium">
                    {sk.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {softSkills && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
                Soft Skills & Leadership
              </h3>
              <div className="flex flex-wrap gap-1 pt-1">
                {softSkills.split(',').map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 rounded text-[10px] font-medium">
                    {sk.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Achievements & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {achievements && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
                Key Achievements & Certifications
              </h3>
              <pre className="text-[11px] text-gray-700 font-sans whitespace-pre-wrap pt-0.5">{achievements}</pre>
            </div>
          )}

          {languages && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider border-b border-gray-200 pb-0.5">
                Languages Spoken
              </h3>
              <p className="text-[11px] text-gray-700 pt-0.5">{languages}</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Print or Save Executive Resume as PDF</span>
      </button>
    </div>
  );
};
