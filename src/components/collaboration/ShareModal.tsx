'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Copy,
  Check,
  Users,
  Shield,
  Link as LinkIcon,
  QrCode,
  X,
  Plus,
  LogIn,
  UserPlus,
  FolderKanban,
  ExternalLink,
  Sparkles,
  UserCheck,
  LogOut,
  LogOut as UnloadIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import { ActiveUser, SavedRoom, UserProfile } from '../../hooks/useCollaborativeSession';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  activeUsers: ActiveUser[];
  userRooms: SavedRoom[];
  authUser: UserProfile | null;
  onStartShare: (roomTitle?: string) => Promise<string | undefined>;
  onStopShare?: () => void;
  onSelectSavedRoom?: (selectedRoomId: string) => void;
  onUnloadWorkspace?: () => void;
  onRefreshRooms?: () => void;
  onLogin?: (email: string, pass: string) => Promise<any>;
  onRegister?: (name: string, email: string, pass: string) => Promise<any>;
  onLogout?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomId,
  activeUsers,
  userRooms,
  authUser,
  onStartShare,
  onStopShare,
  onSelectSavedRoom,
  onUnloadWorkspace,
  onRefreshRooms,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'saved' | 'auth'>('share');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Input states
  const [customRoomTitle, setCustomRoomTitle] = useState('MindMap Team Workspace');
  const [copied, setCopied] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Join Room by ID State
  const [joinInputRoomId, setJoinInputRoomId] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const extractRoomId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.includes('room=')) {
      try {
        const urlObj = new URL(trimmed);
        const param = urlObj.searchParams.get('room');
        if (param) return param.trim();
      } catch (e) {
        const match = trimmed.match(/room=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) return match[1];
      }
    }
    return trimmed;
  };

  const handleJoinRoomById = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setJoinError(null);
    const cleanId = extractRoomId(joinInputRoomId);
    if (!cleanId) {
      setJoinError('Please enter a valid Room ID or Share Link URL');
      return;
    }
    if (onSelectSavedRoom) {
      onSelectSavedRoom(cleanId);
      setActiveTab('share');
      setJoinInputRoomId('');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && onRefreshRooms) {
      onRefreshRooms();
    }
  }, [isOpen, activeTab, onRefreshRooms]);

  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
      setShareUrl(url);

      QRCode.toDataURL(url, { margin: 1, width: 180 })
        .then((dataUrl) => setQrCodeUrl(dataUrl))
        .catch((err) => console.error('Failed to generate QR code', err));
    } else {
      setShareUrl('');
      setQrCodeUrl('');
    }
  }, [roomId]);

  if (!isOpen || !mounted) return null;

  const handleCopyLink = (targetUrl?: string, targetRoomId?: string) => {
    const urlToCopy = targetUrl || shareUrl;
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    if (targetRoomId) {
      setCopiedRoomId(targetRoomId);
      setTimeout(() => setCopiedRoomId(null), 2500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCreateRoomClick = async () => {
    try {
      setIsCreating(true);
      await onStartShare(customRoomTitle);
    } catch (err) {
      console.error('Failed to start share session:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login' && onLogin) {
        await onLogin(authEmail, authPassword);
      } else if (authMode === 'register' && onRegister) {
        await onRegister(authName, authEmail, authPassword);
      }
      setActiveTab('share');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25 shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Real-Time Team Collaboration</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Multi-user live sync backed by MongoDB Atlas & WSS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-950/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'share'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{roomId ? 'Active Room' : 'New Room'}</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span>Saved Workspaces ({userRooms.length})</span>
            </button>
          </div>

          {/* User Auth Status */}
          <div className="flex items-center space-x-2">
            {authUser && !authUser.isGuest ? (
              <div className="flex items-center space-x-2.5 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">{authUser.name}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign Out & Unload Session"
                    className="text-rose-400 hover:text-rose-300 ml-1 p-1 hover:bg-rose-500/10 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setActiveTab('auth');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-cyan-300 flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: Share / Create Room View */}
        {activeTab === 'share' && (
          <>
            {!roomId ? (
              /* Create Room State */
              <div className="py-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Workspace / Room Name</span>
                  </label>
                  <input
                    type="text"
                    value={customRoomTitle}
                    onChange={(e) => setCustomRoomTitle(e.target.value)}
                    placeholder="e.g. Q4 Product Strategy Mindmap"
                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>🔒 Local-First by Default</span>
                  </p>
                  <p className="text-slate-400">
                    Your canvas stays private in browser storage. Clicking below creates a shared global room on MongoDB Atlas so team members can edit live!
                  </p>
                </div>

                <button
                  onClick={handleCreateRoomClick}
                  disabled={isCreating}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 font-black shadow-xl shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Creating Global Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create & Join Live Team Workspace</span>
                    </>
                  )}
                </button>

                {/* Join Existing Workspace Group by Room ID / Share Link */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Or Join Group Workspace by Room ID</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Pasted Link or ID</span>
                  </div>

                  <form onSubmit={handleJoinRoomById} className="flex gap-2">
                    <input
                      type="text"
                      value={joinInputRoomId}
                      onChange={(e) => setJoinInputRoomId(e.target.value)}
                      placeholder="Paste Room ID (e.g. room_mindmap_...) or full share URL"
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition shrink-0 shadow-md cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Join Room</span>
                    </button>
                  </form>
                  {joinError && <p className="text-xs text-rose-400">{joinError}</p>}
                </div>
              </div>
            ) : (
              /* Active Room State */
              <div className="space-y-6">
                {/* Live Indicator Bar */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80">
                  <div className="flex items-center space-x-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">Live Sync Active</span>
                  </div>
                  {onStopShare && (
                    <button
                      onClick={onStopShare}
                      className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                      title="Unload active room & return to local private canvas"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Unload Workspace</span>
                    </button>
                  )}
                </div>

                {/* Guest read-only notice — collaborative graphs are login-gated for edits */}
                {(!authUser || (authUser as any).isGuest) && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-300">Login required to edit</p>
                      <p className="text-slate-300 leading-relaxed">This collaborative graph is <span className="font-bold text-amber-300">read-only</span> for guests. You can view, pan and zoom, but changes are blocked until you login. Logs are also per-graph and visible only after login.</p>
                    </div>
                  </div>
                )}

                {/* Share Link Input */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <LinkIcon className="w-4 h-4 text-cyan-400" />
                    <span>Collaborative Share Link</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-cyan-300 font-mono focus:outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopyLink()}
                      className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* QR Code & Active Users Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* QR Code */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2.5">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Room QR Code" className="w-32 h-32 rounded-xl bg-white p-1.5" />
                    ) : (
                      <div className="w-32 h-32 bg-slate-900 rounded-xl flex items-center justify-center text-slate-600">
                        <QrCode className="w-10 h-10" />
                      </div>
                    )}
                    <span className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Scan on Mobile Device</span>
                    </span>
                  </div>

                  {/* Active Users */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Online Collaborators ({activeUsers.length})</span>
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">Real-time</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[130px] pr-1">
                      {activeUsers.length === 0 ? (
                        <div className="text-xs text-slate-500 italic py-4 text-center">
                          Waiting for team members to join link...
                        </div>
                      ) : (
                        activeUsers.map((u) => (
                          <div key={u.socketId} className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-slate-950 shrink-0"
                                style={{ backgroundColor: u.color || '#00f2fe' }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-slate-200 truncate font-semibold">{u.name}</span>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Exit / Unload Room Option */}
                {onStopShare && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={onStopShare}
                      className="w-full py-3.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer shadow-md"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Unload Active Room & Return to Private Local Storage</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: Saved Workspaces List */}
        {activeTab === 'saved' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">Your MongoDB Workspaces</h4>
              <button
                onClick={() => {
                  if (onUnloadWorkspace) onUnloadWorkspace();
                  setActiveTab('share');
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:from-cyan-300 hover:to-indigo-400 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Workspace</span>
              </button>
            </div>

            {/* Quick Join by Room ID Form */}
            <form onSubmit={handleJoinRoomById} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex gap-2">
              <input
                type="text"
                value={joinInputRoomId}
                onChange={(e) => setJoinInputRoomId(e.target.value)}
                placeholder="Enter Room ID or Share URL to join..."
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Join</span>
              </button>
            </form>
            {joinError && <p className="text-xs text-rose-400 -mt-2">{joinError}</p>}

            {userRooms.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <FolderKanban className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">No saved cloud workspaces yet.</p>
                <p className="text-xs text-slate-400">Create a room or login to save your workspaces permanently.</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {userRooms.map((room) => {
                  const itemUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomId}`;
                  const isCurrent = room.roomId === roomId;

                  return (
                    <div
                      key={room._id}
                      className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white truncate">{room.title}</span>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                              Active Loaded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          ID: <span className="text-cyan-300 font-mono">{room.roomId}</span> • Last active: {new Date(room.lastActiveAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleCopyLink(itemUrl, room.roomId)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-200 rounded-xl flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
                        >
                          {copiedRoomId === room.roomId ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-cyan-400" />
                          )}
                          <span>Copy</span>
                        </button>

                        {/* If clicked on currently loaded workspace, clicking it again UNLOADS it! */}
                        {isCurrent ? (
                          <button
                            onClick={() => {
                              if (onUnloadWorkspace) onUnloadWorkspace();
                            }}
                            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                            title="Click to unload workspace and return to local canvas"
                          >
                            <UnloadIcon className="w-4 h-4" />
                            <span>Unload</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (onSelectSavedRoom) onSelectSavedRoom(room.roomId);
                              setActiveTab('share');
                            }}
                            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-cyan-500/20 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Load</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Auth (Login / Register) View */}
        {activeTab === 'auth' && (
          <div className="py-2 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    authMode === 'login' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    authMode === 'register' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs sm:text-sm text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-200">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Himesh Satyam"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-200">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-200">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-sm sm:text-base shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In to Account</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
