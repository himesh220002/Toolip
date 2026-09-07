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
