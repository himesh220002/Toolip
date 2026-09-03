'use client';

import React, { useState } from 'react';
import { GraduationCap, Award } from 'lucide-react';

export const CgpaConverter: React.FC = () => {
  const [cgpa, setCgpa] = useState<number>(8.5);
  const [scale, setScale] = useState<'cbse' | '10pt' | 'custom'>('cbse');
  const [customMultiplier, setCustomMultiplier] = useState<number>(9.5);

  const calculatePercentage = () => {
    let multiplier = 9.5;
    if (scale === 'cbse') multiplier = 9.5;
    else if (scale === '10pt') multiplier = 10;
    else multiplier = customMultiplier;

    const percentage = cgpa * multiplier;
    let division = 'Pass';
    if (percentage >= 75) division = 'First Class with Distinction';
    else if (percentage >= 60) division = 'First Class';
    else if (percentage >= 50) division = 'Second Class';
    else if (percentage >= 35) division = 'Third Class';
    else division = 'Fail';

    return {
      percentage: Math.min(100, Math.max(0, percentage)).toFixed(2),
      multiplier,
      division,
    };
  };

  const res = calculatePercentage();

  return (
    <div className="space-y-6">
      {/* Scale Selector */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
        <button
          onClick={() => setScale('cbse')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            scale === 'cbse' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          CBSE Formula (x 9.5)
        </button>
        <button
          onClick={() => setScale('10pt')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            scale === '10pt' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Direct 10-Point Scale (x 10)
        </button>
        <button
          onClick={() => setScale('custom')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            scale === 'custom' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Custom Multiplier
        </button>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300">Enter your CGPA / GPA:</label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.01}
            value={cgpa}
            onChange={(e) => setCgpa(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-lg font-mono font-bold text-sky-400 focus:outline-none"
          />
        </div>

        {scale === 'custom' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300">Custom Multiplier:</label>
            <input
              type="number"
              step={0.1}
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-lg font-mono font-bold text-amber-400 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Result Display */}
      <div className="p-6 bg-gradient-to-r from-yellow-950/60 to-amber-950/60 border border-yellow-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs uppercase tracking-wider text-yellow-400 font-semibold">
            Equivalent Percentage
          </div>
          <div className="text-4xl font-extrabold text-white font-mono mt-1">
            {res.percentage}%
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold justify-end">
            <Award className="h-4 w-4" />
            <span>{res.division}</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Formula: CGPA ({cgpa}) × {res.multiplier}
          </div>
        </div>
      </div>
    </div>
  );
};
