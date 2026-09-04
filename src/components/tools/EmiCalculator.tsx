'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, PieChart, Table, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const EmiCalculator: React.FC = () => {
  const [amount, setAmount, resetAmount] = useLocalStorage<number>('toolip_emi_amount', 500000);
  const [interestRate, setInterestRate, resetInterestRate] = useLocalStorage<number>('toolip_emi_rate', 8.5);
  const [tenureYears, setTenureYears, resetTenureYears] = useLocalStorage<number>('toolip_emi_tenure', 5);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const resetEmiCalculator = () => {
    resetAmount();
    resetInterestRate();
    resetTenureYears();
  };

  const calculateEmi = () => {
    const P = amount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (P <= 0 || r <= 0 || n <= 0) return null;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const principalRatio = P / totalPayment;
    const interestRatio = totalInterest / totalPayment;

    // Amortization Schedule
    const schedule = [];
    let balance = P;
    for (let month = 1; month <= n; month++) {
      const interestForMonth = balance * r;
      const principalForMonth = emi - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      if (month <= 12 || month % 12 === 0 || month === n) {
        schedule.push({
          month,
          emi: Math.round(emi),
          principal: Math.round(principalForMonth),
          interest: Math.round(interestForMonth),
          balance: Math.round(balance),
        });
      }
    }

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent: (principalRatio * 100).toFixed(1),
      interestPercent: (interestRatio * 100).toFixed(1),
      principalRatio,
      interestRatio,
      schedule,
    };
  };

  const res = calculateEmi();

  return (
    <div className="space-y-6">
      {/* Reset Control Bar */}
      <div className="flex justify-end">
        <button
          onClick={resetEmiCalculator}
          title="Reset EMI calculator back to default values"
          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-rose-400 rounded-lg text-xs font-semibold transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Values</span>
        </button>
      </div>
      {/* Input Sliders & Number Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300 font-semibold">
            <span>Loan Principal Amount:</span>
            <span className="font-mono text-sky-400">₹{amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={10000}
            max={10000000}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300 font-semibold">
            <span>Annual Interest Rate (%):</span>
            <span className="font-mono text-sky-400">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300 font-semibold">
            <span>Tenure (Years):</span>
            <span className="font-mono text-sky-400">{tenureYears} Years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-sky-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Monthly EMI Highlight Banner */}
      {res && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                Monthly Loan EMI
              </div>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">
                ₹{res.monthlyEmi.toLocaleString()}
                <span className="text-sm font-normal text-gray-400"> / month</span>
              </div>
            </div>

            <div className="flex space-x-6 text-xs text-right">
              <div>
                <div className="text-gray-400">Total Interest Payable</div>
                <div className="text-xl font-bold text-amber-400 font-mono">
                  ₹{res.totalInterest.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Total Amount Payable</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{res.totalPayment.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* SVG Donut Chart & Breakdown Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-950 border border-gray-800 rounded-2xl items-center">
            {/* SVG Donut Chart */}
            <div className="flex justify-center relative">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  stroke="#38bdf8"
                  strokeWidth="24"
                  fill="transparent"
                  strokeDasharray={`${res.principalRatio * 439.8} 439.8`}
                />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  fill="transparent"
                  strokeDasharray={`${res.interestRatio * 439.8} 439.8`}
                  strokeDashoffset={`-${res.principalRatio * 439.8}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase text-gray-400 font-semibold">Total Payout</span>
                <span className="text-xs font-bold font-mono text-white">
                  ₹{(res.totalPayment / 100000).toFixed(2)}L
                </span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-sky-400 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-sky-400"></span>
                    Principal Loan Amount
                  </span>
                  <span className="font-mono text-white">{res.principalPercent}%</span>
                </div>
                <div className="text-gray-400 pl-4 font-mono">₹{amount.toLocaleString()}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                    Interest Payable
                  </span>
                  <span className="font-mono text-white">{res.interestPercent}%</span>
                </div>
                <div className="text-gray-400 pl-4 font-mono">₹{res.totalInterest.toLocaleString()}</div>
              </div>

              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-sky-500/30 text-sky-400 hover:text-sky-300 transition-all font-semibold text-xs"
              >
                <Table className="h-4 w-4" />
                <span>{showAmortization ? 'Hide Repayment Schedule' : 'View Monthly Amortization Table'}</span>
              </button>
            </div>
          </div>

          {/* Amortization Breakdown Table */}
          {showAmortization && (
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                <span>Monthly Amortization Schedule Highlights</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">EMI Paid</th>
                      <th className="py-2 px-3 text-sky-400">Principal</th>
                      <th className="py-2 px-3 text-amber-400">Interest</th>
                      <th className="py-2 px-3">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 text-gray-300">
                    {res.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-900/50">
                        <td className="py-2 px-3 font-semibold text-white">m{row.month}</td>
                        <td className="py-2 px-3">₹{row.emi.toLocaleString()}</td>
                        <td className="py-2 px-3 text-sky-300">₹{row.principal.toLocaleString()}</td>
                        <td className="py-2 px-3 text-amber-300">₹{row.interest.toLocaleString()}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-400">₹{row.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
