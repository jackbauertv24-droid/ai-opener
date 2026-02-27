require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error

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

// Configuration loader - reads all DEST_*_PROTOCOL, DEST_*_HOST, DEST_*_PORT from env
function loadDestinations() {
  const destinations = {};
  
  // Scan environment variables for destination configs
  // Format: DEST_<NAME>_PROTOCOL, DEST_<NAME>_HOST, DEST_<NAME>_PORT
  const envKeys = Object.keys(process.env);
  const destNames = new Set();
  
  // Extract all destination names from env vars
  envKeys.forEach(key => {
    const match = key.match(/^DEST_(.+?)_(PROTOCOL|HOST|PORT)$/);
    if (match) {
      destNames.add(match[1]);
    }
  });
  
  // Build destination objects
  destNames.forEach(name => {
    const protocol = process.env[`DEST_${name}_PROTOCOL`] || 'https';
    const host = process.env[`DEST_${name}_HOST`] || 'localhost';
    const port = process.env[`DEST_${name}_PORT`] || (protocol === 'https' ? '443' : '8080');
    
    destinations[name.toLowerCase()] = {
      name: name,
      protocol,
      host,
      port,
      url: `${protocol}://${host}:${port}`,
    };
  });
  
  return destinations;
}

const destinations = loadDestinations();

log.info('🚀 AI Opener Router starting...');
log.info(`   Listening on port: ${PORT}`);
log.info(`   Log level: ${LOG_LEVEL}`);
log.info(`   Loaded destinations: ${Object.keys(destinations).join(', ') || '(none)'}`);

// Create a proxy middleware factory for dynamic routing
function createRoutingProxy() {
  return (req, res, next) => {
    const path = req.path;
    const pathParts = path.split('/').filter(p => p); // Remove empty strings
    
    if (pathParts.length === 0) {
      return next();
    }
    
    // Extract destination key from first path segment
    const destKey = pathParts[0].toLowerCase();
    
    // Check if we have a destination for this key
    if (!destinations[destKey]) {
      log.warn(`Unknown destination key: ${destKey}. Available: ${Object.keys(destinations).join(', ')}`);
      return res.status(404).json({
        error: 'Unknown destination',
        message: `No destination configured for key: ${destKey}`,
        available: Object.keys(destinations),
      });
    }
    
    const dest = destinations[destKey];
    
    // Reconstruct the path without the first segment (destination key)
    const rewrittenPath = '/' + pathParts.slice(1).join('/');
    
    log.debug(`Routing: ${req.method} ${path} → ${dest.url}${rewrittenPath}`);
    log.info(`➡️  ${req.method} ${path} → ${dest.url}${rewrittenPath} [key: ${destKey}]`);
    
    // Create proxy options for this specific destination
    const proxyOptions = {
      target: dest.url,
      changeOrigin: true,
      // Remove X-Forwarded-For header to avoid leaking original client IP
      headers: {
        'X-Forwarded-For': '',
      },
      pathRewrite: {
        // Rewrite the full path to remove the destination key
        [`^/${pathParts[0]}`]: '',
      },
      onError: (err, request, response) => {
        log.error(`Proxy error for ${destKey}: ${err.message}`);
        response.status(500).json({
          error: 'Backend service unavailable',
          destination: destKey,
          message: err.message,
        });
      },
      onProxyReq: (proxyReq, request, response) => {
        // Remove X-Forwarded-For header if it exists
        if (proxyReq.getHeader('x-forwarded-for')) {
          proxyReq.setHeader('x-forwarded-for', '');
        }
        
        const clientIp = request.ip || request.connection.remoteAddress;
        log.debug(`Incoming request: ${request.method} ${request.path} from ${clientIp}`);
        log.debug(`Request headers: ${JSON.stringify(request.headers)}`);
      },
      onProxyRes: (proxyReq, proxyRes, request, response) => {
        log.info(`⬅️  ${path} - Status: ${proxyRes.statusCode}`);
        log.debug(`Response headers: ${JSON.stringify(proxyRes.headers)}`);
      },
    };
    
    // Create and invoke the proxy middleware
    const proxy = createProxyMiddleware(proxyOptions);
    proxy(req, res, next);
  };
}

// Apply routing proxy to all paths
app.use(createRoutingProxy());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-opener-router',
    port: PORT,
    destinations: Object.keys(destinations),
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
      routing: '/<destination>/*',
    },
    destinations: Object.keys(destinations).map(key => ({
      key,
      ...destinations[key],
    })),
  });
});

// Start server
app.listen(PORT, () => {
  log.info(`✅ Server ready on http://localhost:${PORT}`);
});
