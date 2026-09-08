const SharedRoom = require('./models/SharedRoom');
const RoomLog = require('./models/RoomLog');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_toolip_jwt_secret_key_2026';

// In-memory debounced save cache
const pendingSaves = new Map();

// Helper to verify token and extract user
function getUserFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.userId || decoded.id || decoded.sub;
    if (!uid) return null;
    return {
      id: uid,
      userId: uid,
      name: decoded.name || 'User',
      email: decoded.email || '',
      isGuest: !!decoded.isGuest,
    };
  } catch (e) {
    return null;
  }
}

function canEditRoom(roomId, userInfo) {
  // Private offline mode (no roomId) is always editable
  if (!roomId || !roomId.startsWith('room_')) return true;
  if (!userInfo) return false;
  if (userInfo.isGuest) return false;
  const uid = userInfo.userId || userInfo.id;
  if (!uid || String(uid).startsWith('guest_') || String(uid).startsWith('Guest')) return false;
  return true;
}

async function createLogEntry({ roomId, toolId, userInfo, action, summary, nodeId, version }) {
  try {
    await RoomLog.create({
      roomId,
      toolId: toolId || 'mindmap',
      userId: String(userInfo?.userId || userInfo?.id || 'guest'),
      userName: userInfo?.name || 'Guest',
      userEmail: userInfo?.email || '',
      action,
      summary: summary || '',
      nodeId: nodeId || null,
      version: version || 1,
    });
  } catch (err) {
    console.error('Failed to create RoomLog', err.message);
  }
}

const setupSocketHandlers = (io) => {
  // Store active user sessions per room: roomId -> Map(socketId -> userInfo)
  const roomUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client Connected to Socket: ${socket.id}`);

    // Join room - now accepts token for auth
    socket.on('join_room', async ({ roomId, user, token }) => {
      // 1) Clean up presence from previous room if socket switched rooms
      if (socket.currentRoomId && socket.currentRoomId !== roomId && roomUsers.has(socket.currentRoomId)) {
        const oldRoomMap = roomUsers.get(socket.currentRoomId);
        oldRoomMap.delete(socket.id);
        if (oldRoomMap.size === 0) {
          roomUsers.delete(socket.currentRoomId);
        } else {
          const oldActiveUsers = Array.from(oldRoomMap.values());
          io.to(socket.currentRoomId).emit('room_presence_update', { activeUsers: oldActiveUsers });
          io.to(socket.currentRoomId).emit('peer_left', { socketId: socket.id });
        }
      }

      socket.join(roomId);
      socket.currentRoomId = roomId;

      // Try to verify token for real identity
      const tokenUser = getUserFromToken(token);
      const effectiveUser = tokenUser || user;

      const userId = tokenUser?.userId || tokenUser?.id || user?.id || user?.email || user?.name || `user-${socket.id.slice(0, 4)}`;
      const isGuest = !tokenUser || tokenUser.isGuest || String(userId).startsWith('guest_') || String(userId).startsWith('Guest');
      const userInfo = {
        socketId: socket.id,
        userId,
        id: userId,
        name: tokenUser?.name || user?.name || `Collaborator-${socket.id.slice(0, 4)}`,
        email: tokenUser?.email || user?.email || '',
        avatar: user?.avatarUrl || '',
        color: user?.color || '#00f2fe',
        joinedAt: new Date().toISOString(),
        isGuest,
        isAuthenticated: !isGuest,
      };

      socket.userInfo = userInfo;
      socket.authToken = token;

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }

      const roomMap = roomUsers.get(roomId);

      // 2) Purge any stale socket entries for the SAME user in this room
      for (const [existingSocketId, existingUser] of roomMap.entries()) {
        const isSameUser =
          existingSocketId === socket.id ||
          (userInfo.userId && existingUser.userId === userInfo.userId) ||
          (userInfo.name && existingUser.name === userInfo.name);

        if (isSameUser) {
          roomMap.delete(existingSocketId);
        }
      }

      roomMap.set(socket.id, userInfo);

      // Deduplicate array values before emitting
      const activeUsers = Array.from(roomMap.values());
      io.to(roomId).emit('room_presence_update', { activeUsers });
      socket.to(roomId).emit('peer_joined', { user: userInfo });

      console.log(`👤 ${userInfo.name} joined room ${roomId} (${activeUsers.length} online) ${userInfo.isGuest ? '(guest)' : '(auth)'}`);
    });

    // Real-time graph state update event
    socket.on('state_update', async ({ roomId, toolId, dataState, token }) => {
      if (!roomId || !dataState) return;

      const clientToken = token || socket.authToken;
      const tokenUser = clientToken ? getUserFromToken(clientToken) : null;
      const effectiveUser = tokenUser || socket.userInfo;
      const canEdit = canEditRoom(roomId, effectiveUser);
      if (!canEdit) {
        socket.emit('edit_denied', { reason: 'login_required', message: 'Please login to edit this collaborative graph' });
        console.log(`🚫 Edit denied for ${socket.userInfo?.name || 'User'} in ${roomId} (guest)`);
        return;
      }

      // Broadcast immediately to all other participants in the room
      socket.to(roomId).emit('state_updated', {
        dataState,
        senderSocketId: socket.id,
        senderName: effectiveUser?.name || socket.userInfo?.name || 'Peer',
        timestamp: Date.now(),
      });

      // Debounced write to MongoDB Atlas (1000ms delay) to prevent database hammer during rapid drags
      if (pendingSaves.has(roomId)) {
        clearTimeout(pendingSaves.get(roomId));
      }

      const timer = setTimeout(async () => {
        try {
          const updated = await SharedRoom.findOneAndUpdate(
            { roomId },
            {
              $set: {
                dataState,
                toolId: toolId || 'mindmap',
                lastActiveAt: new Date(),
              },
              $inc: { version: 1 },
            },
            { upsert: true, new: true, returnDocument: 'after' }
          );
          pendingSaves.delete(roomId);
          // Create audit log for this save
          const logUser = clientToken ? getUserFromToken(clientToken) || socket.userInfo : socket.userInfo;
          await createLogEntry({
            roomId,
            toolId,
            userInfo: logUser,
            action: 'state_save',
            summary: `Graph updated by ${logUser?.name || 'Unknown'}`,
            version: updated?.version || 1,
          });
        } catch (err) {
          console.error(`❌ Error saving room ${roomId} state to MongoDB:`, err.message);
        }
      }, 1000);

      pendingSaves.set(roomId, timer);
    });

    // Node specific delta update (e.g. dragging a single node or editing text)
    socket.on('node_update', ({ roomId, node, token }) => {
      if (!roomId || !node) return;
      const clientToken = token || socket.authToken;
      const tokenUser = clientToken ? getUserFromToken(clientToken) : null;
      const effectiveUser = tokenUser || socket.userInfo;
      if (!canEditRoom(roomId, effectiveUser)) {
        socket.emit('edit_denied', { reason: 'login_required', message: 'Please login to edit this collaborative graph' });
        return;
      }
      socket.to(roomId).emit('node_updated', {
        node,
        senderSocketId: socket.id,
      });
      // Light log for node edits (throttled via client)
      createLogEntry({
        roomId,
        toolId: 'mindmap',
        userInfo: effectiveUser,
        action: 'node_update',
        summary: `Node "${node.text || node.id}" updated`,
        nodeId: node.id,
      });
    });

    // Cursor position sync for live multiplayer feel
    socket.on('cursor_move', ({ roomId, x, y }) => {
      if (!roomId) return;
      socket.to(roomId).emit('cursor_updated', {
        socketId: socket.id,
        name: socket.userInfo?.name || 'Peer',
        color: socket.userInfo?.color || '#00f2fe',
        x,
        y,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const roomId = socket.currentRoomId;
      if (roomId && roomUsers.has(roomId)) {
        const usersMap = roomUsers.get(roomId);
        usersMap.delete(socket.id);

        if (usersMap.size === 0) {
          roomUsers.delete(roomId);
        } else {
          const activeUsers = Array.from(usersMap.values());
          io.to(roomId).emit('room_presence_update', { activeUsers });
          io.to(roomId).emit('peer_left', { socketId: socket.id });
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketHandlers;
