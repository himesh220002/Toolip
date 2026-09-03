'use client';

import React, { useState } from 'react';
import { useCurrentContext, ToolStatus } from '@/context/CurrentContext';
import {
  X,
  Tag,
  Check,
  RotateCcw,
  Download,
  Crosshair,
  Hexagon,
  Shield,
  Activity,
} from 'lucide-react';

interface StatusDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_STATUS_TAGS: { tag: ToolStatus; label: string; color: string }[] = [
  { tag: 'planned', label: 'Planned', color: 'text-blue-300 border-blue-400/30 bg-blue-500/10' },
  { tag: 'working', label: 'Working', color: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  { tag: 'completed', label: 'Completed', color: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10' },
  { tag: 'review needed', label: 'Review', color: 'text-violet-300 border-violet-400/30 bg-violet-500/10' },
  { tag: 'upgrade needed', label: 'Upgrade', color: 'text-orange-300 border-orange-400/30 bg-orange-500/10' },
  { tag: 'upgraded', label: 'Upgraded', color: 'text-halo-cyan border-halo-cyan/30 bg-halo-cyan/10' },
  { tag: 'dropped', label: 'Dropped', color: 'text-rose-300 border-rose-400/30 bg-rose-500/10' },
];

export const StatusDashboard: React.FC<StatusDashboardProps> = ({ isOpen, onClose }) => {
  const { tools, updateToolStatus, updateToolNotes, stats, resetToDefaults } = useCurrentContext();
  const [filterTag, setFilterTag] = useState<ToolStatus | 'all'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  if (!isOpen) return null;

  const filteredTools = filterTag === 'all' ? tools : tools.filter((t) => t.status === filterTag);

  const saveNote = (id: string) => {
    updateToolNotes(id, tempNote);
    setEditingNoteId(null);
  };

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tools, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'toolip_tools.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05070F]/80 backdrop-blur-xl">
      {/* outer glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-halo-cyan/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[1080px] max-h-[92vh] clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-vice-pink/30 to-vice-violet/40 shadow-halo-strong flex flex-col overflow-hidden">
        <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] flex flex-col overflow-hidden">
          <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 vice-grain opacity-20 pointer-events-none" />

          {/* Header - Halo armory */}
          <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 clip-chamfer bg-gradient-to-br from-halo-cyan to-halo-electric p-[1.5px] shadow-halo">
                <div className="h-full w-full clip-chamfer bg-gunmetal-900 flex items-center justify-center">
                  <Crosshair className="h-5 w-5 text-halo-cyan" />
                </div>
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl tracking-[0.06em] text-white leading-none">TOOL TRACKER</h2>
                <p className="font-mono text-[10px] tracking-[0.14em] font-bold text-white/40">TOOL COLLECTION • {stats.total} TOOLS</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={exportAsJSON} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-halo-cyan/10 border border-white/10 hover:border-halo-cyan/30 clip-chamfer-sm font-mono text-[10px] tracking-[0.14em] font-bold text-white/70 hover:text-halo-cyan transition-colors">
                <Download className="h-3.5 w-3.5" /> EXPORT
              </button>
              <button onClick={resetToDefaults} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-vice-pink/10 border border-white/10 hover:border-vice-pink/30 clip-chamfer-sm font-mono text-[10px] tracking-[0.14em] font-bold text-white/60 hover:text-vice-pink transition-colors">
                <RotateCcw className="h-3.5 w-3.5" /> RESET
              </button>
              <button onClick={onClose} className="h-9 w-9 clip-chamfer bg-white/5 hover:bg-vice-pink hover:text-white border border-white/10 flex items-center justify-center text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-halo-cyan/30 to-transparent" />
          </div>

          {/* Stats filter bar - Halo REQ tabs */}
          <div className="relative p-3 sm:p-4 border-b border-white/10 bg-gunmetal-900/40">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
              <button
                onClick={() => setFilterTag('all')}
                className={`clip-chamfer-sm border p-2.5 text-left transition-all ${filterTag==='all' ? 'bg-halo-cyan text-gunmetal-900 border-halo-cyan shadow-halo' : 'bg-black/30 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'}`}
              >
                <div className="font-mono text-[8px] tracking-[0.16em] font-bold opacity-70">TOTAL</div>
                <div className="font-display text-xl leading-none mt-1">{stats.total}</div>
              </button>
              {ALL_STATUS_TAGS.map(({ tag, label, color }) => {
                const count = stats[tag] || 0;
                const isActive = filterTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`clip-chamfer-sm border p-2.5 text-left transition-all ${isActive ? `${color} shadow-[0_0_12px_rgba(0,229,255,0.15)]` : 'bg-black/30 border-white/5 text-white/30 hover:bg-white/[0.03] hover:text-white/60'}`}
                  >
                    <div className="font-mono text-[8px] tracking-[0.14em] font-bold truncate">{label.toUpperCase()}</div>
                    <div className="font-tech font-bold text-lg leading-none mt-1 text-white">{count}</div>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:flex justify-between mt-2 font-mono text-[7.5px] tracking-[0.14em] font-bold text-white/20">
              <span>FILTER BY STATUS — CLICK TAB TO ISOLATE</span>
              <span className="text-halo-cyan/40 flex items-center gap-1.5"><Activity className="h-3 w-3" /> ONLINE</span>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-0">
            {filteredTools.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-10 w-10 clip-chamfer bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-3">
                  <Tag className="h-5 w-5" />
                </div>
                <p className="font-mono text-xs tracking-[0.14em] font-bold text-white/30">NO TOOLS FOR FILTER <span className="text-halo-cyan">"{filterTag.toUpperCase()}"</span></p>
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isEditing = editingNoteId === tool.id;
                return (
                  <div
                    key={tool.id}
                    className="group relative clip-chamfer-sm bg-black/30 border border-white/10 hover:border-halo-cyan/20 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-tech font-bold text-sm text-white tracking-[0.02em]">{tool.title.toUpperCase()}</span>
                        <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 clip-chamfer-sm font-mono text-[9px] tracking-[0.10em] font-bold text-white/40">{tool.category.toUpperCase().slice(0,18)}</span>
                        <span className="font-mono text-[8px] tracking-[0.12em] font-bold text-halo-cyan/50">ID: {tool.id.slice(0,16)}</span>
                      </div>
                      <p className="font-mono text-[11px] leading-relaxed text-white/35 mt-1 line-clamp-2">{tool.description}</p>

                      <div className="mt-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              placeholder="Add note..."
                              className="flex-1 px-2.5 py-1.5 bg-gunmetal-900 border border-halo-cyan/30 clip-chamfer-sm font-mono text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-halo-cyan"
                              onKeyDown={(e)=>{ if(e.key==='Enter') saveNote(tool.id); if(e.key==='Escape') setEditingNoteId(null); }}
                            />
                            <button onClick={() => saveNote(tool.id)} className="h-8 w-8 clip-chamfer-sm bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingNoteId(null)} className="h-8 w-8 clip-chamfer-sm bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={()=>{ setEditingNoteId(tool.id); setTempNote(tool.notes||''); }} className="flex items-center gap-1.5 font-mono text-[11px] text-white/25 hover:text-halo-cyan transition-colors text-left">
                            <span className="italic truncate max-w-[320px]">NOTE: {tool.notes || 'Click to add note...'}</span>
                            <Hexagon className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* status selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={tool.status}
                        onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
                        className="px-3 py-2 clip-chamfer-sm bg-gunmetal-900 border border-white/10 font-mono text-xs font-bold tracking-[0.08em] text-white focus:outline-none focus:border-halo-cyan/50 cursor-pointer"
                      >
                        {ALL_STATUS_TAGS.map(({ tag, label }) => (
                          <option key={tag} value={tag} className="bg-gunmetal-900">
                            {label.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <span className={`hidden sm:flex h-2 w-2 rounded-full ${tool.status==='completed' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : tool.status==='working' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse' : 'bg-white/20'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer bar */}
          <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[9px] tracking-[0.14em] font-bold text-white/25">
            <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-halo-cyan" /> SYNCED LOCALLY</span>
            <span>CLICK STATUS TO UPDATE • NOTES SAVED LOCALLY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
