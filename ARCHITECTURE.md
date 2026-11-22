# هستی — Private AI Assistant — Architecture

> Self-hosted, fully local stack. The browser (this Next.js app) never talks to
> anything outside the local network, and the model itself (vLLM) lives entirely
> on your own Linux server.

## Containers in the Docker network (`ai-network`)

```
                        ┌─────────────────────────────────────────────┐
                        │              ai-network                      │
                        │                                             │
  browser ──────────────┼────► frontend (Next.js)   :3000 (host-side)  │
        │               │        │  /api/chat → LLM|engine             │
        │               │        ├──────────────┬─────────────────────┤
        │               │        │              │                     │
        │               │        ▼              ▼                     │
        └───────────────┼────► vllm          custom-engine             │
                        │     port 8000      port 8001                │
                        │     (Qwen3-Coder)   (FastAPI, predict)      │
                        │                        │                    │
                        │             postgres (app DB)               │
                        │             port 5432                       │
                        └─────────────────────────────────────────────┘
```

| Service          | Port | Responsibility                                                        |
| ---------------- | ---- | ---------------------------------------------------------------------- |
| `frontend`       | 3000 | Next.js App Router UI. Talks to vLLM/FastAPI over the internal network. |
| `vllm`           | 8000 | OpenAI-compatible LLM server: `Qwen/Qwen3-Coder-30B-A3B-AWQ`           |
| `custom-engine`  | 8001 | Your own FastAPI engine. Exposes `POST /predict` (your JOSS model).     |
| `postgres`       | 5432 | App storage — chat history, settings, future vector memory.            |

## Key properties

- **All traffic stays inside `ai-network`.** Only the frontend is expected to
  be reachable from a browser. vLLM and the custom engine are only reachable
  between containers and from the host.
- **vLLM on 8000** serves the LLM over an OpenAI-compatible API
  (`/v1/chat/completions`, `/v1/models`). The frontend calls it through a
  Next.js Route Handler (`src/app/api/chat`) so the key/base-URL policy stays
  server-side.
- **Custom engine on 8001** is the backend plug-in for the JOSS-style
  prediction workload. Swap the stub at `custom_engine/main.py` for your real
  model when it is ready — the frontend only POSTs `{ domain, X, D }` at
  `/predict` and reads back `{ y, r2 }`.
- **Postgres on 5432** is the source of truth for the frontend's data model.
  It is not exposed to the browser.
- **The browser never receives GPU, model, or DB credentials.** Everything
  server-side and behind the Docker network boundary.

## Where things are

| Path                       | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `ARCHITECTURE.md`          | This document                                        |
| `docker-compose.yml`       | Orchestration for vllm / custom-engine / postgres    |
| `custom_engine/main.py`    | FastAPI stub — inject your JOSS code here            |
| `custom_engine/Dockerfile` | Image for the custom engine                          |
| `src/app/layout.tsx`       | RTL (`lang="fa" dir="rtl"`) root layout, Vazirmatn font |
| `src/app/globals.css`      | Dark-first design tokens                              |
| `src/app/page.tsx`         | Chat interface (sidebar history + main chat area)    |
| `src/components/Avatar3D.tsx` | `@react-three/fiber` avatar (GLB + Draco + idle spin) |
| `public/draco/gltf/`        | Local Draco decoder (no CDN fetch at runtime)         |

## Notes for the frontend/backend contract

- `vllm` exposes an OpenAI-compatible API — point an `OPENAI_BASE_URL` env
  var at `http://vllm:8000/v1` and consume it with a standard client.
- `custom-engine` documents its request/response contract in
  `custom_engine/main.py` — keep the Pydantic models stable.
- Frontend → backend calls are deliberately made through Route Handlers, never
  directly from the browser, so the Docker network stays private.
