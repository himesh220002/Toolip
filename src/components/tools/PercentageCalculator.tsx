'use client';

import React, { useState } from 'react';
import { Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState<number>(20);
  const [m1Y, setM1Y] = useState<number>(250);

  // Mode 2: X is what % of Y?
  const [m2X, setM2X] = useState<number>(45);
  const [m2Y, setM2Y] = useState<number>(150);

  // Mode 3: Percentage Change from X to Y
  const [m3X, setM3X] = useState<number>(100);
  const [m3Y, setM3Y] = useState<number>(125);

  const res1 = (m1X / 100) * m1Y;
  const res2 = m2Y !== 0 ? (m2X / m2Y) * 100 : 0;
  const diff = m3Y - m3X;
  const res3 = m3X !== 0 ? (diff / m3X) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Tool 1 */}
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
          1. Calculate X% of Y
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span>What is</span>
          <input
            type="number"
            value={m1X}
            onChange={(e) => setM1X(Number(e.target.value))}
            className="w-20 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <span>% of</span>
          <input
            type="number"
            value={m1Y}
            onChange={(e) => setM1Y(Number(e.target.value))}
            className="w-24 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <span>?</span>
          <div className="ml-auto font-mono text-lg font-bold text-emerald-400">
            = {res1.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tool 2 */}
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
          2. Calculate Percentage Ratio (X is what % of Y)
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input
            type="number"
            value={m2X}
            onChange={(e) => setM2X(Number(e.target.value))}
            className="w-20 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <span>is what percentage of</span>
          <input
            type="number"
            value={m2Y}
            onChange={(e) => setM2Y(Number(e.target.value))}
            className="w-24 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <span>?</span>
          <div className="ml-auto font-mono text-lg font-bold text-sky-400">
            = {res2.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Tool 3 */}
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
          3. Percentage Increase / Decrease
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span>From</span>
          <input
            type="number"
            value={m3X}
            onChange={(e) => setM3X(Number(e.target.value))}
            className="w-24 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <span>to</span>
          <input
            type="number"
            value={m3Y}
            onChange={(e) => setM3Y(Number(e.target.value))}
            className="w-24 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white font-mono text-center"
          />
          <div className="ml-auto flex items-center space-x-1 font-mono text-lg font-bold">
            {res3 >= 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="h-5 w-5" /> +{res3.toFixed(2)}%
              </span>
            ) : (
              <span className="text-rose-400 flex items-center">
                <ArrowDownRight className="h-5 w-5" /> {res3.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
