from __future__ import annotations

import hmac
import threading
import time
from dataclasses import dataclass

from fastapi import Header, HTTPException, Request, status


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    remaining: int
    retry_after: int = 0


class InMemoryRateLimiter:
    """Thread-safe fixed-window per-client rate limiter."""

    def __init__(self, *, max_requests: int = 30, window_seconds: int = 900) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._buckets: dict[str, tuple[int, float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str, now: float | None = None) -> RateLimitDecision:
        current_time = time.monotonic() if now is None else now
        bucket_key = key or "unknown"

        with self._lock:
            entry = self._buckets.get(bucket_key)
            if entry is None or (current_time - entry[1]) >= self.window_seconds:
                self._buckets[bucket_key] = (1, current_time)
                return RateLimitDecision(allowed=True, remaining=max(0, self.max_requests - 1))

            count, started_at = entry
            if count >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (current_time - started_at)) + 1)
                return RateLimitDecision(allowed=False, remaining=0, retry_after=retry_after)

            self._buckets[bucket_key] = (count + 1, started_at)
            return RateLimitDecision(allowed=True, remaining=max(0, self.max_requests - (count + 1)))


def extract_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        first = forwarded_for.split(",")[0].strip()
        if first:
            return first
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def verify_backend_auth(
    *,
    expected_token: str,
    require_auth: bool,
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> None:
    """Validate Bearer or X-API-Key credentials when authentication is active."""
    if not expected_token:
        if require_auth:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Backend authentication is required but RAG_API_KEY is not configured.",
            )
        return

    provided = ""
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token.strip():
            provided = token.strip()
    elif x_api_key:
        provided = x_api_key.strip()

    if not provided or not hmac.compare_digest(provided, expected_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
