#!/usr/bin/env bash
set -euo pipefail

# Sally Backend dev launcher
# - Loads backend/.env if present
# - Verifies OPENAI_API_KEY is present (does not print the key)
# - Prints model and port for quick visibility
# - Starts uvicorn in reload mode

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
cd "$ROOT_DIR"

# Load backend/.env if present (simple parser: lines like KEY=VALUE, ignoring comments)
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    # skip comments/blank lines
    [[ -z "$line" || "$line" == \#* ]] && continue
    # expect KEY=VALUE
    key="${line%%=*}"
    val="${line#*=}"
    # Trim possible surrounding quotes in VALUE
    if [[ "$val" == '"'*'"' || "$val" == "'"*"'" ]]; then
      val=${val:1:-1}
    fi
    export "$key=$val"
  done < "$SCRIPT_DIR/.env"
fi

# Note: this backend is standardized to read secrets from backend/.env (or
# from the process environment). It does not fall back to the repo root .env.

PORT="${PORT:-8000}"
MODEL="${OPENAI_MODEL:-gpt-4o-mini}"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: OPENAI_API_KEY is not set in the environment." 1>&2
  echo "Tip: create backend/.env with OPENAI_API_KEY=sk-... (and optional OPENAI_MODEL)." 1>&2
  exit 1
fi

LEN=${#OPENAI_API_KEY}
echo "OPENAI_API_KEY detected (length: ${LEN})."
if [[ "${OPENAI_API_KEY}" == *"REPLACE_ME"* ]]; then
  echo "ERROR: OPENAI_API_KEY looks like a placeholder (contains REPLACE_ME)." 1>&2
  echo "Edit backend/.env and set your real key (sk-...)." 1>&2
  exit 1
fi
echo "Model: ${MODEL}  |  Port: ${PORT}"
echo "Starting Sally backend at http://localhost:${PORT} (health: /health, chat: /chat, stream: /chat/stream)"

# Prefer project venv uvicorn if available
UVICORN_BIN="uvicorn"
if [[ -x "$ROOT_DIR/.venv/bin/uvicorn" ]]; then
  UVICORN_BIN="$ROOT_DIR/.venv/bin/uvicorn"
fi

exec "$UVICORN_BIN" backend.app.main:app --reload --port "$PORT"
