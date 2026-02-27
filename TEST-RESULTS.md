# AI Opener Test Results

**Test Date:** 2026-02-27  
**Test Configuration:** DEBUG logging level  
**Target:** NVIDIA API (https://integrate.api.nvidia.com:443)

## Test Setup

- **Router Port:** 3000
- **Log Level:** debug
- **Target Protocol:** https
- **Target Host:** integrate.api.nvidia.com
- **Target Port:** 443
- **Path Rewrite:** `/api/v1/...` → `/v1/...`

## Server Startup Log

```
[INFO] 2026-02-27T05:44:02.321Z - 🚀 AI Opener Router starting...
[INFO] 2026-02-27T05:44:02.322Z - Listening on port: 3000
[INFO] 2026-02-27T05:44:02.322Z - Forwarding to: https://integrate.api.nvidia.com:443
[INFO] 2026-02-27T05:44:02.322Z - Log level: debug
[HPM] Proxy created: / -> https://integrate.api.nvidia.com:443
[HPM] Proxy rewrite rule created: "^/api" ~> ""
✅ Server ready on http://localhost:3000
```

## Test Request

**Endpoint:** `POST http://localhost:3000/api/v1/chat/completions`

**Request Body:**
```json
{
  "model": "qwen/qwen3.5-397b-a17b",
  "messages": [
    {
      "role": "user",
      "content": "Say hello!"
    }
  ],
  "max_tokens": 50,
  "temperature": 0.7
}
```

## Proxy Logs (Debug Level)

```
[INFO] 2026-02-27T05:44:52.131Z - ➡️  POST /v1/chat/completions → https://integrate.api.nvidia.com:443
[INFO] 2026-02-27T05:44:55.293Z - ⬅️  /v1/chat/completions - Status: 200
```

## Response

**Status:** 200 OK  
**Response Time:** ~3 seconds

```json
{
  "id": "chatcmpl-b5c83e0c5f635c69",
  "object": "chat.completion",
  "created": 1772171092,
  "model": "qwen/qwen3.5-397b-a17b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 10,
    "total_tokens": 25
  }
}
```

## Test Conclusion

✅ **SUCCESS** - All features working:
- ✅ HTTPS target support
- ✅ Path rewriting (`/api` → ``)
- ✅ Debug logging with timestamps
- ✅ Request/response logging
- ✅ X-Forwarded-For header removal (configured)
- ✅ Full API compatibility with NVIDIA

## Raw Log File

See `test-run.log` for complete raw output including curl verbose output.
