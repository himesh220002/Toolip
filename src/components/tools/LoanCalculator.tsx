'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PieChart,
  Table,
  Download,
  Check,
  DollarSign,
  Calendar,
  Percent,
  TrendingUp,
  FileSpreadsheet,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const LoanCalculator: React.FC = () => {
  // Input State with Local Storage Persistence
  const [loanAmount, setLoanAmount, resetLoanAmount] = useLocalStorage<number>('toolip_loan_amount', 500000);
  const [interestRate, setInterestRate, resetInterestRate] = useLocalStorage<number>('toolip_loan_rate', 8.5);
  const [tenureYears, setTenureYears, resetTenureYears] = useLocalStorage<number>('toolip_loan_tenure', 5);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [copied, setCopied] = useState<boolean>(false);

  const resetLoanCalculator = () => {
    resetLoanAmount();
    resetInterestRate();
    resetTenureYears();
  };

  // EMI Math Calculation
  const calculationResults = useMemo(() => {
    const P = Math.max(1000, loanAmount);
    const R = Math.max(0.1, interestRate) / 12 / 100; // Monthly interest rate
    const N = tenureUnit === 'years' ? Math.max(1, tenureYears) * 12 : Math.max(1, tenureYears);

    // Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N - 1]
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    const principalPct = Math.round((P / totalPayment) * 100);
    const interestPct = 100 - principalPct;

    // Generate Amortization Schedule
    let balance = P;
    const schedule: Array<{
      month: number;
      year: number;
      principalPaid: number;
      interestPaid: number;
      totalPayment: number;
      remainingBalance: number;
    }> = [];

    for (let i = 1; i <= N; i++) {
      const interestForMonth = balance * R;
      const principalForMonth = emi - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      schedule.push({
        month: i,
        year: Math.ceil(i / 12),
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        totalPayment: emi,
        remainingBalance: balance,
      });
    }

    // Yearly Aggregation Schedule
    const yearlySchedule: Array<{
      year: number;
      principalPaid: number;
      interestPaid: number;
      totalPayment: number;
      endingBalance: number;
    }> = [];

    const totalYears = Math.ceil(N / 12);
    for (let y = 1; y <= totalYears; y++) {
      const monthsInYear = schedule.filter((s) => s.year === y);
      const yearPrincipal = monthsInYear.reduce((acc, curr) => acc + curr.principalPaid, 0);
      const yearInterest = monthsInYear.reduce((acc, curr) => acc + curr.interestPaid, 0);
      const yearPayment = monthsInYear.reduce((acc, curr) => acc + curr.totalPayment, 0);
      const endingBalance = monthsInYear[monthsInYear.length - 1]?.remainingBalance || 0;

      yearlySchedule.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        totalPayment: yearPayment,
        endingBalance,
      });
    }

    return {
      emi: Number(emi.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      principalPct,
      interestPct,
      monthlySchedule: schedule,
      yearlySchedule,
    };
  }, [loanAmount, interestRate, tenureYears, tenureUnit]);

  // Export Schedule to CSV File
  const downloadAmortizationCsv = () => {
    let csvContent = 'Year,Principal Paid (INR),Interest Paid (INR),Total Payment (INR),Ending Balance (INR)\n';
    calculationResults.yearlySchedule.forEach((row) => {
      csvContent += `${row.year},${row.principalPaid.toFixed(2)},${row.interestPaid.toFixed(2)},${row.totalPayment.toFixed(2)},${row.endingBalance.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_emi_schedule_${Date.now()}.csv`;
    a.click();
  };

  const copySummaryText = () => {
    const summary = `========================================
LOAN EMI CALCULATOR SUMMARY
========================================
Loan Amount (Principal): ₹${loanAmount.toLocaleString('en-IN')}
Annual Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureYears} ${tenureUnit}

CALCULATED BREAKDOWN:
- Monthly EMI: ₹${calculationResults.emi.toLocaleString('en-IN')}
- Total Interest Payable: ₹${calculationResults.totalInterest.toLocaleString('en-IN')} (${calculationResults.interestPct}%)
- Total Amount Payable: ₹${calculationResults.totalPayment.toLocaleString('en-IN')} (${calculationResults.principalPct}% Principal)
========================================`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Main Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column 1: Input Controls & Sliders */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5 backdrop-blur-xl lg:col-span-1 shadow-2xl">
          <div className="flex justify-between items-center text-xs font-extrabold text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            <span className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Loan Parameters</span>
            </span>

            <button
              onClick={resetLoanCalculator}
              title="Reset parameters back to defaults"
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-rose-400 rounded-lg text-[10px] transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Loan Amount:</span>
              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <span className="text-gray-400 font-mono text-xs">₹</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-28 bg-transparent text-emerald-400 font-mono font-extrabold text-md focus:outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min={10000}
              max={10000000}
              step={10000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="flex gap-1.5 pt-1">
              {[100000, 500000, 1000000, 2500000, 5000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setLoanAmount(amt)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${loanAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                >
                  ₹{(amt / 100000).toFixed(1)}L
                </button>
              ))}
            </div>
          </div>

          {/* 2. Annual Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Interest Rate (p.a.):</span>
              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-16 bg-transparent text-emerald-400 font-mono font-extrabold text-xs focus:outline-none"
                />
                <span className="text-gray-400 font-mono text-xs">%</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={25}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Loan Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Loan Tenure:</span>
              <div className="flex items-center space-x-2">
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setTenureUnit('years')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${tenureUnit === 'years' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                      }`}
                  >
                    Yr
                  </button>
                  <button
                    onClick={() => setTenureUnit('months')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${tenureUnit === 'months' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                      }`}
                  >
                    Mo
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-12 bg-transparent text-emerald-400 font-mono font-extrabold text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={tenureUnit === 'years' ? 30 : 360}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Middle Column 2: Calculated EMI Badges & Donut Breakdown */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5 backdrop-blur-xl lg:col-span-2 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-sky-400 uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" />
              <span>Calculated EMI & Interest Breakdown</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={copySummaryText}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={downloadAmortizationCsv}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* EMI Key Figures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly EMI */}
            <div className="p-4 bg-gradient-to-br from-emerald-950/80 to-slate-950 border border-emerald-500/40 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] text-gray-400 font-semibold">Equated Monthly Installment (EMI)</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                ₹{calculationResults.emi.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-300/80 font-mono">Per month payment</span>
            </div>

            {/* Total Interest Payable */}
            <div className="p-4 bg-gradient-to-br from-amber-950/80 to-slate-950 border border-amber-500/40 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] text-gray-400 font-semibold">Total Interest Payable</span>
              <div className="text-xl font-mono font-extrabold text-amber-400">
                ₹{calculationResults.totalInterest.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono">
                {calculationResults.interestPct}% of total payment
              </span>
            </div>

            {/* Total Amount Payable */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-500/40 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] text-gray-400 font-semibold">Total Amount Payable</span>
              <div className="text-xl font-mono font-extrabold text-indigo-300">
                ₹{calculationResults.totalPayment.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-indigo-300/80 font-mono">
                Principal + Interest
              </span>
            </div>
          </div>

          {/* Interactive SVG Donut Breakdown Chart */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-4 shadow-inner">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-32 w-32 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                />
                {/* Principal Segment */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4.5"
                  strokeDasharray={`${calculationResults.principalPct}, 100`}
                />
                {/* Interest Segment */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4.5"
                  strokeDasharray={`${calculationResults.interestPct}, 100`}
                  strokeDashoffset={`-${calculationResults.principalPct}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-mono font-extrabold text-white">
                  {calculationResults.principalPct}%
                </span>
                <span className="text-[9px] text-gray-400">Principal</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-gray-300 font-semibold">Principal Loan Amount:</span>
                <span className="font-mono text-emerald-400 font-extrabold">
                  ₹{loanAmount.toLocaleString('en-IN')} ({calculationResults.principalPct}%)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-gray-300 font-semibold">Total Interest Amount:</span>
                <span className="font-mono text-amber-400 font-extrabold">
                  ₹{calculationResults.totalInterest.toLocaleString('en-IN')} ({calculationResults.interestPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
            <Table className="h-4 w-4" />
            <span>Yearly Amortization Schedule Table</span>
          </div>

          <button
            onClick={downloadAmortizationCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-slate-700 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Schedule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-gray-400">
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Principal Paid (₹)</th>
                <th className="py-3 px-4">Interest Paid (₹)</th>
                <th className="py-3 px-4">Total Payment (₹)</th>
                <th className="py-3 px-4">Ending Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-gray-200">
              {calculationResults.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-950/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">Year {row.year}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    ₹{row.principalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">
                    ₹{row.interestPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sky-300 font-semibold">
                    ₹{row.totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    ₹{row.endingBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
