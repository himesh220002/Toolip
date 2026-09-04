'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft, Clock, Zap, RefreshCw, Trophy, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULT_WORDCOUNTER_TEXT = 'Toolip is an everyday utility platform designed for office workers, developers, writers, and students. Easily process documents, compress photos, generate QR codes, and run financial calculations.';

const TYPING_PROMPTS = [
  'The quick brown fox jumps over the lazy dog. Fast typing skills help writers and office workers save hours of work every day.',
  'Toolip provides fast everyday utilities designed to simplify daily tasks like PDF merging, QR code generation, and financial calculations.',
];

export const WordCounter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'counter' | 'typing'>('counter');

  // Text Counter State with Local Storage Persistence
  const [text, setText, resetText] = useLocalStorage<string>('toolip_wordcounter_text', DEFAULT_WORDCOUNTER_TEXT);

  // Typing Test State
  const [promptIdx, setPromptIdx] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isTestDone, setIsTestDone] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (startTime && !isTestDone) {
      timer = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [startTime, isTestDone]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setUserInput(val);

    const target = TYPING_PROMPTS[promptIdx];
    if (val.length >= target.length) {
      setIsTestDone(true);
    }
  };

  const resetTypingTest = () => {
    setUserInput('');
    setStartTime(null);
    setElapsedSec(0);
    setIsTestDone(false);
  };

  const getStats = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { words: 0, charsWithSpace: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 };
    }

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const charsWithSpace = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = trimmed.split(/\n+/).filter(Boolean).length;
    const readingTimeMin = (words / 200).toFixed(1);

    return { words, charsWithSpace, charsNoSpace, sentences, paragraphs, readingTimeMin };
  };

  const computeWpm = () => {
    if (!elapsedSec || elapsedSec === 0) return 0;
    const typedWords = userInput.trim().split(/\s+/).filter(Boolean).length;
    return Math.round((typedWords / elapsedSec) * 60);
  };

  const computeAccuracy = () => {
    const target = TYPING_PROMPTS[promptIdx];
    let correct = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === target[i]) correct++;
    }
    return userInput.length > 0 ? Math.round((correct / userInput.length) * 100) : 100;
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl max-w-xs flex-1 sm:flex-none">
          <button
            onClick={() => setActiveTab('counter')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'counter' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Word Counter
          </button>
          <button
            onClick={() => setActiveTab('typing')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'typing' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Typing Speed Test
          </button>
        </div>

        {activeTab === 'counter' && (
          <button
            onClick={resetText}
            title="Reset text back to sample paragraph"
            className="flex items-center space-x-1 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Text</span>
          </button>
        )}
      </div>

      {activeTab === 'counter' ? (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Words</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-0.5">{stats.words}</div>
            </div>

            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Characters</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{stats.charsWithSpace}</div>
            </div>

            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">No Spaces</div>
              <div className="text-2xl font-bold text-purple-400 font-mono mt-0.5">{stats.charsNoSpace}</div>
            </div>

            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Sentences</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-0.5">{stats.sentences}</div>
            </div>

            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Paragraphs</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{stats.paragraphs}</div>
            </div>

            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl text-center">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Reading Time</div>
              <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">{stats.readingTimeMin}m</div>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your content here..."
            className="w-full h-72 p-4 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
          />
        </div>
      ) : (
        /* Typing Speed Test Card */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Speed WPM</div>
              <div className="text-3xl font-extrabold text-sky-400 font-mono mt-0.5">{computeWpm()}</div>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Accuracy</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">{computeAccuracy()}%</div>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-[10px] uppercase text-gray-400 font-semibold">Timer</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-0.5">{elapsedSec}s</div>
            </div>
          </div>

          <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2 select-none">
            <div className="text-xs text-gray-400 font-semibold">Target Prompt Text:</div>
            <div className="text-sm font-mono text-gray-200 leading-relaxed p-3 bg-gray-900 rounded-lg">
              {TYPING_PROMPTS[promptIdx]}
            </div>
          </div>

          <textarea
            disabled={isTestDone}
            value={userInput}
            onChange={handleTypingChange}
            placeholder="Start typing the prompt above to begin the speed test..."
            className="w-full h-32 p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-sm text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={resetTypingTest}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Test</span>
            </button>

            {isTestDone && (
              <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>Test Completed! Final Score: {computeWpm()} WPM ({computeAccuracy()}% Accuracy)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
