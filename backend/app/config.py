import os
from functools import lru_cache
from typing import List
from pathlib import Path

try:
    from dotenv import load_dotenv  # type: ignore
except Exception:  # pragma: no cover
    load_dotenv = None  # pyright: ignore[reportGeneralTypeIssues]


class Settings:
    """Application configuration loaded from environment variables.

    This backend is standardized to read secrets from `backend/.env` (for local
    development) or from the process environment provided by your runtime
    (Docker, systemd, cloud). It does not fall back to the repo root `.env`.
    """
    # Load environment from backend/.env if python-dotenv is available. This
    # helps local development without requiring shell exports.
    if load_dotenv is not None:
        backend_dir = Path(__file__).resolve().parents[1]
        # Primary: backend/.env for server-side secrets
        # In local development, values in backend/.env should take precedence
        # over any previously exported shell values to avoid stale keys.
        load_dotenv(backend_dir / ".env", override=True)

    # OpenAI
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Networking
    request_timeout_seconds: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))

    # CORS
    cors_origins_raw: str = os.getenv(
        "CORS_ORIGINS",
        # Allow localhost dev defaults for Vite + common ports
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
