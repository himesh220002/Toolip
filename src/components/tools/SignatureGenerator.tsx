'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Sliders,
} from 'lucide-react';

export const SignatureGenerator: React.FC = () => {
  const [fullName, setFullName] = useState<string>('Alex Johnson');
  const [role, setRole] = useState<string>('Senior Software Engineer');
  const [company, setCompany] = useState<string>('Toolip Inc.');
  const [email, setEmail] = useState<string>('alex@toolip.app');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [website, setWebsite] = useState<string>('https://toolip.app');
  
  // Photo Link Filler & Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  );
  const [avatarShape, setAvatarShape] = useState<'circle' | 'rounded' | 'square'>('circle');
  const [avatarSize, setAvatarSize] = useState<number>(75); // 40px to 100px
  const [showBorder, setShowBorder] = useState<boolean>(true);
  
  const [themeColor, setThemeColor] = useState<string>('#4f46e5');
  const [copied, setCopied] = useState<boolean>(false);

  // Sample Photo Link Presets
  const SAMPLE_PHOTO_LINKS = [
    {
      label: 'Executive Female',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    {
      label: 'Tech Male',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    {
      label: 'Creative Professional',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    },
    {
      label: 'Corporate Leader',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    },
  ];

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getBorderRadius = () => {
    if (avatarShape === 'circle') return '50%';
    if (avatarShape === 'rounded') return '12px';
    return '0px';
  };

  const getSignatureHtml = () => {
    const borderRadius = getBorderRadius();
    const borderStyle = showBorder ? `border: 2px solid ${themeColor};` : '';

    return `<table cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', Arial, sans-serif; color: #333333; font-size: 14px; line-height: 1.4;">
  <tr>
    <td style="padding-right: 16px; vertical-align: top;">
      <img src="${avatarUrl}" alt="${fullName}" width="${avatarSize}" height="${avatarSize}" style="width: ${avatarSize}px; height: ${avatarSize}px; border-radius: ${borderRadius}; object-fit: cover; ${borderStyle} display: block;" />
    </td>
    <td style="border-left: 3px solid ${themeColor}; padding-left: 16px; vertical-align: top;">
      <div style="font-weight: 800; font-size: 16px; color: #0f172a; tracking-tight: -0.02em;">${fullName}</div>
      <div style="color: ${themeColor}; font-size: 13px; font-weight: 700; margin-top: 2px;">${role} ${company ? `| ${company}` : ''}</div>
      <div style="margin-top: 10px; font-size: 12px; color: #475569; space-y: 3px;">
        <div style="margin-bottom: 2px;">📧 <a href="mailto:${email}" style="color: #475569; text-decoration: none; font-weight: 500;">${email}</a></div>
        ${phone ? `<div style="margin-bottom: 2px;">📞 <span style="color: #475569;">${phone}</span></div>` : ''}
        ${website ? `<div>🌐 <a href="${website}" style="color: ${themeColor}; text-decoration: none; font-weight: 600;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
      </div>
    </td>
  </tr>
</table>`;
  };

  const copySignatureHtml = () => {
    navigator.clipboard.writeText(getSignatureHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Professional Email Signature Studio</span>
        </div>

        <button
          onClick={copySignatureHtml}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 hover:from-indigo-400 hover:to-sky-300 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied HTML Signature!' : 'Copy HTML Signature Code'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form & Photo Link Filler */}
        <div className="space-y-5">
          {/* Photo Link Filler & Upload Panel */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                <span>Photo Link Filler & Avatar</span>
              </label>

              {/* Local File Upload Label */}
              <label className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold cursor-pointer border border-slate-700/60 transition-all">
                <Upload className="h-3 w-3" />
                <span>Upload Local Photo</span>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Link Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-indigo-400" />
                <span>Photo / Logo Image URL (HTTP/HTTPS):</span>
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-headshot.jpg"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>

            {/* Quick Sample Photo Links Preset Bar */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                ★ Quick Sample Photo Fillers:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SAMPLE_PHOTO_LINKS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all truncate ${
                      avatarUrl === preset.url
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Shape & Size Controls */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-300 font-semibold">Avatar Shape:</label>
                <div className="flex p-0.5 bg-slate-950 border border-slate-800 rounded-xl">
                  {(['circle', 'rounded', 'square'] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setAvatarShape(shape)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                        avatarShape === shape
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span className="font-semibold">Photo Size:</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{avatarSize}px</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={avatarSize}
                  onChange={(e) => setAvatarSize(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Panel */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="h-4 w-4" />
              <span>Contact & Brand Info</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Full Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Job Title:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Company / Org:</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Phone Number:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Accent Theme Color:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-9 w-12 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Signature Preview & Code Output */}
        <div className="space-y-5">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Live Signature Visual Render
              </label>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Gmail & Outlook Compatible
              </span>
            </div>

            {/* Rendered HTML Container */}
            <div className="p-6 bg-white rounded-2xl border border-slate-700 shadow-2xl overflow-x-auto min-h-[160px] flex items-center">
              <div dangerouslySetInnerHTML={{ __html: getSignatureHtml() }} />
            </div>
          </div>

          {/* Raw HTML Code Output Drawer */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Generated Table HTML Code
            </label>
            <textarea
              readOnly
              value={getSignatureHtml()}
              className="w-full h-44 p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-sky-300 focus:outline-none resize-none shadow-inner"
            />
          </div>

          <button
            onClick={copySignatureHtml}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            {copied ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5" />}
            <span>{copied ? 'Copied Signature HTML Code!' : 'Copy HTML Signature Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
