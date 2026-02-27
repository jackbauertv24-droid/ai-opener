const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration: Where to forward requests
// Change these values or set via environment variables
const TARGET_HOST = process.env.TARGET_HOST || 'localhost';
const TARGET_PORT = process.env.TARGET_PORT || '8080';
const TARGET_URL = `http://${TARGET_HOST}:${TARGET_PORT}`;

console.log(`🚀 AI Opener Router starting...`);
console.log(`   Listening on port: ${PORT}`);
console.log(`   Forwarding to: ${TARGET_URL}`);

// Create proxy middleware
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix if needed
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error: ${err.message}`);
    res.status(500).json({
      error: 'Backend service unavailable',
      message: err.message,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`➡️  ${req.method} ${req.path} → ${TARGET_URL}`);
  },
  onProxyRes: (proxyReq, proxyRes, req, res) => {
    console.log(`⬅️  ${req.path} - Status: ${proxyRes.statusCode}`);
  },
};

// Route all /api/* requests to the target
app.use('/api', createProxyMiddleware(proxyOptions));

// Health check endpoint (not proxied)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-opener-router',
    port: PORT,
    target: TARGET_URL,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'ai-opener-router',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/* (proxied)',
    },
    target: TARGET_URL,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server ready on http://localhost:${PORT}`);
});
