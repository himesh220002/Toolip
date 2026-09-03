'use client';

import React, { useState } from 'react';
import { DollarSign, Percent } from 'lucide-react';

export const TipCalculator: React.FC = () => {
  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [splitDiners, setSplitDiners] = useState<number>(2);

  const presets = [10, 15, 18, 20, 25];

  const tipTotal = (billAmount * tipPercent) / 100;
  const grandTotal = billAmount + tipTotal;
  const perPerson = splitDiners > 0 ? grandTotal / splitDiners : grandTotal;

  return (
    <div className="space-y-6">
      {/* Bill & Diners Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Bill Total Amount ($ / ₹):</label>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Split Between Diners:</label>
          <input
            type="number"
            min={1}
            value={splitDiners}
            onChange={(e) => setSplitDiners(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Preset Tip Percent Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300">Select Tip Percentage:</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((pct) => (
            <button
              key={pct}
              onClick={() => setTipPercent(pct)}
              className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                tipPercent === pct
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="text-gray-400">Total Tip</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${tipTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="text-gray-400">Total Bill + Tip</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            ${grandTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
          <div className="text-gray-400">Per Person Total</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            ${perPerson.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
