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
  MoreHorizontal
} from 'lucide-react';

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

export const MindMapEditor: React.FC = () => {
  // Graph State
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [edges, setEdges] = useState<MindEdge[]>([]);

  // Canvas Pan & Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const [zoom, setZoom] = useState<number>(1);
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

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRafRef = useRef<number | null>(null);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
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

  // Native non-passive wheel listener to stop page scroll when zooming canvas
  useEffect(() => {
    const canvasEl = containerRef.current;
    if (!canvasEl) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.scrollable-note, textarea, .overflow-y-auto, [contenteditable="true"]')) {
        return; // Allow mouse scrolling inside note card text containers!
      }

      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(Math.max(z * delta, 0.3), 3));
    };

    canvasEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

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

  // Initial Load from localStorage, backend API, or default sample
  useEffect(() => {
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
  }, []);

  // Sync state to localStorage whenever nodes or edges update (Debounced 400ms to eliminate drag lag)
  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
        localStorage.setItem(STORAGE_KEY_EDGES, JSON.stringify(edges));
      } catch (e) {
        console.warn('Failed to save mindmap state to localStorage', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nodes, edges, isInitialized]);

  // Reset to Default Sample Map & Clear Storage
  const handleResetToDefaultMap = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_NODES);
      localStorage.removeItem(STORAGE_KEY_EDGES);
    } catch (e) {
      // ignore
    }
    loadDefaultSampleMap();
    showNotification('Reset mind map to default sample map!');
  };

  // Auto-Arrange & Beautify Mind Map Layout
  const handleAutoArrangeGraph = () => {
    if (nodes.length === 0) return;

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

    // Recursive helper to calculate total subtree height needed
    const getSubtreeHeight = (nodeId: string): number => {
      const children = getChildren(nodeId);
      if (children.length === 0) return 76; // Base height per node
      let h = 0;
      children.forEach((c) => {
        h += getSubtreeHeight(c.id);
      });
      return Math.max(76, h);
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
      let currentY = startY - totalHeight / 2 + 38;

      children.forEach((child) => {
        const cHeight = getSubtreeHeight(child.id);
        const cY = currentY + cHeight / 2 - 38;
        const nextX = dir === 'right' ? startX + 240 : startX - 240;
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
        let startRightY = currentRootY - totalRightHeight / 2 + 38;

        rightChildren.forEach((child) => {
          const childHeight = getSubtreeHeight(child.id);
          const childY = startRightY + childHeight / 2 - 38;
          layoutSubtree(child.id, 280, childY, 1, 'right');
          startRightY += childHeight;
        });

        // Left Wing Layout
        const totalLeftHeight = leftChildren.reduce((sum, c) => sum + getSubtreeHeight(c.id), 0);
        let startLeftY = currentRootY - totalLeftHeight / 2 + 38;

        leftChildren.forEach((child) => {
          const childHeight = getSubtreeHeight(child.id);
          const childY = startLeftY + childHeight / 2 - 38;
          layoutSubtree(child.id, -280, childY, 1, 'left');
          startLeftY += childHeight;
        });
      }

      const treeHeight = Math.max(
        getChildren(root.id).reduce((sum, c) => sum + getSubtreeHeight(c.id), 0),
        360
      );
      currentRootY += treeHeight + 220;
    });

    setNodes(updatedNodes);

    // Recenter canvas camera
    setPan({ x: 450, y: 280 });
    setZoom(0.95);

    showNotification('✨ Auto-arranged mind map into clean, beautiful structure!');
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

  // Mouse Wheel Zoom
  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 3);
    setZoom(newZoom);
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
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
    showNotification('Removed arrow connection');
  };

  const handleSetEdgeColor = (edgeId: string, colorHex: string) => {
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
      setNodes((prev) => prev.map((n) => (n.id === editingNodeId ? { ...n, text: editingText || 'Node' } : n)));
      setEditingNodeId(null);
    }
  };

  // Actions for Toolbars
  const handleAddChildNode = (parentNodeId: string) => {
    const parent = nodes.find((n) => n.id === parentNodeId);
    if (!parent) return;

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
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, emoji } : n)));
    setActiveSubMenu(null);
  };

  const handleSetNodeColor = (nodeId: string, colorHex: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, color: colorHex } : n)));
    // Also update outgoing edges color
    setEdges((prev) => prev.map((e) => (e.source === nodeId ? { ...e, color: colorHex } : e)));
    setActiveSubMenu(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId && n.parentId !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
    showNotification('Node removed');
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
    <div className="flex flex-col w-full text-white select-none gap-6 flex-1 min-h-0">
      {/* Drawing Canvas Card */}
      <div className="flex flex-col w-full flex-1 h-[100vh] min-h-[90vh] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-20 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-lg shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Mind Map Editor
              </h2>
              <p className="text-xs text-slate-400">Interactive node builder & GraphML export/import</p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoArrangeGraph}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition"
              title="Auto-arrange & beautify mind map structure"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Auto-Arrange
            </button>

            <button
              onClick={handleResetToDefaultMap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Reset mind map to default sample map"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              Reset Map
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Open mindmap.graphml file"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
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
              onClick={handleSaveGraphML}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/25 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              Save mindmap.graphml
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950 overscroll-contain"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={handleCanvasContextMenu}
          onWheel={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
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
              {/* Render Connecting Edges */}
              {visibleEdges.map((e) => {
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
                  <g key={e.id} className="group cursor-pointer">
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
            {visibleNodes.map((node) => {
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

              return (
                <div
                  key={node.id}
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
                    minHeight: `${calcHeight}px`,
                    borderColor: isSelected ? '#00f2fe' : node.color || (isRoot ? '#00f2fe' : '#475569'),
                    boxShadow: isRoot ? `0 0 24px ${node.color || '#00f2fe'}44` : undefined
                  }}
                >
                  {!hasChildren ? (
                    /* Single Row Layout for Child / Leaf Nodes (Truncate with ... after 300px max) */
                    <div className="flex items-center gap-2 w-full h-full min-w-0">
                      {node.emoji && <span className="text-2xl select-none leading-none shrink-0">{node.emoji}</span>}
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
                          className={`truncate max-w-[230px] font-bold ${node.depth === 1 ? 'text-base text-slate-100' : 'text-sm text-slate-200'
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
                  handleAutoArrangeGraph();
                  setEmptyContextMenu(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-slate-800 text-emerald-400 rounded-lg transition border-t border-slate-800/80 mt-0.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Arrange Map
              </button>
            </div>
          )}

          {/* Bottom Left Floating Zoom & Canvas Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl">
            <button
              onClick={handleAutoArrangeGraph}
              className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition flex items-center gap-1 px-2 font-mono text-[11px] font-bold mr-1"
              title="Auto-arrange & beautify mind map layout"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arrange</span>
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
                setPan({ x: 400, y: 300 });
                setZoom(1);
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

          return (
            <div className="space-y-4">
              {/* Header: Page Icon + Node Name + Depth Badge */}
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
                    </div>
                    <p className="text-xs text-slate-400">Node Documentation & Hierarchy Context</p>
                  </div>
                </div>
              </div>
              {/* Hierarchy Context Info (Just Below Main Details Div) */}
              <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
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
                      {childNodes.map((child) => (
                        <span key={child.id} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-200 font-semibold flex items-center gap-1">
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

      {/* Notification Banner */}
      {statusMessage && (
        <div className="fixed bottom-4 right-4 z-[100000] bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          {statusMessage}
        </div>
      )}
    </div>
  );
};
