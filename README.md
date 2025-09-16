# Sally – Your Well‑being Buddy

A clean, minimal, and calming chatbot interface (React + Vite) with a modular FastAPI backend that proxies to OpenAI Chat Completions. The experience is gentle, supportive, and accessible.

## Project Workflow (TL;DR)
- Install frontend deps: `npm install`
- Create Python venv and install backend deps: `pip install -r backend/requirements.txt`
- Export your OpenAI key: `export OPENAI_API_KEY=sk-...`
- Start backend: `uvicorn backend.app.main:app --reload --port 8000`
- Start frontend: `npm run dev` (Vite on port 5173)
- Open the app, type a message, see the gentle aura while Sally replies

Note: The UI routes all answers to the backend. Set `VITE_API_URL` and optionally enable streaming via `VITE_STREAMING=true`.

## Tech Stack
- Frontend: React 18 + Vite, plain CSS with design tokens and light/dark theme
- Backend: FastAPI, OpenAI Python SDK v1
- API: OpenAI Chat Completions (model configurable)

## Repository Structure
```
.
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  ├─ styles.css
│  ├─ assets/
│  │  └─ sally-avatar.svg
│  └─ components/
│     ├─ Header.jsx
│     ├─ RelationshipToggle.jsx
│     ├─ ChatWindow.jsx
│     ├─ MessageBubble.jsx
│     ├─ Composer.jsx
│     ├─ Aura.jsx
│     ├─ TypingDots.jsx
│     ├─ Sidebar.jsx
│     ├─ ProfileModal.jsx
│     ├─ Toast.jsx
│     └─ Background.jsx
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
├─ SYSTEM_GUIDELINES.md
└─ README_BACKEND.md
```

## Prerequisites
- Node.js ≥ 18 and npm
- Python ≥ 3.10 and `pip`
- OpenAI API key with access to a chat‑capable model

## Environment Variables
Backend (required/optional):
- `OPENAI_API_KEY` (required): Your OpenAI key (never commit it)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`): Set to a model you have access to (e.g., `gpt-4o` or `gpt-4o-mini`)
- `REQUEST_TIMEOUT_SECONDS` (optional, default `30`)
- `CORS_ORIGINS` (optional, defaults include `http://localhost:5173`)

Frontend:
- `VITE_API_URL` (e.g., `http://localhost:8000`) — required for sending messages
- `VITE_STREAMING=true` to enable streaming (SSE) via `/chat/stream`

Create a `.env` at the project root for Vite and export shell vars for FastAPI, for example:
```
# .env (Vite reads this at project root)
VITE_API_URL=http://localhost:8000
```

## Running Locally
1) Backend
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export OPENAI_API_KEY=sk-...             # required
export OPENAI_MODEL=gpt-4o-mini          # optional: use a model you can access
uvicorn backend.app.main:app --reload --port 8000
```

2) Frontend
```
npm install
npm run dev
```
Vite prints a local URL (default `http://localhost:5173`). CORS is preconfigured on the backend for local development.

## Frontend ⇄ Backend
Requests always go to the backend. A health check is available at `GET /health`.
- Body: `{ message: string, role: 'Brother'|'Sister'|'Husband'|'Wife'|'Girlfriend'|'Boyfriend', userNamePreference?: { type: 'first'|'full'|'custom', name?: string } }`
- Non-streaming: `POST /chat` returns `{ reply }`
- Streaming (optional): `POST /chat/stream` emits `data: <token>` lines (SSE).

## Design & Accessibility
- See `SYSTEM_GUIDELINES.md` for rules on tone, components, tokens, accessibility, and motion.
- The aura/typing indicators honor `prefers-reduced-motion`.

## Build & Deploy
Frontend:
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: serve the `dist/` folder behind your web server or host

Backend:
- Dev: `uvicorn backend.app.main:app --reload --port 8000`
- Prod example: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 2`
- Configure environment variables and CORS for your domains

## Troubleshooting
- CORS: Add your front‑end origin to `CORS_ORIGINS` (comma‑separated) in the backend environment.
- Model access: If the default model isn’t available, set `OPENAI_MODEL` to one you can use (e.g., `gpt-4o`, `gpt-4o-mini`).
- Timeouts: Increase `REQUEST_TIMEOUT_SECONDS` if needed.
- Ports in use: Change Vite port (e.g., `npm run dev -- --port 5174`) or uvicorn port.

## Next Steps
- Ensure `.env` contains `VITE_API_URL` so the UI connects by default.
- Add server-side persistence (sessions/messages) beyond current localStorage.
- Refine dark-mode tokens and accessibility contrast across themes.
- Add tests (component tests for UI; route tests for backend) and CI.
