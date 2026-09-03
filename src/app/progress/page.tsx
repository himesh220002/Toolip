'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentContext, ToolStatus } from '@/context/CurrentContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Tag, Check, RotateCcw, Download, Crosshair, Hexagon, Shield, Activity, X } from 'lucide-react';

const ALL_STATUS_TAGS: { tag: ToolStatus; label: string; color: string }[] = [
  { tag: 'planned', label: 'Planned', color: 'text-blue-300 border-blue-400/30 bg-blue-500/10' },
  { tag: 'working', label: 'Working', color: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  { tag: 'completed', label: 'Completed', color: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10' },
  { tag: 'review needed', label: 'Review', color: 'text-violet-300 border-violet-400/30 bg-violet-500/10' },
  { tag: 'upgrade needed', label: 'Upgrade', color: 'text-orange-300 border-orange-400/30 bg-orange-500/10' },
  { tag: 'upgraded', label: 'Upgraded', color: 'text-halo-cyan border-halo-cyan/30 bg-halo-cyan/10' },
  { tag: 'dropped', label: 'Dropped', color: 'text-rose-300 border-rose-400/30 bg-rose-500/10' },
];

export default function ProgressPage() {
  const { tools, updateToolStatus, updateToolNotes, stats, resetToDefaults } = useCurrentContext();
  const [filterTag, setFilterTag] = useState<ToolStatus | 'all'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

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
    <div className="min-h-screen flex flex-col bg-gunmetal text-white selection:bg-vice-pink selection:text-white">
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />
      <Navbar />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/30 via-vice-pink/20 to-vice-violet/30">
          <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] p-5 sm:p-6">
            <div className="absolute inset-0 hex-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-halo-cyan/30 to-transparent" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 clip-chamfer bg-gradient-to-br from-halo-cyan to-halo-electric p-[1.5px] shadow-halo shrink-0">
                  <div className="h-full w-full clip-chamfer bg-gunmetal-900 flex items-center justify-center">
                    <Crosshair className="h-5 w-5 text-halo-cyan" />
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl tracking-[0.06em] text-white leading-none">YOUR PROGRESS</h1>
                  <p className="font-mono text-[10px] tracking-[0.14em] font-bold text-white/40 mt-1">TRACKER • {stats.total} TOOLS</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/10 border border-white/10 clip-chamfer-sm font-mono text-[10px] tracking-[0.12em] font-bold text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> TOOLS
                </Link>
                <button onClick={exportAsJSON} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-halo-cyan/10 border border-white/10 hover:border-halo-cyan/30 clip-chamfer-sm font-mono text-[10px] tracking-[0.12em] font-bold text-white/60 hover:text-halo-cyan transition-colors">
                  <Download className="h-3.5 w-3.5" /> EXPORT
                </button>
                <button onClick={resetToDefaults} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-vice-pink/10 border border-white/10 hover:border-vice-pink/30 clip-chamfer-sm font-mono text-[10px] tracking-[0.12em] font-bold text-white/60 hover:text-vice-pink transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /> RESET
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="clip-chamfer bg-gunmetal-800/40 border border-white/10 p-3 sm:p-4">
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
        </div>

        {/* List */}
        <div className="space-y-2">
          {filteredTools.length === 0 ? (
            <div className="py-16 text-center clip-chamfer bg-gunmetal-800/30 border border-white/10">
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
                  className="group relative clip-chamfer-sm bg-gunmetal-800/40 border border-white/10 hover:border-halo-cyan/20 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-tech font-bold text-sm text-white tracking-[0.02em]">{tool.title.toUpperCase()}</span>
                      <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 clip-chamfer-sm font-mono text-[9px] tracking-[0.10em] font-bold text-white/40">{tool.category.toUpperCase().slice(0,18)}</span>
                    </div>
                    <p className="font-mono text-[12px] leading-relaxed text-white/40 mt-1 line-clamp-2">{tool.description}</p>

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
                          <button onClick={() => saveNote(tool.id)} className="h-8 w-8 clip-chamfer-sm bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingNoteId(null)} className="h-8 w-8 clip-chamfer-sm bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={()=>{ setEditingNoteId(tool.id); setTempNote(tool.notes||''); }} className="flex items-center gap-1.5 font-mono text-[11px] text-white/25 hover:text-halo-cyan transition-colors text-left">
                          <span className="italic truncate max-w-[360px]">NOTE: {tool.notes || 'Click to add note...'}</span>
                          <Hexagon className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={tool.status}
                      onChange={(e) => updateToolStatus(tool.id, e.target.value as ToolStatus)}
                      className="px-3 py-2 clip-chamfer-sm bg-gunmetal-900 border border-white/10 font-mono text-xs font-bold tracking-[0.08em] text-white focus:outline-none focus:border-halo-cyan/50 cursor-pointer"
                    >
                      {ALL_STATUS_TAGS.map(({ tag: t, label }) => (
                        <option key={t} value={t} className="bg-gunmetal-900">{label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
