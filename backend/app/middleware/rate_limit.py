"""
rate_limit.py — slowapi rate limiting setup.

Usage in main.py:
    from app.middleware.rate_limit import limiter, rate_limit_handler
    from slowapi.errors import RateLimitExceeded

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

Then on any route:
    @router.post("/chat")
    @limiter.limit("10/minute")
    async def chat(request: Request, ...):

Dependency (add to requirements.txt):
    slowapi==0.1.9
"""

import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Limiter singleton
# ---------------------------------------------------------------------------

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/day", "50/hour"],   # global fallback
    storage_uri=os.getenv("RATE_LIMIT_STORAGE", "memory://"),
)


# ---------------------------------------------------------------------------
# Custom 429 error handler
# ---------------------------------------------------------------------------

async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": f"Too many requests. Limit: {exc.detail}. Please slow down.",
            "retry_after": "60 seconds",
        },
        headers={"Retry-After": "60"},
    )


# ---------------------------------------------------------------------------
# Per-endpoint limit presets (import these in routers)
# ---------------------------------------------------------------------------

LIMIT_CHAT       = "10/minute"     # chat is expensive (Gemini call)
LIMIT_GENERATE   = "30/minute"      # summarize / flashcards / faq / quiz
LIMIT_UPLOAD     = "20/hour"       # file uploads
LIMIT_AUTH       = "20/minute"     # login callbacks