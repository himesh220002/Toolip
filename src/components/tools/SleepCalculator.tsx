'use client';

import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Activity,
  ShieldAlert,
  Plus,
  Trash2,
  Sliders,
  BatteryCharging,
  Info,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SleepBlock {
  id: string;
  name: string;
  startHour: number; // 0 to 24 (float)
  endHour: number;   // 0 to 24 (float)
}

const DEFAULT_SLEEP_BLOCKS: SleepBlock[] = [
  { id: '1', name: 'Night Sleep', startHour: 23, endHour: 6.5 }, // 11:00 PM to 6:30 AM (7.5h)
  { id: '2', name: 'Afternoon Nap', startHour: 13.5, endHour: 14.25 }, // 1:30 PM to 2:15 PM (0.75h)
];

export const SleepCalculator: React.FC = () => {
  // Mode: Calculator vs 24-Hour Studio
  const [activeTab, setActiveTab] = useState<'studio' | 'quick'>('studio');

  // Quick mode state with local storage persistence
  const [calcMode, setCalcMode, resetCalcMode] = useLocalStorage<'wake' | 'bed'>('toolip_sleep_calcmode', 'wake');
  const [targetTime, setTargetTime, resetTargetTime] = useLocalStorage<string>('toolip_sleep_targettime', '07:00');

  // 24-Hour Sleep Blocks state with local storage persistence
  const [sleepBlocks, setSleepBlocks, resetSleepBlocks] = useLocalStorage<SleepBlock[]>('toolip_sleep_blocks', DEFAULT_SLEEP_BLOCKS);

  // Chronic Duration Toggle (Continuous up to weeks or months?)
  const [isChronic, setIsChronic, resetIsChronic] = useLocalStorage<boolean>('toolip_sleep_chronic', false);

  // Clickable Line Legend Dropdown state (Line 1, Line 2, Line 3)
  const [openLegendLine, setOpenLegendLine] = useState<string | null>(null);

  const resetSleepCalculator = () => {
    resetCalcMode();
    resetTargetTime();
    resetSleepBlocks();
    resetIsChronic();
  };

  const toggleLegendLine = (lineId: string) => {
    setOpenLegendLine((prev) => (prev === lineId ? null : lineId));
  };

  // Mouse hover state for interactive graph inspection
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  // Helper: Check if a float hour (0 to 24) falls inside any sleep block
  const isHourInSleep = (hour: number, blocks: SleepBlock[]): { inSleep: boolean; blockName?: string } => {
    for (const b of blocks) {
      if (b.startHour <= b.endHour) {
        if (hour >= b.startHour && hour <= b.endHour) {
          return { inSleep: true, blockName: b.name };
        }
      } else {
        // Wraps midnight (e.g. 23:00 to 06:30)
        if (hour >= b.startHour || hour <= b.endHour) {
          return { inSleep: true, blockName: b.name };
        }
      }
    }
    return { inSleep: false };
  };

  // Dynamically calculate 24-hour graph points for Process S (Sleep Pressure) & Process C (Circadian Drive)
  const calculateDynamicCurves = (blocks: SleepBlock[]) => {
    const steps = 96; // 15-minute resolution across 24h
    const sPoints: { x: number; y: number; sVal: number; cVal: number; hour: number; isSleep: boolean; blockName?: string }[] = [];
    const cPoints: { x: number; y: number; cVal: number; hour: number }[] = [];

    // Perform 2 passes to ensure seamless midnight-wrap equilibrium
    let sVal = 30;
    for (let pass = 0; pass < 2; pass++) {
      sPoints.length = 0;
      cPoints.length = 0;

      for (let i = 0; i <= steps; i++) {
        const hour = (i / steps) * 24;
        const x = 50 + (hour / 24) * 500; // SVG canvas x: 50 to 550
        const { inSleep, blockName } = isHourInSleep(hour, blocks);

        if (inSleep) {
          // Discharges sleep pressure during sleep (decreases)
          sVal = Math.max(8, sVal - 1.85);
        } else {
          // Accumulates sleep pressure during wakefulness (increases)
          sVal = Math.min(94, sVal + 1.25);
        }

        // Process C (Circadian alertness drive: sinusoidal 24h cycle peaking ~17:00, lowest ~05:00)
        const cPhase = ((hour - 11) * 2 * Math.PI) / 24;
        const cVal = 50 + 35 * Math.sin(cPhase);

        // Convert percentages (0 to 100) to SVG Y coordinates (canvas height 220; top y=30, bottom y=170)
        const sy = 170 - (sVal / 100) * 140;
        const cy = 170 - (cVal / 100) * 140;

        sPoints.push({ x, y: sy, sVal, cVal, hour, isSleep: inSleep, blockName });
        cPoints.push({ x, y: cy, cVal, hour });
      }
    }

    // Build SVG Path strings
    const sPathD = sPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const cPathD = cPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    // Closed path for Process S area fill under curve
    const sAreaD = `${sPathD} L 550 170 L 50 170 Z`;

    // Find Sleep Gate (hour where S - C gap is maximized)
    let maxDiff = -Infinity;
    let sleepGatePoint = sPoints[0];
    for (const p of sPoints) {
      const diff = p.sVal - p.cVal;
      if (diff > maxDiff) {
        maxDiff = diff;
        sleepGatePoint = p;
      }
    }

    return { sPoints, cPoints, sPathD, cPathD, sAreaD, sleepGatePoint };
  };

  const dynamicGraph = calculateDynamicCurves(sleepBlocks);

  // Helper: Calculate total sleep hours across blocks
  const calculateTotalSleepHours = (blocks: SleepBlock[]): number => {
    return blocks.reduce((sum, block) => {
      let duration = block.endHour - block.startHour;
      if (duration < 0) duration += 24; // Crosses midnight
      return sum + duration;
    }, 0);
  };

  const totalSleepDuration = calculateTotalSleepHours(sleepBlocks);

  // Add new sleep block
  const addSleepBlock = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setSleepBlocks((prev) => [
      ...prev,
      { id: newId, name: `Sleep Section ${prev.length + 1}`, startHour: 14, endHour: 15 },
    ]);
  };

  // Remove sleep block
  const removeSleepBlock = (id: string) => {
    if (sleepBlocks.length <= 1) return;
    setSleepBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Update sleep block times
  const updateSleepBlock = (id: string, field: 'name' | 'startHour' | 'endHour', val: any) => {
    setSleepBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  // Format Float Hours deterministically (e.g. 23.5 -> "11:30 PM") to avoid SSR/client hydration mismatch
  const formatHourLabel = (h: number): string => {
    const norm = (h + 24) % 24;
    const hrs24 = Math.floor(norm);
    const mins = Math.round((norm - hrs24) * 60);
    const period = hrs24 >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs12}:${minsStr} ${period}`;
  };

  // Quick Mode Calculation (90m cycles + 14m fall asleep)
  const calculateQuickTimes = () => {
    const times: { cycles: number; hours: string; timeString: string; quality: string }[] = [];
    let baseDate = new Date();
    if (calcMode === 'bed') {
      const [h, m] = targetTime.split(':').map(Number);
      baseDate.setHours(h, m, 0, 0);
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

      const hrs24 = calcDate.getHours();
      const mins = calcDate.getMinutes();
      const period = hrs24 >= 12 ? 'PM' : 'AM';
      const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
      const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
      const formatted = `${hrs12}:${minsStr} ${period}`;

      const hoursSleep = ((c * 90) / 60).toFixed(1);
      let quality = 'Optimal (90m REM x ' + c + ')';
      if (c === 6) quality = '★ Excellent (9 Hours)';
      if (c === 5) quality = '★ Suggested (7.5 Hours)';
      if (c === 4) quality = 'Good (6 Hours)';

      times.push({ cycles: c, hours: hoursSleep, timeString: formatted, quality });
    }
    return times;
  };

  const quickResults = calculateQuickTimes();

  // Dynamic Report & Insights Category
  const getSleepReport = (hours: number) => {
    if (hours < 7.5) {
      return {
        category: 'Sleep Deficit / Recovery Needed',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        badgeText: '⚠️ Deficit (< 7.5 hrs)',
        summary: `Your configured schedule total is ${hours.toFixed(1)} hours. This is short of the recommended 8-hour target by ${(8 - hours).toFixed(1)} hours.`,
        insights: [
          'High Process S Sleep Pressure accumulates during prolonged wakefulness.',
          'Missing 1-2 complete 90-minute REM cycles can impair emotional regulation & cognitive focus.',
          'Elevated risk of afternoon brain fog & reduced reaction speed.',
        ],
        tips: 'Plan a 20-30 minute power nap between 1:00 PM - 3:00 PM, restrict caffeine after 2:00 PM, and shift bedtime 45 minutes earlier.',
      };
    } else if (hours <= 8.5) {
      return {
        category: 'Optimal Circadian Alignment',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        badgeText: '✨ Ideal Sleep (7.5 - 8.5 hrs)',
        summary: `Your total sleep time of ${hours.toFixed(1)} hours perfectly hits the 5 full 90-minute sleep cycle sweet spot!`,
        insights: [
          'Complete coverage of Deep N-REM (stages 3-4) for physical recovery & immune support.',
          'Full REM dreaming cycles for memory consolidation & neural restoration.',
          'Process S sleep pressure fully discharged before morning circadian cortisol rise.',
        ],
        tips: 'Maintain consistent sleep and wake times on weekends to lock in your internal 24-hour biological clock.',
      };
    } else {
      return {
        category: 'Extended Sleep / Oversleeping',
        color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        badgeText: '💤 Extended (> 8.5 hrs)',
        summary: `Configured duration is ${hours.toFixed(1)} hours. Extended sleep may indicate physical recovery or sleep inertia.`,
        insights: [
          'Waking up during deep N-REM stages can cause temporary grogginess (sleep inertia).',
          'May shift Process C circadian melatonin phase, delaying evening sleepiness.',
          'Beneficial if recovering from intense physical exertion or prior sleep debt.',
        ],
        tips: 'Expose your eyes to bright morning sunlight within 15 minutes of waking to stop melatonin production and reset alertness.',
      };
    }
  };

  const report = getSleepReport(totalSleepDuration);

  // Circadian Rhythm 24-Hour Clock Milestones (Reference Image 3)
  const circadianMilestones = [
    { time: '02:00', label: 'Deepest Sleep Stage', icon: Moon, color: 'text-indigo-400' },
    { time: '04:30', label: 'Lowest Body Temperature', icon: Activity, color: 'text-sky-400' },
    { time: '06:45', label: 'Sharpest Blood Pressure Rise', icon: Sun, color: 'text-amber-400' },
    { time: '07:30', label: 'Melatonin Secretion Stops', icon: Sun, color: 'text-yellow-300' },
    { time: '10:00', label: 'Highest Daytime Alertness', icon: Sparkles, color: 'text-emerald-400' },
    { time: '14:30', label: 'Best Motor Coordination', icon: Flame, color: 'text-teal-300' },
    { time: '15:30', label: 'Fastest Reaction Time', icon: BatteryCharging, color: 'text-cyan-300' },
    { time: '19:00', label: 'Highest Body Temperature', icon: Sun, color: 'text-orange-400' },
    { time: '21:00', label: 'Melatonin Secretion Starts', icon: Moon, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header & Tab Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Sleep Cycle & Circadian Rhythm Studio</h3>
            <p className="text-[11px] text-gray-400">24-hour sleep pressure tracking, multi-block schedules & REM cycle reports</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              24-Hr Sleep Studio
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'quick'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              90m Cycle Calculator
            </button>
          </div>

          <button
            onClick={resetSleepCalculator}
            title="Reset sleep schedule back to defaults"
            className="flex items-center space-x-1 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-rose-400 rounded-2xl text-xs font-bold transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {activeTab === 'studio' ? (
        <div className="space-y-6">
          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column (2 Cols): Dynamic Graph (ON TOP) & Sleep Controls (BENEATH) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. 24-HOUR CIRCADIAN & SLEEP PRESSURE GRAPH (SVG Visualizer - ON TOP) */}
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-cyan-400" />
                      <span>Dynamic 24-Hour Process S & Process C Model</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Curves shift dynamically as sleep sections are created, edited, or removed
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/50 font-bold">
                    Real-Time Dynamic Graph
                  </span>
                </div>

                {/* SVG Graph Container with Hover Interactivity */}
                <div
                  className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-hidden"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relativeX = e.clientX - rect.left;
                    const svgWidth = rect.width;
                    // SVG x ranges from 50 to 550 (scale factor 500)
                    const normX = (relativeX / svgWidth) * 600;
                    if (normX >= 50 && normX <= 550) {
                      const h = ((normX - 50) / 500) * 24;
                      setHoverHour(h);
                    } else {
                      setHoverHour(null);
                    }
                  }}
                  onMouseLeave={() => setHoverHour(null)}
                >
                  <svg viewBox="0 0 600 230" className="w-full h-auto overflow-visible select-none">
                    <defs>
                      <linearGradient id="processSGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="sleepBlockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Timeline Grid Lines (Every 4 hours: 0, 4, 8, 12, 16, 20, 24) */}
                    {[0, 4, 8, 12, 16, 20, 24].map((hr) => {
                      const x = 50 + (hr / 24) * 500;
                      return (
                        <g key={hr}>
                          <line x1={x} y1="20" x2={x} y2="170" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                          <text x={x} y="190" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                            {hr < 10 ? `0${hr}:00` : `${hr}:00`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Horizontal Sleep Pressure / Alertness Grid Lines */}
                    <line x1="50" y1="30" x2="550" y2="30" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="100" x2="550" y2="100" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="170" x2="550" y2="170" stroke="#1e293b" strokeWidth="1" />

                    <text x="45" y="35" textAnchor="end" fill="#c084fc" fontSize="9" fontWeight="bold">Max Pressure</text>
                    <text x="45" y="165" textAnchor="end" fill="#38bdf8" fontSize="9" fontWeight="bold">Wake Drive</text>

                    {/* Highlight Configured Sleep Blocks on Graph */}
                    {sleepBlocks.map((block) => {
                      const startX = 50 + (block.startHour / 24) * 500;
                      let endX = 50 + (block.endHour / 24) * 500;
                      if (block.endHour < block.startHour) {
                        // Wraps midnight
                        return (
                          <g key={block.id}>
                            <rect x={startX} y="20" width={550 - startX} height="150" fill="url(#sleepBlockGrad)" stroke="#10b981" strokeDasharray="2 2" />
                            <text x={startX + 6} y="35" fill="#34d399" fontSize="9" fontWeight="bold">{block.name}</text>
                            <rect x="50" y="20" width={endX - 50} height="150" fill="url(#sleepBlockGrad)" stroke="#10b981" strokeDasharray="2 2" />
                            <text x="56" y="35" fill="#34d399" fontSize="9" fontWeight="bold">(cont.)</text>
                          </g>
                        );
                      }
                      return (
                        <g key={block.id}>
                          <rect x={startX} y="20" width={Math.max(6, endX - startX)} height="150" fill="url(#sleepBlockGrad)" stroke="#10b981" strokeDasharray="2 2" />
                          <text x={startX + 6} y="35" fill="#34d399" fontSize="9" fontWeight="bold">{block.name}</text>
                        </g>
                      );
                    })}

                    {/* Line 1: Process S Area Fill Under Curve */}
                    <path d={dynamicGraph.sAreaD} fill="url(#processSGrad)" />

                    {/* Line 1: Process S (Sleep Pressure) Dynamic Curve */}
                    <path
                      d={dynamicGraph.sPathD}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Line 2: Process C (Circadian Drive) Curve */}
                    <path
                      d={dynamicGraph.cPathD}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />

                    {/* Line 3: Sleep Gate Threshold Line (Point of Max S - C Gap) */}
                    {dynamicGraph.sleepGatePoint && (
                      <g>
                        <line
                          x1={dynamicGraph.sleepGatePoint.x}
                          y1="20"
                          x2={dynamicGraph.sleepGatePoint.x}
                          y2="170"
                          stroke="#f43f5e"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <circle cx={dynamicGraph.sleepGatePoint.x} cy={dynamicGraph.sleepGatePoint.y} r="4" fill="#f43f5e" />
                        <text
                          x={Math.min(480, Math.max(60, dynamicGraph.sleepGatePoint.x))}
                          y="15"
                          textAnchor="middle"
                          fill="#fda4af"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          Line 3: Sleep Gate ({formatHourLabel(dynamicGraph.sleepGatePoint.hour)})
                        </text>
                      </g>
                    )}

                    {/* SVG On-Graph Line Labels */}
                    <g>
                      {/* Process S Text Label at mid-timeline */}
                      {dynamicGraph.sPoints[48] && (
                        <text
                          x={dynamicGraph.sPoints[48].x - 10}
                          y={Math.max(35, dynamicGraph.sPoints[48].y - 8)}
                          fill="#e9d5ff"
                          fontSize="10"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          Line 1: Process S (Sleep Pressure)
                        </text>
                      )}

                      {/* Process C Text Label near 16:00 */}
                      {dynamicGraph.cPoints[64] && (
                        <text
                          x={dynamicGraph.cPoints[64].x - 20}
                          y={dynamicGraph.cPoints[64].y + 16}
                          fill="#bae6fd"
                          fontSize="10"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          Line 2: Process C (Circadian Drive)
                        </text>
                      )}
                    </g>

                    {/* Interactive Mouse Hover Inspector */}
                    {hoverHour !== null && (
                      <g>
                        {(() => {
                          const hx = 50 + (hoverHour / 24) * 500;
                          const { inSleep, blockName } = isHourInSleep(hoverHour, sleepBlocks);
                          const idx = Math.min(
                            dynamicGraph.sPoints.length - 1,
                            Math.max(0, Math.round((hoverHour / 24) * 96))
                          );
                          const pt = dynamicGraph.sPoints[idx];
                          return (
                            <>
                              <line x1={hx} y1="20" x2={hx} y2="170" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                              <circle cx={hx} cy={pt ? pt.y : 100} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                              <g transform={`translate(${Math.min(420, Math.max(50, hx - 60))}, 20)`}>
                                <rect width="130" height="48" rx="8" fill="#090d16" stroke="#f59e0b" strokeWidth="1" />
                                <text x="10" y="16" fill="#ffffff" fontSize="10" fontWeight="bold">
                                  {formatHourLabel(hoverHour)}
                                </text>
                                <text x="10" y="30" fill={inSleep ? '#34d399' : '#fbbf24'} fontSize="9" fontWeight="bold">
                                  {inSleep ? `💤 ${blockName || 'Sleeping'}` : '☀️ Awake'}
                                </text>
                                <text x="10" y="42" fill="#c084fc" fontSize="8">
                                  Pressure: {pt ? pt.sVal.toFixed(0) : 0}%
                                </text>
                              </g>
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                </div>

                {/* 3-COLUMN HORIZONTAL ROW DROPDOWN ACCORDIONS FOR LINE LEGENDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {/* Line 1 Dropdown */}
                  <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:border-purple-500/60 self-start">
                    <button
                      onClick={() => toggleLegendLine('line1')}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-purple-900/30 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-purple-400 shrink-0 shadow-sm" />
                        <span className="text-xs font-extrabold text-purple-200">Line 1: Process S</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {openLegendLine === 'line1' ? (
                          <ChevronUp className="h-4 w-4 text-purple-300 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-purple-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openLegendLine === 'line1' && (
                      <div className="px-3 pb-3 pt-2 text-xs font-medium text-gray-200 leading-relaxed border-t border-purple-800/40 bg-slate-950/70 animate-fadeIn space-y-1">
                        <p className="text-purple-300 font-bold text-xs">• Sleep Pressure (Solid Purple Curve)</p>
                        <p className="text-[11px] text-gray-300">
                          Accumulates fatigue during wakefulness and rapidly discharges downward during every configured sleep section (Night sleep, naps, or polyphasic rest).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Line 2 Dropdown */}
                  <div className="bg-sky-950/40 border border-sky-800/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:border-sky-500/60 self-start">
                    <button
                      onClick={() => toggleLegendLine('line2')}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-sky-900/30 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-sky-400 shrink-0 shadow-sm" />
                        <span className="text-xs font-extrabold text-sky-200">Line 2: Process C</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {openLegendLine === 'line2' ? (
                          <ChevronUp className="h-4 w-4 text-sky-300 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-sky-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openLegendLine === 'line2' && (
                      <div className="px-3 pb-3 pt-2 text-xs font-medium text-gray-200 leading-relaxed border-t border-sky-800/40 bg-slate-950/70 animate-fadeIn space-y-1">
                        <p className="text-sky-300 font-bold text-xs">• Biological Clock (Dashed Cyan Curve)</p>
                        <p className="text-[11px] text-gray-300">
                          24-hour suprachiasmatic biological clock regulating daytime alertness, melatonin secretion, core body temperature, and evening sleepiness.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Line 3 Dropdown */}
                  <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:border-rose-500/60 self-start">
                    <button
                      onClick={() => toggleLegendLine('line3')}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-rose-900/30 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-rose-400 shrink-0 shadow-sm" />
                        <span className="text-xs font-extrabold text-rose-200">Line 3: Sleep Gate</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {openLegendLine === 'line3' ? (
                          <ChevronUp className="h-4 w-4 text-rose-300 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                    </button>
                    {openLegendLine === 'line3' && (
                      <div className="px-3 pb-3 pt-2 text-xs font-medium text-gray-200 leading-relaxed border-t border-rose-800/40 bg-slate-950/70 animate-fadeIn space-y-1">
                        <p className="text-rose-300 font-bold text-xs">• Sleep Opportunity (Vertical Rose Line)</p>
                        <p className="text-[11px] text-gray-300">
                          Highlights the physiological sleep gate where sleep pressure (Process S) reaches maximum height while circadian alertness (Process C) drops lowest.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. 24-HOUR SLEEP SECTIONS CONTROLS CARD (BENEATH THE GRAPH) */}
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Sliders className="h-4 w-4 text-purple-400" />
                      <span>Configure 24-Hour Sleep Sections</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Set multiple sleep blocks (Night sleep, afternoon naps, or polyphasic schedules)
                    </p>
                  </div>

                  <button
                    onClick={addSleepBlock}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Sleep Block</span>
                  </button>
                </div>

                {/* Sleep Blocks Sliders List */}
                <div className="space-y-4">
                  {sleepBlocks.map((block, idx) => {
                    let blockHours = block.endHour - block.startHour;
                    if (blockHours < 0) blockHours += 24;

                    return (
                      <div
                        key={block.id}
                        className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative group"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-purple-400 font-mono text-xs">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={block.name}
                              onChange={(e) => updateSleepBlock(block.id, 'name', e.target.value)}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-gray-200 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-purple-300 font-extrabold text-xs bg-purple-950/60 px-2.5 py-1 rounded-xl border border-purple-800/50">
                              {formatHourLabel(block.startHour)} → {formatHourLabel(block.endHour)} ({blockHours.toFixed(1)} hrs)
                            </span>

                            {sleepBlocks.length > 1 && (
                              <button
                                onClick={() => removeSleepBlock(block.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-950/80 text-gray-400 hover:text-rose-300 transition-colors"
                                title="Remove sleep section"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dual Range Sliders for Start & End Hour */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[14px] text-gray-400">
                              <span>Bedtime / Sleep Start:</span>
                              <span className="font-mono text-purple-300 font-bold">{formatHourLabel(block.startHour)}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={24}
                              step={0.25}
                              value={block.startHour}
                              onChange={(e) => updateSleepBlock(block.id, 'startHour', Number(e.target.value))}
                              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[14px] text-gray-400">
                              <span>Wake Time / Sleep End:</span>
                              <span className="font-mono text-emerald-300 font-bold">{formatHourLabel(block.endHour)}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={24}
                              step={0.25}
                              value={block.endHour}
                              onChange={(e) => updateSleepBlock(block.id, 'endHour', Number(e.target.value))}
                              className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chronic Persistence Toggle */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="space-y-0.5">
                    <label htmlFor="chronic-toggle" className="text-xs text-gray-200 font-extrabold cursor-pointer select-none">
                      Is this sleep pattern continuous up to weeks or months?
                    </label>
                    <p className="text-[10px] text-gray-400">
                      Evaluates chronic sleep debt or long-term oversleeping health risks
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    id="chronic-toggle"
                    checked={isChronic}
                    onChange={(e) => setIsChronic(e.target.checked)}
                    className="h-5 w-5 accent-purple-500 rounded cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Sleep Health Report & Chronic Attention Alert */}
            <div className="space-y-6">
              {/* Total Sleep Summary Card */}
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Sleep Health Analysis</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${report.badgeColor}`}>
                    {report.badgeText}
                  </span>
                </div>

                {/* Total Duration Hero Badge */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    Total Daily Sleep Duration
                  </div>
                  <div className="text-4xl font-extrabold font-mono text-white">
                    {totalSleepDuration.toFixed(1)} <span className="text-base font-normal text-purple-400">Hours</span>
                  </div>
                  <div className="text-xs font-bold text-gray-300 pt-1">
                    {report.category}
                  </div>
                </div>

                {/* Report Summary */}
                <p className="text-xs text-gray-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  {report.summary}
                </p>

                {/* Key Insights List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400">Biological Insights:</span>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {report.insights.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-purple-400 text-xs leading-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Tips Box */}
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs space-y-1">
                  <div className="font-extrabold flex items-center space-x-1.5 text-purple-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Recommended Recovery Strategy:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{report.tips}</p>
                </div>
              </div>

              {/* CHRONIC PERSISTENCE ATTENTION ALERT (Triggered by isChronic toggle) */}
              {isChronic && (
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs">
                    <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                    <span>Continuous Sleep Pattern Attention Analysis</span>
                  </div>

                  {totalSleepDuration < 7.5 ? (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs space-y-1.5">
                      <div className="font-extrabold text-rose-300 flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span>🚨 High Attention Needed: Chronic Sleep Debt</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Maintaining a sleep deficit under 7.5 hours continuously over weeks or months impairs cardiovascular health, weakens metabolic glucose regulation, and reduces brain synaptic plasticity. Consult a sleep medicine professional if chronic insomnia or sleep disruption persists.
                      </p>
                    </div>
                  ) : totalSleepDuration > 8.5 ? (
                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs space-y-1.5">
                      <div className="font-extrabold text-purple-300 flex items-center space-x-1">
                        <Info className="h-4 w-4" />
                        <span>⚠️ Health Attention Needed: Chronic Hypersomnia Alert</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Sustained daily sleep exceeding 8.5–9 hours over several months can be a marker for underlying metabolic shifts, thyroid imbalance, or sleep apnea. Consider evaluating daytime fatigue levels with your doctor.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-1.5">
                      <div className="font-extrabold text-emerald-300 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>🌟 Outstanding Circadian Health Habit</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Maintaining a consistent 7.5 to 8.5 hour sleep window continuously over weeks and months optimizes immune resilience, memory consolidation, and long-term neurovascular health!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 24-Hour Circadian Milestones Guide */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>24-Hour Circadian Clock Milestones</span>
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {circadianMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <m.icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-gray-300 font-medium text-[11px]">{m.label}</span>
                      </div>
                      <span className="font-mono font-extrabold text-white text-[11px]">{m.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quick 90m Cycle Calculator Tab */
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Quick 90-Minute REM Cycle Finder</span>
            </h4>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl max-w-sm">
              <button
                onClick={() => setCalcMode('wake')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calcMode === 'wake' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
              >
                If I sleep NOW → Wake at?
              </button>
              <button
                onClick={() => setCalcMode('bed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calcMode === 'bed' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Target Wake Time → Bedtime?
              </button>
            </div>
          </div>

          {calcMode === 'bed' && (
            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-semibold text-gray-300">I want to wake up at:</label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>
          )}

          {/* Suggested Sleep Windows */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400">
              {calcMode === 'wake' ? 'Recommended Wake Up Times:' : 'Recommended Bedtimes:'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickResults.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${item.cycles === 5 || item.cycles === 6
                    ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-gray-300'
                    }`}
                >
                  <div className="text-2xl font-extrabold font-mono text-purple-400">
                    {item.timeString}
                  </div>
                  <div className="text-xs font-bold text-gray-200 mt-1">{item.hours} Hours Sleep</div>
                  <div className="text-[10px] text-purple-300 font-semibold mt-0.5">{item.quality}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
