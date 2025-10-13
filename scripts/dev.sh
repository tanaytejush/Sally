#!/usr/bin/env bash
set -euo pipefail

# Launch backend (FastAPI) and frontend (Vite) together.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
cd "$ROOT_DIR"

BACKEND_CMD=(bash backend/dev.sh)
FRONTEND_CMD=(npx vite)

echo "[dev] Starting backend and frontend..."

# Start backend in background
"${BACKEND_CMD[@]}" &
BACKEND_PID=$!

cleanup() {
  echo "\n[dev] Shutting down..."
  if ps -p $BACKEND_PID >/dev/null 2>&1; then
    kill $BACKEND_PID >/dev/null 2>&1 || true
    # Give uvicorn a moment to stop gracefully
    sleep 0.3 || true
  fi
}
trap cleanup EXIT INT TERM

# Start Vite in foreground (keeps this script alive)
"${FRONTEND_CMD[@]}"

