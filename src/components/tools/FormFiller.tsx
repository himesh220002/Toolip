'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  Briefcase,
  MapPin,
  HelpCircle,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  FileCode2,
  FileText,
  CloudDownload,
  CloudUpload,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getApiBaseUrl } from '@/lib/apiConfig';

export interface FormFieldItem {
  id: string;
  label: string;
  value: string;
  category: 'personal' | 'address' | 'work' | 'questions' | 'cover_letter' | 'custom';
  isCustom?: boolean;
}

const DEFAULT_FIELDS: FormFieldItem[] = [
  // 1. Personal Details
  { id: 'first_name', label: 'First Name', value: 'Himesh', category: 'personal' },
  { id: 'last_name', label: 'Last Name', value: 'Satyam', category: 'personal' },
  { id: 'full_name', label: 'Full Name', value: 'Himesh Satyam', category: 'personal' },
  { id: 'email', label: 'Email Address', value: 'satyamhimesh@gmail.com', category: 'personal' },
  { id: 'phone', label: 'Phone Number', value: '+91 81055 42318', category: 'personal' },
  { id: 'linkedin', label: 'LinkedIn URL', value: 'https://www.linkedin.com/in/himesh-satyam', category: 'personal' },
  { id: 'github', label: 'GitHub URL', value: 'https://github.com/himesh220002', category: 'personal' },
  { id: 'portfolio', label: 'Portfolio / Website', value: 'https://cyphertech.online', category: 'personal' },

  // 2. Address Details
  { id: 'country', label: 'Country', value: 'India', category: 'address' },
  { id: 'address_line1', label: 'Address Line 1', value: '123 Tech Park Avenue', category: 'address' },
  { id: 'address_line2', label: 'Address Line 2', value: 'Suite 400, Innovation Hub', category: 'address' },
  { id: 'town_city', label: 'Town / City', value: 'Bengaluru', category: 'address' },
  { id: 'state_province', label: 'State / Province', value: 'Karnataka', category: 'address' },
  { id: 'postcode_zip', label: 'Postcode / Zip Code', value: '560001', category: 'address' },

  // 3. Work & Profile
  { id: 'job_title', label: 'Current / Desired Job Title', value: 'Platform Software Engineer', category: 'work' },
  { id: 'company', label: 'Current / Recent Company', value: 'Toolip Technologies', category: 'work' },
  { id: 'years_exp', label: 'Years of Experience', value: '4+ Years', category: 'work' },
  { id: 'notice_period', label: 'Notice Period / Availability', value: 'Immediate / 15 Days', category: 'work' },
  { id: 'target_salary', label: 'Expected Salary / Rate', value: 'Competitive / Open for Discussion', category: 'work' },
  {
    id: 'personal_summary',
    label: 'Personal Summary / Bio',
    value:
      'Passionate Software Engineer specializing in scalable full-stack applications, modern TypeScript/Node.js microservices, Docker containerization, and cloud infrastructure.',
    category: 'work',
  },

  // 4. Screening Questions (Common Job Portal Questions)
  {
    id: 'q_linux',
    label: 'Linux Experience (1+ yrs)',
    value: 'Yes, 4+ years building and maintaining production services on Linux.',
    category: 'questions',
  },
  {
    id: 'q_docker',
    label: 'Docker & Containerization Exp',
    value: 'Yes, extensive experience with Docker, Compose, and Kubernetes deployments.',
    category: 'questions',
  },
  {
    id: 'q_multi_lang',
    label: 'Languages besides Python (Go, C++, Java, Rust)',
    value: 'Yes, extensively use TypeScript/JavaScript, Go, and C++ for high-performance apps.',
    category: 'questions',
  },
  {
    id: 'q_python',
    label: 'Python Development Experience (1+ yrs)',
    value: 'Yes, 3+ years writing asynchronous Python APIs, automation scripts, and backend services.',
    category: 'questions',
  },
  {
    id: 'q_production',
    label: 'Diagnosed Live Production Issues?',
    value: 'Yes, regularly monitor, debug, and patch critical live production systems and APIs.',
    category: 'questions',
  },
  {
    id: 'q_referral',
    label: 'How did you hear about this position?',
    value: 'LinkedIn / Company Careers Page',
    category: 'questions',
  },
  {
    id: 'q_work_auth',
    label: 'Authorized to work in target country?',
    value: 'Yes, legally authorized to work.',
    category: 'questions',
  },
  {
    id: 'q_sponsorship',
    label: 'Require visa sponsorship now or future?',
    value: 'No sponsorship required.',
    category: 'questions',
  },

  // 5. Generic Software Engineer Cover Letters
  {
    id: 'cover_letter_fullstack',
    label: 'Generic Software Engineer Cover Letter (Full-Stack / General)',
    value: `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at your company. With extensive experience architecting and building high-performance web applications, distributed systems, and scalable backend infrastructure, I am confident in my ability to make an immediate, positive impact on your engineering team.

In my recent projects, I have designed and implemented resilient microservices, optimized complex database queries, and built responsive user interfaces using modern technologies such as TypeScript, Node.js, Python, React, and Linux environment tooling. I have hands-on experience containerizing applications with Docker, deploying to cloud platforms, and diagnosing critical issues on live production systems under strict SLAs.

I thrive in collaborative, fast-paced environments where software quality, clean architecture, and rapid deployment are prioritized. I would welcome the opportunity to discuss how my technical expertise and problem-solving mindset align with your team's goals.

Thank you for your time and consideration.

Sincerely,
Himesh Satyam
satyamhimesh@gmail.com | +91 81055 42318`,
    category: 'cover_letter',
  },
  {
    id: 'cover_letter_backend',
    label: 'Backend & Systems Engineer Cover Letter (Linux / Docker Focus)',
    value: `Dear Engineering Team,

I am excited to submit my application for the Software Engineer role. As a backend-focused engineer with deep experience in system architecture, API design, and containerized deployments, I specialize in building fault-tolerant services that scale seamlessly under heavy workloads.

Throughout my software engineering career, I have worked heavily with Linux server administration, Python, Go, Node.js, and Docker container orchestration. I have a proven track record of troubleshooting live production incidents, implementing robust CI/CD deployment pipelines, and ensuring zero-downtime maintenance.

I am eager to bring my backend engineering skills and passion for high-reliability systems to your team. Thank you for considering my application.

Best regards,
Himesh Satyam
satyamhimesh@gmail.com`,
    category: 'cover_letter',
  },
  {
    id: 'cover_letter_short',
    label: 'Short Quick-Apply Cover Letter Pitch (2 Paragraphs)',
    value: `Hi Hiring Team,

I am a Software Engineer with extensive experience building production-ready web applications, microservices, and Linux-based infrastructure using Python, TypeScript, Node.js, and Docker. I take pride in writing clean, well-tested code and rapidly resolving complex production bugs under pressure.

I am eager to contribute to your engineering goals and would love to connect to discuss how my background fits your team. Thank you!

Best,
Himesh Satyam`,
    category: 'cover_letter',
  },
];

export const FormFiller: React.FC = () => {
  const [fields, setFields] = useLocalStorage<FormFieldItem[]>('toolip_form_fields_v3', DEFAULT_FIELDS);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auth User & Sync State
  const [authUser, setAuthUser] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // New Custom Field Form state
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'personal' | 'address' | 'work' | 'questions' | 'cover_letter' | 'custom'>('custom');
  const [isAddingField, setIsAddingField] = useState(false);

  // Interactive Test Form state
  const [simulatedForm, setSimulatedForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    address: '',
    city: '',
    country: '',
    linuxExp: '',
    dockerExp: '',
    pythonExp: '',
    prodIssues: '',
    coverLetter: '',
  });
  const [testAutoFilled, setTestAutoFilled] = useState(false);

  // Sync auth user state from localStorage and listen to global login/logout events
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('toolip_user_data');
        if (u) {
          try {
            setAuthUser(JSON.parse(u));
          } catch (e) {
            setAuthUser(null);
          }
        } else {
          setAuthUser(null);
        }
      }
    };
    checkAuth();
    window.addEventListener('toolip_auth_change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('toolip_auth_change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Check if current fields are modified from default values
  const isModifiedFromDefault = useMemo(() => {
    if (fields.length !== DEFAULT_FIELDS.length) return true;
    return fields.some((f, idx) => {
      const d = DEFAULT_FIELDS[idx];
      if (!d) return true;
      return f.id !== d.id || f.label !== d.label || f.value !== d.value || f.category !== d.category;
    });
  }, [fields]);

  // Filtered fields by tab and search query
  const filteredFields = useMemo(() => {
    return fields.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [fields, activeTab, searchQuery]);

  // Copy single field value
  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Copy category or all fields
  const handleCopyCategory = (catName: string) => {
    const targetItems = catName === 'all' ? fields : fields.filter((f) => f.category === catName);
    const formatted = targetItems.map((f) => `${f.label}:\n${f.value}`).join('\n\n---\n\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      setCopiedId(`cat_${catName}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Add Custom Field
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newField: FormFieldItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: newLabel.trim(),
      value: newValue.trim(),
      category: newCategory,
      isCustom: true,
    };

    setFields([...fields, newField]);
    setNewLabel('');
    setNewValue('');
    setIsAddingField(false);
  };

  // Update existing field
  const handleUpdateField = (id: string, updatedVal: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, value: updatedVal } : f)));
  };

  // Update field label (for custom fields)
  const handleUpdateLabel = (id: string, updatedLabel: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, label: updatedLabel } : f)));
  };

  // Delete single field
  const handleDeleteField = (id: string) => {
    if (confirm('Delete this field from your Quick Form Filler profile?')) {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  // Reset profile to default (Strict Confirmation if fields modified!)
  const handleReset = () => {
    if (isModifiedFromDefault) {
      const confirmed = confirm(
        '⚠️ CONFIRM RESET: You have custom edits or added fields in your profile!\n\nResetting will discard ALL your custom changes, added fields, and cover letters, reverting everything back to original defaults.\n\nAre you sure you want to reset?'
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm('Reset form filler profile back to default sample fields?');
      if (!confirmed) return;
    }

    setFields(DEFAULT_FIELDS);
    setSearchQuery('');
    setSyncNotification('Profile reset to original default values.');
    setTimeout(() => setSyncNotification(null), 3000);
  };

  // 1. Pull: MongoDB -> localStorage
  const handlePullServerData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('toolip_auth_token') : null;
    if (!token) {
      alert('Please log in to pull profile from MongoDB cloud storage.');
      return;
    }
    setIsSyncing(true);
    try {
      const backendUrl = getApiBaseUrl();
      const res = await fetch(`${backendUrl}/api/form-filler/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.fields) && json.fields.length > 0) {
        setFields(json.fields);
        setSyncNotification('📥 Successfully pulled profile from MongoDB cloud to device!');
      } else {
        setSyncNotification('ℹ️ No saved profile found on MongoDB server yet. Click Push to upload current profile.');
      }
    } catch (e) {
      setSyncNotification('❌ Failed to pull from server. Check network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotification(null), 4000);
    }
  };

  // 2. Push: localStorage -> MongoDB
  const handlePushServerData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('toolip_auth_token') : null;
    if (!token) {
      alert('Please log in to push profile to MongoDB cloud storage.');
      return;
    }
    setIsSyncing(true);
    try {
      const backendUrl = getApiBaseUrl();
      const res = await fetch(`${backendUrl}/api/form-filler/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fields }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSyncNotification('📤 Successfully pushed local profile fields to MongoDB cloud!');
      } else {
        setSyncNotification(`❌ Push failed: ${json.error || 'Unknown server error'}`);
      }
    } catch (e) {
      setSyncNotification('❌ Failed to push to server. Check network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotification(null), 4000);
    }
  };

  // 3. Auto-Sync: Pull server -> merge local -> Push server
  const handleAutoSync = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('toolip_auth_token') : null;
    if (!token) {
      alert('Please log in to auto-sync profile with MongoDB cloud storage.');
      return;
    }
    setIsSyncing(true);
    try {
      const backendUrl = getApiBaseUrl();
      // Step K: Pull server data
      const res = await fetch(`${backendUrl}/api/form-filler/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      let mergedFields = [...fields];
      if (res.ok && json.success && Array.isArray(json.fields) && json.fields.length > 0) {
        const serverFields: FormFieldItem[] = json.fields;
        const localFieldMap = new Map(fields.map((f) => [f.id, f]));

        mergedFields = serverFields.map((sf) => {
          const lf = localFieldMap.get(sf.id);
          return lf ? lf : sf;
        });

        const serverFieldIds = new Set(serverFields.map((sf) => sf.id));
        fields.forEach((lf) => {
          if (!serverFieldIds.has(lf.id)) {
            mergedFields.push(lf);
          }
        });

        setFields(mergedFields);
      }

      // Step L: Push merged result back to server
      const pushRes = await fetch(`${backendUrl}/api/form-filler/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fields: mergedFields }),
      });
      const pushJson = await pushRes.json();
      if (pushRes.ok && pushJson.success) {
        setSyncNotification('⚡ Auto-Sync Complete! Merged local & MongoDB cloud storage cleanly.');
      } else {
        setSyncNotification(`❌ Auto-sync push failed: ${pushJson.error || 'Unknown error'}`);
      }
    } catch (e) {
      setSyncNotification('❌ Auto-sync failed. Check network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotification(null), 4000);
    }
  };

  // Trigger login modal
  const handleOpenAuthModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('toolip_open_auth'));
    }
  };

  // Export profile JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(fields, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolip_form_filler_profile_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import profile JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].label && parsed[0].value) {
          setFields(parsed);
          alert('Successfully imported form profile JSON!');
        } else {
          alert('Invalid JSON structure. Expecting array of { label, value, category }.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Auto-fill simulated job application form
  const handleSimulateAutoFill = () => {
    const findVal = (key: string) => fields.find((f) => f.id === key || f.label.toLowerCase().includes(key.toLowerCase()))?.value || '';

    setSimulatedForm({
      firstName: findVal('first_name'),
      lastName: findVal('last_name'),
      email: findVal('email'),
      phone: findVal('phone'),
      linkedin: findVal('linkedin'),
      address: findVal('address_line1'),
      city: findVal('town_city'),
      country: findVal('country'),
      linuxExp: findVal('q_linux'),
      dockerExp: findVal('q_docker'),
      pythonExp: findVal('q_python'),
      prodIssues: findVal('q_production'),
      coverLetter: findVal('cover_letter_fullstack') || findVal('cover_letter_short'),
    });
    setTestAutoFilled(true);
    setTimeout(() => setTestAutoFilled(false), 3000);
  };

  // Category Tab Badges
  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return fields.length;
    return fields.filter((f) => f.category === cat).length;
  };

  return (
    <div className="space-y-6 text-white mx-auto">
      {/* Sync Status Banner */}
      {syncNotification && (
        <div className="p-3 bg-halo-cyan/10 border border-halo-cyan/40 rounded-xl text-xs font-semibold text-halo-cyan flex items-center justify-between shadow-lg animate-fade-in">
          <span>{syncNotification}</span>
          <button onClick={() => setSyncNotification(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="relative p-5 bg-gradient-to-r from-gunmetal-900 via-gray-900 to-gunmetal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-halo-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-halo-cyan/20 to-vice-purple/20 border border-halo-cyan/30 rounded-xl shadow-inner">
              <Zap className="h-6 w-6 text-halo-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-display tracking-wide text-white">Quick Form Auto-Filler Store</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-halo-cyan/10 border border-halo-cyan/30 text-halo-cyan rounded-full">
                  1-Click Ready
                </span>
                {isModifiedFromDefault && (
                  <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Modified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Save personal info, custom fields, screening answers, and generic cover letters for instant 1-click auto-fill on job forms.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsAddingField(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-br from-halo-cyan to-vice-purple text-black font-bold text-xs shadow-lg hover:brightness-110 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Field</span>
            </button>

            <button
              onClick={() => handleCopyCategory(activeTab)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              {copiedId === `cat_${activeTab}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-halo-cyan" />}
              <span>{copiedId === `cat_${activeTab}` ? 'Copied Section!' : 'Copy Section'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Export profile JSON"
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>

            <label
              title="Import profile JSON"
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={handleReset}
              title={isModifiedFromDefault ? 'Reset modified fields back to default' : 'Reset to default sample profile'}
              className={`p-2 rounded-xl border transition-colors ${isModifiedFromDefault
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-900/60'
                : 'bg-gray-800/80 border-white/10 text-gray-400 hover:text-rose-400'
                }`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3-Button Data Sync Control Bar */}
        <div className="mt-4 p-3 bg-gray-950/80 border border-white/10 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-lg ${authUser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
              {authUser ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>{authUser ? `Cloud Sync Active (${authUser.name || authUser.email})` : 'Device Storage Mode (LocalStorage Active)'}</span>
              </div>
              <p className="text-[11px] text-gray-400">
                {authUser
                  ? 'Use the 3 sync options below to transfer profile fields between Device Storage & MongoDB Atlas.'
                  : 'Edits save locally on this device. Log in to sync profile fields across browsers & devices via MongoDB.'}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {authUser ? (
              <>
                <button
                  onClick={handlePullServerData}
                  disabled={isSyncing}
                  title="Pull: MongoDB → localStorage"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-halo-cyan/30 text-halo-cyan font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  <CloudDownload className="h-3.5 w-3.5" />
                  <span>Pull (MongoDB → Local)</span>
                </button>

                <button
                  onClick={handlePushServerData}
                  disabled={isSyncing}
                  title="Push: localStorage → MongoDB"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-vice-pink/30 text-vice-pink font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  <CloudUpload className="h-3.5 w-3.5" />
                  <span>Push (Local → MongoDB)</span>
                </button>

                <button
                  onClick={handleAutoSync}
                  disabled={isSyncing}
                  title="Auto-Sync: Pull server data, merge local edits, and push updated state"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-halo-cyan to-vice-pink text-black font-bold text-xs shadow-md hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Auto-Sync (Pull → Push)</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleOpenAuthModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-halo-cyan/20 hover:bg-halo-cyan/30 border border-halo-cyan/50 text-halo-cyan font-bold text-xs transition-colors"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Log In for MongoDB Cloud Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Category Navigation */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Fields', icon: Sparkles },
              { id: 'personal', label: 'Personal', icon: User },
              { id: 'address', label: 'Address', icon: MapPin },
              { id: 'work', label: 'Work Profile', icon: Briefcase },
              { id: 'questions', label: 'Screening Questions', icon: HelpCircle },
              { id: 'cover_letter', label: 'Cover Letters', icon: FileText },
              { id: 'custom', label: 'Custom', icon: Tag },
              { id: 'simulator', label: 'Test Form Simulator', icon: FileCode2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive
                    ? 'bg-halo-cyan/20 border border-halo-cyan/50 text-halo-cyan shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                    : 'bg-gray-800/60 hover:bg-gray-800 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded-full ${isActive ? 'bg-halo-cyan/30 text-white' : 'bg-gray-900 text-gray-500'}`}>
                    {getCategoryCount(tab.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          {activeTab !== 'simulator' && (
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search profile fields & letters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-950/80 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-halo-cyan"
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Field Modal / Drawer */}
      {isAddingField && (
        <form onSubmit={handleAddCustomField} className="p-4 bg-gray-900 border border-halo-cyan/30 rounded-xl space-y-3 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-halo-cyan flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add New Field / Question
            </span>
            <button type="button" onClick={() => setIsAddingField(false)} className="text-xs text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Field Label / Question</label>
              <input
                type="text"
                placeholder="e.g. Work Authorization / Preferred Start Date"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-halo-cyan"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Field Value / Answer</label>
              <input
                type="text"
                placeholder="e.g. Authorized to work / Oct 1, 2026"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-halo-cyan"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-halo-cyan"
              >
                <option value="custom">Custom Field</option>
                <option value="questions">Screening Question</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="personal">Personal Info</option>
                <option value="address">Address</option>
                <option value="work">Work Profile</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-halo-cyan hover:bg-cyan-400 text-black font-bold text-xs rounded-lg shadow-md transition-colors"
            >
              Save New Field
            </button>
          </div>
        </form>
      )}

      {/* Main Content Area */}
      {activeTab === 'simulator' ? (
        /* Simulated Job Application Portal View */
        <div className="p-6 bg-gray-900 border border-white/10 rounded-2xl space-y-6 shadow-xl text-left">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-halo-cyan" />
                <span>Simulated Application Form (Brivo / Greenhouse / Lever Simulator)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Test 1-click auto-fill on a live simulated job portal to verify how your saved profile values and cover letter map to inputs.
              </p>
            </div>

            <button
              onClick={handleSimulateAutoFill}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${testAutoFilled
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-halo-cyan to-vice-pink text-black hover:brightness-110'
                }`}
            >
              <Zap className="h-4 w-4" />
              <span>{testAutoFilled ? '⚡ Form Auto-Filled!' : '⚡ 1-Click Auto-Fill Test Form'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-halo-cyan border-b border-halo-cyan/20 pb-1">
                1. Personal Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={simulatedForm.firstName}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={simulatedForm.lastName}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={simulatedForm.email}
                  onChange={(e) => setSimulatedForm({ ...simulatedForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={simulatedForm.linkedin}
                  onChange={(e) => setSimulatedForm({ ...simulatedForm, linkedin: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  placeholder="LinkedIn"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-vice-pink border-b border-vice-pink/20 pb-1">
                2. Address & Location
              </h4>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={simulatedForm.address}
                  onChange={(e) => setSimulatedForm({ ...simulatedForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  placeholder="Street Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Town / City</label>
                  <input
                    type="text"
                    value={simulatedForm.city}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={simulatedForm.country}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, country: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Screening Questions Section */}
            <div className="md:col-span-2 space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-amber-400/20 pb-1">
                3. Employer Screening Questions
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                    Do you have at least 1 year of software experience on Linux?
                  </label>
                  <textarea
                    rows={2}
                    value={simulatedForm.linuxExp}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, linuxExp: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                    Do you have professional experience with Docker / Containers?
                  </label>
                  <textarea
                    rows={2}
                    value={simulatedForm.dockerExp}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, dockerExp: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                    Do you have at least 1 year of Python development experience?
                  </label>
                  <textarea
                    rows={2}
                    value={simulatedForm.pythonExp}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, pythonExp: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                    Have you diagnosed and resolved issues on live production systems?
                  </label>
                  <textarea
                    rows={2}
                    value={simulatedForm.prodIssues}
                    onChange={(e) => setSimulatedForm({ ...simulatedForm, prodIssues: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter Section in Simulator */}
            <div className="md:col-span-2 space-y-2 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-400/20 pb-1">
                4. Cover Letter / Personal Statement
              </h4>
              <textarea
                rows={6}
                value={simulatedForm.coverLetter}
                onChange={(e) => setSimulatedForm({ ...simulatedForm, coverLetter: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-halo-cyan"
                placeholder="Paste or auto-fill your cover letter..."
              />
            </div>
          </div>
        </div>
      ) : (
        /* Regular Field Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {filteredFields.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-gray-900/50 border border-white/5 rounded-xl space-y-2">
              <HelpCircle className="h-8 w-8 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-400">No fields matching &quot;{searchQuery}&quot;</p>
              <button onClick={() => setSearchQuery('')} className="text-xs text-halo-cyan hover:underline">
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredFields.map((field) => {
              const isCopied = copiedId === field.id;
              const isLongText = field.value.length > 60 || field.id.startsWith('q_') || field.id === 'personal_summary' || field.category === 'cover_letter';

              return (
                <div
                  key={field.id}
                  className={`group relative p-4 bg-gray-900/80 hover:bg-gray-900 border border-white/10 hover:border-halo-cyan/40 rounded-xl transition-all duration-200 shadow-md space-y-2 ${field.category === 'cover_letter' ? 'md:col-span-2 border-emerald-500/30 bg-emerald-950/10' : ''
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">
                        {field.isCustom ? (
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateLabel(field.id, e.target.value)}
                            className="bg-transparent border-b border-halo-cyan/30 text-xs font-bold text-halo-cyan focus:outline-none"
                          />
                        ) : (
                          field.label
                        )}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-gray-800 text-gray-400 rounded">
                        {field.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopy(field.id, field.value)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${isCopied
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-halo-cyan/10 hover:bg-halo-cyan/20 text-halo-cyan border border-halo-cyan/30'
                          }`}
                      >
                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopied ? 'Copied!' : '1-Click Copy'}</span>
                      </button>

                      {field.isCustom && (
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete custom field"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isLongText ? (
                    <textarea
                      rows={field.category === 'cover_letter' ? 10 : 3}
                      value={field.value}
                      onChange={(e) => handleUpdateField(field.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-halo-cyan resize-y leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleUpdateField(field.id, e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-halo-cyan"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
