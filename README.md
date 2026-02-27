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
| `TARGET_PROTOCOL` | `https` | Protocol (`http` or `https`) |
| `TARGET_HOST` | `localhost` | Backend host to forward to |
| `TARGET_PORT` | `443` (https) / `8080` (http) | Backend port to forward to |

> **Note:** The proxy removes the `X-Forwarded-For` header to avoid leaking the original client IP address to the target server.

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
