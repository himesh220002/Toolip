'use client';

import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    generatePassword();
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const generatePassword = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      setPassword('');
      return;
    }

    let result = '';
    const array = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    setPassword(result);
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthScore = () => {
    let score = 0;
    if (length >= 12) score += 2;
    else if (length >= 8) score += 1;
    if (useUpper) score += 1;
    if (useLower) score += 1;
    if (useNumbers) score += 1;
    if (useSymbols) score += 1;

    if (score >= 5) return { label: 'Strong', color: 'bg-emerald-500 text-emerald-400' };
    if (score >= 3) return { label: 'Medium', color: 'bg-amber-500 text-amber-400' };
    return { label: 'Weak', color: 'bg-rose-500 text-rose-400' };
  };

  const strength = getStrengthScore();

  return (
    <div className="space-y-6">
      {/* Generated Password Box */}
      <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl">
        <div className="font-mono text-xl font-bold text-sky-300 break-all select-all pr-4">
          {password || <span className="text-gray-600">Select options below</span>}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={generatePassword}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={copyPassword}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="flex items-center space-x-3 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl">
        <ShieldCheck className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-400 font-medium">Security Score:</span>
        <span className={`text-xs font-bold ${strength.color.split(' ')[1]}`}>
          {strength.label}
        </span>
      </div>

      {/* Length Slider */}
      <div className="space-y-2 p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex justify-between text-xs text-gray-300 font-semibold">
          <span>Password Length:</span>
          <span className="font-mono text-sky-400">{length} characters</span>
        </div>
        <input
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
        />
      </div>

      {/* Checkbox Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700">
          <input
            type="checkbox"
            checked={useUpper}
            onChange={(e) => setUseUpper(e.target.checked)}
            className="accent-sky-500 h-4 w-4 rounded"
          />
          <span className="text-xs text-gray-200 font-medium">A-Z Uppercase</span>
        </label>

        <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700">
          <input
            type="checkbox"
            checked={useLower}
            onChange={(e) => setUseLower(e.target.checked)}
            className="accent-sky-500 h-4 w-4 rounded"
          />
          <span className="text-xs text-gray-200 font-medium">a-z Lowercase</span>
        </label>

        <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700">
          <input
            type="checkbox"
            checked={useNumbers}
            onChange={(e) => setUseNumbers(e.target.checked)}
            className="accent-sky-500 h-4 w-4 rounded"
          />
          <span className="text-xs text-gray-200 font-medium">0-9 Numbers</span>
        </label>

        <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700">
          <input
            type="checkbox"
            checked={useSymbols}
            onChange={(e) => setUseSymbols(e.target.checked)}
            className="accent-sky-500 h-4 w-4 rounded"
          />
          <span className="text-xs text-gray-200 font-medium">!@# Symbols</span>
        </label>
      </div>
    </div>
  );
};
