'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';

export const AgeCalculator: React.FC = () => {
  const [dob, setDob] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const calculateAge = () => {
    if (!dob) return null;

    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return null;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total metrics
    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;

    // Next birthday calculation
    let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      daysToNextBday,
    };
  };

  const result = calculateAge();

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Date of Birth (DOB):</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Age at Date (Default Today):</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Results Cards */}
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 p-6 bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/20 rounded-2xl text-center shadow-lg">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">{result.years}</div>
              <div className="text-xs text-sky-400 font-medium uppercase mt-1">Years</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">{result.months}</div>
              <div className="text-xs text-sky-400 font-medium uppercase mt-1">Months</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">{result.days}</div>
              <div className="text-xs text-sky-400 font-medium uppercase mt-1">Days</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-gray-400">Total Days Lived</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {result.totalDays.toLocaleString()} days
              </div>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-gray-400">Total Hours</div>
              <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                {result.totalHours.toLocaleString()} hours
              </div>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-gray-400">Next Birthday Countdown</div>
              <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                {result.daysToNextBday} days left
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 text-xs">
          Select a valid birth date to calculate exact age metrics.
        </div>
      )}
    </div>
  );
};
