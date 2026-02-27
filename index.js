require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ROUTER_API_KEY = process.env.ROUTER_API_KEY;

// Logging utility with levels
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[LOG_LEVEL.toLowerCase()] || levels.info;
const log = {
  debug: (msg) => currentLevel <= levels.debug && console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
  info: (msg) => currentLevel <= levels.info && console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => currentLevel <= levels.warn && console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => currentLevel <= levels.error && console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
};

// Load destinations from environment variables
function loadDestinations() {
  const destinations = {};
  const envKeys = Object.keys(process.env);
  const destNames = new Set();

  // Extract destination names from DEST_<NAME>_<PROPERTY>
  envKeys.forEach(key => {
    const match = key.match(/^DEST_(.+?)_(PROTOCOL|HOST|PORT)$/);
    if (match) {
      destNames.add(match[1]);
    }
  });

  // Build destination objects with API keys
  destNames.forEach(name => {
    const protocol = process.env[`DEST_${name}_PROTOCOL`] || 'https';
    const host = process.env[`DEST_${name}_HOST`] || 'localhost';
    const port = process.env[`DEST_${name}_PORT`] || (protocol === 'https' ? '443' : '8080');
    const apiKey = process.env[`${name}_API_KEY`] || null;

    destinations[name.toLowerCase()] = {
      name: name,
      protocol,
      host,
      port,
      url: `${protocol}://${host}:${port}`,
      apiKey: apiKey,
    };
  });

  return destinations;
}

const destinations = loadDestinations();
log.info('🚀 AI Opener Router starting...');
log.info(` Listening on port: ${PORT}`);
log.info(` Log level: ${LOG_LEVEL}`);
log.info(` Router API Key: ${ROUTER_API_KEY ? '✅ Configured' : '❌ NOT CONFIGURED (SECURITY RISK!)'}`);
log.info(` Loaded destinations: ${Object.keys(destinations).join(', ') || '(none)'}`);

// Authentication middleware - check router API key
function authenticateRouter(req, res, next) {
  // Skip auth for health check and root
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    log.warn(`❌ Missing Authorization header from ${req.ip}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header required. Use: Authorization: Bearer <ROUTER_API_KEY>'
    });
  }

  // Extract Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    log.warn(`❌ Invalid Authorization format from ${req.ip}: ${authHeader}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid Authorization format. Use: Bearer <token>'
    });
  }

  const token = parts[1];
  if (token !== ROUTER_API_KEY) {
    log.warn(`❌ Invalid API key from ${req.ip}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  log.debug(`✅ Authenticated request from ${req.ip}`);
  next();
}

// Create proxy middleware for dynamic routing
function createRoutingProxy() {
  return (req, res, next) => {
    const path = req.path;
    const pathParts = path.split('/').filter(p => p);

    if (pathParts.length === 0) {
      return next();
    }

    const destKey = pathParts[0].toLowerCase();

    if (!destinations[destKey]) {
      log.warn(`Unknown destination key: ${destKey}. Available: ${Object.keys(destinations).join(', ')}`);
      return res.status(404).json({
        error: 'Unknown destination',
        message: `No destination configured for key: ${destKey}`,
        available: Object.keys(destinations),
      });
    }

    const dest = destinations[destKey];
    const rewrittenPath = '/' + pathParts.slice(1).join('/');

    log.debug(`Routing: ${req.method} ${path} → ${dest.url}${rewrittenPath}`);
    log.info(`➡️ ${req.method} ${path} → ${dest.url}${rewrittenPath} [key: ${destKey}]`);

    const proxyOptions = {
      target: dest.url,
      changeOrigin: true,
      
      // Security headers
      headers: {
        'X-Forwarded-For': '',
      },
      
      pathRewrite: {
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
        // Remove X-Forwarded-For
        if (proxyReq.getHeader('x-forwarded-for')) {
          proxyReq.setHeader('x-forwarded-for', '');
        }

        // Remove client's Authorization header (don't forward to backend)
        proxyReq.removeHeader('authorization');

        // Inject backend API key if configured
        if (dest.apiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${dest.apiKey}`);
          log.debug(`🔑 Injected API key for ${destKey}`);
        }

        const clientIp = request.ip || request.connection.remoteAddress;
        log.debug(`Incoming request: ${request.method} ${request.path} from ${clientIp}`);
      },

      onProxyRes: (proxyReq, proxyRes, request, response) => {
        log.info(`⬅️ ${path} - Status: ${proxyRes.statusCode}`);
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);
    proxy(req, res, next);
  };
}

// Health check endpoint (public, no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-opener-router',
    port: PORT,
    destinations: Object.keys(destinations),
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint (public, no auth required)
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
      url: destinations[key].url,
      hasApiKey: !!destinations[key].apiKey,
    })),
  });
});

// Apply authentication to all other routes
app.use(authenticateRouter);

// Apply routing proxy
app.use(createRoutingProxy());

// Start server
app.listen(PORT, () => {
  log.info(`✅ Server ready on http://localhost:${PORT}`);
});
