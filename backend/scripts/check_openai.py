#!/usr/bin/env python3
from __future__ import annotations

import os
import sys
import json
import time
from pathlib import Path

from dotenv import load_dotenv

try:
    from openai import OpenAI
    from openai import (
        AuthenticationError,
        PermissionDeniedError,
        RateLimitError,
        APIConnectionError,
        BadRequestError,
        APIError,
    )
except Exception as e:  # pragma: no cover
    print(json.dumps({"ok": False, "error": f"OpenAI SDK import failed: {e}"}))
    sys.exit(2)


def main() -> int:
    # Load env only from backend/.env (local dev convenience)
    cwd = Path(__file__).resolve().parents[2]
    load_dotenv(cwd / "backend/.env")

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-5")

    if not api_key:
        print(json.dumps({"ok": False, "error": "OPENAI_API_KEY not set. Add it to backend/.env"}))
        return 1
    if "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" in api_key:
        print(json.dumps({"ok": False, "error": "OPENAI_API_KEY is a placeholder. Edit backend/.env and set your real key (sk-...)."}))
        return 1

    client = OpenAI(api_key=api_key, timeout=float(os.getenv("REQUEST_TIMEOUT_SECONDS", "30")))

    messages = [
        {"role": "system", "content": "Be brief."},
        {"role": "user", "content": "Say 'ok'."},
    ]

    t0 = time.perf_counter()
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=8,
        )
        dt = time.perf_counter() - t0
        content = (resp.choices[0].message.content or "").strip()
        out = {
            "ok": True,
            "model": model,
            "request_id": getattr(resp, "id", ""),
            "latency_sec": round(dt, 3),
            "snippet": content[:80],
        }
        print(json.dumps(out))
        return 0
    except AuthenticationError:
        print(json.dumps({"ok": False, "error": "Invalid OpenAI API key (401)"}))
        return 1
    except PermissionDeniedError:
        print(json.dumps({"ok": False, "error": "Permission denied for model (403). Check model access or use a different model."}))
        return 1
    except RateLimitError:
        print(json.dumps({"ok": False, "error": "Rate limit exceeded (429)"}))
        return 1
    except APIConnectionError:
        print(json.dumps({"ok": False, "error": "Network error contacting OpenAI (connectivity)"}))
        return 1
    except BadRequestError as e:
        print(json.dumps({"ok": False, "error": f"Bad request: {e}"}))
        return 1
    except APIError as e:
        print(json.dumps({"ok": False, "error": f"OpenAI API error: {e}"}))
        return 1
    except Exception as e:
        print(json.dumps({"ok": False, "error": f"Unexpected error: {e}"}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
