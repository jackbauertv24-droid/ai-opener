const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error

// Configuration: Where to forward requests
// Change these values or set via environment variables
const TARGET_PROTOCOL = process.env.TARGET_PROTOCOL || 'https';
const TARGET_HOST = process.env.TARGET_HOST || 'localhost';
const TARGET_PORT = process.env.TARGET_PORT || (TARGET_PROTOCOL === 'https' ? '443' : '8080');
const TARGET_URL = `${TARGET_PROTOCOL}://${TARGET_HOST}:${TARGET_PORT}`;

// Logging utility with levels
const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[LOG_LEVEL.toLowerCase()] || levels.info;

const log = {
  debug: (msg) => currentLevel <= levels.debug && console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
  info: (msg) => currentLevel <= levels.info && console.log(`[INFO]  ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => currentLevel <= levels.warn && console.warn(`[WARN]  ${new Date().toISOString()} - ${msg}`),
  error: (msg) => currentLevel <= levels.error && console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

log.info(`🚀 AI Opener Router starting...`);
log.info(`   Listening on port: ${PORT}`);
log.info(`   Forwarding to: ${TARGET_URL}`);
log.info(`   Log level: ${LOG_LEVEL}`);

// Create proxy middleware
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  // Remove X-Forwarded-For header to avoid leaking original client IP
  headers: {
    'X-Forwarded-For': '',
  },
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix if needed
  },
  onError: (err, req, res) => {
    log.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      error: 'Backend service unavailable',
      message: err.message,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Remove X-Forwarded-For header if it exists
    if (proxyReq.getHeader('x-forwarded-for')) {
      proxyReq.setHeader('x-forwarded-for', '');
    }
    
    const method = req.method;
    const path = req.path;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    log.debug(`Incoming request: ${method} ${path} from ${clientIp}`);
    log.info(`➡️  ${method} ${path} → ${TARGET_URL}`);
    
    // Log request headers (debug level only)
    log.debug(`Request headers: ${JSON.stringify(req.headers)}`);
  },
  onProxyRes: (proxyReq, proxyRes, req, res) => {
    const path = req.path;
    const status = proxyRes.statusCode;
    
    log.info(`⬅️  ${path} - Status: ${status}`);
    log.debug(`Response headers: ${JSON.stringify(proxyRes.headers)}`);
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
