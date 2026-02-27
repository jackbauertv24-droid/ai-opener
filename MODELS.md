# AI Opener - Supported Models by Provider

This document lists all available models accessible through the AI Opener router.

---

## 1. NVIDIA (185 models)

**Route:** `/nvidia/v1/*`  
**Endpoint:** `/nvidia/v1/models`  
**Status:** ✅ Full Access

### Major Model Families:

#### Meta (Llama Series)
- meta/llama-3.1-8b-instruct
- meta/llama-3.1-70b-instruct
- meta/llama-3.1-405b-instruct
- meta/llama-3.2-1b-instruct
- meta/llama-3.2-3b-instruct
- meta/llama-3.2-11b-vision-instruct
- meta/llama-3.2-90b-vision-instruct
- meta/llama-3.3-70b-instruct
- meta/llama-4-scout-17b-16e-instruct
- meta/llama-4-maverick-17b-128e-instruct

#### Google (Gemma Series)
- google/gemma-2b
- google/gemma-2-2b-it
- google/gemma-2-9b-it
- google/gemma-2-27b-it
- google/gemma-3-1b-it
- google/gemma-3-4b-it
- google/gemma-3-12b-it
- google/gemma-3-27b-it
- google/gemma-3n-e2b-it
- google/gemma-3n-e4b-it

#### Mistral AI
- mistralai/mistral-7b-instruct-v0.2
- mistralai/mistral-7b-instruct-v0.3
- mistralai/mistral-large
- mistralai/mistral-large-2-instruct
- mistralai/mistral-large-3-675b-instruct-2512
- mistralai/mistral-medium-3-instruct
- mistralai/mixtral-8x7b-instruct-v0.1
- mistralai/mixtral-8x22b-instruct-v0.1

#### Qwen (Alibaba)
- qwen/qwen2-7b-instruct
- qwen/qwen2.5-7b-instruct
- qwen/qwen2.5-coder-7b-instruct
- qwen/qwen2.5-coder-32b-instruct
- qwen/qwen3-235b-a22b
- qwen/qwen3-coder-480b-a35b-instruct
- qwen/qwen3.5-397b-a17b
- qwen/qwq-32b

#### DeepSeek
- deepseek-ai/deepseek-coder-6.7b-instruct
- deepseek-ai/deepseek-r1-distill-llama-8b
- deepseek-ai/deepseek-r1-distill-qwen-7b
- deepseek-ai/deepseek-r1-distill-qwen-14b
- deepseek-ai/deepseek-r1-distill-qwen-32b
- deepseek-ai/deepseek-v3.1
- deepseek-ai/deepseek-v3.2

#### Microsoft
- microsoft/phi-3-mini-4k-instruct
- microsoft/phi-3-mini-128k-instruct
- microsoft/phi-3-small-8k-instruct
- microsoft/phi-3-small-128k-instruct
- microsoft/phi-3-medium-4k-instruct
- microsoft/phi-3-medium-128k-instruct
- microsoft/phi-3.5-mini-instruct
- microsoft/phi-3.5-moe-instruct
- microsoft/phi-4-mini-instruct
- microsoft/phi-4-multimodal-instruct

#### IBM Granite
- ibm/granite-3.0-3b-a800m-instruct
- ibm/granite-3.0-8b-instruct
- ibm/granite-3.3-8b-instruct
- ibm/granite-8b-code-instruct
- ibm/granite-34b-code-instruct

#### NVIDIA (Own Models)
- nvidia/llama-3.1-nemotron-51b-instruct
- nvidia/llama-3.1-nemotron-70b-instruct
- nvidia/nemotron-4-340b-instruct
- nvidia/nemotron-nano-4b-v1.1
- nvidia/nemotron-mini-4b-instruct

#### Other Notable Models
- 01-ai/yi-large
- databricks/dbrx-instruct
- bigcode/starcoder2-15b
- bigcode/starcoder2-7b
- upstage/solar-10.7b-instruct
- thudm/chatglm3-6b

**Total:** 185 models from 40+ organizations

---

## 2. DeepSeek

**Route:** `/deepseek/*`  
**Endpoint:** Chat completions only (no models endpoint)  
**Status:** ⚠️ Needs Balance

### Available Models:
- deepseek-chat (tested)
- deepseek-coder (inferred)

**Note:** DeepSeek requires account balance. Routing works but returns "Insufficient Balance" error.

---

## 3. Cerebras (4 models)

**Route:** `/cerebras/v1/*`  
**Endpoint:** `/cerebras/v1/models`  
**Status:** ✅ Full Access

### Available Models:
1. **gpt-oss-120b** - General purpose, 120B params
2. **zai-glm-4.7** - GLM series model
3. **qwen-3-235b-a22b-instruct-2507** - Qwen3 235B variant
4. **llama3.1-8b** - Llama 3.1 8B instruct

**Total:** 4 models

---

## 4. Groq (20 models)

**Route:** `/groq/openai/v1/*`  
**Endpoint:** `/groq/openai/v1/models`  
**Status:** ✅ Full Access (Ultra-low latency)

### Available Models:

#### Llama Series
- llama-3.3-70b-versatile
- llama-3.1-8b-instant
- meta-llama/llama-4-scout-17b-16e-instruct
- meta-llama/llama-4-maverick-17b-128e-instruct

#### OpenAI Compatible
- openai/gpt-oss-120b
- openai/gpt-oss-20b
- openai/gpt-oss-safeguard-20b

#### Qwen
- qwen/qwen3-32b

#### Kimi (Moonshot AI)
- moonshotai/kimi-k2-instruct
- moonshotai/kimi-k2-instruct-0905

#### Whisper (Speech-to-Text)
- whisper-large-v3
- whisper-large-v3-turbo

#### Groq Native
- groq/compound
- groq/compound-mini

#### Safety
- meta-llama/llama-prompt-guard-2-22m
- meta-llama/llama-prompt-guard-2-86m
- meta-llama/llama-guard-4-12b

#### Other
- allam-2-7b
- canopylabs/orpheus-arabic-saudi
- canopylabs/orpheus-v1-english

**Total:** 20 models

---

## Summary Table

| Provider | Models | Route | Status | Latency |
|----------|--------|-------|--------|---------|
| **NVIDIA** | 185 | `/nvidia/v1/*` | ✅ Full Access | Standard |
| **DeepSeek** | 2+ | `/deepseek/*` | ⚠️ Needs Balance | Standard |
| **Cerebras** | 4 | `/cerebras/v1/*` | ✅ Full Access | Fast |
| **Groq** | 20 | `/groq/openai/v1/*` | ✅ Full Access | Ultra-fast |

---

## Usage Examples

### NVIDIA
```bash
curl http://localhost:8901/nvidia/v1/chat/completions \
  -H "Authorization: Bearer ai-opener-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama-3.1-8b-instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Cerebras
```bash
curl http://localhost:8901/cerebras/v1/chat/completions \
  -H "Authorization: Bearer ai-opener-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss-120b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Groq
```bash
curl http://localhost:8901/groq/openai/v1/chat/completions \
  -H "Authorization: Bearer ai-opener-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

Generated: $(date)
Router Version: 1.0.0
Port: 8901
