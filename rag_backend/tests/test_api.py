from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from langchain_core.documents import Document
from langchain_core.messages import AIMessage

from app.config import Settings
from app.main import create_app
from app.rag import build_openrouter_llm


class FakeVectorStore:
    def __init__(self, docs: list[Document]) -> None:
        self._docs = docs

    def similarity_search_with_score(self, query: str, k: int = 4) -> list[tuple[Document, float]]:
        return [(doc, 0.1) for doc in self._docs[:k]]


class RecordingLLM:
    def __init__(self, reply_text: str = "Ramesh worked at Vanguard as a Junior Frontend Developer.") -> None:
        self.reply_text = reply_text
        self.calls: list[list[Any]] = []

    def invoke(self, messages: list[Any]) -> AIMessage:
        self.calls.append(messages)
        return AIMessage(content=self.reply_text)


def make_test_settings(tmp_path: Path, **overrides: Any) -> Settings:
    defaults: dict[str, Any] = {
        "environment": "test",
        "openrouter_api_key": "test-openrouter-secret",
        "openrouter_model": "openai/gpt-4o-mini",
        "openrouter_temperature": 0.1,
        "openrouter_max_tokens": 400,
        "rag_api_key": "test-backend-token",
        "require_auth": True,
        "resume_pdf_path": tmp_path / "resume.pdf",
        "chroma_persist_dir": tmp_path / "chroma",
        "chroma_collection_name": "test_collection",
        "embedding_model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "chunk_size": 700,
        "chunk_overlap": 120,
        "retrieval_k": 4,
        "rate_limit_max_requests": 5,
        "rate_limit_window_seconds": 60,
        "allowed_origins": ("http://localhost:5173",),
        "app_url": "https://rameshbaduguai.com",
        "app_title": "Test Portfolio RAG",
    }
    defaults.update(overrides)
    return Settings(**defaults)


def sample_docs() -> list[Document]:
    return [
        Document(
            page_content="Junior Frontend Developer at Vanguard (Aug 2024 - Sep 2025). Built React.js UI components.",
            metadata={"source": "Ramesh_Badugu_Resume.pdf", "page": 1, "chunk_index": 0},
        ),
        Document(
            page_content="Igris AI Commander: Telegram-based AI agent orchestrator using Node.js and TypeScript.",
            metadata={"source": "Ramesh_Badugu_Resume.pdf", "page": 1, "chunk_index": 1},
        ),
    ]


def test_health_endpoint_does_not_leak_secrets(tmp_path: Path) -> None:
    settings = make_test_settings(tmp_path)
    app = create_app(settings=settings, vectorstore=FakeVectorStore(sample_docs()), llm=RecordingLLM())

    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True
        assert body["authEnabled"] is True
        assert body["openrouterConfigured"] is True
        assert body["model"] == "openai/gpt-4o-mini"
        assert "test-openrouter-secret" not in response.text
        assert "test-backend-token" not in response.text


def test_chat_requires_valid_authentication(tmp_path: Path) -> None:
    settings = make_test_settings(tmp_path)
    app = create_app(settings=settings, vectorstore=FakeVectorStore(sample_docs()), llm=RecordingLLM())

    with TestClient(app) as client:
        missing = client.post("/chat", json={"message": "Tell me about Vanguard"})
        assert missing.status_code == 401

        wrong = client.post(
            "/chat",
            headers={"Authorization": "Bearer wrong-token"},
            json={"message": "Tell me about Vanguard"},
        )
        assert wrong.status_code == 401

        via_bearer = client.post(
            "/chat",
            headers={"Authorization": "Bearer test-backend-token"},
            json={"message": "Tell me about Vanguard"},
        )
        assert via_bearer.status_code == 200

        via_header = client.post(
            "/chat",
            headers={"X-API-Key": "test-backend-token"},
            json={"question": "Tell me about Igris"},
        )
        assert via_header.status_code == 200


def test_chat_fails_closed_when_auth_required_without_token(tmp_path: Path) -> None:
    settings = make_test_settings(tmp_path, rag_api_key="", require_auth=True)
    app = create_app(settings=settings, vectorstore=FakeVectorStore(sample_docs()), llm=RecordingLLM())

    with TestClient(app) as client:
        response = client.post("/chat", json={"message": "Hello"})
        assert response.status_code == 503


def test_chat_supports_connector_aliases_history_and_sources(tmp_path: Path) -> None:
    settings = make_test_settings(tmp_path)
    llm = RecordingLLM("Ramesh built React.js components at Vanguard.")
    app = create_app(settings=settings, vectorstore=FakeVectorStore(sample_docs()), llm=llm)

    with TestClient(app) as client:
        response = client.post(
            "/chat",
            headers={"Authorization": "Bearer test-backend-token"},
            json={
                "query": "What did Ramesh do at Vanguard?",
                "history": [
                    {"role": "user", "content": "Hi"},
                    {"role": "assistant", "content": "Hello! How can I help?"},
                ],
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["answer"] == "Ramesh built React.js components at Vanguard."
    assert data["reply"] == data["answer"]
    assert data["model"] == "openai/gpt-4o-mini"
    assert len(data["sources"]) == 1
    assert data["sources"][0]["source"] == "Ramesh_Badugu_Resume.pdf (p. 1)"

    sent_messages = llm.calls[0]
    assert "Do NOT invent" in sent_messages[0].content
    assert "Junior Frontend Developer at Vanguard" in sent_messages[0].content
    assert sent_messages[-1].content == "What did Ramesh do at Vanguard?"


def test_chat_validates_payload_and_rate_limits(tmp_path: Path) -> None:
    headers = {"Authorization": "Bearer test-backend-token"}

    validation_app = create_app(
        settings=make_test_settings(tmp_path, rate_limit_max_requests=10),
        vectorstore=FakeVectorStore(sample_docs()),
        llm=RecordingLLM(),
    )
    with TestClient(validation_app) as client:
        empty_res = client.post("/chat", headers=headers, json={"message": "   "})
        assert empty_res.status_code == 422

        too_long = client.post("/chat", headers=headers, json={"message": "x" * 1501})
        assert too_long.status_code == 422

    rate_limit_app = create_app(
        settings=make_test_settings(tmp_path, rate_limit_max_requests=2),
        vectorstore=FakeVectorStore(sample_docs()),
        llm=RecordingLLM(),
    )
    with TestClient(rate_limit_app) as client:
        assert client.post("/chat", headers=headers, json={"message": "q1"}).status_code == 200
        assert client.post("/chat", headers=headers, json={"message": "q2"}).status_code == 200
        limited = client.post("/chat", headers=headers, json={"message": "q3"})
        assert limited.status_code == 429
        assert "Retry-After" in limited.headers


def test_build_openrouter_llm_requires_key_and_reads_model(tmp_path: Path) -> None:
    missing_settings = make_test_settings(tmp_path, openrouter_api_key="")
    with pytest.raises(RuntimeError):
        build_openrouter_llm(missing_settings)

    configured = make_test_settings(tmp_path, openrouter_model="anthropic/claude-3.5-haiku")
    llm = build_openrouter_llm(configured)
    assert llm.model_name == "anthropic/claude-3.5-haiku"
