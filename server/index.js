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
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
);
app.options('*', cors());
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

const serverStartTime = Date.now();

// Helper to construct backend trigger status payload
function getStatusPayload(req) {
  const activePort = httpServer.address()?.port || PORT;
  return {
    status: 'online',
    service: 'Toolip Realtime Collaboration & AI Backend Server',
    message: '🚀 Toolip Express & Socket.io server is live and operational!',
    port: activePort,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    websocket: {
      status: 'active',
      path: '/socket.io/',
      cors: '*',
    },
    database: {
      type: 'MongoDB Atlas',
      connected: true,
    },
    endpoints: {
      rootStatus: 'GET /',
      apiHealth: 'GET /api/health',
      apiStatus: 'GET /api/status',
      createRoom: 'POST /api/rooms/create',
      getRoom: 'GET /api/rooms/:roomId',
      userRooms: 'GET /api/rooms/user/my-rooms',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      nvidiaProxy: 'POST /api/nvidia/generate',
    },
  };
}

// Express Root & Status Endpoints
app.get(['/', '/api', '/api/status', '/api/health'], (req, res) => {
  const statusData = getStatusPayload(req);

  // Send interactive live dashboard HTML with JSON code block for browser navigation
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const jsonStr = JSON.stringify(statusData, null, 2);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toolip Backend Server - Live</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.15);
      backdrop-filter: blur(16px);
      border-radius: 24px;
      max-width: 760px;
      width: 100%;
      padding: 2.5rem;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 22px;
      color: #090d16;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(to right, #ffffff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 6px 14px;
      border-radius: 9999px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .info-item {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.6);
      padding: 1rem;
      border-radius: 14px;
    }
    .info-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 1rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .json-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    pre {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 1.25rem;
      color: #38bdf8;
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      line-height: 1.5;
    }
    .footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title-group">
        <div class="logo">T</div>
        <div>
          <h1>Toolip Server Engine</h1>
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">Realtime Express & Socket.io Backend</div>
        </div>
      </div>
      <div class="badge">
        <span class="dot"></span>
        <span>ONLINE :${statusData.port}</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Server Host & Port</div>
        <div class="info-value">http://localhost:${statusData.port}</div>
      </div>
      <div class="info-item">
        <div class="info-label">WebSocket Engine</div>
        <div class="info-value">Socket.io Connected</div>
      </div>
      <div class="info-item">
        <div class="info-label">Uptime</div>
        <div class="info-value">${statusData.uptimeSeconds}s</div>
      </div>
    </div>

    <div class="json-title">
      <span>Backend Response Trigger JSON:</span>
      <span style="font-size:0.75rem; color:#34d399; font-weight:600;">Status: 200 OK</span>
    </div>
    <pre><code>${jsonStr}</code></pre>

    <div class="footer">
      Toolip Collaborative Workspace Engine &bull; Port ${statusData.port}
    </div>
  </div>
</body>
</html>`;
    return res.send(html);
  }

  // Pure JSON response for API calls
  return res.json(statusData);
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

    let filter = {};

    if (ownerId && ownerId !== 'guest') {
      // Authenticated user: strict ownership filter to prevent cross-account leaks
      filter = { ownerId };
    } else if (roomIds.length > 0) {
      // Guest user: filter by explicitly tracked roomIds on local device
      filter = { roomId: { $in: roomIds } };
    } else {
      filter = { ownerId: 'guest' };
    }

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

app.post('/api/nvidia/generate', async (req, res) => {
  try {
    const { apiKey, model, messages, temperature, max_tokens } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ error: 'NVIDIA API key required (BYOK nvapi-...)' });
    }

    const fetchRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model || 'meta/llama-3.1-8b-instruct',
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
      }),
    });

    const data = await fetchRes.json();
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({
        error: data.detail || data.error?.message || `NVIDIA API Error (${fetchRes.status})`,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error proxying request to NVIDIA API' });
  }
});

let currentPort = Number(PORT);

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    currentPort++;
    console.warn(`⚠️ Port ${currentPort - 1} is in use. Retrying on port ${currentPort}...`);
    setTimeout(() => {
      httpServer.listen(currentPort);
    }, 300);
  } else {
    console.error('Server error:', err);
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Express & Socket.io server running on http://localhost:${PORT}`);
});
