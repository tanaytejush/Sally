# Sally – Your Well‑being Buddy

## Overview

Sally is a sentiment-aware AI companion designed to provide emotional support and well-being assistance through empathetic conversation. Built with a focus on accessibility, calm aesthetics, and thoughtful interaction design, Sally adapts its conversational tone based on the relationship context you choose (Brother, Sister, Husband, Wife, Girlfriend, or Boyfriend) while maintaining healthy boundaries and a supportive, non-clinical approach.

The application features a clean, minimal interface with React + Vite frontend and a modular FastAPI backend that integrates with OpenAI's Chat Completions API. The experience prioritizes gentle, supportive interactions with careful attention to design tokens, motion sensitivity, and accessibility standards.

## Key Features

### Relationship-Aware Conversations
Sally adapts its conversational style based on your selected relationship context:
- **Brother**: Steady, protective support with a "I've got your back" tone
- **Sister**: Gentle, nurturing encouragement with "I'm by your side" warmth
- **Husband/Wife**: Partner-like warmth and teamwork approach
- **Girlfriend/Boyfriend**: Affectionate, caring reassurance

All interactions maintain healthy boundaries and avoid dependency-creating language, focusing on reflective listening over prescriptive advice.

### Session Management
- **Multiple Sessions**: Create and manage separate conversation threads
- **Session History**: All conversations are preserved in browser localStorage
- **Session Naming**: Personalize session titles for easy identification
- **Session Switching**: Seamlessly switch between different conversation contexts
- **Auto-persistence**: Conversations are automatically saved locally

### Personalization
- **Name Preferences**: Choose how Sally addresses you (first name, full name, or custom nickname)
- **Visual Auras**: Three aura variants (calm, default, vivid) for personalized ambiance
- **Theme Support**: Light and dark mode with carefully balanced design tokens
- **Profile Management**: Set and update your preferences at any time

### Real-time Streaming
- **Streaming Mode**: Optional token-by-token response streaming for natural conversation flow
- **Non-streaming Mode**: Standard request-response for simpler deployments
- **Typing Indicators**: Visual feedback while Sally is thinking
- **Motion Sensitivity**: Respects `prefers-reduced-motion` settings

### Technical Highlights
- **Modular Architecture**: Clean separation between frontend, backend, and API services
- **Error Handling**: Comprehensive error messages with actionable guidance
- **Connection Testing**: Built-in health check for backend connectivity
- **Accessibility**: WCAG AA contrast compliance, full keyboard support, ARIA live regions
- **Performance**: Lightweight bundle, optimized assets, lazy loading ready

## Project Workflow (TL;DR)
- Install frontend deps: `npm install`
- Create Python venv and install backend deps: `python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt`
- Copy frontend env: `cp .env.frontend.example .env` (create `backend/.env` manually)
- Put your OpenAI key in `backend/.env` (or `export OPENAI_API_KEY=sk-...`). The backend reads only `backend/.env` (or process env), not the root `.env`.
- Start both backend and frontend together: `npm run dev`
- Open the app at the Vite URL (default `http://localhost:5173`)

Note: The UI routes all answers to the backend. If `VITE_API_URL` is not set, the UI defaults to `http://localhost:8000`. You can override via `VITE_API_URL` and optionally enable streaming via `VITE_STREAMING=true`.

## Tech Stack
- Frontend: React 18 + Vite, plain CSS with design tokens and light/dark theme
- Backend: FastAPI, OpenAI Python SDK v1
- API: OpenAI Chat Completions (model configurable)

## Repository Structure
```
.
├─ .env.frontend.example
├─ package.json
├─ vite.config.js
├─ frontend/
│  ├─ index.html
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ styles.css
│     ├─ api.js
│     ├─ assets/
│     │  └─ sally-avatar.svg
│     └─ components/
│        ├─ Header.jsx
│        ├─ RelationshipToggle.jsx
│        ├─ ChatWindow.jsx
│        ├─ MessageBubble.jsx
│        ├─ Composer.jsx
│        ├─ Aura.jsx
│        ├─ TypingDots.jsx
│        ├─ Sidebar.jsx
│        ├─ ProfileModal.jsx
│        ├─ Toast.jsx
│        └─ Background.jsx
├─ backend/
│  ├─ requirements.txt
│  └─ app/
│     ├─ __init__.py
│     ├─ main.py
│     ├─ config.py
│     ├─ schemas.py
│     ├─ routers/
│     │  ├─ __init__.py
│     │  └─ chat.py
│     └─ services/
│        └─ openai_client.py
└─ SYSTEM_GUIDELINES.md
```

## Prerequisites
- Node.js ≥ 18 and npm
- Python ≥ 3.10 and `pip`
- OpenAI API key with access to a chat‑capable model

## Environment Variables
Keep it simple: two environments, clearly separated.

- Backend (FastAPI) — lives in `backend/.env` (server-side secrets only):
  - `OPENAI_API_KEY` (required): Your OpenAI key (never commit it)
  - `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
  - `REQUEST_TIMEOUT_SECONDS` (optional, default `30`)
  - `CORS_ORIGINS` (optional, defaults include `http://localhost:5173`)

- Frontend (Vite) — lives in `.env` at repo root (no secrets):
  - `VITE_API_URL` (optional; defaults to `http://localhost:8000`) — backend base URL
  - `VITE_STREAMING=true` (optional) to enable streaming (SSE) via `/chat/stream`

Templates:
- Frontend: copy `.env.frontend.example` → `.env`
- Backend: create `backend/.env` and set your secrets

Samples:
```
# .env (root, used by Vite)
# Optional: override backend URL (defaults to http://localhost:8000)
VITE_API_URL=http://localhost:8000

# backend/.env (server-only)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Tip: If you see repeated "Error 401: Invalid OpenAI API key" in the chat, your backend does not have a valid key. Put it in `backend/.env` and restart the backend. You can quickly verify configuration with `npm run check:openai`. The dev launcher fails fast if the key looks like a placeholder.

Note about stale environment variables: if you previously exported `OPENAI_API_KEY` in your shell or OS, it may have been overriding the value in `backend/.env`, causing confusing 401 errors even after updating the file. The backend now explicitly loads `backend/.env` with override, so values in that file win during local development. If you still run into issues, try `unset OPENAI_API_KEY` in your shell and restart the backend.

## Running Locally
1) Install dependencies
```
npm install
python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt
```

2) Configure env
```
cp .env.frontend.example .env
# create backend/.env and set OPENAI_API_KEY=sk-...
```

3) Start both services
```
npm run dev
```
Vite prints a local URL (default `http://localhost:5173`). The UI uses `http://localhost:8000` by default; set `VITE_API_URL` in `.env` to change it.

Restart tip: After editing `.env`, restart the Vite dev server so changes take effect.

Optional quick check:
```
npm run check:openai
```
This performs a tiny request to verify your key and model access.

## Frontend ⇄ Backend
Requests always go to the backend. A health check is available at `GET /health`.
- In the UI, use “Test Connection” in the header to ping `/health` and confirm connectivity.
- Body: `{ message: string, role: 'Brother'|'Sister'|'Husband'|'Wife'|'Girlfriend'|'Boyfriend', userNamePreference?: { type: 'first'|'full'|'custom', name?: string } }`
- Non-streaming: `POST /chat` returns `{ reply }`
- Streaming (optional): `POST /chat/stream` emits `data: <token>` lines (SSE).

### Curl Examples
Non‑streaming:
```
curl -X POST http://localhost:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, Sally!","role":"Sister","userNamePreference":{"type":"first","name":"Alex"}}'
```
Response:
```
{ "reply": "...", "model": "gpt-4o-mini" }
```

Streaming:
```
curl -N -X POST http://localhost:8000/chat/stream \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, Sally!","role":"Sister","userNamePreference":{"type":"custom","name":"Lex"}}'
```
Outputs lines like:
```
data: Hello
data: ,
data: Lex!
```

## Design & Accessibility
- See `SYSTEM_GUIDELINES.md` for rules on tone, components, tokens, accessibility, and motion.
- The aura/typing indicators honor `prefers-reduced-motion`.

## Build & Deploy
Frontend:
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: serve the `frontend/dist/` folder behind your web server or host

Backend:
- Dev: `uvicorn backend.app.main:app --reload --port 8000`
- Prod example: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 2`
- Configure environment variables and CORS for your domains

## Troubleshooting
- CORS: Add your front‑end origin to `CORS_ORIGINS` (comma‑separated) in the backend environment.
- Model access: If the default model isn’t available, set `OPENAI_MODEL` to one you can use (e.g., `gpt-4o`, `gpt-4o-mini`).
- Timeouts: Increase `REQUEST_TIMEOUT_SECONDS` if needed.
- Ports in use: Change Vite port (e.g., `npm run dev -- --port 5174`) or uvicorn port.
 - Env not taking effect: Restart Vite after changing `.env` at the repo root.

## Next Steps
- Optionally set `VITE_API_URL` to point the UI at a non-local backend.
- Add server-side persistence (sessions/messages) beyond current localStorage.
- Refine dark-mode tokens and accessibility contrast across themes.
- Add tests (component tests for UI; route tests for backend) and CI.
