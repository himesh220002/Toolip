'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Pause, Play, Copy, Check, Trash2, Download, AlertCircle, Activity, Globe, FileText } from 'lucide-react';

export const SpeechToText: React.FC = () => {
  const [transcriptTitle, setTranscriptTitle] = useState<string>('Voice Dictation Notes');
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = selectedLang;

        reco.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const chunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setFinalTranscript((prev) => prev + (prev ? ' ' : '') + chunk.trim());
            } else {
              interim += chunk;
            }
          }
          setInterimTranscript(interim);
        };

        reco.onerror = (event: any) => {
          setErrorMsg('Microphone error: ' + event.error);
          stopAudioVisualizer();
          setIsListening(false);
          setIsPaused(false);
        };

        reco.onend = () => {
          if (isListening && !isPaused) {
            // Auto restart if continuous stream ended unexpectedly
            try {
              reco.start();
            } catch (e) {
              setIsListening(false);
            }
          }
        };

        recognitionRef.current = reco;
      } else {
        setErrorMsg('Web Speech Recognition is not supported in this browser (Use Chrome or Edge).');
      }
    }

    return () => {
      stopAudioVisualizer();
    };
  }, [selectedLang]);

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawWaveform();
    } catch (err) {
      console.warn('Could not access microphone visualizer stream:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(244, 63, 94, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    render();
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setErrorMsg('');
    try {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      startAudioVisualizer();
      setIsListening(true);
      setIsPaused(false);
    } catch (e) {
      console.warn('Start recognition error:', e);
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      stopAudioVisualizer();
      setIsListening(false);
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        startAudioVisualizer();
        setIsListening(true);
        setIsPaused(false);
      } catch (e) {
        console.warn('Resume error:', e);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      stopAudioVisualizer();
      setIsListening(false);
      setIsPaused(false);
    }
  };

  // Generate full formatted transcript document with date/time tagline
  const getFullFormattedDocument = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const header = `==================================================
DOCUMENT TITLE: ${transcriptTitle || 'Untitled Speech Transcript'}
RECORDED DATE: ${dateStr} | ${timeStr}
LANGUAGE DETECTED: ${selectedLang}
==================================================\n\n`;

    const body = finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : '');
    return header + (body || '(No spoken text recorded yet)');
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(getFullFormattedDocument());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranscriptFile = () => {
    const docText = getFullFormattedDocument();
    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${(transcriptTitle || 'transcript').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Transcript Header Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <FileText className="h-3.5 w-3.5 text-sky-400" />
            <span>Transcript Document Title:</span>
          </label>
          <input
            type="text"
            value={transcriptTitle}
            onChange={(e) => setTranscriptTitle(e.target.value)}
            placeholder="e.g. Client Discussion Notes..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Speech Language:</span>
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            disabled={isListening}
            className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
          >
            <option value="en-US">English (US)</option>
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi (hi-IN)</option>
          </select>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl gap-3">
        <div className="flex items-center space-x-2">
          {!isListening && !isPaused && (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition-all"
            >
              <Mic className="h-4 w-4" />
              <span>Start Voice Dictation</span>
            </button>
          )}

          {isListening && (
            <button
              onClick={pauseRecording}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
            >
              <Pause className="h-4 w-4 fill-current" />
              <span>Pause Recording</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeRecording}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all animate-pulse"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Resume Recording</span>
            </button>
          )}

          {(isListening || isPaused) && (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs"
            >
              <MicOff className="h-4 w-4" />
              <span>Stop</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyTranscript}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 text-xs font-medium"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Full Document!' : 'Copy Transcript'}</span>
          </button>

          <button
            onClick={downloadTranscriptFile}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .TXT File</span>
          </button>

          <button
            onClick={() => {
              setFinalTranscript('');
              setInterimTranscript('');
            }}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs"
            title="Clear transcript text"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Real-time Microphone Sound Wave Frequency Canvas */}
      <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center space-x-1.5 font-semibold text-sky-400">
            <Activity className="h-4 w-4" />
            <span>Microphone Sound Frequency Wave Visualizer</span>
          </span>
          <span className="font-mono text-[10px]">
            {isListening ? '● Live Frequency Spectrum' : isPaused ? '⏸ Recording Paused' : 'Mic Offline'}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={60}
          className="w-full h-16 bg-gray-900 rounded-lg border border-gray-800"
        />
      </div>

      {/* Transcribed Text Box */}
      <div className="relative">
        <textarea
          readOnly
          value={getFullFormattedDocument()}
          placeholder={
            isListening
              ? 'Listening to microphone... speak now.'
              : 'Click "Start Voice Dictation" to begin speech transcription.'
          }
          className="w-full h-64 p-4 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed font-mono whitespace-pre-wrap"
        />
        {isListening && (
          <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-mono animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Continuously Transcribing...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
