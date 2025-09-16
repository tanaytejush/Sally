import logging
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..schemas import ChatRequest, ChatResponse
from ..services.openai_client import (
    OpenAIService,
    build_messages,
    AuthenticationError,
    APIConnectionError,
    RateLimitError,
    BadRequestError,
    APIError,
)
try:
    from openai import PermissionDeniedError  # type: ignore
except Exception:  # pragma: no cover
    PermissionDeniedError = None


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        svc = OpenAIService()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        t0 = time.perf_counter()
        preferred = None
        if req.userNamePreference and req.userNamePreference.name:
            preferred = req.userNamePreference.name
        messages = build_messages(req.message, req.role, preferred)
        reply, req_id = svc.chat(messages)
        dt = time.perf_counter() - t0
        logging.getLogger("uvicorn.access").info("openai_request_id=%s latency=%.3fs", req_id, dt)
        return ChatResponse(reply=reply, model=svc.model)

    except AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key")
    except RateLimitError:
        raise HTTPException(status_code=429, detail="OpenAI rate limit exceeded. Please try again.")
    except APIConnectionError:
        raise HTTPException(status_code=504, detail="Unable to reach OpenAI service (network).")
    except BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Bad request to OpenAI: {e}")
    except APIError as e:
        # Covers server-side errors from OpenAI
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")
    except Exception as e:
        if PermissionDeniedError and isinstance(e, PermissionDeniedError):
            raise HTTPException(status_code=403, detail="OpenAI permission denied")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    try:
        svc = OpenAIService()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    def event_gen():
        t0 = time.perf_counter()
        req_id = None
        try:
            preferred = None
            if req.userNamePreference and req.userNamePreference.name:
                preferred = req.userNamePreference.name
            messages = build_messages(req.message, req.role, preferred)
            # We cannot reliably get the request id until first chunk; so capture when present
            for token in svc.stream_chat(messages):
                # Send Server-Sent Events style lines
                yield f"data: {token}\n\n"
                if token and req_id is None:
                    # We can't get ID without SDK access on chunks in this simplified path; skip.
                    pass
        except AuthenticationError:
            yield "event: error\n" + "data: 401 Invalid OpenAI API key\n\n"
        except RateLimitError:
            yield "event: error\n" + "data: 429 OpenAI rate limit exceeded\n\n"
        except APIConnectionError:
            yield "event: error\n" + "data: 504 Unable to reach OpenAI service\n\n"
        except BadRequestError as e:
            yield "event: error\n" + f"data: 400 Bad request: {e}\n\n"
        except APIError as e:
            yield "event: error\n" + f"data: 500 OpenAI API error: {e}\n\n"
        except Exception as e:
            if PermissionDeniedError and isinstance(e, PermissionDeniedError):
                yield "event: error\n" + "data: 403 OpenAI permission denied\n\n"
            else:
                yield "event: error\n" + f"data: 500 Unexpected error: {e}\n\n"
        finally:
            dt = time.perf_counter() - t0
            logging.getLogger("uvicorn.access").info("stream latency=%.3fs", dt)

    return StreamingResponse(event_gen(), media_type="text/event-stream")
