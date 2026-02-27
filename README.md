# AI Opener - API Router

A simple Node.js API router that forwards requests to another host/port.

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your target host/port

# Start the server
npm start
```

## Configuration

Set these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port to listen on |
| `LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `TARGET_PROTOCOL` | `https` | Protocol (`http` or `https`) |
| `TARGET_HOST` | `localhost` | Backend host to forward to |
| `TARGET_PORT` | `443` (https) / `8080` (http) | Backend port to forward to |

> **Note:** The proxy removes the `X-Forwarded-For` header to avoid leaking the original client IP address to the target server.

## Logging

The router uses a structured logging system with four levels:

- **debug**: Detailed request/response headers and client IPs (verbose)
- **info**: Request method, path, target, and response status (default)
- **warn**: Potential issues (not currently used, reserved for future)
- **error**: Proxy errors and failures

Example log output:
```
[INFO]  2026-02-27T05:34:00.000Z - ➡️  POST /api/v1/chat/completions → https://integrate.api.nvidia.com:443
[INFO]  2026-02-27T05:34:01.000Z - ⬅️  /api/v1/chat/completions - Status: 200
```

Set `LOG_LEVEL=debug` for full request/response details including headers.

## Usage

- **Health Check**: `GET /health` - Returns service status
- **API Proxy**: `GET/POST /api/*` - Forwards to target backend

## Example

If configured with `TARGET_HOST=backend` and `TARGET_PORT=8080`:

```bash
# This request:
curl http://localhost:3000/api/users

# Gets forwarded to:
curl http://backend:8080/api/users
```
