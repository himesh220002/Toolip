'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, User, FileClock, ShieldCheck, LogIn, RefreshCw, GitCommit, RotateCcw } from 'lucide-react';

export interface RoomLogEntry {
  _id: string;
  roomId: string;
  userName: string;
  userEmail?: string;
  userId: string;
  action: string;
  summary: string;
  commitMessage?: string;
  snapshot?: any;
  nodeId?: string;
  version?: number;
  createdAt: string;
}

interface LogTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  logs: RoomLogEntry[];
  isLoading: boolean;
  total?: number;
  onRefresh?: () => void;
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  onRestoreCommitSnapshot?: (snapshot: any, version?: number) => void;
}

export const LogTableModal: React.FC<LogTableModalProps> = ({
  isOpen,
  onClose,
  roomId,
  logs,
  isLoading,
  total,
  onRefresh,
  isLoggedIn,
  onLoginClick,
  onRestoreCommitSnapshot,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Change & Commit Audit Logs
                {roomId && <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">{roomId.slice(0, 14)}…</span>}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLoggedIn
                  ? 'Git-style version commits & live user changes backed by MongoDB Atlas'
                  : 'Login required to view audit logs for this graph'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Login to view logs</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Logs are per-graph and only visible to authenticated collaborators of <span className="font-mono text-cyan-300">{roomId || 'this graph'}</span>.</p>
              </div>
              {onLoginClick && (
                <button
                  onClick={onLoginClick}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 hover:from-cyan-300 hover:to-indigo-500 transition shadow-md cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> Login / Register
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-sm font-semibold">Loading logs for this graph...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-2">
              <FileClock className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No edits logged yet for this graph</p>
              <p className="text-xs text-slate-500">Edits and Git commits will appear here with user and timestamp once collaborators make changes.</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-slate-400">
                  Showing <span className="text-white font-bold">{logs.length}</span> of <span className="text-white font-bold">{total ?? logs.length}</span> entries for <span className="text-cyan-300">{roomId}</span>
                </p>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
                    title="Refresh logs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
                    <tr className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="px-4 py-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> When</th>
                      <th className="px-4 py-3"><User className="w-3.5 h-3.5 inline mr-1" /> User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Summary</th>
                      <th className="px-4 py-3 text-right">Restore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.map((log) => {
                      const isCommit = log.action === 'commit';
                      const hasSnapshot = !!log.snapshot;

                      return (
                        <tr key={log._id} className={`transition text-slate-300 ${isCommit ? 'bg-indigo-950/20 hover:bg-indigo-950/40' : 'hover:bg-slate-900/60'}`}>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">{formatTime(log.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-100 text-xs truncate max-w-[140px]">{log.userName}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{log.userEmail || log.userId.slice(0, 8)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isCommit ? (
                              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1">
                                <GitCommit className="w-3 h-3 text-purple-400" />
                                Git Commit {log.version ? `v${log.version}` : ''}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wide">
                                {log.action}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300 max-w-[240px] truncate" title={log.commitMessage || log.summary}>
                            {log.commitMessage ? (
                              <span className="font-semibold text-purple-200">"{log.commitMessage}"</span>
                            ) : (
                              log.summary || '-'
                            )}
                            {log.nodeId && <span className="ml-2 text-[10px] font-mono text-slate-500">· {log.nodeId}</span>}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {hasSnapshot && onRestoreCommitSnapshot ? (
                              <button
                                onClick={() => {
                                  onRestoreCommitSnapshot(log.snapshot, log.version);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                title={`Restore graph canvas to Git version ${log.version || ''}`}
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore {log.version ? `v${log.version}` : ''}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">Logs are scoped to this collaborative graph only (roomId). Older entries paginated 50 at a time.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
