from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent


def load_environment() -> None:
    """Load environment variables from repo root and rag_backend .env files."""
    load_dotenv(REPO_ROOT / ".env", override=False)
    load_dotenv(BACKEND_DIR / ".env", override=False)


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    environment: str
    openrouter_api_key: str
    openrouter_model: str
    openrouter_temperature: float
    openrouter_max_tokens: int
    rag_api_key: str
    require_auth: bool
    resume_pdf_path: Path
    chroma_persist_dir: Path
    chroma_collection_name: str
    embedding_model_name: str
    chunk_size: int
    chunk_overlap: int
    retrieval_k: int
    rate_limit_max_requests: int
    rate_limit_window_seconds: int
    allowed_origins: tuple[str, ...]
    app_url: str
    app_title: str


def get_settings() -> Settings:
    load_environment()

    environment = os.getenv("RAG_ENV", os.getenv("NODE_ENV", "development")).strip().lower()
    rag_api_key = os.getenv("RAG_API_KEY", "").strip()
    require_auth = _bool_env("RAG_REQUIRE_AUTH", environment == "production" or bool(rag_api_key))

    resume_override = os.getenv("RESUME_PDF_PATH", "").strip()
    resume_pdf_path = (
        Path(resume_override).expanduser().resolve()
        if resume_override
        else REPO_ROOT / "public" / "resume" / "Ramesh_Badugu_Resume.pdf"
    )

    chroma_override = os.getenv("CHROMA_PERSIST_DIR", "").strip()
    chroma_persist_dir = (
        Path(chroma_override).expanduser().resolve()
        if chroma_override
        else BACKEND_DIR / "chroma_db"
    )

    origins_raw = os.getenv(
        "RAG_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8787",
    )
    allowed_origins = tuple(origin.strip() for origin in origins_raw.split(",") if origin.strip())

    try:
        temperature = float(os.getenv("OPENROUTER_TEMPERATURE", "0.1"))
    except ValueError:
        temperature = 0.1

    return Settings(
        environment=environment,
        openrouter_api_key=os.getenv("OPENROUTER_API_KEY", "").strip(),
        openrouter_model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini").strip() or "openai/gpt-4o-mini",
        openrouter_temperature=temperature,
        openrouter_max_tokens=_int_env("OPENROUTER_MAX_TOKENS", 400),
        rag_api_key=rag_api_key,
        require_auth=require_auth,
        resume_pdf_path=resume_pdf_path,
        chroma_persist_dir=chroma_persist_dir,
        chroma_collection_name=os.getenv("CHROMA_COLLECTION_NAME", "ramesh_portfolio_resume").strip()
        or "ramesh_portfolio_resume",
        embedding_model_name=os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2").strip()
        or "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size=_int_env("RAG_CHUNK_SIZE", 700),
        chunk_overlap=_int_env("RAG_CHUNK_OVERLAP", 120),
        retrieval_k=_int_env("RAG_RETRIEVAL_K", 4),
        rate_limit_max_requests=_int_env("RAG_RATE_LIMIT_MAX_REQUESTS", 30),
        rate_limit_window_seconds=_int_env("RAG_RATE_LIMIT_WINDOW_SECONDS", 900),
        allowed_origins=allowed_origins,
        app_url=os.getenv("OPENROUTER_SITE_URL", "https://rameshbaduguai.com").strip(),
        app_title=os.getenv("OPENROUTER_APP_NAME", "Ramesh Badugu Portfolio RAG").strip(),
    )
