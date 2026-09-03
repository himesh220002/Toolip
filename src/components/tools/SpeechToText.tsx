'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Copy,
  Check,
  Trash2,
  Download,
  AlertCircle,
  Activity,
  Globe,
  FileText,
  Music,
  Settings,
  Package,
} from 'lucide-react';

export const SpeechToText: React.FC = () => {
  const [transcriptTitle, setTranscriptTitle] = useState<string>('Voice Dictation Notes');
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  
  // Microphone Device Selector State
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Audio Recording (MediaRecorder API) State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Enumerate hardware microphones
  const loadAudioDevices = async () => {
    try {
      // Request mic permission briefly to reveal device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tempStream.getTracks().forEach((t) => t.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setAudioDevices(mics);
      if (mics.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(mics[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate audio input devices:', err);
    }
  };

  useEffect(() => {
    loadAudioDevices();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = selectedLang === 'hinglish' ? 'en-IN' : selectedLang;

        reco.onresult = (event: any) => {
          let interim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += (finalChunk ? ' ' : '') + transcriptChunk.trim();
            } else {
              interim += transcriptChunk;
            }
          }

          if (finalChunk) {
            setFinalTranscript((prev) => {
              const cleanPrev = prev.trim();
              const cleanChunk = finalChunk.trim();
              if (!cleanPrev) return cleanChunk;
              if (cleanPrev.endsWith(cleanChunk)) return cleanPrev; // Avoid duplicate chunks
              return `${cleanPrev} ${cleanChunk}`;
            });
          }
          setInterimTranscript(interim);
        };

        reco.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            setErrorMsg('Speech Recognition Notice: ' + event.error);
          }
        };

        reco.onend = () => {
          if (isListening && !isPaused) {
            try {
              reco.start();
            } catch (e) {
              // Ignore restart collision
            }
          }
        };

        recognitionRef.current = reco;
      } else {
        setErrorMsg('Web Speech Recognition is not supported in this browser (Recommended: Chrome or Edge).');
      }
    }

    return () => {
      stopAudioVisualizer();
    };
  }, [selectedLang]);

  // Start Audio Visualizer & MediaRecorder using selected microphone device
  const startAudioStreams = async () => {
    try {
      const audioConstraint: any = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : true;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
      streamRef.current = stream;

      // 1. Setup AudioContext Frequency Visualizer Spectrum
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawWaveform();

      // 2. Setup MediaRecorder for voice audio recording
      audioChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? { mimeType: 'audio/ogg' }
        : undefined;

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start(500); // 500ms timeslice chunks
      mediaRecorderRef.current = recorder;
    } catch (err: any) {
      console.warn('Microphone stream error:', err);
      setErrorMsg('Could not start microphone audio recorder: ' + (err.message || err));
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

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

  const startRecording = async () => {
    setErrorMsg('');
    setAudioUrl(null);
    setAudioBlob(null);

    await startAudioStreams();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLang === 'hinglish' ? 'en-IN' : selectedLang;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start recognition warning:', e);
      }
    }

    setIsListening(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      setIsListening(false);
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (isPaused) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      setIsListening(true);
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopAudioVisualizer();
    setIsListening(false);
    setIsPaused(false);
  };

  // Format complete document text
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

  const downloadRecordedAudio = () => {
    if (!audioBlob && !audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl!;
    const ext = audioBlob?.type.includes('webm') ? 'webm' : 'wav';
    a.download = `${(transcriptTitle || 'audio_recording').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    a.click();
  };

  // Simultaneous 1-click Download: Recorded Audio + Transcribed .TXT Document
  const downloadAudioAndTranscriptPackage = () => {
    downloadTranscriptFile();
    if (audioUrl) {
      setTimeout(() => {
        downloadRecordedAudio();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Settings Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl">
        {/* Document Title */}
        <div className="space-y-1 sm:col-span-1">
          <label className="text-xs font-bold text-gray-300 flex items-center space-x-1">
            <FileText className="h-3.5 w-3.5 text-sky-400" />
            <span>Transcript Document Title:</span>
          </label>
          <input
            type="text"
            value={transcriptTitle}
            onChange={(e) => setTranscriptTitle(e.target.value)}
            placeholder="e.g. Executive Meeting Notes..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-inner"
          />
        </div>

        {/* Hardware Microphone Device Selector */}
        <div className="space-y-1 sm:col-span-1">
          <label className="text-xs font-bold text-gray-300 flex items-center space-x-1">
            <Settings className="h-3.5 w-3.5 text-purple-400" />
            <span>Select Microphone Device:</span>
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={isListening}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none truncate"
          >
            {audioDevices.length === 0 ? (
              <option value="">Default Microphone</option>
            ) : (
              audioDevices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Microphone ${idx + 1}`}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Speech Language */}
        <div className="space-y-1 sm:col-span-1">
          <label className="text-xs font-bold text-gray-300 flex items-center space-x-1">
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Speech Recognition Language:</span>
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            disabled={isListening}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
          >
            <option value="hinglish">Hinglish (Hindi + English in Latin script)</option>
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (United States)</option>
            <option value="hi-IN">Hindi (India - Devanagari Script)</option>
            <option value="es-ES">Spanish (Spain)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
            <option value="ja-JP">Japanese (Japan)</option>
          </select>
          {/* Quick Language Switcher Preset Badges */}
          <div className="flex flex-wrap gap-1 pt-1">
            {[
              { id: 'hinglish', label: 'Hinglish ✨' },
              { id: 'en-IN', label: 'English (IN)' },
              { id: 'en-US', label: 'English (US)' },
              { id: 'hi-IN', label: 'Hindi (HI)' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                disabled={isListening}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedLang === lang.id
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl gap-3">
        {/* Record / Pause / Stop Controls */}
        <div className="flex items-center space-x-2">
          {!isListening && !isPaused && (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
            >
              <Mic className="h-4 w-4" />
              <span>Start Voice Dictation & Recording</span>
            </button>
          )}

          {isListening && (
            <button
              onClick={pauseRecording}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              <Pause className="h-4 w-4 fill-current" />
              <span>Pause Recording</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeRecording}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all animate-pulse"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Resume Recording</span>
            </button>
          )}

          {(isListening || isPaused) && (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold text-xs transition-colors border border-slate-700/60"
            >
              <MicOff className="h-4 w-4 text-rose-400" />
              <span>Stop & Save</span>
            </button>
          )}
        </div>

        {/* Action Buttons Specified by User */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Transcribe */}
          <button
            onClick={copyTranscript}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700/60 transition-all shadow-md"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied Transcript!' : 'Copy Transcribe'}</span>
          </button>

          {/* Download TXT File */}
          <button
            onClick={downloadTranscriptFile}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white font-bold text-xs border border-emerald-500/40 transition-all shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Download .TXT File</span>
          </button>

          {/* Download Recorded Audio (.WEBM / .WAV) */}
          {audioUrl && (
            <button
              onClick={downloadRecordedAudio}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs border border-purple-500/40 transition-all shadow-md"
            >
              <Music className="h-4 w-4 text-purple-300" />
              <span>Download Audio (.WEBM)</span>
            </button>
          )}

          {/* Download Audio + Transcribe Package Together */}
          {audioUrl && (
            <button
              onClick={downloadAudioAndTranscriptPackage}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-extrabold text-xs shadow-lg transition-all hover:scale-105"
            >
              <Package className="h-4 w-4" />
              <span>Download Audio + Transcript Together</span>
            </button>
          )}

          <button
            onClick={() => {
              setFinalTranscript('');
              setInterimTranscript('');
              setAudioUrl(null);
              setAudioBlob(null);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white text-xs border border-slate-700/60 transition-colors"
            title="Clear all text and audio"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* In-App Audio Playback Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
          <Music className="h-4 w-4 text-purple-400" />
          <span>Recorded Voice Audio Playback:</span>
        </div>

        {audioUrl ? (
          <audio controls src={audioUrl} className="w-full sm:w-auto h-9 accent-indigo-500" />
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-400 text-xs font-mono">
            🎙️ Voice recording audio will appear here after clicking "Start Dictation & Recording"
          </span>
        )}
      </div>

      {/* Real-time Microphone Sound Wave Frequency Spectrum Canvas */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center space-x-1.5 font-bold text-sky-400">
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
          className="w-full h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner"
        />
      </div>

      {/* Transcribed Text Box Header & Clear/Reset Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span>Transcribed Speech Document Output:</span>
          </span>

          <button
            onClick={() => {
              setFinalTranscript('');
              setInterimTranscript('');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-gray-300 hover:text-white text-xs font-bold border border-slate-700 transition-all shadow-md"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>🔄 Reset / Clear Transcript Text</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={getFullFormattedDocument()}
            placeholder={
              isListening
                ? 'Listening to selected microphone... speak clearly now.'
                : 'Click "Start Voice Dictation & Recording" to begin.'
            }
            className="w-full h-64 p-5 bg-slate-950 border border-slate-800 rounded-3xl text-xs text-gray-200 focus:outline-none resize-none leading-relaxed font-mono whitespace-pre-wrap shadow-2xl"
          />
          {isListening && (
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-mono animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Recording Audio & Transcribing...</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
