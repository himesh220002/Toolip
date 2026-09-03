'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

export const SignatureGenerator: React.FC = () => {
  const [fullName, setFullName] = useState<string>('Alex Johnson');
  const [role, setRole] = useState<string>('Senior Software Engineer');
  const [company, setCompany] = useState<string>('Toolip Inc.');
  const [email, setEmail] = useState<string>('alex@toolip.app');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [website, setWebsite] = useState<string>('https://toolip.app');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [themeColor, setThemeColor] = useState<string>('#0284c7');
  const [copied, setCopied] = useState<boolean>(false);

  const getSignatureHtml = () => {
    return `<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; color: #333333; font-size: 14px; line-height: 1.4;">
  <tr>
    <td style="padding-right: 15px; vertical-align: top;">
      <img src="${avatarUrl}" alt="${fullName}" width="70" height="70" style="border-radius: 50%; object-fit: cover;" />
    </td>
    <td style="border-left: 2px solid ${themeColor}; padding-left: 15px; vertical-align: top;">
      <div style="font-weight: bold; font-size: 16px; color: #111827;">${fullName}</div>
      <div style="color: ${themeColor}; font-size: 13px; font-weight: 600;">${role} | ${company}</div>
      <div style="margin-top: 8px; font-size: 12px; color: #4b5563;">
        <div>📧 <a href="mailto:${email}" style="color: #4b5563; text-decoration: none;">${email}</a></div>
        <div>📞 ${phone}</div>
        <div>🌐 <a href="${website}" style="color: ${themeColor}; text-decoration: none;">${website}</a></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Job Title:</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Company:</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Phone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Accent Color:</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-full h-8 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Signature Preview & Copy */}
      <div className="space-y-4">
        <div className="p-6 bg-white rounded-2xl shadow-xl text-gray-900 overflow-x-auto">
          <div dangerouslySetInnerHTML={{ __html: getSignatureHtml() }} />
        </div>

        <button
          onClick={copySignatureHtml}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition-all"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied Signature HTML!' : 'Copy HTML Signature Code'}</span>
        </button>
      </div>
    </div>
  );
};
