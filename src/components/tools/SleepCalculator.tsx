'use client';

import React, { useState } from 'react';
import { Moon, Clock, Sparkles, Sun } from 'lucide-react';

export const SleepCalculator: React.FC = () => {
  const [calcMode, setCalcMode] = useState<'wake' | 'bed'>('wake');
  const [targetTime, setTargetTime] = useState<string>('07:00');

  // Calculates 90-minute cycles plus 14 mins average time to fall asleep
  const calculateTimes = () => {
    const times: { cycles: number; hours: string; timeString: string; quality: string }[] = [];

    let baseDate = new Date();
    if (calcMode === 'bed') {
      // User inputs target wake-up time, calculate when to go to bed
      const [h, m] = targetTime.split(':').map(Number);
      baseDate.setHours(h, m, 0, 0);
    } else {
      // User sleeps now, calculate wake times
      baseDate = new Date();
    }

    const fallAsleepMins = 14;

    for (let c = 6; c >= 3; c--) {
      const totalMinutes = c * 90 + fallAsleepMins;
      const calcDate = new Date(baseDate.getTime());

      if (calcMode === 'bed') {
        calcDate.setMinutes(calcDate.getMinutes() - totalMinutes);
      } else {
        calcDate.setMinutes(calcDate.getMinutes() + totalMinutes);
      }

      const formatted = calcDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const hoursSleep = ((c * 90) / 60).toFixed(1);
      let quality = 'Optimal (90m REM x ' + c + ')';
      if (c === 6) quality = '★ Excellent (9 Hours)';
      if (c === 5) quality = '★ Suggested (7.5 Hours)';
      if (c === 4) quality = 'Good (6 Hours)';

      times.push({
        cycles: c,
        hours: hoursSleep,
        timeString: formatted,
        quality,
      });
    }

    return times;
  };

  const results = calculateTimes();

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl max-w-sm">
        <button
          onClick={() => setCalcMode('wake')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            calcMode === 'wake' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          If I sleep NOW → Wake at?
        </button>
        <button
          onClick={() => setCalcMode('bed')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            calcMode === 'bed' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Target Wake Time → Bedtime?
        </button>
      </div>

      {calcMode === 'bed' && (
        <div className="space-y-1 max-w-xs">
          <label className="text-xs font-semibold text-gray-300">I want to wake up at:</label>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none"
          />
        </div>
      )}

      {/* Suggested Sleep Windows */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
          {calcMode === 'wake' ? 'Recommended Wake Up Times:' : 'Recommended Bedtimes:'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {results.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                item.cycles === 5 || item.cycles === 6
                  ? 'bg-purple-950/60 border-purple-500/30 text-white shadow-lg'
                  : 'bg-gray-900/60 border-gray-800 text-gray-300'
              }`}
            >
              <div className="text-2xl font-extrabold font-mono text-purple-300">
                {item.timeString}
              </div>
              <div className="text-xs font-semibold text-gray-300 mt-1">{item.hours} Hours Sleep</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{item.quality}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
