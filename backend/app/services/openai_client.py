from __future__ import annotations

from typing import List, Dict, Any, Iterable, Optional
import re

from openai import OpenAI
from openai import (
    APIError,
    APIConnectionError,
    AuthenticationError,
    RateLimitError,
    BadRequestError,
)

from ..config import get_settings


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in the environment")
        if "REPLACE_ME" in settings.openai_api_key:
            raise RuntimeError(
                "OPENAI_API_KEY looks like a placeholder. Edit backend/.env and set your real key (sk-...)."
            )

        # Configure client with explicit API key and timeout.
        self.client = OpenAI(api_key=settings.openai_api_key, timeout=settings.request_timeout_seconds)
        self.model = settings.openai_model

    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> tuple[str, str]:
        """Send chat messages and return (reply_text, request_id).

        Raises exceptions from OpenAI SDK to be handled by the caller.
        """
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
        )

        if not getattr(resp, "choices", None):
            raise APIError("Empty response from OpenAI", response=None)

        content = resp.choices[0].message.content or ""
        req_id = getattr(resp, "id", "")
        return content, req_id

    def stream_chat(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> Iterable[str]:
        """Stream tokens from OpenAI. Yields incremental token strings only."""
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            stream=True,
        )

        for chunk in stream:
            # According to SDK v1, chunks are ChatCompletionChunk objects.
            # Each choice contains a `.delta` with optional `.content`.
            try:
                choices = getattr(chunk, "choices", [])
                if not choices:
                    continue
                delta = getattr(choices[0], "delta", None)
                token = getattr(delta, "content", None)
                if token:
                    yield token
            except Exception:
                # Ignore malformed chunks silently to keep stream alive
                continue


def build_messages(user_text: str, role: str, preferred_name: Optional[str] = None) -> List[Dict[str, str]]:
    # Minimal tone shim only; no extra guidance or disclaimers
    if preferred_name and preferred_name.strip():
        safe_name = re.sub(r"\s+", " ", preferred_name.strip())[:80]
        system = (
            f"Adopt the tone and style of a {role}. "
            f"Address the user as {safe_name}. "
            "Respond naturally and directly without disclaimers."
        )
    else:
        system = (
            f"Adopt the tone and style of a {role}. "
            "Respond naturally and directly without disclaimers."
        )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user_text},
    ]


__all__ = [
    "OpenAIService",
    "build_messages",
    "APIError",
    "APIConnectionError",
    "AuthenticationError",
    "RateLimitError",
    "BadRequestError",
]
