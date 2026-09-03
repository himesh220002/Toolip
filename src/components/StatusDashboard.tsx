'use client';

import React, { useState } from 'react';
import { useCurrentContext, ToolStatus } from '@/context/CurrentContext';
import {
  X,
  Tag,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';

interface StatusDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_STATUS_TAGS: { tag: ToolStatus; label: string; className: string }[] = [
  { tag: 'planned', label: 'Planned', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { tag: 'working', label: 'Working', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { tag: 'completed', label: 'Completed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { tag: 'review needed', label: 'Review Needed', className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { tag: 'upgrade needed', label: 'Upgrade Needed', className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { tag: 'upgraded', label: 'Upgraded', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { tag: 'dropped', label: 'Dropped', className: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
];

export const StatusDashboard: React.FC<StatusDashboardProps> = ({ isOpen, onClose }) => {
  const { tools, updateToolStatus, updateToolNotes, stats, resetToDefaults } = useCurrentContext();
  const [filterTag, setFilterTag] = useState<ToolStatus | 'all'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  if (!isOpen) return null;

  const filteredTools = filterTag === 'all'
    ? tools
    : tools.filter((t) => t.status === filterTag);

  const startEditNote = (id: string, currentNote: string = '') => {
    setEditingNoteId(id);
    setTempNote(currentNote);
  };

  const saveNote = (id: string) => {
    updateToolNotes(id, tempNote);
    setEditingNoteId(null);
  };

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tools, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'currentcontext_status.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                CurrentContext Status Tracker Dashboard
              </h2>
              <p className="text-xs text-gray-400">
                Track, tag & manage execution states for all 19 Toolip utilities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportAsJSON}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
              title="Export state JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
              title="Reset tags to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Pills / Counter Cards */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            <button
              onClick={() => setFilterTag('all')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filterTag === 'all'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-gray-800/40 border-gray-800 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider">Total</div>
              <div className="text-xl font-bold text-white mt-0.5">{stats.total}</div>
            </button>

            {ALL_STATUS_TAGS.map(({ tag, label, className }) => {
              const count = stats[tag] || 0;
              const isActive = filterTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? `${className} ring-1 ring-white/20`
                      : 'bg-gray-800/40 border-gray-800 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <div className="text-[10px] font-medium truncate">{label}</div>
                  <div className="text-xl font-bold text-white mt-0.5">{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools List with Tag Controls */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No tools matching status tag <span className="font-mono text-sky-400">"{filterTag}"</span>
            </div>
          ) : (
            filteredTools.map((tool) => {
              const isEditing = editingNoteId === tool.id;
              return (
                <div
                  key={tool.id}
                  className="p-4 rounded-xl bg-gray-950/70 border border-gray-800 hover:border-gray-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-white text-sm">{tool.title}</span>
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{tool.description}</p>
                    
                    {/* Note editor section */}
                    <div className="mt-2 text-xs">
                      {isEditing ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="text"
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Add developer note..."
                            className="flex-1 px-2.5 py-1 bg-gray-900 border border-gray-700 rounded text-gray-200 text-xs focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={() => saveNote(tool.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-800 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400 group cursor-pointer" onClick={() => startEditNote(tool.id, tool.notes)}>
                          <span className="italic text-[11px] text-gray-500">
                            Note: {tool.notes || 'Click to add dev notes...'}
                          </span>
                          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-sky-400 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Tag Selector */}
                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <select
                      value={tool.status}
                      onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none transition-all cursor-pointer ${
                        tool.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                          : tool.status === 'working'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                          : tool.status === 'planned'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/40'
                          : tool.status === 'review needed'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                          : tool.status === 'upgrade needed'
                          ? 'bg-orange-500/10 text-orange-300 border-orange-500/40'
                          : tool.status === 'upgraded'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {ALL_STATUS_TAGS.map(({ tag, label }) => (
                        <option key={tag} value={tag} className="bg-gray-900 text-gray-200">
                          Tag: {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 bg-gray-950/60 text-xs text-gray-500 flex justify-between items-center">
          <span>CurrentContext system active & synced in React state</span>
          <span>Click on any tool status to re-tag in real time</span>
        </div>

      </div>
    </div>
  );
};
