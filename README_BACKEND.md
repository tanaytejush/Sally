# Sally Backend (FastAPI + OpenAI Chat Completions)

This backend provides `/chat` and `/chat/stream` endpoints that forward user messages to the OpenAI Chat Completions API and return the assistant's reply. It includes robust error handling and CORS for local React + Vite development.

## Features
- FastAPI app with modular structure
- `/chat` POST endpoint accepting JSON: `{ "message": "...", "role": "Brother|Sister|Husband|Wife|Girlfriend|Boyfriend", "userNamePreference": { "type": "first|full|custom", "name": "PreferredName" } }`
- `/chat/stream` POST endpoint (Server-Sent Events) emitting incremental tokens only
- Reads `OPENAI_API_KEY` from environment (never hardcoded)
- Uses latest Chat Completions API via the `openai` Python SDK v1
- Configurable model via `OPENAI_MODEL` (defaults to `gpt-4o-mini` — set to an available model in your account)
- Timeouts and error handling (invalid key, network/timeout, rate limit, API errors)
- CORS enabled for local Vite dev server

## Quickstart

1) Create and activate a virtual environment (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

2) Install dependencies

```bash
pip install -r backend/requirements.txt
```

3) Set environment variables

```bash
export OPENAI_API_KEY=sk-...  # your key
# Optional overrides
export OPENAI_MODEL=gpt-4o-mini   # or a model you have access to
export CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

4) Run the server

```bash
uvicorn backend.app.main:app --reload --port 8000
```

5) Test the endpoint (non-streaming)

```bash
curl -X POST http://localhost:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, Sally!","role":"Sister","userNamePreference":{"type":"first","name":"Alex"}}'
```

Expected JSON:

```json
{ "reply": "...", "model": "gpt-4o-mini" }

Streaming example:
```bash
curl -N -X POST http://localhost:8000/chat/stream \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, Sally!","role":"Sister","userNamePreference":{"type":"custom","name":"Lex"}}'
```
Outputs `data: <token>` lines.
```

## Frontend Integration (Vite + React)
From the frontend, call the endpoint directly (CORS is enabled):

```ts
const res = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: input, mode }),
});
const data = await res.json();
```

## Structure
```
backend/
  app/
    __init__.py
    main.py
    config.py
    schemas.py
    routers/
      __init__.py
      chat.py
    services/
      openai_client.py
  requirements.txt
```

## Notes
- The default `OPENAI_MODEL` is `gpt-4o-mini`. Set to a model you have access to.
- Extend `OpenAIService` to add logging, user auth, or persistence as needed.
- For production, set stricter CORS and consider rate limiting & request validation.
