const SharedRoom = require('./models/SharedRoom');

// In-memory debounced save cache
const pendingSaves = new Map();

const setupSocketHandlers = (io) => {
  // Store active user sessions per room: roomId -> Map(socketId -> userInfo)
  const roomUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client Connected to Socket: ${socket.id}`);

    // Join room
    socket.on('join_room', async ({ roomId, user }) => {
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

      const userId = user?.id || user?.email || user?.name || `user-${socket.id.slice(0, 4)}`;
      const userInfo = {
        socketId: socket.id,
        userId,
        name: user?.name || `Collaborator-${socket.id.slice(0, 4)}`,
        avatar: user?.avatarUrl || '',
        color: user?.color || '#00f2fe',
        joinedAt: new Date().toISOString(),
      };

      socket.userInfo = userInfo;

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

      console.log(`👤 ${userInfo.name} joined room ${roomId} (${activeUsers.length} online)`);
    });

    // Real-time graph state update event
    socket.on('state_update', async ({ roomId, toolId, dataState }) => {
      if (!roomId || !dataState) return;

      // Broadcast immediately to all other participants in the room
      socket.to(roomId).emit('state_updated', {
        dataState,
        senderSocketId: socket.id,
        senderName: socket.userInfo?.name || 'Peer',
        timestamp: Date.now(),
      });

      // Debounced write to MongoDB Atlas (1000ms delay) to prevent database hammer during rapid drags
      if (pendingSaves.has(roomId)) {
        clearTimeout(pendingSaves.get(roomId));
      }

      const timer = setTimeout(async () => {
        try {
          await SharedRoom.findOneAndUpdate(
            { roomId },
            {
              $set: {
                dataState,
                toolId: toolId || 'mindmap',
                lastActiveAt: new Date(),
              },
              $inc: { version: 1 },
            },
            { upsert: true, new: true }
          );
          pendingSaves.delete(roomId);
        } catch (err) {
          console.error(`❌ Error saving room ${roomId} state to MongoDB:`, err.message);
        }
      }, 1000);

      pendingSaves.set(roomId, timer);
    });

    // Node specific delta update (e.g. dragging a single node or editing text)
    socket.on('node_update', ({ roomId, node }) => {
      if (!roomId || !node) return;
      socket.to(roomId).emit('node_updated', {
        node,
        senderSocketId: socket.id,
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
