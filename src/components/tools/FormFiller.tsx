'use client';

import React, { useState } from 'react';
import { User, Copy, Check, Save } from 'lucide-react';

export const FormFiller: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: 'Himesh Kumar',
    email: 'himesh@example.com',
    phone: '+91 98765 43210',
    address: '123 Tech Park Avenue, Suite 400',
    city: 'Bengaluru',
    zip: '560001',
    company: 'Toolip Corp',
    title: 'Product Engineer',
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyField = (key: keyof typeof profile, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllProfile = () => {
    const fullText = `Full Name: ${profile.fullName}\nEmail: ${profile.email}\nPhone: ${profile.phone}\nAddress: ${profile.address}, ${profile.city} ${profile.zip}\nCompany: ${profile.company}\nTitle: ${profile.title}`;
    navigator.clipboard.writeText(fullText);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-sky-400" />
          <span className="text-xs font-semibold text-white">Form Auto-Fill Profile Store</span>
        </div>

        <button
          onClick={copyAllProfile}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md transition-colors"
        >
          {copiedKey === 'all' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedKey === 'all' ? 'Copied Full Profile!' : 'Copy Entire Profile'}</span>
        </button>
      </div>

      {/* Field Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(profile) as Array<keyof typeof profile>).map((field) => (
          <div key={field} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              <span>{field.replace(/([A-Z])/g, ' $1')}</span>
              <button
                onClick={() => copyField(field, profile[field])}
                className="text-sky-400 hover:underline flex items-center space-x-1"
              >
                {copiedKey === field ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === field ? 'Copied' : '1-Click Copy'}</span>
              </button>
            </div>
            <input
              type="text"
              value={profile[field]}
              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
