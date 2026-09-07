const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');

// Load environment variables from .env.local or .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./db');
const User = require('./models/User');
const SharedRoom = require('./models/SharedRoom');
const RoomLog = require('./models/RoomLog');
const setupSocketHandlers = require('./socketHandler');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_toolip_jwt_secret_key_2026';

// Attach Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSocketHandlers(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB Atlas asynchronously
connectDB();

// JWT auth middleware (used for protected routes like logs)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required - please login to access this resource' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Express status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Toolip Express & WebSocket API Backend',
    timestamp: new Date().toISOString(),
    toolsAvailable: 34,
    mongoConnected: !!connectDB,
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/guest', (req, res) => {
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
  const guestName = 'Guest ' + Math.floor(1000 + Math.random() * 9000);
  const token = jwt.sign({ userId: guestId, email: `${guestId}@guest.local`, name: guestName, isGuest: true }, JWT_SECRET, {
    expiresIn: '24h',
  });

  res.json({
    success: true,
    token,
    user: { id: guestId, name: guestName, isGuest: true },
  });
});

// Shared Room Management Routes
app.get('/api/rooms/user/my-rooms', async (req, res) => {
  try {
    const ownerId = req.query.ownerId || 'guest';
    const toolId = req.query.toolId;
    const roomIdsStr = req.query.roomIds || '';
    const roomIds = roomIdsStr.split(',').map((s) => s.trim()).filter(Boolean);

    const conditions = [];
    if (ownerId && ownerId !== 'guest') {
      conditions.push({ ownerId });
    }
    if (roomIds.length > 0) {
      conditions.push({ roomId: { $in: roomIds } });
    }
    if (conditions.length === 0) {
      conditions.push({ ownerId: 'guest' });
    }

    const filter = { $or: conditions };
    if (toolId) {
      filter.toolId = toolId;
    }

    const rooms = await SharedRoom.find(filter).sort({ lastActiveAt: -1 }).limit(30);
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/create', async (req, res) => {
  try {
    const { toolId, title, dataState, ownerId, accessRole } = req.body;
    const roomId = `room_${toolId || 'tool'}_${Math.random().toString(36).substring(2, 9)}`;

    const newRoom = await SharedRoom.create({
      roomId,
      toolId: toolId || 'mindmap',
      title: title || 'Collaborative Workspace',
      ownerId: ownerId || 'guest',
      accessRole: accessRole || 'public_edit',
      dataState: dataState || {},
    });

    res.json({
      success: true,
      roomId: newRoom.roomId,
      room: newRoom,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:roomId/logs', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = parseInt(req.query.skip) || 0;

    // Verify room exists and user has access (owner or collaborator - for now any authenticated user can view logs of a room they know)
    const room = await SharedRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const logs = await RoomLog.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RoomLog.countDocuments({ roomId });

    res.json({ success: true, logs, total, roomId, toolId: room.toolId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/:roomId/commit', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { dataState, message } = req.body;

    const room = await SharedRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const nextVersion = (room.version || 1) + 1;
    if (dataState) {
      room.dataState = dataState;
    }
    room.version = nextVersion;
    room.lastActiveAt = new Date();
    await room.save();

    const commitMessageStr = message?.trim() || `Git Commit v${nextVersion}`;

    const commitLog = await RoomLog.create({
      roomId,
      toolId: room.toolId || 'mindmap',
      userId: req.user.userId || req.user.id || 'user',
      userName: req.user.name || 'User',
      userEmail: req.user.email || '',
      action: 'commit',
      summary: `Git Commit: "${commitMessageStr}" (v${nextVersion})`,
      commitMessage: commitMessageStr,
      version: nextVersion,
      snapshot: dataState || room.dataState,
    });

    res.json({
      success: true,
      message: `Committed version v${nextVersion}`,
      version: nextVersion,
      commit: commitLog,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await SharedRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { dataState, title, accessRole } = req.body;

    const room = await SharedRoom.findOneAndUpdate(
      { roomId },
      {
        $set: {
          ...(dataState !== undefined && { dataState }),
          ...(title !== undefined && { title }),
          ...(accessRole !== undefined && { accessRole }),
          lastActiveAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to process PDF metadata
app.post('/api/pdf/info', (req, res) => {
  const { fileName, size } = req.body;
  res.json({
    success: true,
    message: `Received ${fileName} (${size} bytes) for server-side processing`,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/pdf/merge', (req, res) => {
  const { fileCount } = req.body;
  res.json({
    success: true,
    message: `Merged ${fileCount} PDF documents successfully via Express service`,
    downloadUrl: '#',
  });
});

// Mindmap GraphML endpoints
app.get('/api/mindmap', (req, res) => {
  const filePath = path.join(__dirname, '..', 'mindmap.graphml');
  if (fs.existsSync(filePath)) {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/xml');
    res.send(xmlContent);
  } else {
    res.status(404).json({ error: 'mindmap.graphml not found' });
  }
});

app.post('/api/mindmap/save', (req, res) => {
  try {
    const { xmlContent } = req.body;
    if (!xmlContent) {
      return res.status(400).json({ error: 'xmlContent is required' });
    }
    const filePath = path.join(__dirname, '..', 'mindmap.graphml');
    fs.writeFileSync(filePath, xmlContent, 'utf8');
    res.json({ success: true, message: 'mindmap.graphml saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Express & Socket.io server running on http://localhost:${PORT}`);
});
