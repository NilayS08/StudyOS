"""
auth.py — Google OAuth 2.0 SSO + JWT token issuance.

Flow:
  1. Frontend redirects user to GET /api/auth/google/login
  2. Google redirects back to GET /api/auth/google/callback?code=...
  3. We exchange code → tokens → fetch user profile
  4. We issue our own JWT and redirect to frontend with it
  5. Frontend stores JWT in localStorage, sends it as Bearer on every API call

Dependencies (add to requirements.txt):
  google-auth==2.29.0
  google-auth-oauthlib==1.2.0
  requests-oauthlib==1.3.1
  python-jose[cryptography]==3.3.0
  httpx==0.27.0
"""

import os
import logging
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Config — all pulled from .env
# ---------------------------------------------------------------------------

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

JWT_SECRET           = os.getenv("JWT_SECRET", "change-me-in-production-use-a-long-random-string")
JWT_ALGORITHM        = "HS256"
JWT_EXPIRE_HOURS     = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# Google OAuth endpoints
GOOGLE_AUTH_URL      = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL     = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"

# In-memory user store (replace with DB in production)
USER_STORE: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_jwt(user_id: str, email: str, name: str, picture: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {
        "sub":     user_id,
        "email":   email,
        "name":    name,
        "picture": picture,
        "exp":     expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}")


# ---------------------------------------------------------------------------
# Dependency — inject current user from Bearer token
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency.  Raises 401 if no valid JWT is present.
    Usage:  current_user: dict = Depends(get_current_user)
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_jwt(credentials.credentials)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    """Like get_current_user but returns None instead of raising — for soft-auth endpoints."""
    if credentials is None:
        return None
    try:
        return decode_jwt(credentials.credentials)
    except HTTPException:
        return None


# ---------------------------------------------------------------------------
# OAuth routes
# ---------------------------------------------------------------------------

@router.get("/auth/google/login")
def google_login():
    """Redirect the user to Google's OAuth consent screen."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID is not configured. See .env setup instructions.",
        )

    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",
        "prompt":        "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/auth/google/callback")
async def google_callback(code: str, request: Request):
    """Exchange the authorization code for tokens, fetch user info, issue JWT."""
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    async with httpx.AsyncClient() as client:
        # 1. Exchange code → access_token
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code":          code,
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri":  GOOGLE_REDIRECT_URI,
                "grant_type":    "authorization_code",
            },
        )

        if token_resp.status_code != 200:
            logger.error("Token exchange failed: %s", token_resp.text)
            raise HTTPException(status_code=502, detail="Failed to exchange code with Google")

        token_data   = token_resp.json()
        access_token = token_data.get("access_token")

        # 2. Fetch user profile
        profile_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if profile_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch user profile from Google")

        profile = profile_resp.json()

    user_id = profile.get("sub")
    email   = profile.get("email", "")
    name    = profile.get("name", "")
    picture = profile.get("picture", "")

    # Upsert user in store
    USER_STORE[user_id] = {"user_id": user_id, "email": email, "name": name, "picture": picture}
    logger.info("User authenticated: %s (%s)", name, email)

    # 3. Issue our JWT and redirect to frontend
    our_jwt = create_jwt(user_id, email, name, picture)
    redirect_url = f"{FRONTEND_URL}/auth/callback?token={our_jwt}"
    return RedirectResponse(redirect_url)


@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the decoded JWT claims for the logged-in user."""
    return {
        "user_id": current_user.get("sub"),
        "email":   current_user.get("email"),
        "name":    current_user.get("name"),
        "picture": current_user.get("picture"),
    }


@router.post("/auth/logout")
def logout():
    """
    Stateless logout — client must delete its own JWT.
    If you add a token blocklist DB later, invalidate here.
    """
    return {"message": "Logged out. Delete your token on the client."}