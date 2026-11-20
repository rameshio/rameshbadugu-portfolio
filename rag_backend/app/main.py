from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

from app.config import Settings, get_settings
from app.embeddings import get_vectorstore
from app.rag import answer_question
from app.security import InMemoryRateLimiter, extract_client_ip, verify_backend_auth

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("rag_backend.api")


class HistoryTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=1500)


class ChatRequest(BaseModel):
    message: str | None = Field(default=None, max_length=1500)
    question: str | None = Field(default=None, max_length=1500)
    query: str | None = Field(default=None, max_length=1500)
    history: list[HistoryTurn] = Field(default_factory=list, max_length=8)

    @model_validator(mode="after")
    def ensure_prompt_present(self) -> "ChatRequest":
        resolved = (self.message or self.question or self.query or "").strip()
        if not resolved:
            raise ValueError("One of 'message', 'question', or 'query' must be a non-empty string.")
        if len(resolved) > 1500:
            raise ValueError("Prompt must be 1500 characters or fewer.")
        return self

    def resolved_question(self) -> str:
        return (self.message or self.question or self.query or "").strip()


class ChatResponse(BaseModel):
    ok: bool = True
    answer: str
    reply: str
    sources: list[dict[str, Any]]
    model: str


def _collection_count(vectorstore: Any) -> int:
    try:
        collection = getattr(vectorstore, "_collection", None)
        if collection is not None and hasattr(collection, "count"):
            return int(collection.count())
    except Exception:
        return 0
    return 0


def create_app(
    *,
    settings: Settings | None = None,
    vectorstore: Any | None = None,
    llm: Any | None = None,
) -> FastAPI:
    active_settings = settings or get_settings()
    rate_limiter = InMemoryRateLimiter(
        max_requests=active_settings.rate_limit_max_requests,
        window_seconds=active_settings.rate_limit_window_seconds,
    )

    @asynccontextmanager
    async def lifespan(app_instance: FastAPI):
        if app_instance.state.vectorstore is None:
            try:
                app_instance.state.vectorstore = get_vectorstore(
                    persist_dir=active_settings.chroma_persist_dir,
                    collection_name=active_settings.chroma_collection_name,
                    embedding_model_name=active_settings.embedding_model_name,
                )
                logger.info(
                    "RAG backend initialized (collection=%s, chunks=%d, model=%s)",
                    active_settings.chroma_collection_name,
                    _collection_count(app_instance.state.vectorstore),
                    active_settings.openrouter_model,
                )
            except Exception as exc:
                logger.warning("ChromaDB warmup skipped at startup: %s", exc.__class__.__name__)
        yield

    application = FastAPI(
        title="Ramesh Badugu Portfolio RAG API",
        version="1.0.0",
        lifespan=lifespan,
    )
    application.state.settings = active_settings
    application.state.vectorstore = vectorstore
    application.state.llm = llm
    application.state.rate_limiter = rate_limiter

    if active_settings.allowed_origins:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=list(active_settings.allowed_origins),
            allow_credentials=False,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization", "X-API-Key"],
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        first_error = exc.errors()[0].get("msg", "Invalid request.") if exc.errors() else "Invalid request."
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"ok": False, "error": first_error},
        )

    def require_auth_and_rate_limit(
        request: Request,
        authorization: str | None = Header(default=None),
        x_api_key: str | None = Header(default=None),
    ) -> None:
        verify_backend_auth(
            expected_token=active_settings.rag_api_key,
            require_auth=active_settings.require_auth,
            authorization=authorization,
            x_api_key=x_api_key,
        )
        client_ip = extract_client_ip(request)
        decision = rate_limiter.check(client_ip)
        if not decision.allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again shortly.",
                headers={"Retry-After": str(decision.retry_after)},
            )

    @application.get("/health")
    def health() -> dict[str, Any]:
        store = application.state.vectorstore
        if store is None:
            try:
                store = get_vectorstore(
                    persist_dir=active_settings.chroma_persist_dir,
                    collection_name=active_settings.chroma_collection_name,
                    embedding_model_name=active_settings.embedding_model_name,
                )
                application.state.vectorstore = store
            except Exception:
                store = None

        chunk_count = _collection_count(store) if store is not None else 0
        return {
            "ok": True,
            "service": "rameshbadugu-portfolio-rag",
            "environment": active_settings.environment,
            "authEnabled": bool(active_settings.rag_api_key),
            "authRequired": active_settings.require_auth,
            "openrouterConfigured": bool(active_settings.openrouter_api_key),
            "model": active_settings.openrouter_model,
            "embeddingModel": active_settings.embedding_model_name,
            "collection": active_settings.chroma_collection_name,
            "indexedChunks": chunk_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    @application.post("/chat", response_model=ChatResponse)
    def chat(
        payload: ChatRequest,
        _guard: None = Depends(require_auth_and_rate_limit),
    ) -> ChatResponse:
        question = payload.resolved_question()
        history = [{"role": turn.role, "content": turn.content} for turn in payload.history]

        store = application.state.vectorstore
        if store is None:
            store = get_vectorstore(
                persist_dir=active_settings.chroma_persist_dir,
                collection_name=active_settings.chroma_collection_name,
                embedding_model_name=active_settings.embedding_model_name,
            )
            application.state.vectorstore = store

        if _collection_count(store) == 0 and application.state.vectorstore is not None:
            # Allow mocked test stores that don't expose private _collection.count()
            has_private_collection = getattr(store, "_collection", None) is not None
            if has_private_collection:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Resume vector store is empty. Run the ingestion script first.",
                )

        try:
            result = answer_question(
                question=question,
                history=history,
                settings=active_settings,
                vectorstore=store,
                llm=application.state.llm,
            )
            logger.info(
                "Answered /chat query (chars=%d, chunks=%d, model=%s)",
                len(question),
                result.retrieved_chunks,
                result.model,
            )
            return ChatResponse(
                ok=True,
                answer=result.answer,
                reply=result.answer,
                sources=result.sources,
                model=result.model,
            )
        except RuntimeError as exc:
            logger.error("Configuration or model error during /chat: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RAG generation service is temporarily unavailable.",
            ) from exc
        except Exception as exc:
            logger.exception("Unexpected error during /chat: %s", exc.__class__.__name__)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to generate a grounded response right now.",
            ) from exc

    return application


app = create_app()
