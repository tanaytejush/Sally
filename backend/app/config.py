import os
from functools import lru_cache
from typing import List


class Settings:
    """Application configuration loaded from environment variables."""

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
