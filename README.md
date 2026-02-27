# AI Opener - Multi-Destination API Router

A flexible Node.js API router that forwards requests to multiple backend destinations based on URL path routing.

## How It Works

Requests are routed based on the **first path segment** (destination key):

````
http://localhost:3000/<destination>/<rest-of-path>
                      ↓              ↓
          Route to: <dest-config>  Forward: /<rest-of-path>
````

### Examples

- `http://localhost:3000/nvidia/v1/chat/completions` → Routes to NVIDIA API (`/v1/chat/completions`)
- `http://localhost:3000/openai/v1/chat/completions` → Routes to OpenAI API (`/v1/chat/completions`)
- `http://localhost:3000/local/api/users` → Routes to local backend (`/api/users`)

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your destinations

# Start the server
npm start
```

## Configuration

Set these environment variables:

### Server Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port to listen on |
| `LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |

### Destination Configuration

Destinations are defined using the pattern: `DEST_<NAME>_<PROPERTY>`

| Property | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEST_<NAME>_PROTOCOL` | Protocol (`http` or `https`) | No | `https` |
| `DEST_<NAME>_HOST` | Backend host | Yes | - |
| `DEST_<NAME>_PORT` | Backend port | No | `443` (https) / `8080` (http) |

### Example Configuration

```bash
# NVIDIA API
DEST_NVIDIA_PROTOCOL=https
DEST_NVIDIA_HOST=integrate.api.nvidia.com
DEST_NVIDIA_PORT=443

# OpenAI API
DEST_OPENAI_PROTOCOL=https
DEST_OPENAI_HOST=api.openai.com
DEST_OPENAI_PORT=443

# Local Backend
DEST_LOCAL_PROTOCOL=http
DEST_LOCAL_HOST=localhost
DEST_LOCAL_PORT=8080
```

## Usage

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "service": "ai-opener-router",
  "port": 3000,
  "destinations": ["nvidia", "openai", "local"],
  "timestamp": "2026-02-27T05:00:00.000Z"
}
```

### Route to NVIDIA

```bash
curl http://localhost:3000/nvidia/v1/chat/completions \
  -H "Authorization: Bearer YOUR_NVIDIA_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen/qwen3.5-397b-a17b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Route to OpenAI

```bash
curl http://localhost:3000/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_OPENAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Logging

The router uses structured logging with four levels:

- **debug**: Detailed request/response headers, client IPs, routing decisions
- **info**: Request method, path, destination, and response status (default)
- **warn**: Unknown destinations, configuration issues
- **error**: Proxy errors and failures

### Example Log Output

```
[INFO]  2026-02-27T05:00:00.000Z - 🚀 AI Opener Router starting...
[INFO]  2026-02-27T05:00:00.000Z -    Listening on port: 3000
[INFO]  2026-02-27T05:00:00.000Z -    Log level: debug
[INFO]  2026-02-27T05:00:00.000Z -    Loaded destinations: nvidia, openai, local
[INFO]  2026-02-27T05:00:01.000Z - ➡️  POST /nvidia/v1/chat/completions → https://integrate.api.nvidia.com:443/v1/chat/completions [key: nvidia]
[INFO]  2026-02-27T05:00:02.000Z - ⬅️  /nvidia/v1/chat/completions - Status: 200
```

Set `LOG_LEVEL=debug` for full details including headers.

## Path Rewriting Rules

1. **First segment extraction**: The first path segment is extracted as the destination key
   - `/nvidia/v1/chat` → key: `nvidia`, path: `/v1/chat`

2. **No additional trimming**: The rest of the path is forwarded as-is (no `/api` stripping)
   - `/local/api/users` → forwarded as `/api/users`

3. **Case-insensitive keys**: Destination keys are matched case-insensitively
   - `/NVIDIA/...` and `/nvidia/...` both route to the `nvidia` destination

## Security

- **X-Forwarded-For Removal**: The proxy removes the `X-Forwarded-For` header to avoid leaking the original client IP address to backend servers.
- **No Automatic IP Forwarding**: Backend servers only see the proxy's IP address.

## Features

✅ **Multi-destination routing** - Support for unlimited backends  
✅ **Dynamic configuration** - Add/remove destinations via environment variables  
✅ **Path preservation** - Routes paths exactly as specified  
✅ **Structured logging** - Timestamped logs with configurable verbosity  
✅ **HTTPS support** - Secure connections to backends  
✅ **IP privacy** - Hides client IP from backends  
✅ **Streaming support** - Full SSE/WebSocket compatibility  

## License

MIT
