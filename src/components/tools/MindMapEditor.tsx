'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Smile,
  Link2,
  Eye,
  EyeOff,
  Palette,
  Trash2,
  Check,
  X,
  Sparkles,
  Move,
  FileCode,
  FolderOpen,
  Search,
  Grid,
  Filter,
  FileText,
  BookOpen,
  Crown,
  Network,
  ChevronUp,
  ChevronDown,
  StickyNote,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  MoreHorizontal,
  Share2,
  Users,
  LogOut,
  FileClock,
  Shield,
  Lock,
  GitCommit,
  GitBranch,
  User,
  Globe,
  Square,
  Terminal,
  Undo2,
  Redo2,
  WandSparkles,
  ArrowBigUpDash
} from 'lucide-react';
import { useCollaborativeSession } from '../../hooks/useCollaborativeSession';
import { useUndoRedoStack } from '../../hooks/useUndoRedoStack';
import { ShareModal } from '../collaboration/ShareModal';
import { LogTableModal } from '../collaboration/LogTableModal';
import {
  NVIDIA_MODELS,
  CLOUD_NVIDIA_MODELS,
  LOCAL_OLLAMA_MODELS,
  getAllOllamaModels,
  addCustomOllamaModel,
  removeCustomOllamaModel,
  checkOllamaHealth,
  getNvidiaApiKey,
  setNvidiaApiKey,
  getNvidiaSelectedModel,
  setNvidiaSelectedModel,
  generateMindMapWithNvidia
} from '../../lib/nvidiaAi';
import {
  CLOUD_GEMINI_MODELS,
  generateMindMapWithGemini,
  getGeminiApiKey,
  setGeminiApiKey
} from '../../lib/geminiAi';

export interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isRoot?: boolean;
  depth: number;
  collapsed?: boolean;
  emoji?: string;
  color?: string;
  parentId?: string | null;
  details?: string;
  note?: string;
  notes?: string[];
}

export interface MindEdge {
  id: string;
  source: string;
  target: string;
  color?: string;
}

export const EMOJI_CATEGORIES = [
  {
    category: 'Popular & Status',
    emojis: ['🧠', '💡', '🚀', '⭐', '🎯', '🔥', '📌', '🎨', '📝', '🏆', '💻', '🎮', '📚', '⚽', '🚗', '✈️', '❤️', '✅', '❓', '❗', '🧊', '❄️', '⚡', '✨', '💥', '🌟', '💫', '💧', '☀️', '🌙']
  },
  {
    category: 'Expressions',
    emojis: ['😊', '😂', '😃', '🥰', '😎', '🤩', '🤔', '🤯', '🥳', '😴', '😇', '😷', '🤓', '🧐', '🤡', '💩', '👻', '👽', '🤖', '🎃', '😈', '🙈', '🙉', '🙊']
  },
  {
    category: 'Tech & Work',
    emojis: ['💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '📷', '🎥', '🎧', '🎙️', '⏰', '⌛', '🔋', '🔌', '💎', '🔑', '🔐', '✏️', '📄', '📑', '📊', '📈', '📉', '📦', '🏷️', '📁', '📂', '🗑️', '🛠️', '⚙️', '🔬', '🔭']
  },
  {
    category: 'Sports & Hobbies',
    emojis: ['🎯', '🎮', '🎲', '♟️', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🏸', '🏒', '⛳', '⛷️', '🧗', '🏊', '🚴', '🚵', '🏋️', '🥇', '🥈', '🥉', '🎫', '🎭', '🎨', '🎤', '🎼', '🎵', '🎶']
  },
  {
    category: 'Food & Ice',
    emojis: ['🧊', '☕', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🍕', '🍔', '🍟', '🌭', '🍿', '🥞', '🧀', '🥗', '🌮', '🌯', '🍝', '🍜', '🍣', '🍱', '🥟', '🍦', '🍩', '🍪', '🍎', '🍇', '🥑']
  },
  {
    category: 'Places & Travel',
    emojis: ['🚀', '✈️', '🚁', '⛵', '🚢', '🚗', '🏎️', '🚓', '🚑', '🚒', '🚚', '🚜', '🏍️', '🛵', '🚲', '🛑', '🚦', '🗺️', '🏠', '🏢', '🏦', '🏥', '🏫', '🏛️', '🏰', '🗽']
  },
  {
    category: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💯', '⚠️', '🚫', '⛔', '❌', '⭕', '🛑', '➕', '➖', '✖️', '➗', '🔰', '⚜️', '🔱', '🆗', '🆕', '🆘']
  }
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) => c.emojis);

const COLOR_OPTIONS = [
  { label: 'Cyan', hex: '#00f2fe' },
  { label: 'Neon Pink', hex: '#ff007f' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Coral', hex: '#ff5722' },
  { label: 'Slate', hex: '#94a3b8' }
];

const NoteCardEditor: React.FC<{
  nodeId: string;
  noteIndex: number;
  initialHtml: string;
  onChange: (nodeId: string, index: number, html: string) => void;
}> = ({ nodeId, noteIndex, initialHtml, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = initialHtml && initialHtml.trim() !== '' ? initialHtml : '<div>Type your notes here...</div>';
      }
    }
  }, [nodeId, noteIndex, initialHtml]);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={(e) => {
        if (e.currentTarget.innerHTML === '<div>Type your notes here...</div>') {
          e.currentTarget.innerHTML = '';
        }
      }}
      onInput={(e) => {
        onChange(nodeId, noteIndex, e.currentTarget.innerHTML);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.innerHTML.trim()) {
          e.currentTarget.innerHTML = '<div>Type your notes here...</div>';
        }
        onChange(nodeId, noteIndex, e.currentTarget.innerHTML);
      }}
      className="w-full p-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-xs text-slate-800 focus:outline-none min-h-[110px] max-h-[220px] overflow-y-auto scrollable-note leading-relaxed space-y-1 [&_h1]:text-base [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:my-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:my-1 [&_b]:font-bold [&_b]:text-slate-900 [&_i]:italic [&_u]:underline [&_s]:line-through [&_del]:line-through [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_a]:text-indigo-600 [&_a]:underline"
    />
  );
};

interface MindMapEditorProps {
  isExpanded?: boolean;
}

export const MindMapEditor: React.FC<MindMapEditorProps> = ({ isExpanded = false }) => {
  // Graph State
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [edges, setEdges] = useState<MindEdge[]>([]);

  // Canvas Pan & Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 600, y: 400 });
  const [zoom, setZoom] = useState<number>(.6);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection & Interactivity State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Context Menus & Sub-menus State
  const [emptyContextMenu, setEmptyContextMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [connectorModeSourceId, setConnectorModeSourceId] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<'emoji' | 'color' | 'hierarchy' | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<string>('All');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState<string>('');
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState<boolean>(false);

  // Status & Notification
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Real-Time Collaboration Setup
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [urlRoomId, setUrlRoomId] = useState<string | null>(null);

  // Audit Logs State (per-graph, login-gated)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [roomLogs, setRoomLogs] = useState<any[]>([]);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [logTotal, setLogTotal] = useState(0);

  // Reset confirmation state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // SSR Hydration state tracking
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const key = getNvidiaApiKey();
    if (key) {
      setNvidiaApiKeyInput(key);
    }
    const gKey = getGeminiApiKey();
    if (gKey) {
      setGeminiApiKeyInput(gKey);
    }
    const savedModel = getNvidiaSelectedModel();
    if (savedModel) {
      setSelectedNvidiaModel(savedModel);
    }
  }, []);

  // Local Ollama Service Health & Installed Models State
  const [isOllamaActive, setIsOllamaActive] = useState(false);
  const [installedOllamaModels, setInstalledOllamaModels] = useState<string[]>([]);

  useEffect(() => {
    const checkHealth = async () => {
      const { active, models } = await checkOllamaHealth();
      setIsOllamaActive(active);
      setInstalledOllamaModels(models);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  // NVIDIA & GEMINI BYOK AI Generator State
  const [isNvidiaAiModalOpen, setIsNvidiaAiModalOpen] = useState(false);
  const [nvidiaApiKeyInput, setNvidiaApiKeyInput] = useState('');
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState('deepseek-ai/deepseek-v4-pro-0813');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeBuildingTargetId, setActiveBuildingTargetId] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // Custom Local Ollama Model State
  const [customOllamaInput, setCustomOllamaInput] = useState('');
  const [showOllamaGuide, setShowOllamaGuide] = useState(false);

  const handleAddCustomModelSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customOllamaInput.trim()) return;
    const newModelId = addCustomOllamaModel(customOllamaInput);
    if (newModelId) {
      handleSelectNvidiaModel(newModelId);
      showNotification(`✓ Added & selected custom local model: "${customOllamaInput.trim()}"`);
      setCustomOllamaInput('');
    }
  };

  const handleRemoveCustomModelClick = (modelId: string) => {
    removeCustomOllamaModel(modelId);
    showNotification(`Removed custom model: ${modelId}`);
    if (selectedNvidiaModel === modelId) {
      handleSelectNvidiaModel(CLOUD_NVIDIA_MODELS[0].id);
    }
  };

  const handleSaveNvidiaKey = (key: string) => {
    setNvidiaApiKey(key);
    setNvidiaApiKeyInput(key);
    showNotification(key.trim() ? '✓ Saved NVIDIA API Key to BYOK local storage' : 'Removed NVIDIA API Key');
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    setGeminiApiKeyInput(key);
    showNotification(key.trim() ? '✓ Saved Google Gemini API Key to BYOK local storage' : 'Removed Gemini API Key');
  };

  const handleSelectNvidiaModel = (modelId: string) => {
    setSelectedNvidiaModel(modelId);
    setNvidiaSelectedModel(modelId);
  };

  // Stop Building & 1-Step Snapshot Revert State
  const previousGraphSnapshotRef = useRef<{ nodes: MindNode[]; edges: MindEdge[] } | null>(null);
  const aiAbortControllerRef = useRef<AbortController | null>(null);
  const [isStopConfirmModalOpen, setIsStopConfirmModalOpen] = useState(false);

  // Real-time Thinking & Working AI Log State
  interface AiLogEntry {
    id: string;
    timestamp: string;
    text: string;
    type: 'info' | 'success' | 'warn' | 'error';
  }

  const [aiLogs, setAiLogs] = useState<AiLogEntry[]>([]);
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const [showAiLogPanel, setShowAiLogPanel] = useState(false);
  const logAutoShrinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const addAiLog = useCallback((text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    const entry: AiLogEntry = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp,
      text,
      type,
    };
    setAiLogs((prev) => {
      const isTicker = text.startsWith('⚡ [Live Stream') || text.startsWith('🧠 [Thinking');
      if (isTicker && prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.text.startsWith('⚡ [Live Stream') || last.text.startsWith('🧠 [Thinking')) {
          return [...prev.slice(0, prev.length - 1), entry];
        }
      }
      return [...prev, entry];
    });
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const handleStopBuilding = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (aiAbortControllerRef.current) {
      aiAbortControllerRef.current.abort();
      aiAbortControllerRef.current = null;
    }
    setIsAiGenerating(false);
    setIsNvidiaAiModalOpen(false);
    addAiLog('🛑 AI generation stopped by user.', 'warn');
    setIsStopConfirmModalOpen(true);

    if (logAutoShrinkTimerRef.current) clearTimeout(logAutoShrinkTimerRef.current);
    logAutoShrinkTimerRef.current = setTimeout(() => {
      setIsLogExpanded(false);
    }, 2000);
  };

  const handleKeepPartialState = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsStopConfirmModalOpen(false);
    showNotification('Kept active mind map state');
  };

  const handleRevertPreviousState = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (previousGraphSnapshotRef.current) {
      setNodes(previousGraphSnapshotRef.current.nodes);
      setEdges(previousGraphSnapshotRef.current.edges);
      if (roomId) {
        broadcastStateUpdate({
          nodes: previousGraphSnapshotRef.current.nodes,
          edges: previousGraphSnapshotRef.current.edges,
        });
      }
    }
    setIsStopConfirmModalOpen(false);
    showNotification('↺ Reverted mind map back 1 step to previous state');
  };

  const handleGenerateAiMindMap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) {
      setAiErrorMsg('Please enter a topic or prompt for AI generation');
      return;
    }

    const isGeminiModel = selectedNvidiaModel.startsWith('gemini-');
    const isLocalModel = selectedNvidiaModel.startsWith('ollama/');

    if (isGeminiModel && !geminiApiKeyInput.trim()) {
      setAiErrorMsg('Google Gemini API Key required. Please enter your key from Google AI Studio (https://aistudio.google.com/app/apikey).');
      return;
    }

    if (!isLocalModel && !isGeminiModel && !nvidiaApiKeyInput.trim()) {
      setAiErrorMsg('NVIDIA API Key required for Cloud Models. Please enter your BYOK key (nvapi-...).');
      return;
    }

    setAiErrorMsg(null);
    setIsAiGenerating(true);

    if (logAutoShrinkTimerRef.current) {
      clearTimeout(logAutoShrinkTimerRef.current);
      logAutoShrinkTimerRef.current = null;
    }
    setAiLogs([]);
    setShowAiLogPanel(true);
    setIsLogExpanded(true);
    addAiLog(`🚀 Starting AI MindMap generation (${selectedNvidiaModel}) for: "${aiPrompt.trim()}"`, 'info');

    try {
      if (isGeminiModel) {
        handleSaveGeminiKey(geminiApiKeyInput);
      } else if (!isLocalModel) {
        handleSaveNvidiaKey(nvidiaApiKeyInput);
      }

      const isUpgrading = nodes.length > 0;

      // Lock building target node ID for this entire generation run
      let targetId: string | null = selectedNodeId;
      if (!targetId && nodes.length > 0) {
        const promptLower = aiPrompt.trim().toLowerCase();
        // Sort by title length descending so longer matching titles take precedence (e.g. "Launch & Post-Launch" over "Launch")
        const sortedNodes = [...nodes].sort((a, b) => b.text.length - a.text.length);
        const matchedByTitle = sortedNodes.find(
          (n) => n.text.trim() && promptLower.includes(n.text.toLowerCase().trim())
        );

        if (matchedByTitle) {
          targetId = matchedByTitle.id;
        } else {
          const match = aiPrompt.trim().match(/node\s*#?\s*(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num >= 1 && num <= nodes.length) {
              targetId = nodes[num - 1].id;
            }
          }
        }
      }
      setActiveBuildingTargetId(targetId);

      // Save 1-step snapshot before AI generation starts
      previousGraphSnapshotRef.current = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };

      const controller = new AbortController();
      aiAbortControllerRef.current = controller;

      let newGraph: { nodes: any[]; edges: any[] };
      if (isGeminiModel) {
        newGraph = await generateMindMapWithGemini(
          aiPrompt.trim(),
          geminiApiKeyInput.trim(),
          selectedNvidiaModel,
          nodes,
          controller.signal,
          (msg: string) => {
            addAiLog(msg, 'info');
          },
          edges,
          targetId
        );
      } else {
        newGraph = await generateMindMapWithNvidia(
          aiPrompt.trim(),
          nvidiaApiKeyInput.trim(),
          selectedNvidiaModel,
          nodes,
          controller.signal,
          (msg: string) => {
            addAiLog(msg, 'info');
          },
          edges,
          targetId
        );
      }

      const { nodes: newNodes, edges: newEdges } = newGraph;

      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setNodes(newNodes);
      setEdges(newEdges);

      if (roomId) {
        broadcastStateUpdate({ nodes: newNodes, edges: newEdges });
      }

      const providerLabel = isGeminiModel ? 'Google Gemini AI' : isLocalModel ? 'Local Ollama' : 'NVIDIA NIM';
      const successText = isUpgrading
        ? `✨ Upgraded existing MindMap structure with ${providerLabel}!`
        : `✨ AI MindMap successfully generated with ${providerLabel}!`;
      addAiLog(successText, 'success');
      showNotification(successText);
      setIsNvidiaAiModalOpen(false);
      setAiPrompt('');

      if (logAutoShrinkTimerRef.current) clearTimeout(logAutoShrinkTimerRef.current);
      logAutoShrinkTimerRef.current = setTimeout(() => {
        setIsLogExpanded(false);
      }, 2000);
    } catch (err: any) {
      const isAbort =
        err.name === 'AbortError' ||
        err.message?.toLowerCase().includes('cancelled') ||
        err.message?.toLowerCase().includes('aborted') ||
        err.message?.toLowerCase().includes('abort');

      if (isAbort) {
        addAiLog('🛑 AI generation cancelled by user.', 'warn');
      } else {
        console.error('NVIDIA AI Generation error:', err);
        addAiLog(`❌ Error: ${err.message || 'AI Generation Failed'}`, 'error');
        setAiErrorMsg(err.message || 'Failed to generate mindmap with NVIDIA AI');
      }

      if (logAutoShrinkTimerRef.current) clearTimeout(logAutoShrinkTimerRef.current);
      logAutoShrinkTimerRef.current = setTimeout(() => {
        setIsLogExpanded(false);
      }, 2000);
    } finally {
      setIsAiGenerating(false);
      setActiveBuildingTargetId(null);
      aiAbortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('room');
      if (param) setUrlRoomId(param);
    }
  }, []);

  const isRemoteUpdateRef = useRef(false);

  const handleRemoteStateChange = useCallback((newState: any) => {
    // If collaborative room has no data yet (first load), keep current canvas (fallback to local/default) — prevents blank
    if (!newState || !Array.isArray(newState.nodes) || newState.nodes.length === 0) {
      return;
    }
    isRemoteUpdateRef.current = true;
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setNodes(newState.nodes);
    setEdges(Array.isArray(newState.edges) ? newState.edges : []);
  }, []);

  const handleRemoteNodeChange = useCallback((updatedNode: any) => {
    if (updatedNode && updatedNode.id) {
      isRemoteUpdateRef.current = true;
      setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? { ...n, ...updatedNode } : n)));
    }
  }, []);

  const {
    roomId,
    isCollaborating,
    isHydrating,
    setIsHydrating,
    activeUsers,
    peerCursors,
    userRooms,
    authUser,
    token,
    canEdit,
    roomOwnerId,
    isRoomOwner,
    fetchUserRooms,
    fetchRoomLogs,
    loginUser,
    registerUser,
    logoutUser,
    unloadWorkspace,
    broadcastStateUpdate,
    broadcastNodeUpdate,
    broadcastCursor,
    createSharedRoom,
    commitRoomVersion,
    setRoomId,
  } = useCollaborativeSession({
    toolId: 'mindmap',
    initialRoomId: urlRoomId,
    onRemoteStateChange: handleRemoteStateChange,
    onRemoteNodeChange: handleRemoteNodeChange,
  });

  // Stack-based Undo & Redo History State
  const { canUndo, canRedo, recordState, undo, redo, clearHistory, undoSize, redoSize } = useUndoRedoStack<{
    nodes: MindNode[];
    edges: MindEdge[];
  }>({ maxSize: 50 });

  // Record graph snapshot onto undoStack
  const pushUndoSnapshot = useCallback(() => {
    recordState({ nodes, edges });
  }, [recordState, nodes, edges]);

  const handleUndo = useCallback(() => {
    const previousState = undo({ nodes, edges });
    if (previousState) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      if (roomId) {
        broadcastStateUpdate({ nodes: previousState.nodes, edges: previousState.edges });
      }
      showNotification(`↺ Undo state restored (${undoSize - 1} remaining in stack)`);
    }
  }, [undo, nodes, edges, roomId, broadcastStateUpdate, undoSize]);

  const handleRedo = useCallback(() => {
    const nextState = redo({ nodes, edges });
    if (nextState) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      if (roomId) {
        broadcastStateUpdate({ nodes: nextState.nodes, edges: nextState.edges });
      }
      showNotification(`↻ Redo state applied (${redoSize - 1} remaining in stack)`);
    }
  }, [redo, nodes, edges, roomId, broadcastStateUpdate, redoSize]);

  // Keyboard Shortcuts for Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && !e.altKey) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Git Commit Version State
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [isSubmittingCommit, setIsSubmittingCommit] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRafRef = useRef<number | null>(null);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Handle edit_denied from server (guest trying to edit collaborative graph)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail || {};
      showNotification(detail.message || 'Please login to edit this collaborative graph');
    };
    window.addEventListener('toolip_edit_denied' as any, handler);
    return () => window.removeEventListener('toolip_edit_denied' as any, handler);
  }, []);

  // Open share modal when ToolDetailClient header SHARE is clicked (for mindmap)
  useEffect(() => {
    const handler = () => setIsShareModalOpen(true);
    window.addEventListener('openShareModal' as any, handler);
    return () => window.removeEventListener('openShareModal' as any, handler);
  }, []);

  const handleOpenLogs = async () => {
    if (!roomId || !isCollaborating) {
      showNotification('No collaborative graph selected — create or load a shared workspace first');
      return;
    }
    if (!authUser || (authUser as any).isGuest || !token) {
      showNotification('Please login to view logs for this graph');
      setIsShareModalOpen(true);
      return;
    }
    setIsLogModalOpen(true);
    setIsLogLoading(true);
    try {
      const res = await fetchRoomLogs(roomId, 50, 0);
      setRoomLogs(res.logs || []);
      setLogTotal(res.total || 0);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load logs');
      setRoomLogs([]);
    } finally {
      setIsLogLoading(false);
    }
  };

  const handleRefreshLogs = async () => {
    if (!roomId) return;
    setIsLogLoading(true);
    try {
      const res = await fetchRoomLogs(roomId, 50, 0);
      setRoomLogs(res.logs || []);
      setLogTotal(res.total || 0);
    } catch (err: any) {
      showNotification(err.message || 'Failed to refresh logs');
    } finally {
      setIsLogLoading(false);
    }
  };

  const handleOpenCommitModal = () => {
    if (!roomId) {
      showNotification('Please join or create a shared workspace room first');
      setIsShareModalOpen(true);
      return;
    }
    if (!authUser || (authUser as any).isGuest || !token) {
      showNotification('Please login to save & commit version changes to Git history');
      setIsShareModalOpen(true);
      return;
    }
    setCommitMessage(`feat: updated mindmap architecture (${nodes.length} nodes)`);
    setIsCommitModalOpen(true);
  };

  const handlePushCommit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomId) {
      showNotification('Please join or create a shared room first');
      return;
    }
    if (!commitMessage.trim()) {
      showNotification('Please enter a commit message');
      return;
    }

    try {
      setIsSubmittingCommit(true);
      const dataState = { nodes, edges };
      const res = await commitRoomVersion(roomId, dataState, commitMessage.trim());

      // Broadcast updated state to all connected room peers
      broadcastStateUpdate(dataState);

      showNotification(`Git Commit ${res.version ? `v${res.version}` : ''} saved & pushed to Atlas!`);
      setIsCommitModalOpen(false);
      setCommitMessage('');

      if (isLogModalOpen) {
        handleRefreshLogs();
      }
    } catch (err: any) {
      console.error('Commit failed:', err);
      showNotification(err.message || 'Failed to push version commit');
    } finally {
      setIsSubmittingCommit(false);
    }
  };

  const handleRestoreCommitSnapshot = (snapshot: any, version?: number) => {
    if (!snapshot || !Array.isArray(snapshot.nodes)) {
      showNotification('Invalid snapshot state');
      return;
    }
    handleRemoteStateChange(snapshot);
    if (roomId) {
      broadcastStateUpdate(snapshot);
    }
    showNotification(`Restored graph canvas to Git Version ${version ? `v${version}` : 'snapshot'}`);
  };

  const requireLoginForEdit = (): boolean => {
    if (isCollaborating && (!authUser || (authUser as any).isGuest)) {
      showNotification('🔒 Login to edit this collaborative graph — viewing is read-only');
      setIsShareModalOpen(true);
      return true;
    }
    return false;
  };

  // Lock background scroll when Emoji Modal is open
  useEffect(() => {
    if (isEmojiModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEmojiModalOpen]);


  // Prevent outer document page scrolling when in Fullscreen Editor mode
  useEffect(() => {
    if (!isExpanded) return;

    const preventPageScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.scrollable-note, textarea, .overflow-y-auto, [contenteditable="true"]')) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener('wheel', preventPageScroll, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventPageScroll);
    };
  }, [isExpanded]);

  // Active Note Popover & Dropdown State
  const [activeNoteNodeId, setActiveNoteNodeId] = useState<string | null>(null);
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [activeNoteMenuIndex, setActiveNoteMenuIndex] = useState<number | null>(null);
  const [closedNoteIndices, setClosedNoteIndices] = useState<number[]>([]);

  // Helper to retrieve notes array for a node
  const getNodeNotes = (node: MindNode): string[] => {
    if (Array.isArray(node.notes) && node.notes.length > 0) {
      return node.notes;
    }
    if (node.note && node.note.trim() !== '') {
      return [node.note];
    }
    return [''];
  };

  // Helper to check if node has any non-empty note content
  const hasNodeAnyNote = (node: MindNode): boolean => {
    if (Array.isArray(node.notes) && node.notes.length > 0) {
      return node.notes.some((n) => n && n.replace(/<[^>]*>/g, '').trim() !== '');
    }
    return !!(node.note && node.note.replace(/<[^>]*>/g, '').trim() !== '');
  };

  // Node Details & Note Helper Functions
  const handleUpdateNodeDetails = (nodeId: string, detailsText: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, details: detailsText } : n)));
  };

  const handleUpdateNodeNoteAtIndex = (nodeId: string, index: number, noteHtml: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const currentNotes = getNodeNotes(n);
          const updatedNotes = [...currentNotes];
          updatedNotes[index] = noteHtml;
          return {
            ...n,
            notes: updatedNotes,
            note: updatedNotes[0] || ''
          };
        }
        return n;
      })
    );
  };

  const handleAddParallelNote = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const currentNotes = getNodeNotes(n);
          const updatedNotes = [...currentNotes, ''];
          return {
            ...n,
            notes: updatedNotes,
            note: updatedNotes[0] || ''
          };
        }
        return n;
      })
    );
    showNotification('Added parallel note card!');
  };

  const handleDeleteNoteAtIndex = (nodeId: string, index: number) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const currentNotes = getNodeNotes(n);
          if (currentNotes.length <= 1) {
            return { ...n, notes: [''], note: '' };
          }
          const updatedNotes = currentNotes.filter((_, idx) => idx !== index);
          return {
            ...n,
            notes: updatedNotes,
            note: updatedNotes[0] || ''
          };
        }
        return n;
      })
    );
    showNotification('Deleted note card');
  };

  const generateDefaultNodeDetails = (node: MindNode): string => {
    const parentNode = node.parentId ? nodes.find((n) => n.id === node.parentId) : null;
    const childNodes = nodes.filter((n) => n.parentId === node.id);

    let html = `<h2>${node.emoji ? node.emoji + ' ' : ''}${node.text} Details</h2>\n`;

    if (parentNode) {
      html += `<p><strong>Parent Node:</strong> ${parentNode.emoji ? parentNode.emoji + ' ' : ''}${parentNode.text} <em>(Depth ${parentNode.depth})</em></p>\n`;
    } else {
      html += `<p><strong>Parent Node:</strong> None <em>(Main Root Node)</em></p>\n`;
    }

    if (childNodes.length > 0) {
      html += `<p><strong>Sub-branches / Children (${childNodes.length}):</strong></p>\n<ul>\n`;
      childNodes.forEach((child) => {
        html += `  <li>${child.emoji ? child.emoji + ' ' : ''}${child.text}</li>\n`;
      });
      html += `</ul>\n`;
    } else {
      html += `<p><strong>Sub-branches / Children:</strong> No child nodes attached yet.</p>\n`;
    }

    html += `<p>Write custom notes, descriptions, or objectives for ${node.text} here...</p>`;
    return html;
  };

  const handleInsertStructureTemplate = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    const defaultTemplate = generateDefaultNodeDetails(targetNode);
    handleUpdateNodeDetails(nodeId, defaultTemplate);
    showNotification('Inserted smart parent & child summary template!');
  };

  const appendTagToDetails = (nodeId: string, tagContent: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    const current = targetNode.details && targetNode.details.trim() !== ''
      ? targetNode.details
      : generateDefaultNodeDetails(targetNode);
    handleUpdateNodeDetails(nodeId, current + (current ? '\n' : '') + tagContent);
  };

  // Hierarchy Setter Functions
  const handleMakeRoot = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
            ...n,
            isRoot: true,
            depth: 0,
            parentId: null,
            width: Math.max(n.width, 220),
            height: Math.max(n.height, 68),
            color: '#00f2fe'
          }
          : n
      )
    );
    showNotification('Promoted node to Main Root (Depth 0)');
    setActiveSubMenu(null);
  };

  const handleSetParentNode = (nodeId: string, newParentId: string) => {
    const parent = nodes.find((n) => n.id === newParentId);
    if (!parent) return;

    const newDepth = parent.depth + 1;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
            ...n,
            parentId: newParentId,
            depth: newDepth,
            isRoot: false
          }
          : n
      )
    );

    setEdges((prev) => {
      const filtered = prev.filter((e) => e.target !== nodeId);
      return [
        ...filtered,
        {
          id: `e_${Date.now()}`,
          source: newParentId,
          target: nodeId,
          color: parent.color || '#00f2fe'
        }
      ];
    });

    showNotification(`Assigned parent to "${parent.text}" (Depth ${newDepth})`);
    setActiveSubMenu(null);
  };

  const handlePromoteHierarchy = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const newDepth = Math.max(0, n.depth - 1);
          return {
            ...n,
            depth: newDepth,
            isRoot: newDepth === 0,
            parentId: newDepth === 0 ? null : n.parentId
          };
        }
        return n;
      })
    );
    showNotification('Promoted hierarchy level (-1)');
  };

  const handleDemoteHierarchy = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const newDepth = n.depth + 1;
          return {
            ...n,
            depth: newDepth,
            isRoot: false
          };
        }
        return n;
      })
    );
    showNotification('Demoted hierarchy level (+1)');
  };

  // Build yFiles-compatible GraphML XML
  const generateGraphML = useCallback((): string => {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;
    xml += `<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:mindmap="http://www.yworks.com/yFilesHTML/demos/MindMap/1.0" xmlns:y="http://www.yworks.com/xml/yfiles-common/3.0" xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    xml += `  <key id="d0" for="node" attr.name="NodeLabels"/>\n`;
    xml += `  <key id="d1" for="node" attr.name="NodeGeometry"/>\n`;
    xml += `  <key id="d2" for="all" attr.name="UserTags"/>\n`;
    xml += `  <key id="d3" for="edge" attr.name="EdgeGeometry"/>\n`;
    xml += `  <graph id="G" edgedefault="directed">\n`;

    nodes.forEach((n) => {
      const nodeJson = JSON.stringify({
        id: n.id,
        text: n.text,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        depth: n.depth,
        isRoot: n.isRoot || false,
        collapsed: n.collapsed || false,
        emoji: n.emoji || '',
        color: n.color || '#00f2fe',
        parentId: n.parentId || null,
        details: n.details || '',
        note: n.note || '',
        notes: n.notes || []
      });

      const labelEscaped = (n.text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      xml += `    <node id="${n.id}">\n`;
      xml += `      <data key="d0"><y:Label Text="${labelEscaped}"/></data>\n`;
      xml += `      <data key="d1"><y:RectD X="${n.x}" Y="${n.y}" Width="${n.width}" Height="${n.height}"/></data>\n`;
      xml += `      <data key="d2"><y:Json><![CDATA[${nodeJson}]]></y:Json></data>\n`;
      xml += `    </node>\n`;
    });

    edges.forEach((e) => {
      const edgeJson = JSON.stringify({
        id: e.id,
        source: e.source,
        target: e.target,
        color: e.color || '#00f2fe'
      });
      xml += `    <edge id="${e.id}" source="${e.source}" target="${e.target}">\n`;
      xml += `      <data key="d2"><y:Json><![CDATA[${edgeJson}]]></y:Json></data>\n`;
      xml += `    </edge>\n`;
    });

    xml += `  </graph>\n`;
    xml += `</graphml>`;
    return xml;
  }, [nodes, edges]);

  // Parse GraphML XML into MindNode & MindEdge arrays
  const parseGraphML = (xmlText: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML Parse Error: ' + parserError.textContent);
      }

      const nodeEls = doc.querySelectorAll('node');
      const edgeEls = doc.querySelectorAll('edge');

      const parsedNodes: MindNode[] = [];
      const parsedEdges: MindEdge[] = [];

      nodeEls.forEach((nEl, idx) => {
        const id = nEl.getAttribute('id') || `n${idx}`;
        let text = 'Node';
        let x = (idx % 4) * 160;
        let y = Math.floor(idx / 4) * 100;
        let width = 140;
        let height = 50;
        let depth = 1;
        let isRoot = idx === 0;
        let collapsed = false;
        let emoji = '';
        let color = '#00f2fe';
        let parentId: string | null = null;
        let details = '';
        let note = '';
        let notes: string[] = [];

        // Try extracting geometry from <y:RectD>
        const rectEl = nEl.querySelector('data[key="d1"] y\\:RectD, y\\:RectD, RectD');
        if (rectEl) {
          if (rectEl.getAttribute('X')) x = parseFloat(rectEl.getAttribute('X')!);
          if (rectEl.getAttribute('Y')) y = parseFloat(rectEl.getAttribute('Y')!);
          if (rectEl.getAttribute('Width')) width = parseFloat(rectEl.getAttribute('Width')!);
          if (rectEl.getAttribute('Height')) height = parseFloat(rectEl.getAttribute('Height')!);
        }

        // Try label text
        const labelEl = nEl.querySelector('data[key="d0"] y\\:Label, y\\:Label, Label');
        if (labelEl) {
          const txtAttr = labelEl.getAttribute('Text');
          if (txtAttr) text = txtAttr;
        }

        // Extract detailed state from <y:Json> or <data key="d2">
        const jsonEl = nEl.querySelector('data[key="d2"] y\\:Json, y\\:Json, Json');
        if (jsonEl && jsonEl.textContent) {
          try {
            const dataObj = JSON.parse(jsonEl.textContent);
            if (dataObj.text) text = dataObj.text;
            if (typeof dataObj.x === 'number') x = dataObj.x;
            if (typeof dataObj.y === 'number') y = dataObj.y;
            if (typeof dataObj.width === 'number') width = dataObj.width;
            if (typeof dataObj.height === 'number') height = dataObj.height;
            if (typeof dataObj.depth === 'number') depth = dataObj.depth;
            if (typeof dataObj.isRoot === 'boolean') isRoot = dataObj.isRoot;
            if (typeof dataObj.collapsed === 'boolean') collapsed = dataObj.collapsed;
            if (dataObj.emoji) emoji = dataObj.emoji;
            if (dataObj.color) color = dataObj.color;
            if (dataObj.parentId !== undefined) parentId = dataObj.parentId;
            if (dataObj.details) details = dataObj.details;
            if (dataObj.note) note = dataObj.note;
            if (Array.isArray(dataObj.notes)) notes = dataObj.notes;
          } catch (e) {
            console.warn('Failed to parse node JSON payload', e);
          }
        }

        // Depth 0 or id === 'n0'
        if (id === 'n0' || depth === 0) {
          isRoot = true;
          depth = 0;
        }

        parsedNodes.push({ id, text, x, y, width, height, isRoot, depth, collapsed, emoji, color, parentId, details, note, notes });
      });

      edgeEls.forEach((eEl, idx) => {
        const id = eEl.getAttribute('id') || `e${idx}`;
        const source = eEl.getAttribute('source') || '';
        const target = eEl.getAttribute('target') || '';
        let color = '#00f2fe';

        const jsonEl = eEl.querySelector('data[key="d2"] y\\:Json, y\\:Json, Json');
        if (jsonEl && jsonEl.textContent) {
          try {
            const dataObj = JSON.parse(jsonEl.textContent);
            if (dataObj.color) color = dataObj.color;
          } catch (e) {
            // ignore
          }
        }

        if (source && target) {
          parsedEdges.push({ id, source, target, color });
        }
      });

      if (parsedNodes.length > 0) {
        setNodes(parsedNodes);
        setEdges(parsedEdges);
        showNotification('Loaded GraphML structure successfully!');
      } else {
        throw new Error('No nodes found in XML');
      }
    } catch (err) {
      console.error('Failed to parse GraphML', err);
      // Fallback default sample map
      loadDefaultSampleMap();
    }
  };

  const STORAGE_KEY_NODES = 'toolip_mindmap_nodes_v1';
  const STORAGE_KEY_EDGES = 'toolip_mindmap_edges_v1';

  // State to track initial loading completion
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const loadDefaultSampleMap = () => {
    const defaultNodes: MindNode[] = [
      { id: 'n0', text: 'hobbies', x: 0, y: 0, width: 220, height: 68, isRoot: true, depth: 0, emoji: '🎯', color: '#00f2fe' },
      { id: 'n1', text: 'games', x: -280, y: -130, width: 170, height: 56, depth: 1, emoji: '🎮', color: '#10b981', parentId: 'n0' },
      { id: 'n2', text: 'computer', x: -500, y: -200, width: 160, height: 52, depth: 2, emoji: '💻', color: '#10b981', parentId: 'n1' },
      { id: 'n3', text: 'settlers of catan', x: -540, y: -120, width: 190, height: 52, depth: 2, emoji: '🎲', color: '#10b981', parentId: 'n1' },
      { id: 'n4', text: 'cops & robbers', x: -520, y: -40, width: 180, height: 52, depth: 2, emoji: '🚓', color: '#10b981', parentId: 'n1' },

      { id: 'n5', text: 'books', x: 280, y: -140, width: 170, height: 56, depth: 1, emoji: '📚', color: '#f59e0b', parentId: 'n0' },
      { id: 'n6', text: 'fantasy', x: 500, y: -210, width: 160, height: 52, depth: 2, emoji: '🧙‍♂️', color: '#f59e0b', parentId: 'n5' },
      { id: 'n7', text: 'sci-fi', x: 500, y: -130, width: 150, height: 52, depth: 2, emoji: '🚀', color: '#f59e0b', parentId: 'n5' },
      { id: 'n8', text: 'thriller', x: 500, y: -50, width: 150, height: 52, depth: 2, emoji: '🕵️', color: '#f59e0b', parentId: 'n5' },

      { id: 'n9', text: 'collecting', x: -290, y: 130, width: 170, height: 56, depth: 1, emoji: '🎨', color: '#8b5cf6', parentId: 'n0' },
      { id: 'n10', text: 'stamps', x: -500, y: 130, width: 160, height: 52, depth: 2, emoji: '📮', color: '#8b5cf6', parentId: 'n9' },

      { id: 'n11', text: 'sport', x: 280, y: 130, width: 170, height: 56, depth: 1, emoji: '⚽', color: '#ff007f', parentId: 'n0' },
      { id: 'n12', text: 'soccer', x: 500, y: 70, width: 150, height: 52, depth: 2, emoji: '⚽', color: '#ff007f', parentId: 'n11' },
      { id: 'n13', text: 'climbing', x: 500, y: 150, width: 160, height: 52, depth: 2, emoji: '🧗', color: '#ff007f', parentId: 'n11' },
      { id: 'n14', text: 'rock', x: 710, y: 110, width: 130, height: 48, depth: 3, emoji: '🪨', color: '#ff007f', parentId: 'n13' },
      { id: 'n15', text: 'ice', x: 710, y: 180, width: 130, height: 48, depth: 3, emoji: '🧊', color: '#ff007f', parentId: 'n13' },
    ];

    const defaultEdges: MindEdge[] = [
      { id: 'e0', source: 'n0', target: 'n1', color: '#10b981' },
      { id: 'e1', source: 'n1', target: 'n2', color: '#10b981' },
      { id: 'e2', source: 'n1', target: 'n3', color: '#10b981' },
      { id: 'e3', source: 'n1', target: 'n4', color: '#10b981' },

      { id: 'e4', source: 'n0', target: 'n5', color: '#f59e0b' },
      { id: 'e5', source: 'n5', target: 'n6', color: '#f59e0b' },
      { id: 'e6', source: 'n5', target: 'n7', color: '#f59e0b' },
      { id: 'e7', source: 'n5', target: 'n8', color: '#f59e0b' },

      { id: 'e8', source: 'n0', target: 'n9', color: '#8b5cf6' },
      { id: 'e9', source: 'n9', target: 'n10', color: '#8b5cf6' },

      { id: 'e10', source: 'n0', target: 'n11', color: '#ff007f' },
      { id: 'e11', source: 'n11', target: 'n12', color: '#ff007f' },
      { id: 'e12', source: 'n11', target: 'n13', color: '#ff007f' },
      { id: 'e13', source: 'n13', target: 'n14', color: '#ff007f' },
      { id: 'e14', source: 'n13', target: 'n15', color: '#ff007f' },
    ];

    setNodes(defaultNodes);
    setEdges(defaultEdges);
  };

  const loadProfileSampleMap = () => {
    const profileNodes: MindNode[] = [
      // Root Node: Personal Profile
      {
        id: 'prof_root',
        text: 'Personal Profile',
        x: 0,
        y: 0,
        width: 240,
        height: 72,
        isRoot: true,
        depth: 0,
        emoji: '👤',
        color: '#00f2fe',
        details: 'Comprehensive Personal Profile covering Motive, Education, Experience, Skills, and Hobbies.',
        note: 'Main profile hub.',
      },

      // Branch 1: Motive & Objectives (Top-Left)
      {
        id: 'prof_motive',
        text: 'Motive & Objectives',
        x: -340,
        y: -220,
        width: 200,
        height: 56,
        depth: 1,
        emoji: '🎯',
        color: '#10b981',
        parentId: 'prof_root',
        details: 'Career motivation, vision, and long-term professional aspirations.',
        note: 'Driven by technology innovation and continuous learning.',
      },
      {
        id: 'prof_motive_1',
        text: 'Career Vision & Goals',
        x: -590,
        y: -300,
        width: 180,
        height: 50,
        depth: 2,
        emoji: '🚀',
        color: '#10b981',
        parentId: 'prof_motive',
        details: 'Building scalable software systems & leading technical teams.',
      },
      {
        id: 'prof_motive_2',
        text: 'Core Values & Purpose',
        x: -590,
        y: -220,
        width: 180,
        height: 50,
        depth: 2,
        emoji: '💡',
        color: '#10b981',
        parentId: 'prof_motive',
        details: 'Integrity, impact-driven engineering, and user empathy.',
      },
      {
        id: 'prof_motive_3',
        text: 'Passion & Growth Mindset',
        x: -590,
        y: -140,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '🔥',
        color: '#10b981',
        parentId: 'prof_motive',
        details: 'Passionate about solving complex real-world problems.',
      },

      // Branch 2: Education & Qualifications (Top-Right)
      {
        id: 'prof_edu',
        text: 'Education & Qualifications',
        x: 340,
        y: -220,
        width: 220,
        height: 56,
        depth: 1,
        emoji: '🎓',
        color: '#3b82f6',
        parentId: 'prof_root',
        details: 'Academic degrees, certifications, and specialized coursework.',
      },
      {
        id: 'prof_edu_1',
        text: 'Computer Science Degree',
        x: 600,
        y: -300,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '📜',
        color: '#3b82f6',
        parentId: 'prof_edu',
        details: 'Bachelor of Science / Technology in Computer Engineering.',
      },
      {
        id: 'prof_edu_2',
        text: 'Certifications & Courses',
        x: 600,
        y: -220,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '🎖️',
        color: '#3b82f6',
        parentId: 'prof_edu',
        details: 'Cloud certifications, System Architecture, & AI/ML specialization.',
      },
      {
        id: 'prof_edu_3',
        text: 'Academic Projects & Thesis',
        x: 600,
        y: -140,
        width: 200,
        height: 50,
        depth: 2,
        emoji: '🔬',
        color: '#3b82f6',
        parentId: 'prof_edu',
        details: 'Capstone research on distributed state management.',
      },

      // Branch 3: Experience & Work History (Mid-Left)
      {
        id: 'prof_exp',
        text: 'Work Experience',
        x: -380,
        y: 60,
        width: 190,
        height: 56,
        depth: 1,
        emoji: '💼',
        color: '#8b5cf6',
        parentId: 'prof_root',
        details: 'Professional employment history, key responsibilities, and achievements.',
      },
      {
        id: 'prof_exp_1',
        text: 'Software Developer Roles',
        x: -630,
        y: -20,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '👨‍💻',
        color: '#8b5cf6',
        parentId: 'prof_exp',
        details: 'Full-Stack Engineer building real-time collaboration platforms.',
      },
      {
        id: 'prof_exp_2',
        text: 'Key Impact & Projects',
        x: -630,
        y: 60,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '🏆',
        color: '#8b5cf6',
        parentId: 'prof_exp',
        details: 'Optimized performance by 40% & engineered live canvas sync.',
      },
      {
        id: 'prof_exp_3',
        text: 'Team Leadership & Mentorship',
        x: -630,
        y: 140,
        width: 210,
        height: 50,
        depth: 2,
        emoji: '📈',
        color: '#8b5cf6',
        parentId: 'prof_exp',
        details: 'Mentored team members and led agile product execution.',
      },

      // Branch 4: Technical & Soft Skills (Mid-Right)
      {
        id: 'prof_skills',
        text: 'Skills & Competencies',
        x: 380,
        y: 60,
        width: 200,
        height: 56,
        depth: 1,
        emoji: '⚡',
        color: '#f59e0b',
        parentId: 'prof_root',
        details: 'Technical stack, tools, frameworks, and interpersonal skills.',
      },
      {
        id: 'prof_skills_1',
        text: 'Frontend & UI Engineering',
        x: 630,
        y: -20,
        width: 200,
        height: 50,
        depth: 2,
        emoji: '💻',
        color: '#f59e0b',
        parentId: 'prof_skills',
        details: 'React, Next.js, TypeScript, Tailwind CSS, SVG manipulation.',
      },
      {
        id: 'prof_skills_2',
        text: 'Backend & Cloud Systems',
        x: 630,
        y: 60,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '🛠️',
        color: '#f59e0b',
        parentId: 'prof_skills',
        details: 'Node.js, Express, WebSockets, MongoDB, NVIDIA AI APIs.',
      },
      {
        id: 'prof_skills_3',
        text: 'Soft Skills & Collaboration',
        x: 630,
        y: 140,
        width: 200,
        height: 50,
        depth: 2,
        emoji: '🤝',
        color: '#f59e0b',
        parentId: 'prof_skills',
        details: 'Problem solving, communication, agile development.',
      },

      // Branch 5: Hobbies & Personal Interests (Bottom-Center)
      {
        id: 'prof_hobbies',
        text: 'Hobbies & Interests',
        x: 0,
        y: 260,
        width: 210,
        height: 56,
        depth: 1,
        emoji: '🎨',
        color: '#ff007f',
        parentId: 'prof_root',
        details: 'Extracurricular pursuits, creative arts, and wellness.',
      },
      {
        id: 'prof_hobbies_1',
        text: 'Creative Arts & UI Design',
        x: -250,
        y: 370,
        width: 190,
        height: 50,
        depth: 2,
        emoji: '🖌️',
        color: '#ff007f',
        parentId: 'prof_hobbies',
        details: 'Digital illustration, UI prototyping, and vector art.',
      },
      {
        id: 'prof_hobbies_2',
        text: 'Sports & Fitness',
        x: 0,
        y: 370,
        width: 170,
        height: 50,
        depth: 2,
        emoji: '⚽',
        color: '#ff007f',
        parentId: 'prof_hobbies',
        details: 'Cycling, soccer, and outdoor adventure.',
      },
      {
        id: 'prof_hobbies_3',
        text: 'Open Source & Mentoring',
        x: 250,
        y: 370,
        width: 200,
        height: 50,
        depth: 2,
        emoji: '🌱',
        color: '#ff007f',
        parentId: 'prof_hobbies',
        details: 'Contributing to open source software and community building.',
      },
    ];

    const profileEdges: MindEdge[] = [
      { id: 'pe_0', source: 'prof_root', target: 'prof_motive', color: '#10b981' },
      { id: 'pe_1', source: 'prof_motive', target: 'prof_motive_1', color: '#10b981' },
      { id: 'pe_2', source: 'prof_motive', target: 'prof_motive_2', color: '#10b981' },
      { id: 'pe_3', source: 'prof_motive', target: 'prof_motive_3', color: '#10b981' },

      { id: 'pe_4', source: 'prof_root', target: 'prof_edu', color: '#3b82f6' },
      { id: 'pe_5', source: 'prof_edu', target: 'prof_edu_1', color: '#3b82f6' },
      { id: 'pe_6', source: 'prof_edu', target: 'prof_edu_2', color: '#3b82f6' },
      { id: 'pe_7', source: 'prof_edu', target: 'prof_edu_3', color: '#3b82f6' },

      { id: 'pe_8', source: 'prof_root', target: 'prof_exp', color: '#8b5cf6' },
      { id: 'pe_9', source: 'prof_exp', target: 'prof_exp_1', color: '#8b5cf6' },
      { id: 'pe_10', source: 'prof_exp', target: 'prof_exp_2', color: '#8b5cf6' },
      { id: 'pe_11', source: 'prof_exp', target: 'prof_exp_3', color: '#8b5cf6' },

      { id: 'pe_12', source: 'prof_root', target: 'prof_skills', color: '#f59e0b' },
      { id: 'pe_13', source: 'prof_skills', target: 'prof_skills_1', color: '#f59e0b' },
      { id: 'pe_14', source: 'prof_skills', target: 'prof_skills_2', color: '#f59e0b' },
      { id: 'pe_15', source: 'prof_skills', target: 'prof_skills_3', color: '#f59e0b' },

      { id: 'pe_16', source: 'prof_root', target: 'prof_hobbies', color: '#ff007f' },
      { id: 'pe_17', source: 'prof_hobbies', target: 'prof_hobbies_1', color: '#ff007f' },
      { id: 'pe_18', source: 'prof_hobbies', target: 'prof_hobbies_2', color: '#ff007f' },
      { id: 'pe_19', source: 'prof_hobbies', target: 'prof_hobbies_3', color: '#ff007f' },
    ];

    setNodes(profileNodes);
    setEdges(profileEdges);
    setPan({ x: 600, y: 400 });
    setZoom(.6);
    showNotification('Loaded Profile Mind Map (Motive, Education, Experience, Skill, Hobbies)');
  };

  // Initial Load from localStorage, backend API, or default sample
  useEffect(() => {
    // If a room is active in URL query or local room key, skip overwriting canvas with local storage!
    const urlParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : null;
    const savedActiveRoom = typeof window !== 'undefined' ? localStorage.getItem('toolip_active_room_mindmap') : null;
    const targetRoom = urlParam || savedActiveRoom || urlRoomId;

    if (targetRoom) {
      // Cloud room is active; fetchRoomData will hydrate canvas from MongoDB Atlas
      setIsInitialized(true);
      return;
    }

    try {
      const savedNodes = localStorage.getItem(STORAGE_KEY_NODES);
      const savedEdges = localStorage.getItem(STORAGE_KEY_EDGES);

      if (savedNodes && savedEdges) {
        const parsedNodes: MindNode[] = JSON.parse(savedNodes);
        const parsedEdges: MindEdge[] = JSON.parse(savedEdges);

        if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
          setNodes(parsedNodes);
          setEdges(Array.isArray(parsedEdges) ? parsedEdges : []);
          setIsInitialized(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to restore mindmap state from localStorage', e);
    }

    fetch('/api/mindmap')
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error('API not available');
      })
      .then((xml) => {
        parseGraphML(xml);
        setIsInitialized(true);
      })
      .catch(() => {
        loadDefaultSampleMap();
        setIsInitialized(true);
      });
  }, [urlRoomId]);

  // Sync state to localStorage whenever nodes or edges update (ONLY when working in private offline mode)
  useEffect(() => {
    if (!isInitialized || isHydrating || roomId) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
        localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
      } catch (e) {
        console.warn('Failed to save mindmap state to localStorage', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nodes, edges, isInitialized, isHydrating, roomId]);

  // Broadcast updates to real-time WebSockets if in collaborative room
  useEffect(() => {
    if (!isCollaborating || !isInitialized || isHydrating) return;

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      broadcastStateUpdate({ nodes, edges });
    }, 250);

    return () => clearTimeout(timer);
  }, [nodes, edges, isCollaborating, isInitialized, isHydrating, broadcastStateUpdate]);

  // Restore private local storage graph on unload
  const restoreLocalGraph = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    try {
      const savedNodes = localStorage.getItem(STORAGE_KEY_NODES);
      const savedEdges = localStorage.getItem(STORAGE_KEY_EDGES);

      if (savedNodes && savedEdges) {
        const parsedNodes: MindNode[] = JSON.parse(savedNodes);
        const parsedEdges: MindEdge[] = JSON.parse(savedEdges);

        if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
          setNodes(parsedNodes);
          setEdges(Array.isArray(parsedEdges) ? parsedEdges : []);
          setPan({ x: 600, y: 400 });
          setZoom(.6);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to restore mindmap state from localStorage', e);
    }
    loadDefaultSampleMap();
    setPan({ x: 600, y: 400 });
    setZoom(.6);
  }, []);

  const handleUnloadWorkspace = useCallback(() => {
    unloadWorkspace();
    restoreLocalGraph();
    showNotification('Unloaded room & restored private local canvas');
  }, [unloadWorkspace, restoreLocalGraph]);

  // Reset to Default Sample Map & Clear Storage
  const handleResetToDefaultMap = () => {
    pushUndoSnapshot();
    try {
      localStorage.removeItem(STORAGE_KEY_NODES);
      localStorage.removeItem(STORAGE_KEY_EDGES);
    } catch (e) {
      // ignore
    }
    loadDefaultSampleMap();
    showNotification('Reset mind map to default sample map!');
  };

  // Auto-Arrange & Beautify Mind Map Layout (Horizontal or Free 360° Radial)
  const handleAutoArrangeGraph = (mode: 'horizontal' | 'radial' = 'horizontal') => {
    if (nodes.length === 0) return;
    pushUndoSnapshot();

    // Identify root nodes (nodes marked isRoot, nodes with no parentId, or nodes whose parentId doesn't exist)
    const rootNodes = nodes.filter(
      (n) => n.isRoot || !n.parentId || !nodes.some((other) => other.id === n.parentId)
    );

    if (rootNodes.length === 0 && nodes.length > 0) {
      rootNodes.push(nodes[0]);
    }

    const updatedNodes = [...nodes];

    // Helper to get direct children
    const getChildren = (parentId: string) =>
      updatedNodes.filter((n) => n.parentId === parentId && n.id !== parentId);

    // Dynamic node height helper with safety margin
    const getNodeHeight = (nodeId: string) => {
      const n = updatedNodes.find((item) => item.id === nodeId);
      return (n?.height || 56) + 32; // 32px vertical gap
    };

    // Dynamic node width helper with safety margin
    const getNodeWidth = (nodeId: string) => {
      const n = updatedNodes.find((item) => item.id === nodeId);
      return (n?.width || 180) + 40; // 40px horizontal gap
    };

    if (mode === 'radial') {
      // --- FREE 360° RADIAL ALL-DIRECTIONS ARRANGEMENT ---
      let rootOffsetY = 0;

      rootNodes.forEach((root) => {
        const rootIdx = updatedNodes.findIndex((n) => n.id === root.id);
        if (rootIdx !== -1) {
          updatedNodes[rootIdx] = {
            ...updatedNodes[rootIdx],
            x: 0,
            y: rootOffsetY,
            depth: 0,
            isRoot: true,
          };
        }

        const level1 = getChildren(root.id);
        const count = level1.length;
        if (count === 0) return;

        const baseRadius = Math.max(340, 240 + count * 18);
        const angleStep = (2 * Math.PI) / count;

        const layoutRadialSubtree = (
          nodeId: string,
          centerX: number,
          centerY: number,
          parentAngle: number,
          depth: number
        ) => {
          const children = getChildren(nodeId);
          if (children.length === 0) return;

          const numChildren = children.length;
          const fanAngle = Math.min(Math.PI / 1.8, (Math.PI / 3) * Math.max(1, numChildren / 2.5));
          const startAngle = parentAngle - fanAngle / 2;
          const stepAngle = numChildren > 1 ? fanAngle / (numChildren - 1) : 0;
          const childRadius = Math.max(240, 190 + numChildren * 14);

          children.forEach((child, i) => {
            const childAngle = numChildren === 1 ? parentAngle : startAngle + i * stepAngle;
            const cx = centerX + Math.cos(childAngle) * childRadius;
            const cy = centerY + Math.sin(childAngle) * childRadius;

            const cIdx = updatedNodes.findIndex((n) => n.id === child.id);
            if (cIdx !== -1) {
              updatedNodes[cIdx] = {
                ...updatedNodes[cIdx],
                x: cx,
                y: cy,
                depth: depth,
                isRoot: false,
              };
            }

            layoutRadialSubtree(child.id, cx, cy, childAngle, depth + 1);
          });
        };

        level1.forEach((child, i) => {
          const angle = i * angleStep - Math.PI / 2; // Start top
          const cx = Math.cos(angle) * baseRadius;
          const cy = rootOffsetY + Math.sin(angle) * baseRadius;

          const cIdx = updatedNodes.findIndex((n) => n.id === child.id);
          if (cIdx !== -1) {
            updatedNodes[cIdx] = {
              ...updatedNodes[cIdx],
              x: cx,
              y: cy,
              depth: 1,
              isRoot: false,
            };
          }

          layoutRadialSubtree(child.id, cx, cy, angle, 2);
        });

        rootOffsetY += baseRadius * 2 + 350;
      });
    } else {
      // --- HORIZONTAL LEFT-RIGHT WING ARRANGEMENT ---
      const getSubtreeHeight = (nodeId: string): number => {
        const children = getChildren(nodeId);
        const baseH = getNodeHeight(nodeId);
        if (children.length === 0) return baseH;
        const childrenH = children.reduce((sum, c) => sum + getSubtreeHeight(c.id), 0);
        return Math.max(baseH, childrenH);
      };

      // Recursive subtree placer
      const layoutSubtree = (nodeId: string, startX: number, startY: number, depth: number, dir: 'left' | 'right') => {
        const idx = updatedNodes.findIndex((n) => n.id === nodeId);
        if (idx !== -1) {
          updatedNodes[idx] = {
            ...updatedNodes[idx],
            x: startX,
            y: startY,
            depth: depth,
            isRoot: false
          };
        }

        const children = getChildren(nodeId);
        if (children.length === 0) return;

        const totalHeight = children.reduce((sum, c) => sum + getSubtreeHeight(c.id), 0);
        let currentY = startY - totalHeight / 2;

        const currentWidth = getNodeWidth(nodeId);
        const HORIZONTAL_STEP = Math.max(280, currentWidth + 60);

        children.forEach((child) => {
          const cHeight = getSubtreeHeight(child.id);
          const cY = currentY + cHeight / 2;
          const nextX = dir === 'right' ? startX + HORIZONTAL_STEP : startX - HORIZONTAL_STEP;
          layoutSubtree(child.id, nextX, cY, depth + 1, dir);
          currentY += cHeight;
        });
      };

      let currentRootY = 0;

      rootNodes.forEach((root) => {
        const rootIdx = updatedNodes.findIndex((n) => n.id === root.id);
        if (rootIdx !== -1) {
          updatedNodes[rootIdx] = {
            ...updatedNodes[rootIdx],
            x: 0,
            y: currentRootY,
            depth: 0,
            isRoot: true
          };
        }

        const children = getChildren(root.id);
        if (children.length > 0) {
          const rightChildren = children.filter((_, idx) => idx % 2 === 0);
          const leftChildren = children.filter((_, idx) => idx % 2 === 1);

          // Right Wing Layout
          const totalRightHeight = rightChildren.reduce((sum, c) => sum + getSubtreeHeight(c.id), 0);
          let startRightY = currentRootY - totalRightHeight / 2;
          const rootWidth = getNodeWidth(root.id);
          const wingX = Math.max(300, rootWidth / 2 + 160);

          rightChildren.forEach((child) => {
            const childHeight = getSubtreeHeight(child.id);
            const childY = startRightY + childHeight / 2;
            layoutSubtree(child.id, wingX, childY, 1, 'right');
            startRightY += childHeight;
          });

          // Left Wing Layout
          const totalLeftHeight = leftChildren.reduce((sum, c) => sum + getSubtreeHeight(c.id), 0);
          let startLeftY = currentRootY - totalLeftHeight / 2;

          leftChildren.forEach((child) => {
            const childHeight = getSubtreeHeight(child.id);
            const childY = startLeftY + childHeight / 2;
            layoutSubtree(child.id, -wingX, childY, 1, 'left');
            startLeftY += childHeight;
          });
        }

        const treeHeight = Math.max(
          getChildren(root.id).reduce((sum, c) => sum + getSubtreeHeight(c.id), 0),
          380
        );
        currentRootY += treeHeight + 250;
      });
    }

    // --- SUBTREE COLLISION DETECTION & DE-OVERLAPPING PASS ---
    const shiftSubtree = (startNodeId: string, deltaX: number, deltaY: number) => {
      const stack = [startNodeId];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const currId = stack.pop()!;
        if (visited.has(currId)) continue;
        visited.add(currId);

        const nodeIdx = updatedNodes.findIndex((n) => n.id === currId);
        if (nodeIdx !== -1) {
          updatedNodes[nodeIdx] = {
            ...updatedNodes[nodeIdx],
            x: updatedNodes[nodeIdx].x + deltaX,
            y: updatedNodes[nodeIdx].y + deltaY
          };

          const childNodes = updatedNodes.filter((n) => n.parentId === currId && n.id !== currId);
          childNodes.forEach((c) => stack.push(c.id));
        }
      }
    };

    const isAncestor = (ancestorId: string, targetId: string): boolean => {
      let curr = updatedNodes.find((n) => n.id === targetId);
      while (curr && curr.parentId) {
        if (curr.parentId === ancestorId) return true;
        const parentId: string = curr.parentId;
        curr = updatedNodes.find((n) => n.id === parentId);
      }
      return false;
    };

    const MARGIN_X = 40;
    const MARGIN_Y = 30;
    const MAX_COLLISION_PASSES = 35;

    for (let pass = 0; pass < MAX_COLLISION_PASSES; pass++) {
      let movedAny = false;

      for (let i = 0; i < updatedNodes.length; i++) {
        for (let j = i + 1; j < updatedNodes.length; j++) {
          const n1 = updatedNodes[i];
          const n2 = updatedNodes[j];

          if (isAncestor(n1.id, n2.id) || isAncestor(n2.id, n1.id)) continue;

          const w1 = n1.width || 180;
          const h1 = n1.height || 56;
          const w2 = n2.width || 180;
          const h2 = n2.height || 56;

          const minXDist = (w1 + w2) / 2 + MARGIN_X;
          const minYDist = (h1 + h2) / 2 + MARGIN_Y;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;

          const absX = Math.abs(dx);
          const absY = Math.abs(dy);

          const overlapX = minXDist - absX;
          const overlapY = minYDist - absY;

          if (overlapX > 0 && overlapY > 0) {
            movedAny = true;

            if (overlapY <= overlapX + 20) {
              const shiftY = overlapY;
              const signY = dy >= 0 ? 1 : -1;

              if (n1.isRoot && !n2.isRoot) {
                shiftSubtree(n2.id, 0, shiftY * signY);
              } else if (!n1.isRoot && n2.isRoot) {
                shiftSubtree(n1.id, 0, -shiftY * signY);
              } else {
                shiftSubtree(n2.id, 0, (shiftY / 2) * signY);
                shiftSubtree(n1.id, 0, (-shiftY / 2) * signY);
              }
            } else {
              const shiftX = overlapX;
              const signX = dx >= 0 ? 1 : -1;

              if (n1.isRoot && !n2.isRoot) {
                shiftSubtree(n2.id, shiftX * signX, 0);
              } else if (!n1.isRoot && n2.isRoot) {
                shiftSubtree(n1.id, -shiftX * signX, 0);
              } else {
                shiftSubtree(n2.id, (shiftX / 2) * signX, 0);
                shiftSubtree(n1.id, (-shiftX / 2) * signX, 0);
              }
            }
          }
        }
      }

      if (!movedAny) break;
    }

    setNodes(updatedNodes);
    setPan({ x: 600, y: 400 });
    setZoom(.6);

    const modeText = mode === 'radial' ? '360° Free Radial (All Directions)' : 'Horizontal Tree (Left & Right Wings)';
    showNotification(`✨ Auto-arranged mind map into ${modeText} layout!`);
  };

  // Save mindmap.graphml locally & sync to root folder
  const handleSaveGraphML = async () => {
    const xmlContent = generateGraphML();

    // 1. Download file locally
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.graphml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 2. Post to server to save in root folder
    try {
      const res = await fetch('/api/mindmap/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xmlContent })
      });
      if (res.ok) {
        showNotification('Saved mindmap.graphml to workspace root!');
      } else {
        showNotification('Downloaded mindmap.graphml file!');
      }
    } catch (e) {
      showNotification('Downloaded mindmap.graphml file!');
    }
  };

  // Open .graphml file from disk
  const handleOpenFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        parseGraphML(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Canvas Coordinates Converter
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Mouse Handlers for Pan & Drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If clicked on canvas background
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'grid-pattern') {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setActiveSubMenu(null);
      setEmptyContextMenu(null);
      setConnectorModeSourceId(null); // Cancel connector arrow mode if clicked anywhere on canvas background

      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (isCollaborating && containerRef.current) {
      const coords = getCanvasCoords(clientX, clientY);
      broadcastCursor(coords.x, coords.y);
    }

    // Strict Left Click Drag Enforcement: deny panning/dragging if left click is not active
    if (isPanning || draggedNodeId) {
      if ((e.buttons & 1) !== 1) {
        if (dragRafRef.current) {
          cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = null;
        }
        setIsPanning(false);
        setDraggedNodeId(null);
        return;
      }
    }

    // Only update mouse position state if connector mode is active (drawing line preview)
    if (connectorModeSourceId) {
      const coords = getCanvasCoords(clientX, clientY);
      setMouseCanvasPos(coords);
    }

    if (isPanning) {
      setPan({ x: clientX - panStart.x, y: clientY - panStart.y });
    } else if (draggedNodeId) {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
      }

      dragRafRef.current = requestAnimationFrame(() => {
        const coords = getCanvasCoords(clientX, clientY);
        const targetX = Math.round(coords.x - dragOffset.x);
        const targetY = Math.round(coords.y - dragOffset.y);

        setNodes((prev) =>
          prev.map((n) => (n.id === draggedNodeId ? { ...n, x: targetX, y: targetY } : n))
        );
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Global window listener to ensure dragging/panning terminates immediately on left-click release anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      setIsPanning(false);
      setDraggedNodeId(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
    };
  }, []);

  // Mind Map Drawing Canvas Interaction Control Mapping:
  // - Normal Scroll (Wheel): Pan Up & Down
  // - Shift + Scroll (Wheel): Pan Left & Right (Horizontal)
  // - Ctrl + Scroll / Cmd + Scroll (Wheel): Zoom In & Out
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.scrollable-note, textarea, input, [contenteditable="true"], .custom-scrollbar, .note-modal-scroll')) {
        return; // Allow mouse scrolling inside note card text containers!
      }

      e.preventDefault();
      e.stopPropagation();

      const isZooming = e.ctrlKey || e.metaKey;

      if (isZooming) {
        // Ctrl + Wheel / Cmd + Wheel -> Zoom Canvas In & Out
        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        setZoom((z) => Math.min(Math.max(z * delta, 0.3), 3));
      } else if (e.shiftKey) {
        // Shift + Wheel -> Pan Left & Right (Horizontal)
        const scrollDelta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        setPan((p) => ({
          x: p.x - scrollDelta,
          y: p.y,
        }));
      } else {
        // Normal Scroll -> Pan Up & Down (Vertical) + 2D Trackpad Panning
        setPan((p) => ({
          x: p.x - (e.deltaX || 0),
          y: p.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onNativeWheel);
    };
  }, []);

  const handleCanvasWheel = (e: React.WheelEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('.scrollable-note, textarea, input, [contenteditable="true"], .custom-scrollbar, .note-modal-scroll')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const isZooming = e.ctrlKey || e.metaKey;

    if (isZooming) {
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(Math.max(z * delta, 0.3), 3));
    } else if (e.shiftKey) {
      const scrollDelta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      setPan((p) => ({
        x: p.x - scrollDelta,
        y: p.y,
      }));
    } else {
      setPan((p) => ({
        x: p.x - (e.deltaX || 0),
        y: p.y - e.deltaY,
      }));
    }
  };

  // Handle Canvas Right Click to show Empty Context Menu
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'grid-pattern') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setEmptyContextMenu({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          canvasX: coords.x,
          canvasY: coords.y
        });
      }
    }
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: MindNode) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Deny dragging if non-left click (e.g. right click or middle click)
    setEmptyContextMenu(null);
    setSelectedEdgeId(null);

    if (connectorModeSourceId) {
      // Connect source node to clicked target node
      if (connectorModeSourceId !== node.id) {
        const sourceNode = nodes.find((n) => n.id === connectorModeSourceId);
        const newEdge: MindEdge = {
          id: `e_${Date.now()}`,
          source: connectorModeSourceId,
          target: node.id,
          color: sourceNode?.color || node.color || '#00f2fe'
        };
        setEdges((prev) => [...prev.filter((e) => !(e.source === connectorModeSourceId && e.target === node.id)), newEdge]);

        // Auto-assign parent hierarchy if target node is standalone or has no parent
        if (sourceNode && (node.isRoot || !node.parentId)) {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === node.id
                ? {
                  ...n,
                  parentId: sourceNode.id,
                  depth: sourceNode.depth + 1,
                  isRoot: false
                }
                : n
            )
          );
          showNotification(`Connected & assigned "${node.text}" as child of "${sourceNode.text}"`);
        } else {
          showNotification(`Connected arrow to "${node.text}"`);
        }
      }
      setConnectorModeSourceId(null);
      return;
    }

    setSelectedNodeId(node.id);
    setActiveSubMenu(null);

    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDraggedNodeId(node.id);
    setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
  };

  // Edge Selection & Management
  const handleEdgeMouseDown = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setEmptyContextMenu(null);
    setActiveSubMenu(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    pushUndoSnapshot();
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
    showNotification('Removed arrow connection');
  };

  const handleSetEdgeColor = (edgeId: string, colorHex: string) => {
    pushUndoSnapshot();
    setEdges((prev) => prev.map((e) => (e.id === edgeId ? { ...e, color: colorHex } : e)));
    showNotification('Updated arrow color');
  };

  // Inline Label Editing
  const handleNodeDoubleClick = (e: React.MouseEvent, node: MindNode) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingText(node.text);
  };

  const saveEditingText = () => {
    if (editingNodeId) {
      pushUndoSnapshot();
      setNodes((prev) => prev.map((n) => (n.id === editingNodeId ? { ...n, text: editingText || 'Node' } : n)));
      setEditingNodeId(null);
    }
  };

  // Actions for Toolbars
  const handleAddChildNode = (parentNodeId: string) => {
    const parent = nodes.find((n) => n.id === parentNodeId);
    if (!parent) return;

    pushUndoSnapshot();
    const childCount = nodes.filter((n) => n.parentId === parentNodeId).length;
    const isLeft = parent.x < 0;
    const offsetX = isLeft ? -180 : 180;
    const offsetY = (childCount - 1) * 60;

    const newNodeId = `n_${Date.now()}`;
    const newNode: MindNode = {
      id: newNodeId,
      text: `New Node`,
      x: parent.x + offsetX,
      y: parent.y + offsetY,
      width: 170,
      height: 56,
      depth: parent.depth + 1,
      color: parent.color || '#00f2fe',
      emoji: '💡',
      parentId: parentNodeId
    };

    const newEdge: MindEdge = {
      id: `e_${Date.now()}`,
      source: parentNodeId,
      target: newNodeId,
      color: parent.color || '#00f2fe'
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
    setSelectedNodeId(newNodeId);
    showNotification('Added new node');
  };

  const handleCreateNodeAtCoords = (isRootNode: boolean) => {
    if (!emptyContextMenu) return;
    pushUndoSnapshot();
    const newNodeId = `n_${Date.now()}`;
    const newNode: MindNode = {
      id: newNodeId,
      text: isRootNode ? 'Main Root' : 'Topic Node',
      x: emptyContextMenu.canvasX - 60,
      y: emptyContextMenu.canvasY - 20,
      width: isRootNode ? 160 : 130,
      height: isRootNode ? 54 : 44,
      isRoot: isRootNode,
      depth: isRootNode ? 0 : 1,
      color: isRootNode ? '#00f2fe' : '#ff007f',
      emoji: isRootNode ? '🧠' : '✨'
    };
    setNodes((prev) => [...prev, newNode]);
    setEmptyContextMenu(null);
    setSelectedNodeId(newNodeId);
    showNotification(`Created ${isRootNode ? 'Root' : 'Secondary'} node`);
  };

  const handleToggleCollapsibility = (nodeId: string) => {
    setNodes((prev) => {
      const node = prev.find((n) => n.id === nodeId);
      if (!node) return prev;
      const newCollapsed = !node.collapsed;

      // Find all descendant IDs recursively
      const getDescendantIds = (id: string): string[] => {
        const children = prev.filter((n) => n.parentId === id);
        let ids: string[] = [];
        children.forEach((c) => {
          ids.push(c.id);
          ids = [...ids, ...getDescendantIds(c.id)];
        });
        return ids;
      };

      const descendantIds = getDescendantIds(nodeId);

      return prev.map((n) => {
        if (n.id === nodeId) {
          return { ...n, collapsed: newCollapsed };
        }
        if (descendantIds.includes(n.id)) {
          return { ...n, collapsed: newCollapsed };
        }
        return n;
      });
    });
    showNotification('Toggled child collapsibility');
  };

  const handleSetEmoji = (nodeId: string, emoji: string) => {
    pushUndoSnapshot();
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, emoji } : n)));
    setActiveSubMenu(null);
  };

  const handleSetNodeColor = (nodeId: string, colorHex: string) => {
    pushUndoSnapshot();
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, color: colorHex } : n)));
    // Also update outgoing edges color
    setEdges((prev) => prev.map((e) => (e.source === nodeId ? { ...e, color: colorHex } : e)));
    setActiveSubMenu(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    pushUndoSnapshot();

    // Helper to collect ALL descendant node IDs recursively (children, grandchildren, etc.)
    const getSubtreeIds = (startId: string, currentNodes: MindNode[]): Set<string> => {
      const ids = new Set<string>([startId]);
      const traverse = (id: string) => {
        const children = currentNodes.filter((n) => n.parentId === id);
        children.forEach((child) => {
          ids.add(child.id);
          traverse(child.id);
        });
      };
      traverse(startId);
      return ids;
    };

    // If deleting root node:
    if (targetNode.isRoot) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      showNotification('Root node & mind map cleared');
      if (roomId) {
        broadcastStateUpdate({ nodes: [], edges: [] });
      }
      return;
    }

    // Get set of all node IDs to delete (nodeId + all recursive descendants)
    const deletedIds = getSubtreeIds(nodeId, nodes);
    const remainingNodes = nodes.filter((n) => !deletedIds.has(n.id));

    // Cleanup orphan nodes that no longer have a valid parent path to a root node
    const validNodeIds = new Set(remainingNodes.map((n) => n.id));
    const cleanNodes = remainingNodes.filter((n) => {
      if (n.isRoot) return true;
      let curr = n;
      while (curr.parentId) {
        if (!validNodeIds.has(curr.parentId)) return false; // Parent missing => Orphan!
        const parent = remainingNodes.find((p) => p.id === curr.parentId);
        if (!parent) return false;
        curr = parent;
      }
      return true;
    });

    const cleanNodeIds = new Set(cleanNodes.map((n) => n.id));
    const cleanEdges = edges.filter((e) => cleanNodeIds.has(e.source) && cleanNodeIds.has(e.target));

    setNodes(cleanNodes);
    setEdges(cleanEdges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

    showNotification(deletedIds.size > 1 ? `Node & ${deletedIds.size - 1} sub-branches removed` : 'Node removed');

    if (roomId) {
      broadcastStateUpdate({ nodes: cleanNodes, edges: cleanEdges });
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Filter visible nodes (handling collapsibility)
  const isNodeVisible = (node: MindNode): boolean => {
    let curr = node;
    while (curr.parentId) {
      const parent = nodes.find((n) => n.id === curr.parentId);
      if (!parent) break;
      if (parent.collapsed) return false;
      curr = parent;
    }
    return true;
  };

  const visibleNodes = nodes.filter(isNodeVisible);
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  return (
    <div className="flex flex-col w-full text-white gap-4 flex-1 min-h-0">
      {/* Top Header & AI Prompt Control Panel (Outside Drawing Area) */}
      <div className={`flex flex-col w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0 transition-all ${isExpanded ? 'p-2 sm:p-2.5 gap-2' : 'p-3.5 sm:p-4 gap-3'
        }`}>
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">


          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Auto-Arrange Layout Controls: Horizontal & Free 360° Radial */}
            <div className="flex items-center bg-slate-900 border border-emerald-500/30 p-0.5 rounded-lg gap-0.5">
              <button
                onClick={() => handleAutoArrangeGraph('horizontal')}
                className={`flex items-center gap-1  hover:from-emerald-400 hover:to-teal-500 text-slate-50 font-bold rounded-md shadow-md transition ${isExpanded ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                  }`}
                title="Arrange mind map horizontally (Left & Right Wings)"
              >
                <span>↔️ Horizontal</span>
              </button>

              <button
                onClick={() => handleAutoArrangeGraph('radial')}
                className={`flex items-center gap-1 hover:bg-slate-700 text-emerald-300 font-bold rounded-md transition border border-slate-700/60 ${isExpanded ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'
                  }`}
                title="Arrange mind map in 360° Free All Directions (Radial Starburst)"
              >
                <span>🌐 Free 360°</span>
              </button>
            </div>

            {/* Undo & Redo History Controls (Stack Data Structure) */}
            <div className="flex items-center bg-slate-900 border border-slate-700/60 p-0.5 rounded-lg gap-0.5">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`flex items-center gap-1 font-bold rounded-md transition ${canUndo
                  ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 shadow cursor-pointer'
                  : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800'
                  } ${isExpanded ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
                title={canUndo ? `Undo last call / change (Ctrl+Z) [${undoSize} items in stack]` : 'Undo stack is empty'}
              >
                <Undo2 className={`w-3.5 h-3.5 ${canUndo ? 'text-indigo-400' : 'text-slate-600'}`} />
                <span>Undo{undoSize > 0 ? ` (${undoSize})` : ''}</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`flex items-center gap-1 font-bold rounded-md transition ${canRedo
                  ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 shadow cursor-pointer'
                  : 'bg-slate-900/60 text-slate-600 cursor-not-allowed border border-slate-800'
                  } ${isExpanded ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
                title={canRedo ? `Redo last call / change (Ctrl+Y / Cmd+Shift+Z) [${redoSize} items in stack]` : 'Redo stack is empty'}
              >
                <Redo2 className={`w-3.5 h-3.5 ${canRedo ? 'text-purple-400' : 'text-slate-600'}`} />
                <span>Redo{redoSize > 0 ? ` (${redoSize})` : ''}</span>
              </button>
            </div>

            <button
              onClick={handleResetToDefaultMap}
              className={`flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                }`}
              title="Reset mind map to default sample map"
            >
              <RotateCcw className={isExpanded ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
              Reset Map
            </button>

            <button
              onClick={loadProfileSampleMap}
              className={`flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold rounded-lg border border-slate-700 transition cursor-pointer ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                }`}
              title="Load Personal Profile Mind Map (Motive, Education, Experience, Skill, Hobbies)"
            >
              <User className={isExpanded ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
              Profile Map
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                }`}
              title="Open mindmap.graphml file"
            >
              <Upload className={isExpanded ? 'w-3 h-3 text-indigo-400' : 'w-3.5 h-3.5 text-indigo-400'} />
              Open .graphml
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleOpenFileUpload}
              accept=".graphml,.xml"
              className="hidden"
            />

            <button
              onClick={() => setIsNvidiaAiModalOpen(true)}
              className={`flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black rounded-lg transition shadow-lg shadow-emerald-500/25 cursor-pointer ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
                }`}
              title="Brainstorm & Auto-Generate Mind Map with NVIDIA BYOK AI"
            >
              <span>AI Model</span>
              <span className="px-1 py-0.2 text-[9px] bg-slate-950/20 text-slate-950 font-mono rounded font-black">BYOK</span>
            </button>

            <button
              onClick={handleSaveGraphML}
              className={`flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition ${isExpanded ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs'
                }`}
            >
              <Download className={isExpanded ? 'w-3 h-3 text-slate-950' : 'w-3.5 h-3.5 text-slate-950'} />
              Save mindmap.graphml
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className={`flex items-center gap-1.5 font-bold rounded-lg transition shadow-lg ${isCollaborating
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white shadow-indigo-500/20'
                } ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'}`}
              title="Share room & collaborate real-time with team members"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCollaborating ? `Live (${activeUsers.length})` : 'Team Collaboration'}</span>
            </button>

            {isCollaborating && (
              <>
                <button
                  onClick={handleOpenCommitModal}
                  className={`flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition shadow-lg shadow-purple-500/20 cursor-pointer ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                    }`}
                  title="Commit version snapshot Git-style with commit message"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>M-Commit</span>
                </button>

                <button
                  onClick={handleOpenLogs}
                  className={`flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold rounded-lg transition shadow-sm cursor-pointer ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                    }`}
                  title="View Change Logs & M Commit History for this room"
                >
                  <FileClock className="w-3.5 h-3.5" />
                  <span>Audit Logs</span>
                </button>

                <button
                  onClick={handleUnloadWorkspace}
                  className={`flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg transition cursor-pointer ${isExpanded ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                    }`}
                  title="Unload active room & return to local private canvas"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Unload
                </button>
              </>
            )}
          </div>
        </div>

        {/* NVIDIA AI Prompt & Model Control Bar (Outside Draw Area) */}
        <div className="p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-2 text-xs backdrop-blur-md shadow-inner shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <WandSparkles className="h-4 w-4 animate-pulse fill-current" />
              </div>
              <span className="font-extrabold text-white text-xs tracking-tight flex items-center gap-1.5">
                {selectedNvidiaModel.startsWith('ollama/') ? 'Ollama AI MindMap Generator' : 'NVIDIA AI MindMap Generator'}
                <span className={`text-[9px] font-mono font-black border px-1.5 py-0.5 rounded ${selectedNvidiaModel.startsWith('ollama/')
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                  : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                  }`}>
                  {selectedNvidiaModel.startsWith('ollama/') ? 'LOCAL OLLAMA' : 'BYOK'}
                </span>
                {nodes.length > 0 && (
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded animate-pulse">
                    Upgrading Active Map ({nodes.length} nodes)
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Model Selector Dropdown */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 space-x-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Model:</span>
                <select
                  value={selectedNvidiaModel}
                  onChange={(e) => handleSelectNvidiaModel(e.target.value)}
                  className="bg-transparent text-emerald-300 text-xs font-semibold focus:outline-none cursor-pointer max-w-[220px] sm:max-w-none"
                >
                  <optgroup label="⚡ Direct Google Gemini Models (Instant Queue)" className="bg-slate-900 text-blue-400 font-bold">
                    {CLOUD_GEMINI_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white font-medium">
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="🌐 NVIDIA Cloud Models (BYOK)" className="bg-slate-900 text-cyan-400 font-bold">
                    {CLOUD_NVIDIA_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white font-medium">
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup
                    label={isOllamaActive ? "🟢 Local Ollama Models (Active)" : "🔴 Local Ollama Models (Offline / Inactive)"}
                    className={isOllamaActive ? "bg-slate-900 text-emerald-400 font-bold" : "bg-slate-900 text-slate-500 font-bold"}
                  >
                    {getAllOllamaModels(installedOllamaModels).map((m) => {
                      const isInstalled = installedOllamaModels.length === 0 || installedOllamaModels.some((name) => name.includes(m.ollamaModel || ''));
                      const isAvailable = isOllamaActive && isInstalled;
                      return (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={!isAvailable}
                          className={isAvailable ? "bg-slate-900 text-emerald-300 font-semibold" : "bg-slate-900 text-slate-500 italic"}
                        >
                          {m.name} {isAvailable ? "🟢 (Local Active)" : "🔴 (Local - Ollama Offline)"}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              {/* Key Status & Settings Trigger */}
              <button
                onClick={() => setIsNvidiaAiModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center space-x-1 cursor-pointer transition"
                title={selectedNvidiaModel.startsWith('ollama/') ? 'Local Ollama Model Active (No API Key Required)' : 'Configure NVIDIA BYOK API Key'}
              >
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>
                  {selectedNvidiaModel.startsWith('ollama/')
                    ? 'No Key Needed 🟢'
                    : mounted && nvidiaApiKeyInput
                      ? 'Key Saved ⚙️'
                      : 'Set Key 🔑'}
                </span>
              </button>
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleGenerateAiMindMap} className="flex items-center gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={
                nodes.length > 0
                  ? "Ask AI to modify/upgrade current map (e.g. 'Add a branch for Cloud Tools with AWS and Docker')..."
                  : "Type topic for AI MindMap (e.g. 'Microservices e-commerce architecture with payment')..."
              }
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
            />
            {isAiGenerating ? (
              <button
                type="button"
                onClick={handleStopBuilding}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0 animate-pulse"
                title="Stop AI building process"
              >
                <Square className="h-3.5 w-3.5 fill-current text-white" />
                <span>Stop Building 🛑</span>
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-lg rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowBigUpDash className="h-3.5 w-3.5 text-slate-950 fill-current" />
                <span>{nodes.length > 0 ? 'Upgrade Map' : 'Generate MindMap'}</span>
              </button>
            )}
          </form>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] pt-0.5">
            <span className="text-slate-500 font-semibold">
              {nodes.length > 0 ? 'Map Upgrade Prompts:' : 'Quick Prompts:'}
            </span>
            {(nodes.length > 0
              ? [
                '➕ Add 3 detailed sub-value nodes under every child node',
                '🎯 Expand all branches with actionable key results & metrics',
                '💰 Add estimated cost, time & priority levels to each branch',
                '💡 Add pros, cons, and potential risks under each main topic',
              ]
              : [
                '👤 Personal Profile (Motive, Education, Experience, Skill, Hobbies)',
                '🚀 SaaS Product Launch Roadmap',
                '💻 Microservices Architecture',
                '🎨 Content Marketing Funnel',
                '🎯 Q4 OKRs & Growth Strategy',
              ]
            ).map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setAiPrompt(pill)}
                className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-emerald-200 border border-slate-800 transition cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time AI Thinking & Working Log Box (Just below prompt div, expandable up to 500px) */}
        {showAiLogPanel && aiLogs.length > 0 && (
          <div className="p-3 bg-slate-950/90 border border-purple-500/40 rounded-xl space-y-2 text-xs backdrop-blur-md shadow-2xl shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                  <Terminal className="h-4 w-4 animate-pulse" />
                </div>
                <span className="font-extrabold text-white text-xs tracking-tight flex items-center gap-2">
                  AI Thinking & Working Log
                  {isAiGenerating && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-black animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      THINKING LIVE
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono font-normal">({aiLogs.length} events)</span>
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Expand / Collapse Button (Up to 500px height) */}
                <button
                  type="button"
                  onClick={() => {
                    if (logAutoShrinkTimerRef.current) clearTimeout(logAutoShrinkTimerRef.current);
                    setIsLogExpanded(!isLogExpanded);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                  title={isLogExpanded ? 'Collapse Log (Auto-shrinks 2s after generation)' : 'Expand Log Box (Up to 500px)'}
                >
                  {isLogExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{isLogExpanded ? 'Collapse' : 'Expand (500px)'}</span>
                </button>

                {/* Clear Log Button */}
                <button
                  type="button"
                  onClick={() => setAiLogs([])}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
                  title="Clear Logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Hide Log Panel Button */}
                <button
                  type="button"
                  onClick={() => setShowAiLogPanel(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Hide Log Panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Log Messages List (Expandable up to max 500px, auto-shrinks to compact) */}
            <div
              ref={logContainerRef}
              className={`p-2 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar space-y-1.5 transition-all duration-300 ${isLogExpanded ? 'max-h-[500px]' : 'max-h-24 h-20'
                }`}
            >
              {aiLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 ${log.type === 'success'
                    ? 'text-emerald-300 font-bold'
                    : log.type === 'warn'
                      ? 'text-amber-300 font-bold'
                      : log.type === 'error'
                        ? 'text-rose-400 font-bold'
                        : 'text-slate-300'
                    }`}
                >
                  <span className="text-slate-500 text-[10px] shrink-0 font-mono">[{log.timestamp}]</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pure Drawing Canvas Card (Dedicated ONLY to Map Graph & Nodes) */}
      <div className="flex flex-col w-full flex-1 h-[100vh] min-h-[90vh] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950 overscroll-contain"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={handleCanvasContextMenu}
          onWheel={handleCanvasWheel}
        >
          {/* SVG Grid & Edge Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.07)" />
              </pattern>

              {/* Marker Definitions for Edge Arrows */}
              {COLOR_OPTIONS.map((c) => (
                <marker
                  key={c.hex}
                  id={`arrow-${c.hex.replace('#', '')}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={c.hex} />
                </marker>
              ))}
            </defs>

            {/* Grid Background */}
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />

            {/* Transformed Group for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render Real-Time Peer Cursors */}
              {Array.from(peerCursors.values()).map((cursor) => (
                <g key={cursor.socketId} transform={`translate(${cursor.x}, ${cursor.y})`} className="pointer-events-none z-50">
                  <path
                    d="M 0 0 L 12 18 L 8 13 L 14 11 L 12 8 L 6 10 Z"
                    fill={cursor.color || '#00f2fe'}
                    stroke="#000"
                    strokeWidth="1"
                  />
                  <rect
                    x="12"
                    y="14"
                    width={cursor.name.length * 7 + 10}
                    height="18"
                    rx="4"
                    fill={cursor.color || '#00f2fe'}
                  />
                  <text
                    x="17"
                    y="26"
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {cursor.name}
                  </text>
                </g>
              ))}

              {/* Render Connecting Edges */}
              {visibleEdges.map((e, idx) => {
                const srcNode = nodes.find((n) => n.id === e.source);
                const tgtNode = nodes.find((n) => n.id === e.target);
                if (!srcNode || !tgtNode) return null;

                const srcX = srcNode.x + srcNode.width / 2;
                const srcY = srcNode.y + srcNode.height / 2;
                const tgtX = tgtNode.x + tgtNode.width / 2;
                const tgtY = tgtNode.y + tgtNode.height / 2;

                // Smooth Curved Bezier Path
                const dx = tgtX - srcX;
                const controlDist = Math.abs(dx) * 0.5;
                const pathD = `M ${srcX} ${srcY} C ${srcX + (dx > 0 ? controlDist : -controlDist)} ${srcY}, ${tgtX - (dx > 0 ? controlDist : -controlDist)} ${tgtY}, ${tgtX} ${tgtY}`;

                const isEdgeSelected = e.id === selectedEdgeId;
                const strokeColor = e.color || srcNode.color || '#00f2fe';
                const markerId = `arrow-${strokeColor.replace('#', '')}`;

                return (
                  <g key={`${e.id}_${idx}`} className="group cursor-pointer">
                    {/* Invisible wide stroke for easy clicking/holding edge */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      pointerEvents="stroke"
                      onMouseDown={(evt) => handleEdgeMouseDown(evt, e.id)}
                    />

                    {/* Visible Styled Arrow Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isEdgeSelected ? '#ffffff' : strokeColor}
                      strokeWidth={isEdgeSelected ? '4.5' : srcNode.isRoot ? '4' : '2.5'}
                      strokeOpacity={isEdgeSelected ? '1' : '0.85'}
                      strokeDasharray={isEdgeSelected ? '6,3' : undefined}
                      markerEnd={`url(#${markerId})`}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}

              {/* Render Dynamic Live Connecting Line in Connector Mode */}
              {connectorModeSourceId && (() => {
                const srcNode = nodes.find((n) => n.id === connectorModeSourceId);
                if (!srcNode) return null;
                const srcX = srcNode.x + srcNode.width / 2;
                const srcY = srcNode.y + srcNode.height / 2;
                const dx = mouseCanvasPos.x - srcX;
                const controlDist = Math.abs(dx) * 0.5;
                const pathD = `M ${srcX} ${srcY} C ${srcX + (dx > 0 ? controlDist : -controlDist)} ${srcY}, ${mouseCanvasPos.x - (dx > 0 ? controlDist : -controlDist)} ${mouseCanvasPos.y}, ${mouseCanvasPos.x} ${mouseCanvasPos.y}`;

                return (
                  <g pointerEvents="none">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#00f2fe"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      markerEnd="url(#arrow-00f2fe)"
                      className="animate-pulse"
                    />
                    <circle cx={mouseCanvasPos.x} cy={mouseCanvasPos.y} r="5" fill="#00f2fe" />
                  </g>
                );
              })()}
            </g>
          </svg>

          {/* Floating Edge Options Toolbar (When an Arrow/Edge is selected) */}
          {selectedEdgeId && (() => {
            const edge = edges.find((e) => e.id === selectedEdgeId);
            if (!edge) return null;
            const srcNode = nodes.find((n) => n.id === edge.source);
            const tgtNode = nodes.find((n) => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            const midX = (srcNode.x + tgtNode.x) / 2 + (srcNode.width + tgtNode.width) / 4;
            const midY = (srcNode.y + tgtNode.y) / 2 + (srcNode.height + tgtNode.height) / 4;

            return (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute z-40 flex flex-col items-center pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
                style={{
                  left: `${pan.x + midX * zoom}px`,
                  top: `${pan.y + midY * zoom}px`
                }}
              >
                <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-rose-500/50 rounded-xl p-1.5 shadow-2xl gap-2">
                  <span className="text-[10px] font-mono text-slate-300 font-bold px-1">Arrow Options:</span>

                  {/* Delete / Remove Connected Arrow */}
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-xs font-bold transition border border-rose-500/30"
                    title="Remove Arrow Connection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Arrow
                  </button>

                  {/* Edge Color Palette Selector */}
                  <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => handleSetEdgeColor(edge.id, c.hex)}
                        className="w-4 h-4 rounded-full hover:scale-125 transition border border-slate-600 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                        title={`Change arrow color to ${c.label}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedEdgeId(null)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Close toolbar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Nodes Layer */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {visibleNodes.map((node, idx) => {
              const isSelected = node.id === selectedNodeId;
              const isRoot = !!node.isRoot;

              const getDescendantCount = (id: string): number => {
                const children = nodes.filter((n) => n.parentId === id);
                let c = children.length;
                children.forEach((child) => {
                  c += getDescendantCount(child.id);
                });
                return c;
              };

              const childCount = getDescendantCount(node.id);
              const hasChildren = childCount > 0;
              const textLen = node.text ? node.text.length : 4;

              // Dynamic width calculation capped at 300px max
              const calcWidth = Math.min(
                300,
                Math.max(
                  node.width,
                  isRoot ? Math.max(220, textLen * 14 + 75) : Math.max(160, textLen * 12 + 65)
                )
              );
              const calcHeight = hasChildren ? Math.max(node.height, 68) : Math.max(node.height, 52);

              const buildingTargetNodeId = selectedNodeId || (nodes.length > 0 ? (nodes.find((n) => n.isRoot)?.id || nodes[0].id) : null);

              return (
                <div
                  key={`${node.id}_${idx}`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
                  className={`absolute pointer-events-auto flex flex-col justify-between px-4 py-2.5 rounded-2xl ${draggedNodeId === node.id ? 'transition-none' : 'transition-colors transition-shadow'
                    } shadow-xl group cursor-move ${isRoot
                      ? 'bg-slate-900 border-2 text-white font-extrabold'
                      : node.depth === 1
                        ? 'bg-slate-900/95 border text-slate-100 font-bold'
                        : 'bg-slate-900/90 border text-slate-200 font-semibold'
                    } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 z-30' : 'hover:border-cyan-400/50 z-20'}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    minWidth: `${isRoot ? 180 : 120}px`,
                    maxWidth: '300px',
                    width: 'max-content',
                    // minHeight: `${calcHeight}px`,
                    borderColor: isSelected ? '#00f2fe' : node.color || (isRoot ? '#00f2fe' : '#475569'),
                    boxShadow: isRoot ? `0 0 24px ${node.color || '#00f2fe'}44` : undefined
                  }}
                >
                  {/* Real-time Hammering Worker Building Animation (Positioned BELOW Node) */}
                  {isAiGenerating && (
                    activeBuildingTargetId
                      ? (node.id === activeBuildingTargetId || node.parentId === activeBuildingTargetId)
                      : (!node.isRoot || nodes.length === 1)
                  ) && (
                      <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-amber-400/80 text-amber-300 shadow-md text-[9px] font-black tracking-tight animate-bounce">
                          <span className="inline-block animate-[spin_0.8s_ease-in-out_infinite] text-xs">🔨</span>
                          <span className="font-mono uppercase text-amber-300 text-[8.5px] tracking-wider animate-pulse whitespace-nowrap">
                            👷‍♂️ Hammering...
                          </span>
                        </div>
                      </div>
                    )}
                  {!hasChildren ? (
                    /* Single Row Layout for Child / Leaf Nodes (Truncate with ... after 300px max) */
                    <div className="flex items-center relative gap-2 w-full h-full min-w-0">
                      {node.emoji && <span className="text-2xl opacity-40 absolute top-0 -left-3 select-none leading-none shrink-0">{node.emoji}</span>}
                      {(hasNodeAnyNote(node) || activeNoteNodeId === node.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeNoteNodeId === node.id) {
                              setActiveNoteNodeId(null);
                              setClosedNoteIndices([]);
                            } else {
                              setActiveNoteNodeId(node.id);
                              setClosedNoteIndices([]);
                            }
                          }}
                          className={`p-1 rounded-md transition border shrink-0 z-20 ${activeNoteNodeId === node.id
                            ? 'bg-amber-500/40 border-amber-400 text-amber-200'
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            }`}
                          title="Open All / Close All Notes"
                        >
                          <StickyNote className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {editingNodeId === node.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={saveEditingText}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditingText()}
                          autoFocus
                          className="bg-slate-950 text-white text-base font-bold px-2 py-1 rounded-lg border border-cyan-400 outline-none w-full max-w-[230px]"
                        />
                      ) : (
                        <span
                          title={node.text}
                          className={`truncate max-w-[230px] font-bold ${node.depth === 1 ? 'text-base text-slate-100' : 'text-[12px] text-slate-200'
                            }`}
                        >
                          {node.text}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* 2-Row Layout for Parent Nodes with Sub-branches */
                    <>
                      {/* Top Row: Icon Left & Eye Child Count Badge Right */}
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {node.emoji ? (
                            <span className="text-2xl select-none leading-none">{node.emoji}</span>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/40" />
                          )}
                          {(hasNodeAnyNote(node) || activeNoteNodeId === node.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeNoteNodeId === node.id) {
                                  setActiveNoteNodeId(null);
                                  setClosedNoteIndices([]);
                                } else {
                                  setActiveNoteNodeId(node.id);
                                  setClosedNoteIndices([]);
                                }
                              }}
                              className={`p-1 rounded-md transition border shrink-0 ${activeNoteNodeId === node.id
                                ? 'bg-amber-500/40 border-amber-400 text-amber-200'
                                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                }`}
                              title="Open All / Close All Notes"
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {node.collapsed ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCollapsibility(node.id);
                            }}
                            className="flex items-center gap-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/50 hover:to-orange-500/50 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full text-xs font-mono font-bold animate-pulse shadow-lg cursor-pointer whitespace-nowrap shrink-0"
                            title={`Click to expand ${childCount} hidden sub-branches`}
                          >
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span>+{childCount} hidden</span>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCollapsibility(node.id);
                            }}
                            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0"
                            title={`Click to collapse ${childCount} sub-branches`}
                          >
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span>{childCount}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Node Label Text (Truncate with ... after max width) */}
                      <div className="w-full mt-1 min-w-0">
                        {editingNodeId === node.id ? (
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={saveEditingText}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditingText()}
                            autoFocus
                            className="bg-slate-950 text-white text-base font-bold px-2 py-1 rounded-lg border border-cyan-400 outline-none w-full max-w-[260px]"
                          />
                        ) : (
                          <div
                            title={node.text}
                            className={`truncate max-w-[260px] leading-tight ${isRoot
                              ? 'text-lg font-extrabold text-cyan-300 tracking-wide'
                              : node.depth === 1
                                ? 'text-base font-bold text-slate-100'
                                : 'text-sm font-semibold text-slate-200'
                              }`}
                          >
                            {node.text}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Active Floating Multi-Note Grid Container (Centered Horizontally Relative to Node) */}
            {(() => {
              const activeNoteNode = visibleNodes.find((n) => n.id === activeNoteNodeId);
              if (!activeNoteNode) return null;

              const fullNoteList = getNodeNotes(activeNoteNode);

              // Get list of unclosed note indices
              const visibleNoteIndices = fullNoteList
                .map((_, idx) => idx)
                .filter((idx) => !closedNoteIndices.includes(idx));

              if (visibleNoteIndices.length === 0) return null;

              const N_vis = visibleNoteIndices.length;

              let cols = 1;
              if (N_vis === 1) cols = 1;
              else if (N_vis <= 4) cols = 2; // 2x1 for N=2, 2x2 for N=3,4
              else cols = 3;                 // 3x2 for N=5,6, 3x3 for N=7..9

              const cardWidth = 340;
              const cardGap = 16;
              const totalGridCols = Math.min(N_vis, cols);
              const totalGridWidth = totalGridCols * cardWidth + (totalGridCols - 1) * cardGap;

              const nodeCenterX = activeNoteNode.x + (activeNoteNode.width || 160) / 2;
              const gridLeft = nodeCenterX - totalGridWidth / 2;
              const gridTop = activeNoteNode.y + (activeNoteNode.height || 60) + 16;

              const executeFormat = (cmd: string, val: string | undefined = undefined) => {
                document.execCommand(cmd, false, val);
              };

              return (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute z-50 pointer-events-auto transition-all animate-fadeIn"
                  style={{
                    left: `${gridLeft}px`,
                    top: `${gridTop}px`
                  }}
                >
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${totalGridCols}, minmax(0, 340px))`
                    }}
                  >
                    {visibleNoteIndices.map((noteIdx) => {
                      const noteContent = fullNoteList[noteIdx];
                      return (
                        <div
                          key={noteIdx}
                          className="w-[340px] bg-white rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-200 text-slate-800 flex flex-col justify-between relative"
                        >
                          {/* Header: Notes Title & Action Controls */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                                Notes {fullNoteList.length > 1 && <span className="text-xs text-slate-400 font-normal">({noteIdx + 1}/{fullNoteList.length})</span>}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              {/* Triple Dot Dropdown Menu */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setActiveNoteMenuIndex(activeNoteMenuIndex === noteIdx ? null : noteIdx);
                                  }}
                                  className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                  title="Note options"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {activeNoteMenuIndex === noteIdx && (
                                  <div className="absolute right-0 top-7 z-50 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl shadow-2xl p-1.5 w-48 text-xs font-semibold flex flex-col gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleAddParallelNote(activeNoteNode.id);
                                        setActiveNoteMenuIndex(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-cyan-400 rounded-lg transition"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Add Parallel Note
                                    </button>

                                    {closedNoteIndices.length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setClosedNoteIndices([]);
                                          setActiveNoteMenuIndex(null);
                                        }}
                                        className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-emerald-400 rounded-lg transition"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Show All Hidden Notes ({closedNoteIndices.length})
                                      </button>
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const text = noteContent.replace(/<[^>]*>/g, '');
                                        navigator.clipboard.writeText(text);
                                        showNotification('Copied note text to clipboard!');
                                        setActiveNoteMenuIndex(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-slate-200 rounded-lg transition"
                                    >
                                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                                      Copy Note Text
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleUpdateNodeNoteAtIndex(activeNoteNode.id, noteIdx, '');
                                        setActiveNoteMenuIndex(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-amber-400 rounded-lg transition"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      Clear Note Text
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleDeleteNoteAtIndex(activeNoteNode.id, noteIdx);
                                        setActiveNoteMenuIndex(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-rose-400 rounded-lg transition border-t border-slate-800 mt-0.5 pt-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete Note Card
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Plus Icon: Opens connected parallel note next to it in grid */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleAddParallelNote(activeNoteNode.id);
                                }}
                                className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-indigo-600 font-bold"
                                title="Add connected parallel note card"
                              >
                                <Plus className="w-4 h-4" />
                              </button>

                              {/* Close Button (Closes Selected Note Card Only - Does NOT Delete Note) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const nextClosed = [...closedNoteIndices, noteIdx];
                                  setClosedNoteIndices(nextClosed);
                                  if (nextClosed.length >= fullNoteList.length) {
                                    setActiveNoteNodeId(null);
                                    setClosedNoteIndices([]);
                                  }
                                }}
                                className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                title="Close this note card"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Search Bar */}
                          <div className="relative mb-3">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={noteSearchQuery}
                              onChange={(e) => setNoteSearchQuery(e.target.value)}
                              placeholder="Search notes..."
                              className="w-full pl-8 pr-3 py-1 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          </div>

                          {/* Content Body */}
                          <div className="space-y-1.5 mb-3 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {activeNoteNode.emoji && <span>{activeNoteNode.emoji}</span>}
                              <span>{activeNoteNode.text}</span>
                            </h4>

                            {/* Rich ContentEditable Note Area (Visual Formatting, preserved cursor) */}
                            <NoteCardEditor
                              nodeId={activeNoteNode.id}
                              noteIndex={noteIdx}
                              initialHtml={noteContent}
                              onChange={handleUpdateNodeNoteAtIndex}
                            />
                          </div>

                          {/* Bottom Formatting Toolbar (Executes Rich Formatting on Selection or Paragraph) */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs select-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('formatBlock', '<h1>');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded font-extrabold text-[11px]"
                              title="Heading 1"
                            >
                              H¹
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('formatBlock', '<h2>');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded font-bold text-[11px]"
                              title="Heading 2"
                            >
                              H²
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('bold');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Bold"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('italic');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Italic"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('underline');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Underline"
                            >
                              <Underline className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('strikeThrough');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Strikethrough"
                            >
                              <Strikethrough className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('insertUnorderedList');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Bullet List"
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                executeFormat('insertOrderedList');
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Numbered List"
                            >
                              <ListOrdered className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const url = prompt('Enter link URL:');
                                if (url) executeFormat('createLink', url);
                              }}
                              className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Insert Link"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Selected Node Floating Options Toolbar */}
          {selectedNode && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute z-40 flex flex-col items-center pointer-events-auto transition-all transform -translate-x-1/2"
              style={{
                left: `${pan.x + (selectedNode.x + selectedNode.width / 2) * zoom}px`,
                top: `${pan.y + selectedNode.y * zoom - 55}px`
              }}
            >
              {/* Main Option Buttons Row */}
              <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1 shadow-2xl gap-1">
                {/* Option 1: Child Collapsibility */}
                <button
                  onClick={() => handleToggleCollapsibility(selectedNode.id)}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${selectedNode.collapsed ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  title="Child Collapsibility (Toggle expansion)"
                >
                  {selectedNode.collapsed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>

                {/* Option 2: Emoji Picker Toggle */}
                <button
                  onClick={() => setActiveSubMenu(activeSubMenu === 'emoji' ? null : 'emoji')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${activeSubMenu === 'emoji' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  title="Choose Emoji metadata"
                >
                  <Smile className="w-3.5 h-3.5 text-yellow-400" />
                </button>

                {/* Option: Note Popover Card Toggle */}
                <button
                  onClick={() => {
                    if (activeNoteNodeId === selectedNode.id) {
                      setActiveNoteNodeId(null);
                      setClosedNoteIndices([]);
                    } else {
                      setActiveNoteNodeId(selectedNode.id);
                      setClosedNoteIndices([]);
                    }
                  }}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${activeNoteNodeId === selectedNode.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  title="Open All / Close All Notes"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {/* Option 3 for Secondary: Arrow Color Picker */}
                {!selectedNode.isRoot && (
                  <button
                    onClick={() => setActiveSubMenu(activeSubMenu === 'color' ? null : 'color')}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${activeSubMenu === 'color' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    title="Color of Arrow / Edge"
                  >
                    <Palette className="w-3.5 h-3.5" style={{ color: selectedNode.color || '#00f2fe' }} />
                  </button>
                )}

                {/* Option: Hierarchy Setter */}
                <button
                  onClick={() => setActiveSubMenu(activeSubMenu === 'hierarchy' ? null : 'hierarchy')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${activeSubMenu === 'hierarchy' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  title="Hierarchy Setter (Set Root, Parent, Promote/Demote Level)"
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {/* Option 4: Connector Arrow mode */}
                <button
                  onClick={() => {
                    setConnectorModeSourceId(selectedNode.id);
                    showNotification('Click target node to connect arrow!');
                  }}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${connectorModeSourceId === selectedNode.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  title="Connector arrow to any node or child"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {/* Option 5: Add New Child Node */}
                <button
                  onClick={() => handleAddChildNode(selectedNode.id)}
                  className="p-1.5 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs flex items-center gap-1 transition font-bold"
                  title="Add new child node"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Remove Node */}
                <button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition"
                  title="Delete node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-menu: Emoji Popover */}
              {activeSubMenu === 'emoji' && (
                <div className="mt-2 p-2.5 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col gap-2 z-50 w-64">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 px-1">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5 text-yellow-400" /> Emojis & Icons
                    </span>
                    <button
                      onClick={() => handleSetEmoji(selectedNode.id, '')}
                      className="text-[10px] text-rose-400 hover:underline font-mono"
                      title="Remove icon from node"
                    >
                      Clear Icon
                    </button>
                  </div>

                  {/* Popular Quick Icons Grid */}
                  <div
                    className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto overscroll-contain custom-scrollbar p-0.5"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {['🧠', '💡', '🚀', '⭐', '🎯', '🔥', '📌', '🎨', '📝', '🏆', '💻', '🎮', '📚', '⚽', '🚗', '✈️', '🧊', '❄️', '⚡', '✨', '☕', '🍕', '❤️', '✅'].map((e) => (
                      <button
                        key={e}
                        onClick={() => handleSetEmoji(selectedNode.id, e)}
                        className="p-1.5 hover:bg-slate-800 hover:scale-115 rounded-lg text-lg transition flex items-center justify-center border border-transparent hover:border-slate-700"
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  {/* View All 100+ Icons Button */}
                  <button
                    onClick={() => {
                      setIsEmojiModalOpen(true);
                      setActiveSubMenu(null);
                    }}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 font-bold text-xs rounded-lg border border-cyan-500/30 flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Grid className="w-3.5 h-3.5 text-cyan-400" />
                    View All 120+ Icons & Emojis
                  </button>
                </div>
              )}

              {/* Sub-menu: Color Popover (Secondary node edge color) */}
              {activeSubMenu === 'color' && !selectedNode.isRoot && (
                <div className="mt-2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl grid grid-cols-4 gap-2 z-50">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => handleSetNodeColor(selectedNode.id, c.hex)}
                      className="w-6 h-6 rounded-full border border-slate-600 hover:scale-110 transition shadow"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              )}

              {/* Sub-menu: Hierarchy Setter Popover */}
              {activeSubMenu === 'hierarchy' && (
                <div className="mt-2 p-3.5 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col gap-3 z-50 w-80 text-sm font-semibold">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-0.5">
                    <span className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                      <Network className="w-4 h-4 text-cyan-400" /> Hierarchy Setter
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                      {selectedNode.isRoot ? 'ROOT (Depth 0)' : `DEPTH ${selectedNode.depth}`}
                    </span>
                  </div>

                  {/* Option A: Set as Root Node */}
                  <button
                    onClick={() => handleMakeRoot(selectedNode.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-400/40 transition text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" /> Promote to Main Root Node
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Depth 0</span>
                  </button>

                  {/* Option B: Re-parent Node Dropdown / Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Set Parent Node:</span>
                      <span className="text-[10px] text-cyan-400 font-normal">Dropdown Options</span>
                    </label>
                    <select
                      value={selectedNode.parentId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSetParentNode(selectedNode.id, e.target.value);
                        } else {
                          handleMakeRoot(selectedNode.id);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 cursor-pointer shadow-inner"
                    >
                      <option value="" className="bg-slate-900 text-slate-300 font-bold py-1">
                        No Parent (Root Node)
                      </option>
                      {nodes
                        .filter((n) => n.id !== selectedNode.id)
                        .map((n) => (
                          <option key={n.id} value={n.id} className="bg-slate-900 text-white font-medium py-1">
                            {n.emoji ? `${n.emoji} ` : ''}{n.text} (Depth {n.depth})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Option C: Promote / Demote Level Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handlePromoteHierarchy(selectedNode.id)}
                      disabled={selectedNode.isRoot || selectedNode.depth <= 0}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold border border-slate-700 transition"
                      title="Move up 1 level in hierarchy"
                    >
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                      <span>Promote Level</span>
                    </button>
                    <button
                      onClick={() => handleDemoteHierarchy(selectedNode.id)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                      title="Move down 1 level in hierarchy"
                    >
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                      <span>Demote Level</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty Area Context Menu */}
          {emptyContextMenu && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-1.5 w-48 text-xs font-semibold flex flex-col gap-1 pointer-events-auto"
              style={{ left: `${emptyContextMenu.x}px`, top: `${emptyContextMenu.y}px` }}
            >
              <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                Create New Node
              </div>
              <button
                onClick={() => handleCreateNodeAtCoords(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-cyan-400 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Add Main / Root Node
              </button>
              <button
                onClick={() => handleCreateNodeAtCoords(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-slate-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                Add Secondary Node
              </button>
              <button
                onClick={() => {
                  handleAutoArrangeGraph('horizontal');
                  setEmptyContextMenu(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-emerald-400 rounded-lg transition border-t border-slate-800/80 mt-0.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Arrange: ↔️ Horizontal
              </button>
              <button
                onClick={() => {
                  handleAutoArrangeGraph('radial');
                  setEmptyContextMenu(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-teal-300 rounded-lg transition"
              >
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                Arrange: 🌐 Free 360°
              </button>
            </div>
          )}

          {/* Bottom Left Floating Zoom & Canvas Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl">
            <button
              onClick={() => handleAutoArrangeGraph('horizontal')}
              className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition flex items-center gap-1 px-2 font-mono text-[11px] font-bold"
              title="Arrange mind map horizontally (Left & Right Wings)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>↔️ Horiz</span>
            </button>
            <button
              onClick={() => handleAutoArrangeGraph('radial')}
              className="p-1.5 hover:bg-teal-500/20 text-teal-300 rounded-lg transition flex items-center gap-1 px-2 font-mono text-[11px] font-bold mr-1"
              title="Arrange mind map in 360° Free All Directions (Radial)"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>🌐 360°</span>
            </button>
            <div className="h-4 w-px bg-slate-800 mr-1" />
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z / 1.2, 0.3))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPan({ x: 600, y: 400 });
                setZoom(.6);
              }}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
              title="Reset Pan & Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Notification Banner */}
          {statusMessage && (
            <div className="absolute bottom-4 right-4 z-50 bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4" />
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Node Details & Rich Documentation Panel (Out of drawing area, below main graph canvas) */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        {selectedNode ? (() => {
          const parentNode = selectedNode.parentId ? nodes.find((n) => n.id === selectedNode.parentId) : null;
          const childNodes = nodes.filter((n) => n.parentId === selectedNode.id);

          const getRootAncestor = (n: MindNode): MindNode => {
            let curr = n;
            while (curr.parentId) {
              const p = nodes.find((item) => item.id === curr.parentId);
              if (!p) break;
              curr = p;
            }
            return curr;
          };

          const rootOriginNode = getRootAncestor(selectedNode);
          const selectedNodeIdx = nodes.findIndex((n) => n.id === selectedNode.id);

          return (
            <div className="space-y-4">
              {/* Header: Page Icon + Node Name + Depth Badge + Node Number Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-lg">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white flex items-center gap-1.5">
                        {selectedNode.emoji && <span>{selectedNode.emoji}</span>}
                        {selectedNode.text}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${selectedNode.isRoot ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                        {selectedNode.isRoot ? 'ROOT NODE' : `DEPTH ${selectedNode.depth}`}
                      </span>
                      <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded border bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm shadow-purple-500/20">
                        Node #{selectedNodeIdx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Node Documentation & Hierarchy Context</p>
                  </div>
                </div>
              </div>
              {/* Hierarchy Context Info (Just Below Main Details Div) */}
              <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
                {/* Node Position Number */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">Node Position:</span>
                  <span className="font-mono font-black text-purple-300 bg-purple-500/20 border border-purple-400/40 px-2 py-0.5 rounded text-[11px] shadow-sm shadow-purple-500/20">
                    Node #{selectedNodeIdx + 1}
                  </span>
                </div>
                {/* Parent Node Info */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">Parent Node:</span>
                  {parentNode ? (
                    <span className="font-bold text-slate-200 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {parentNode.emoji && <span>{parentNode.emoji}</span>}
                      <span>{parentNode.text}</span>
                      <span className="text-[10px] text-cyan-400 font-mono"> (Depth {parentNode.depth})</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">None (Main Root Node)</span>
                  )}
                </div>

                {/* Root Origin Info */}
                {/* {rootOriginNode && rootOriginNode.id !== selectedNode.id && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">Root Origin:</span>
                    <span className="font-bold text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {rootOriginNode.emoji && <span>{rootOriginNode.emoji}</span>}
                      <span>{rootOriginNode.text}</span>
                    </span>
                  </div>
                )} */}

                {/* Sub-branches / Children Info */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">Sub-branches ({childNodes.length}):</span>
                  {childNodes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {childNodes.map((child, childIdx) => (
                        <span key={`${child.id}_${childIdx}`} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-200 font-semibold flex items-center gap-1">
                          {child.emoji && <span>{child.emoji}</span>}
                          <span>{child.text}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-xs">No children attached</span>
                  )}
                </div>
              </div>
              {/* Main Node Details Div (Padded Container) */}
              <div className="w-full min-h-[100px] max-h-[260px] p-4 bg-slate-950/90 border border-slate-800 rounded-xl overflow-y-auto overscroll-contain custom-scrollbar text-slate-200 text-sm leading-relaxed space-y-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-cyan-300 [&_h2]:border-b [&_h2]:border-slate-800 [&_h2]:pb-1 [&_p]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-slate-300 shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: selectedNode.details && selectedNode.details.trim() !== '' ? selectedNode.details : generateDefaultNodeDetails(selectedNode) }} />
              </div>



              {/* Structured Textarea Editor & Formatting Toolbar */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>STRUCTURED EDITOR (EDIT HTML / TEXT):</span>
                  </label>

                  {/* HTML Tags Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-mono text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">Insert:</span>
                    <button
                      onClick={() => appendTagToDetails(selectedNode.id, `<h2>${selectedNode.text} Section</h2>\n`)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-md border border-slate-700 transition"
                    >
                      + &lt;h2&gt;
                    </button>
                    <button
                      onClick={() => appendTagToDetails(selectedNode.id, '<p>Write detailed notes or descriptions...</p>\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
                    >
                      + &lt;p&gt;
                    </button>
                    <button
                      onClick={() => appendTagToDetails(selectedNode.id, '<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md border border-slate-700 transition"
                    >
                      + &lt;ul&gt;&lt;li&gt;
                    </button>
                    <button
                      onClick={() => appendTagToDetails(selectedNode.id, '<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n</ol>\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-md border border-slate-700 transition"
                    >
                      + &lt;ol&gt;&lt;li&gt;
                    </button>
                    <button
                      onClick={() => appendTagToDetails(selectedNode.id, '  <li>List item</li>\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-md border border-slate-700 transition"
                    >
                      + &lt;li&gt;
                    </button>
                    <button
                      onClick={() => handleUpdateNodeDetails(selectedNode.id, '')}
                      className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-md border border-rose-500/20 transition ml-2"
                      title="Reset to default details"
                    >
                      Reset Details
                    </button>
                  </div>
                </div>

                <textarea
                  value={selectedNode.details !== undefined && selectedNode.details !== '' ? selectedNode.details : generateDefaultNodeDetails(selectedNode)}
                  onChange={(e) => handleUpdateNodeDetails(selectedNode.id, e.target.value)}
                  onWheel={(e) => e.stopPropagation()}
                  placeholder="Write custom notes, descriptions, or HTML details..."
                  rows={5}
                  className="w-full min-h-[230px] p-3 bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 rounded-xl focus:border-cyan-400 focus:outline-none leading-relaxed resize-y overscroll-contain shadow-inner"
                />
              </div>
            </div>
          );
        })() : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-300">No Node Selected</h4>
            <p className="text-xs text-slate-500 max-w-md">
              Click any node on the mind map canvas above to view or edit its detailed documentation, objectives, and structured notes (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;).
            </p>
          </div>
        )}
      </div>

      {/* Full 120+ Icon & Emoji Library Modal (Rendered with Portal to document.body) */}
      {isEmojiModalOpen && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-lg shadow-lg shadow-yellow-500/20">
                  <Smile className="w-5 h-5 text-slate-950 font-bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Icon & Emoji Library <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">120+ Icons</span>
                  </h3>
                  <p className="text-xs text-slate-400">Select any icon to attach to node labels</p>
                </div>
              </div>

              <button
                onClick={() => setIsEmojiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emojiSearchQuery}
                  onChange={(e) => setEmojiSearchQuery(e.target.value)}
                  placeholder="Search icons (e.g. ice, game, sports, tech, star)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                {emojiSearchQuery && (
                  <button
                    onClick={() => setEmojiSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Pill Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {['All', ...EMOJI_CATEGORIES.map((c) => c.category)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEmojiCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${emojiCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Emoji Grid Content Body */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-6 space-y-6 max-h-[50vh]"
              onWheel={(e) => e.stopPropagation()}
            >
              {EMOJI_CATEGORIES.filter((cat) => emojiCategory === 'All' || cat.category === emojiCategory)
                .map((cat) => {
                  const filteredEmojis = cat.emojis.filter((e) => {
                    if (!emojiSearchQuery.trim()) return true;
                    const q = emojiSearchQuery.toLowerCase();
                    return cat.category.toLowerCase().includes(q) || e.includes(q);
                  });

                  if (filteredEmojis.length === 0) return null;

                  return (
                    <div key={cat.category} className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{cat.category}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{filteredEmojis.length} icons</span>
                      </h4>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        {filteredEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (selectedNodeId) {
                                handleSetEmoji(selectedNodeId, emoji);
                                showNotification(`Set icon ${emoji} on selected node`);
                              } else {
                                showNotification(`Selected ${emoji}. Select a node to apply.`);
                              }
                              setIsEmojiModalOpen(false);
                            }}
                            className="h-10 rounded-xl bg-slate-950/60 hover:bg-cyan-500/20 hover:border-cyan-400/50 border border-slate-800 flex items-center justify-center text-xl transition transform hover:scale-125 shadow-sm group"
                            title={`Select ${emoji}`}
                          >
                            <span>{emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Click any icon to attach it to the selected node</span>
              <button
                onClick={() => setIsEmojiModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Real-Time Team Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId}
        activeUsers={activeUsers}
        userRooms={userRooms}
        authUser={authUser}
        onStartShare={async (title?: string) => {
          const newRoomId = await createSharedRoom({ nodes, edges }, title);
          if (newRoomId && typeof window !== 'undefined') {
            const newUrl = `${window.location.pathname}?room=${newRoomId}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          }
          return newRoomId;
        }}
        onStopShare={() => {
          handleUnloadWorkspace();
          setIsShareModalOpen(false);
        }}
        onSelectSavedRoom={(selectedRoomId: string) => {
          setIsHydrating(true);
          setRoomId(selectedRoomId);
          if (typeof window !== 'undefined') {
            const newUrl = `${window.location.pathname}?room=${selectedRoomId}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          }
        }}
        onUnloadWorkspace={() => {
          handleUnloadWorkspace();
        }}
        onRefreshRooms={fetchUserRooms}
        onLogin={loginUser}
        onRegister={registerUser}
        onLogout={() => {
          logoutUser();
          handleUnloadWorkspace();
        }}
      />

      {/* Audit Logs & Change History Modal */}
      <LogTableModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        roomId={roomId}
        logs={roomLogs}
        isLoading={isLogLoading}
        total={logTotal}
        onRefresh={handleRefreshLogs}
        isLoggedIn={!!authUser && !authUser.isGuest}
        onLoginClick={() => {
          setIsLogModalOpen(false);
          setIsShareModalOpen(true);
        }}
        onRestoreCommitSnapshot={handleRestoreCommitSnapshot}
      />

      {/* Git Commit Version Modal Portal */}
      {isCommitModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Git-Style Version Commit</h3>
                    <p className="text-xs text-slate-400">Save a version snapshot with message to room audit log</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCommitModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePushCommit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Commit Message</span>
                    <span className="text-[11px] font-mono text-purple-400">Room: {roomId || 'Active'}</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="e.g. feat: refactored root nodes and added API endpoints"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
                  />
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    Committing saves a permanent version checkpoint in MongoDB Atlas. Collaborators can view commit messages and restore previous graph states anytime from Change Logs.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCommitModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCommit}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCommit ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Pushing Commit...</span>
                      </>
                    ) : (
                      <>
                        <GitCommit className="w-4 h-4" />
                        <span>Push Commit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* NVIDIA BYOK AI Generator Modal Portal */}
      {isNvidiaAiModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      NVIDIA NIM AI Brainstorm
                      <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-lg">BYOK</span>
                    </h3>
                    <p className="text-xs text-slate-400">Generate structured mind map architecture with 3 NVIDIA NIM models</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNvidiaAiModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Google Gemini BYOK API Key Section */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Gemini API Key (Direct API)</span>
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Get Key from Google AI Studio ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={geminiApiKeyInput}
                      onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-blue-300 placeholder-slate-600 focus:outline-none focus:border-blue-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGeminiKey(geminiApiKeyInput)}
                      className="px-3.5 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-bold text-xs rounded-xl border border-blue-500/40 transition cursor-pointer shrink-0"
                    >
                      Save Gemini Key
                    </button>
                  </div>
                </div>

                {/* NVIDIA BYOK API Key Section */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>NVIDIA API Key (BYOK)</span>
                    </label>
                    <a
                      href="https://build.nvidia.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get Key from build.nvidia.com ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={nvidiaApiKeyInput}
                      onChange={(e) => setNvidiaApiKeyInput(e.target.value)}
                      placeholder="nvapi-..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNvidiaKey(nvidiaApiKeyInput)}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>

                {/* Model Selector Cards */}
                <div className="space-y-3">
                  {/* Section 0: Direct Google Gemini Models */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-blue-400 font-extrabold">⚡ Direct Google Gemini AI Models (Instant Queue)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {CLOUD_GEMINI_MODELS.map((model) => {
                        const isSelected = selectedNvidiaModel === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => handleSelectNvidiaModel(model.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${isSelected
                              ? 'bg-blue-950/40 border-blue-400 text-white shadow-md shadow-blue-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                              }`}
                          >
                            <div>
                              <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 inline-block mb-1">
                                {model.badge}
                              </span>
                              <h4 className="text-xs font-black text-slate-100">{model.name}</h4>
                            </div>
                            <p className="text-[10px] leading-relaxed opacity-80">{model.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 1: Cloud NVIDIA Models */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-cyan-400 font-extrabold">🌐 NVIDIA Cloud AI Models (BYOK Key Required)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {CLOUD_NVIDIA_MODELS.map((model) => {
                        const isSelected = selectedNvidiaModel === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => handleSelectNvidiaModel(model.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${isSelected
                              ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                              }`}
                          >
                            <div>
                              <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 inline-block mb-1">
                                {model.badge}
                              </span>
                              <h4 className="text-xs font-black text-slate-100">{model.name}</h4>
                            </div>
                            <p className="text-[10px] leading-relaxed opacity-80">{model.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Local Ollama Models */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-black">🏠 Local Ollama Models (No API Key Required)</span>
                      </label>
                      <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${isOllamaActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                        {isOllamaActive ? '🟢 Ollama Active (http://localhost:11434)' : '🔴 Ollama Service Offline'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getAllOllamaModels(installedOllamaModels).map((model) => {
                        const isSelected = selectedNvidiaModel === model.id;
                        const isInstalled = installedOllamaModels.length === 0 || installedOllamaModels.some((name) => name.includes(model.ollamaModel || ''));
                        const isAvailable = isOllamaActive && isInstalled;
                        const isCustom = model.badge === 'Custom Local';

                        return (
                          <div
                            key={model.id}
                            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${!isAvailable
                              ? 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-60 grayscale'
                              : isSelected
                                ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                              }`}
                          >
                            <div
                              onClick={() => isAvailable && handleSelectNvidiaModel(model.id)}
                              className="cursor-pointer space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${isAvailable
                                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-500'
                                  }`}>
                                  {model.badge}
                                </span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${isAvailable ? 'bg-emerald-400/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                  }`}>
                                  {isAvailable ? '🟢 Active' : '🔴 Offline'}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-slate-100 flex items-center justify-between">
                                <span>{model.name}</span>
                                {isSelected && <span className="text-[10px] text-emerald-400 font-bold">✓ Selected</span>}
                              </h4>
                              <p className="text-[10px] leading-relaxed opacity-80">{model.description}</p>
                            </div>

                            {isCustom && (
                              <div className="pt-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustomModelClick(model.id);
                                  }}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove Custom Model
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Local Model Form */}
                    <form onSubmit={handleAddCustomModelSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={customOllamaInput}
                        onChange={(e) => setCustomOllamaInput(e.target.value)}
                        placeholder="Add custom model name (e.g. mistral:7b, llama3.2:3b)..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0 cursor-pointer"
                      >
                        + Add Local Model
                      </button>
                    </form>

                    {/* Interactive Step-by-Step Local Ollama Setup & Usage Guide */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                            📖 How to Setup & Run Custom Local Ollama Models (Step-by-Step Guide)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowOllamaGuide(!showOllamaGuide)}
                          className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                        >
                          {showOllamaGuide ? 'Collapse Guide ▲' : 'Show Setup Guide 📖'}
                        </button>
                      </div>

                      {showOllamaGuide && (
                        <div className="space-y-3 text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                          {/* Step 1 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">1</span>
                              <span>Download & Install Ollama</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Download Ollama for Linux, macOS, or Windows from{' '}
                              <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">
                                ollama.com ↗
                              </a>
                            </p>
                          </div>

                          {/* Step 2 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">2</span>
                              <span>Choose a Suitable Model for Your PC Specs</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Research and pick an efficient model suited for your RAM / VRAM (e.g. 7B models like <code className="text-emerald-300">qwen2.5-coder:7b</code> for 8GB-16GB RAM, or 3B models for low VRAM PCs).
                            </p>
                          </div>

                          {/* Step 3 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">3</span>
                              <span>Pull Model via Terminal</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-1">Open your terminal and pull your chosen model:</p>
                            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px]">
                              <span className="text-amber-300">ollama pull qwen2.5-coder:7b</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('ollama pull qwen2.5-coder:7b');
                                  showNotification('Copied: ollama pull qwen2.5-coder:7b');
                                }}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">4</span>
                              <span>Verify Download & Start Service</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono">
                              <div className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-800 rounded-lg">
                                <span className="text-slate-300">ollama list</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('ollama list');
                                    showNotification('Copied: ollama list');
                                  }}
                                  className="text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                              <div className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-800 rounded-lg">
                                <span className="text-slate-300">systemctl start ollama</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('systemctl start ollama');
                                    showNotification('Copied: systemctl start ollama');
                                  }}
                                  className="text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                              <div className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-800 rounded-lg sm:col-span-2">
                                <span className="text-slate-300">systemctl status ollama</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('systemctl status ollama');
                                    showNotification('Copied: systemctl status ollama');
                                  }}
                                  className="text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Step 5 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">5</span>
                              <span>Test Chat Response in Terminal</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-1">
                              Run model in terminal and test if chat prompt responds:
                            </p>
                            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px]">
                              <span className="text-cyan-300">ollama run qwen2.5-coder:7b</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('ollama run qwen2.5-coder:7b');
                                  showNotification('Copied: ollama run qwen2.5-coder:7b');
                                }}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Step 6 */}
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">6</span>
                              <span>Add Model Name to Toolip</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Copy the exact model name from <code className="text-amber-300">ollama list</code> (e.g. <code className="text-emerald-300">qwen2.5-coder:7b</code> or <code className="text-emerald-300">mistral:7b</code>) and paste it into the <strong>Add Custom Local Model</strong> input above!
                            </p>
                          </div>

                          {/* Step 7 */}
                          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                            <p className="text-[11px] text-emerald-200 font-medium">
                              Ensure status shows <span className="text-emerald-300 font-bold">🟢 Ollama Active</span> and you are good to go for 100% private, keyless local AI generation!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prompt Text Area */}
                {/* <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    Brainstorm Prompt / Topic
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={
                      nodes.length > 0
                        ? "Ask AI to expand, modify or upgrade the current mind map (e.g. 'Expand Technical Skills branch with Rust and WebAssembly')..."
                        : "e.g. Brainstorm a microservices architecture for an automated trading platform with data ingestion, ML models, and notification services..."
                    }
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                  />

                  
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Quick Prompts:</span>
                    {[
                      '👤 Personal Profile (Motive, Education, Experience, Skill, Hobbies)',
                      '🚀 SaaS Product Launch Roadmap',
                      '💻 Microservices Architecture',
                      '🎨 Content Marketing Funnel',
                      '🎯 Q4 OKRs & Growth Strategy',
                    ].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setAiPrompt(pill)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[10px] font-semibold transition cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div> */}

                {/* Error Banner */}
                {aiErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0" />
                    <span>{aiErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              {/* <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNvidiaAiModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                {isAiGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopBuilding}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current text-white" />
                    <span>Stop Building 🛑</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleGenerateAiMindMap}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                    <span>{nodes.length > 0 ? 'Upgrade Mind Map' : 'Generate Mind Map'}</span>
                  </button>
                )}
              </div> */}
            </div>
          </div>,
          document.body
        )}

      {/* Stop Building Confirmation Modal (Keep vs Revert 1 Step) */}
      {mounted && isStopConfirmModalOpen && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100001] animate-fade-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center relative z-[100002] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Square className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Building Stopped</h3>
              <p className="text-xs text-slate-400 mt-1">
                AI mind map generation was stopped. Choose how you want to handle the canvas:
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleKeepPartialState}
                className="w-full py-3 px-4 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
              >
                <Check className="w-4 h-4" />
                Keep Current Canvas State
              </button>

              <button
                type="button"
                onClick={handleRevertPreviousState}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Revert 1 Step Back (Restore Previous State)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Notification Banner - Top Left Corner */}
      {statusMessage && (
        <div className="fixed top-5 left-5 z-[100000] bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-2xl border border-cyan-300/40 flex items-center gap-2 animate-bounce pointer-events-none">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
