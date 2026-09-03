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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Bill Total Amount ($ / ₹):</label>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none shadow-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Split Between Diners:</label>
          <input
            type="number"
            min={1}
            value={splitDiners}
            onChange={(e) => setSplitDiners(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Preset Tip Percent Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">Select Tip Percentage:</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((pct) => (
            <button
              key={pct}
              onClick={() => setTipPercent(pct)}
              className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-xs font-bold border transition-all ${
                tipPercent === pct
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="text-emerald-800 font-bold">Total Tip</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            ${tipTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
          <div className="text-sky-800 font-bold">Total Bill + Tip</div>
          <div className="text-2xl font-extrabold text-sky-700 font-mono mt-1">
            ${grandTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="text-amber-800 font-bold">Per Person Total</div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">
            ${perPerson.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
