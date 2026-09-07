import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../lib/socketClient';

export interface ActiveUser {
  socketId: string;
  name: string;
  avatar?: string;
  color: string;
  joinedAt: string;
}

export interface PeerCursor {
  socketId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface SavedRoom {
  _id: string;
  roomId: string;
  toolId: string;
  title: string;
  ownerId: string;
  accessRole: string;
  dataState: any;
  version: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGuest?: boolean;
}

export interface UseCollaborativeSessionOptions {
  toolId: string;
  initialRoomId?: string | null;
  onRemoteStateChange?: (dataState: any) => void;
  onRemoteNodeChange?: (node: any) => void;
}

export function useCollaborativeSession({
  toolId,
  initialRoomId = null,
  onRemoteStateChange,
  onRemoteNodeChange,
}: UseCollaborativeSessionOptions) {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [peerCursors, setPeerCursors] = useState<Map<string, PeerCursor>>(new Map());
  const [roomTitle, setRoomTitle] = useState<string>('Shared Workspace');
  const [accessRole, setAccessRole] = useState<'public_edit' | 'public_view'>('public_edit');
  const [userRooms, setUserRooms] = useState<SavedRoom[]>([]);

  // Auth User State
  const [authUser, setAuthUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{ name: string; color: string }>({
    name: 'Collaborator',
    color: '#00f2fe',
  });

  const socketRef = useRef(getSocket());

  // Restore Auth Token & User from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('toolip_auth_token');
      const savedUserStr = localStorage.getItem('toolip_user_data');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        setAuthUser(parsed);
        setToken(savedToken);
      }
    } catch (e) {
      console.warn('Failed to restore auth from localStorage', e);
    }
  }, []);

  // Generate random avatar color & user display name
  useEffect(() => {
    const colors = ['#00f2fe', '#ff007f', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ff5722'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const displayName = authUser?.name || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
    setCurrentUser({ name: displayName, color: randomColor });
  }, [authUser]);

  // Fetch initial room data from backend when roomId is set
  const fetchRoomData = useCallback(async (targetRoomId: string) => {
    setIsHydrating(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/rooms/${targetRoomId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.room) {
          setRoomTitle(json.room.title || 'Shared Workspace');
          setAccessRole(json.room.accessRole || 'public_edit');
          if (onRemoteStateChange) {
            onRemoteStateChange(json.room.dataState || null);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch room state from backend server', e);
    } finally {
      setIsHydrating(false);
    }
  }, [onRemoteStateChange]);

  const trackRoomIdLocally = (id: string) => {
    if (!id || typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem('toolip_my_room_ids');
      const list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('toolip_my_room_ids', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to track room ID locally', e);
    }
  };

  // Fetch user's saved rooms from backend
  const fetchUserRooms = useCallback(async (ownerId?: string) => {
    const targetOwner = ownerId || authUser?.id || 'guest';
    let localRoomIdsStr = '';
    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('toolip_my_room_ids');
        const list: string[] = existing ? JSON.parse(existing) : [];
        localRoomIdsStr = list.join(',');
      }
    } catch (e) {
      // ignore
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/rooms/user/my-rooms?ownerId=${targetOwner}&toolId=${toolId}&roomIds=${localRoomIdsStr}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.rooms)) {
          setUserRooms(json.rooms);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user rooms', e);
    }
  }, [authUser, toolId]);

  useEffect(() => {
    fetchUserRooms();
  }, [fetchUserRooms]);

  // Restore active room on initial mount or page refresh (F5)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('room');
      const savedActiveRoom = localStorage.getItem(`toolip_active_room_${toolId}`);
      const targetRoom = urlParam || savedActiveRoom || initialRoomId;
      if (targetRoom) {
        setRoomId(targetRoom);
        trackRoomIdLocally(targetRoom);
      }
    }
  }, [toolId, initialRoomId]);

  // Sync active room changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (roomId) {
        localStorage.setItem(`toolip_active_room_${toolId}`, roomId);
        trackRoomIdLocally(roomId);
      } else {
        localStorage.removeItem(`toolip_active_room_${toolId}`);
      }
    }
  }, [roomId, toolId]);

  // Connect socket and join room
  useEffect(() => {
    if (!roomId) {
      setIsCollaborating(false);
      setActiveUsers([]);
      setPeerCursors(new Map());
      setIsHydrating(false);
      return;
    }

    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { roomId, user: currentUser });
    setIsCollaborating(true);

    fetchRoomData(roomId);

    const handlePresenceUpdate = ({ activeUsers: rawUsers }: { activeUsers: ActiveUser[] }) => {
      if (!Array.isArray(rawUsers)) return;
      const uniqueUsers: ActiveUser[] = [];
      const seenNames = new Set<string>();

      for (const u of rawUsers) {
        const key = (u.name || u.socketId).toLowerCase().trim();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          uniqueUsers.push(u);
        }
      }
      setActiveUsers(uniqueUsers);
    };

    const handleStateUpdated = ({ dataState, senderSocketId }: { dataState: any; senderSocketId: string }) => {
      if (senderSocketId !== socket.id && onRemoteStateChange) {
        onRemoteStateChange(dataState);
      }
    };

    const handleNodeUpdated = ({ node, senderSocketId }: { node: any; senderSocketId: string }) => {
      if (senderSocketId !== socket.id && onRemoteNodeChange) {
        onRemoteNodeChange(node);
      }
    };

    const handleCursorUpdated = ({ socketId, name, color, x, y }: PeerCursor) => {
      if (socketId !== socket.id) {
        setPeerCursors((prev) => {
          const next = new Map(prev);
          next.set(socketId, { socketId, name, color, x, y });
          return next;
        });
      }
    };

    const handlePeerLeft = ({ socketId }: { socketId: string }) => {
      setPeerCursors((prev) => {
        const next = new Map(prev);
        next.delete(socketId);
        return next;
      });
    };

    socket.on('room_presence_update', handlePresenceUpdate);
    socket.on('state_updated', handleStateUpdated);
    socket.on('node_updated', handleNodeUpdated);
    socket.on('cursor_updated', handleCursorUpdated);
    socket.on('peer_left', handlePeerLeft);

    return () => {
      socket.off('room_presence_update', handlePresenceUpdate);
      socket.off('state_updated', handleStateUpdated);
      socket.off('node_updated', handleNodeUpdated);
      socket.off('cursor_updated', handleCursorUpdated);
      socket.off('peer_left', handlePeerLeft);
    };
  }, [roomId, currentUser, fetchRoomData, onRemoteStateChange, onRemoteNodeChange]);

  // Broadcast handlers
  const broadcastStateUpdate = useCallback((dataState: any) => {
    if (!roomId) return;
    const socket = socketRef.current;
    if (socket.connected) {
      socket.emit('state_update', { roomId, toolId, dataState });
    }
  }, [roomId, toolId]);

  const broadcastNodeUpdate = useCallback((node: any) => {
    if (!roomId) return;
    const socket = socketRef.current;
    if (socket.connected) {
      socket.emit('node_update', { roomId, node });
    }
  }, [roomId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
    if (!roomId) return;
    const socket = socketRef.current;
    if (socket.connected) {
      socket.emit('cursor_move', { roomId, x, y });
    }
  }, [roomId]);

  // Create Room action with custom title and ownerId
  const createSharedRoom = useCallback(async (dataState: any, customTitle?: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const ownerId = authUser?.id || 'guest';
      const title = customTitle?.trim() || `${toolId.toUpperCase()} Workspace`;

      const res = await fetch(`${backendUrl}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          title,
          dataState,
          ownerId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.roomId) {
          trackRoomIdLocally(json.roomId);
          setRoomId(json.roomId);
          setRoomTitle(json.room?.title || title);
          fetchUserRooms(ownerId);
          return json.roomId;
        }
      }
      throw new Error('Failed to create room on server');
    } catch (err: any) {
      console.error('Error creating shared room:', err);
      throw err;
    }
  }, [toolId, authUser, fetchUserRooms]);

  const unloadWorkspace = useCallback(() => {
    setRoomId(null);
    setIsCollaborating(false);
    setActiveUsers([]);
    setPeerCursors(new Map());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`toolip_active_room_${toolId}`);
      const cleanUrl = window.location.pathname;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    }
    fetchUserRooms();
  }, [toolId, fetchUserRooms]);

  // Auth actions
  const loginUser = async (email: string, password: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');

    setToken(json.token);
    setAuthUser(json.user);
    localStorage.setItem('toolip_auth_token', json.token);
    localStorage.setItem('toolip_user_data', JSON.stringify(json.user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('toolip_auth_change'));
    }
    fetchUserRooms(json.user.id);
    return json.user;
  };

  const registerUser = async (name: string, email: string, password: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');

    setToken(json.token);
    setAuthUser(json.user);
    localStorage.setItem('toolip_auth_token', json.token);
    localStorage.setItem('toolip_user_data', JSON.stringify(json.user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('toolip_auth_change'));
    }
    fetchUserRooms(json.user.id);
    return json.user;
  };

  const logoutUser = useCallback(() => {
    setToken(null);
    setAuthUser(null);
    localStorage.removeItem('toolip_auth_token');
    localStorage.removeItem('toolip_user_data');
    unloadWorkspace();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('toolip_auth_change'));
    }
    fetchUserRooms('guest');
  }, [unloadWorkspace, fetchUserRooms]);

  return {
    roomId,
    setRoomId,
    isCollaborating,
    isHydrating,
    setIsHydrating,
    activeUsers,
    peerCursors,
    roomTitle,
    accessRole,
    currentUser,
    userRooms,
    authUser,
    token,
    fetchUserRooms,
    loginUser,
    registerUser,
    logoutUser,
    unloadWorkspace,
    broadcastStateUpdate,
    broadcastNodeUpdate,
    broadcastCursor,
    createSharedRoom,
  };
}
