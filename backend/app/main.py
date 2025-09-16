from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging
from .config import get_settings
from .routers import chat as chat_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Sally Backend", version="0.2.0")

    # CORS: allow configured origins (suitable for Vite dev server)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=3600,
    )

    @app.get("/health")
    async def health():
        return {"ok": True}

    app.include_router(chat_router.router)

    @app.on_event("startup")
    async def _validate_openai():
        s = get_settings()
        if not s.openai_api_key:
            # Keep server up so /health works and UI can show a friendly error.
            logging.getLogger("uvicorn.error").warning("OPENAI_API_KEY is not set. Chat endpoints will return errors until configured.")
        else:
            logging.getLogger("uvicorn.error").info("OpenAI configured. model=%s timeout=%ss", s.openai_model, s.request_timeout_seconds)
    return app


app = create_app()
