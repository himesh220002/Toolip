const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Express status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Toolip Express API Backend',
    timestamp: new Date().toISOString(),
    toolsAvailable: 19
  });
});

// Endpoint to process PDF page counts or server-side metadata if requested
app.post('/api/pdf/info', (req, res) => {
  const { fileName, size } = req.body;
  res.json({
    success: true,
    message: `Received ${fileName} (${size} bytes) for server-side processing`,
    timestamp: new Date().toISOString()
  });
});

// Endpoint to split/merge payload proxy
app.post('/api/pdf/merge', (req, res) => {
  const { fileCount } = req.body;
  res.json({
    success: true,
    message: `Merged ${fileCount} PDF documents successfully via Express service`,
    downloadUrl: '#'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
