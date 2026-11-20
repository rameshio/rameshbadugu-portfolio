from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from langchain_core.documents import Document
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openrouter import ChatOpenRouter

from app.config import Settings
from app.embeddings import get_vectorstore

SYSTEM_INSTRUCTIONS = """You are the AI portfolio assistant for Ramesh Badugu.
Answer the visitor's question using ONLY the retrieved resume context provided below.

Strict grounding rules:
1. Do NOT invent, assume, or extrapolate professional experience, employers, dates, metrics, degrees, certifications, or project details that are not explicitly present in the retrieved context.
2. If the retrieved context does not contain enough information to answer, say clearly that the indexed resume does not specify that detail and suggest reaching out to Ramesh directly through the Contact section.
3. Keep responses concise, factual, and helpful for recruiters and technical interviewers.
4. Preserve exact company names, dates, technologies, and project names from the retrieved context."""


@dataclass(frozen=True)
class SourceAttribution:
    source: str
    file: str
    page: int
    chunk_index: int | None = None

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "source": self.source,
            "file": self.file,
            "page": self.page,
        }
        if self.chunk_index is not None:
            payload["chunk_index"] = self.chunk_index
        return payload


@dataclass(frozen=True)
class RagResponse:
    answer: str
    sources: list[dict[str, Any]]
    model: str
    retrieved_chunks: int


def build_openrouter_llm(settings: Settings) -> ChatOpenRouter:
    """Create a LangChain ChatOpenRouter instance from server-side settings."""
    if not settings.openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured on the server.")

    kwargs: dict[str, Any] = {
        "model": settings.openrouter_model,
        "api_key": settings.openrouter_api_key,
        "temperature": settings.openrouter_temperature,
        "max_tokens": settings.openrouter_max_tokens,
        "timeout": 8,
        "max_retries": 1,
    }
    if settings.app_url:
        kwargs["app_url"] = settings.app_url
    if settings.app_title:
        kwargs["app_title"] = settings.app_title

    return ChatOpenRouter(**kwargs)


def retrieve_documents(vectorstore: Any, query: str, k: int = 4) -> list[Document]:
    """Retrieve relevant document chunks from ChromaDB."""
    if hasattr(vectorstore, "similarity_search_with_score"):
        docs_with_scores = vectorstore.similarity_search_with_score(query, k=k)
        return [doc for doc, _score in docs_with_scores]
    return list(vectorstore.similarity_search(query, k=k))


def format_sources(documents: list[Document]) -> list[dict[str, Any]]:
    """Extract deduplicated source metadata entries from retrieved chunks."""
    seen: set[tuple[str, int]] = set()
    sources: list[dict[str, Any]] = []

    for doc in documents:
        meta = doc.metadata or {}
        file_name = str(meta.get("source") or "Ramesh_Badugu_Resume.pdf")
        raw_page = meta.get("page", 1)
        page = int(raw_page) if isinstance(raw_page, (int, float)) else 1
        raw_chunk = meta.get("chunk_index")
        chunk_index = int(raw_chunk) if isinstance(raw_chunk, (int, float)) else None

        key = (file_name, page)
        if key in seen:
            continue
        seen.add(key)

        sources.append(
            SourceAttribution(
                source=f"{file_name} (p. {page})",
                file=file_name,
                page=page,
                chunk_index=chunk_index,
            ).to_dict()
        )

    return sources


def format_context(documents: list[Document]) -> str:
    """Format retrieved chunks with explicit source/page headers for the LLM."""
    blocks: list[str] = []
    for idx, doc in enumerate(documents, start=1):
        meta = doc.metadata or {}
        source_name = str(meta.get("source") or "Ramesh_Badugu_Resume.pdf")
        page = meta.get("page", 1)
        blocks.append(f"[Excerpt {idx} | Source: {source_name}, Page {page}]\n{doc.page_content.strip()}")
    return "\n\n".join(blocks)


def _coerce_message_text(content: Any) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and "text" in item:
                parts.append(str(item["text"]))
        return "".join(parts).strip()
    return str(content or "").strip()


def answer_question(
    *,
    question: str,
    history: list[dict[str, str]] | None,
    settings: Settings,
    vectorstore: Any | None = None,
    llm: Any | None = None,
) -> RagResponse:
    """Retrieve grounded resume chunks and generate a ChatOpenRouter answer."""
    store = vectorstore or get_vectorstore(
        persist_dir=settings.chroma_persist_dir,
        collection_name=settings.chroma_collection_name,
        embedding_model_name=settings.embedding_model_name,
    )

    documents = retrieve_documents(store, question, k=settings.retrieval_k)
    if not documents:
        return RagResponse(
            answer=(
                "The resume vector index does not have matching context right now. "
                "Please run the resume ingestion script or contact Ramesh directly."
            ),
            sources=[],
            model=settings.openrouter_model,
            retrieved_chunks=0,
        )

    sources = format_sources(documents)
    context_text = format_context(documents)

    messages: list[BaseMessage] = [
        SystemMessage(
            content=f"{SYSTEM_INSTRUCTIONS}\n\nRETRIEVED RESUME CONTEXT:\n{context_text}"
        )
    ]

    for turn in (history or [])[-8:]:
        role = turn.get("role")
        content = str(turn.get("content") or "").strip()
        if not content:
            continue
        if role == "assistant":
            messages.append(AIMessage(content=content))
        elif role == "user":
            messages.append(HumanMessage(content=content))

    messages.append(HumanMessage(content=question))

    chat_model = llm or build_openrouter_llm(settings)
    ai_message = chat_model.invoke(messages)
    answer = _coerce_message_text(getattr(ai_message, "content", ai_message))
    if not answer:
        raise RuntimeError("OpenRouter returned an empty response.")

    return RagResponse(
        answer=answer,
        sources=sources,
        model=settings.openrouter_model,
        retrieved_chunks=len(documents),
    )
