#!/usr/bin/env bash
set -euo pipefail

# Sally Backend dev launcher
# - Verifies OPENAI_API_KEY is present (does not print the key)
# - Prints model and port for quick visibility
# - Starts uvicorn in reload mode

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
cd "$ROOT_DIR"

PORT="${PORT:-8000}"
MODEL="${OPENAI_MODEL:-gpt-4o-mini}"

if [[ -z "${OPENAI_API_KEY:-# ...existing code...
if [ -f "$SCRIPT_DIR/.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi
# ...existing code...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

}" ]];
then
  echo "ERROR: OPENAI_API_KEY is not set in the environment." 1>&2
  echo "Tip: export OPENAI_API_KEY=sk-... before running this script." 1>&2
  exit 1
fi

LEN=${#OPENAI_API_KEY}
echo "OPENAI_API_KEY detected (length: ${LEN})."
echo "Model: ${MODEL}  |  Port: ${PORT}"
echo "Starting Sally backend at http://localhost:${PORT} (health: /health, chat: /chat, stream: /chat/stream)"

exec uvicorn backend.app.main:app --reload --port "$PORT"

