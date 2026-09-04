'use client';

import React, { useState } from 'react';
import { Droplets, Flame, Sun, Sparkles, CheckCircle2, Info, GlassWater, Dumbbell } from 'lucide-react';

export const WaterCalculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityMins, setActivityMins] = useState<number>(30); // 30 mins exercise
  const [climate, setClimate] = useState<'normal' | 'hot'>('normal');

  // Calculates daily water intake
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

    return { totalMl, liters, glasses, baseMl, exerciseMl, climateMl };
  };

  const result = calculateWaterGoal();

  // Reference Table Brackets (4th Attached Image)
  const intakeBrackets = [
    { range: '40–60 KG', target: 'Min. 1.4 Ltr', desc: 'Light / Petite Body Weight' },
    { range: '60–80 KG', target: 'Min. 2.1 Ltr', desc: 'Average Adult Weight' },
    { range: '80–100 KG', target: 'Min. 2.8 Ltr', desc: 'Athletic / Heavy Weight' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Daily Water Intake Calculator</h3>
            <p className="text-[11px] text-gray-400">Personalized hydration targets based on bodyweight, activity level & climate</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-2xl border border-cyan-800/50">
          <GlassWater className="h-4 w-4 text-cyan-400" />
          <span>250ml Standard Glass Standard</span>
        </div>
      </div>

      {/* Main Studio 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): User Inputs & Visual Water Bottle Animation */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Inputs Form Card */}
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-5">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Dumbbell className="h-4 w-4 text-cyan-400" />
              <span>Body Metrics & Activity Inputs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Body Weight Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-300">Body Weight (kg):</label>
                  <span className="font-mono text-cyan-400 font-extrabold">{weightKg} kg</span>
                </div>
                <input
                  type="number"
                  min={30}
                  max={200}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="range"
                  min={30}
                  max={150}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Daily Exercise Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-300">Daily Exercise (mins):</label>
                  <span className="font-mono text-cyan-400 font-extrabold">{activityMins} min</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={300}
                  step={15}
                  value={activityMins}
                  onChange={(e) => setActivityMins(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={15}
                  value={activityMins}
                  onChange={(e) => setActivityMins(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Climate Environment Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Climate Environment:</label>
                <select
                  value={climate}
                  onChange={(e) => setClimate(e.target.value as 'normal' | 'hot')}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 text-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="normal">Normal / Moderate Climate</option>
                  <option value="hot">Hot / Humid Weather (+500ml)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Hydration Target Result & Bottle Visualizer */}
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Target Numbers */}
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-extrabold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Calculated Daily Target</span>
              </div>

              <div>
                <div className="text-5xl font-extrabold font-mono text-white">
                  {result.liters} <span className="text-lg font-normal text-cyan-400">Liters / day</span>
                </div>
                <div className="text-xs text-gray-400 font-mono mt-1">
                  ≈ {result.totalMl} ml total fluid requirement
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-gray-400">Glass Count: </span>
                  <span className="text-cyan-300 font-extrabold text-sm">{result.glasses} Glasses</span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-gray-400">Base Weight Fluid: </span>
                  <span className="text-cyan-300 font-extrabold text-sm">{(result.baseMl / 1000).toFixed(2)}L</span>
                </div>
              </div>
            </div>

            {/* Visual Animated Water Bottle Graphic */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-slate-800 rounded-2xl w-full sm:w-48">
              <div className="relative w-20 h-40 border-4 border-cyan-400/60 rounded-b-3xl rounded-t-xl overflow-hidden bg-slate-950 flex flex-col justify-end p-1 shadow-inner">
                {/* Bottle Cap */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-cyan-500 rounded-t-sm" />

                {/* Animated Liquid Water Level */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-b-2xl transition-all duration-700 relative overflow-hidden"
                  style={{ height: `${Math.min(100, Math.max(30, (Number(result.liters) / 3.5) * 100))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="text-[11px] font-mono text-cyan-300 font-bold mt-3">
                {result.liters} L Target Fill
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Reference Image 4 Bodyweight Water Intake Chart */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5 backdrop-blur-xl shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span>Bodyweight Water Intake Chart</span>
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Standard Daily Requirement Guide (as shown in health reference)
            </p>
          </div>

          {/* Reference Image Chart Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="text-xs font-extrabold text-cyan-300 text-center uppercase tracking-widest border-b border-slate-800 pb-2">
              How Much Water Should You Drink In A Day?
            </div>

            <div className="space-y-2">
              {intakeBrackets.map((item, idx) => {
                const isActive =
                  (idx === 0 && weightKg <= 60) ||
                  (idx === 1 && weightKg > 60 && weightKg <= 80) ||
                  (idx === 2 && weightKg > 80);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono font-extrabold">{item.range}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-extrabold text-cyan-300">{item.target}</div>
                      {isActive && (
                        <div className="text-[9px] font-bold text-emerald-400 flex items-center space-x-1 justify-end">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>YOUR BRACKET</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hydration Tips Box */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs space-y-1.5">
            <div className="font-extrabold flex items-center space-x-1.5 text-cyan-300">
              <Info className="h-4 w-4" />
              <span>Hydration Best Practices:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-gray-300">
              <li>• Drink 1 full glass of water immediately upon waking up to activate organs.</li>
              <li>• Drink 1 glass 30 minutes before meals to aid digestive breakdown.</li>
              <li>• Increase fluid intake by +350ml for every 30 minutes of cardio or intense exercise.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
