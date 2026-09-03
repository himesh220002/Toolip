'use client';

import React, { useState } from 'react';
import { Droplets, HeartPulse, Sun } from 'lucide-react';

export const WaterCalculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityMins, setActivityMins] = useState<number>(30); // 30 mins exercise
  const [climate, setClimate] = useState<'normal' | 'hot'>('normal');

  const calculateWaterGoal = () => {
    // Base rule: 35ml per kg body weight
    let baseMl = weightKg * 35;
    // Add 350ml for every 30 mins of exercise
    let exerciseMl = (activityMins / 30) * 350;
    // Add 500ml for hot climate
    let climateMl = climate === 'hot' ? 500 : 0;

    const totalMl = baseMl + exerciseMl + climateMl;
    const liters = (totalMl / 1000).toFixed(2);
    const glasses = Math.round(totalMl / 250); // 250ml per standard glass

    return { totalMl, liters, glasses };
  };

  const result = calculateWaterGoal();

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Body Weight (kg):</label>
          <input
            type="number"
            min={30}
            max={200}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Daily Exercise (mins):</label>
          <input
            type="number"
            min={0}
            max={300}
            step={15}
            value={activityMins}
            onChange={(e) => setActivityMins(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Climate Environment:</label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value as 'normal' | 'hot')}
            className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
          >
            <option value="normal">Normal / Moderate Climate</option>
            <option value="hot">Hot / Humid Weather (+500ml)</option>
          </select>
        </div>
      </div>

      {/* Hydration Goal Result */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Droplets className="h-8 w-8" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
              Daily Target Hydration
            </div>
            <div className="text-4xl font-extrabold text-white font-mono mt-1">
              {result.liters} <span className="text-sm font-normal text-gray-400">Liters / day</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-sky-400 font-mono">
            ~ {result.glasses} Glasses
          </div>
          <div className="text-xs text-gray-400 mt-0.5">(250ml per glass)</div>
        </div>
      </div>
    </div>
  );
};
