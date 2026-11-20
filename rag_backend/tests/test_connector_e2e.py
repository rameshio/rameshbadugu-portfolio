from __future__ import annotations

import json
import os
import shutil
import socket
import subprocess
import threading
import time
from pathlib import Path
from typing import Any

import httpx
import uvicorn
from langchain_core.messages import AIMessage

from app.config import REPO_ROOT, Settings
from app.embeddings import get_vectorstore
from app.main import create_app


class GroundedEchoLLM:
    """Test LLM that verifies retrieved resume context was supplied before replying."""

    def invoke(self, messages: list[Any]) -> AIMessage:
        system_prompt = str(messages[0].content)
        assert "RETRIEVED RESUME CONTEXT:" in system_prompt
        assert "Vanguard" in system_prompt or "React" in system_prompt
        return AIMessage(
            content="Grounded reply: Ramesh Badugu worked as a Junior Frontend Developer at Vanguard."
        )


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def test_node_connector_to_fastapi_chromadb_end_to_end(tmp_path: Path) -> None:
    persisted_chroma = REPO_ROOT / "rag_backend" / "chroma_db"
    assert persisted_chroma.exists(), "Expected ingested ChromaDB at rag_backend/chroma_db"

    settings = Settings(
        environment="test",
        openrouter_api_key="test-openrouter-secret",
        openrouter_model="openai/gpt-4o-mini",
        openrouter_temperature=0.1,
        openrouter_max_tokens=400,
        rag_api_key="e2e-shared-secret",
        require_auth=True,
        resume_pdf_path=REPO_ROOT / "public" / "resume" / "Ramesh_Badugu_Resume.pdf",
        chroma_persist_dir=persisted_chroma,
        chroma_collection_name="ramesh_portfolio_resume",
        embedding_model_name="sentence-transformers/all-MiniLM-L6-v2",
        chunk_size=700,
        chunk_overlap=120,
        retrieval_k=3,
        rate_limit_max_requests=20,
        rate_limit_window_seconds=60,
        allowed_origins=("http://localhost:5173",),
        app_url="https://rameshbaduguai.com",
        app_title="E2E Portfolio RAG",
    )

    real_store = get_vectorstore(
        persist_dir=settings.chroma_persist_dir,
        collection_name=settings.chroma_collection_name,
        embedding_model_name=settings.embedding_model_name,
    )
    app = create_app(settings=settings, vectorstore=real_store, llm=GroundedEchoLLM())

    port = _free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    try:
        health_url = f"http://127.0.0.1:{port}/health"
        chat_url = f"http://127.0.0.1:{port}/chat"

        deadline = time.monotonic() + 10
        health_data: dict[str, Any] | None = None
        while time.monotonic() < deadline:
            try:
                res = httpx.get(health_url, timeout=1.0)
                if res.status_code == 200:
                    health_data = res.json()
                    break
            except httpx.HTTPError:
                time.sleep(0.1)

        assert health_data is not None, "FastAPI server did not become ready in time"
        assert health_data["ok"] is True
        assert health_data["indexedChunks"] >= 2

        node_script = (
            "import { processChat } from './server/chat-service.js';"
            "const okRes = await processChat({"
            "  method: 'POST',"
            "  ip: 'e2e-1',"
            "  payload: { message: 'Where did Ramesh work as a frontend developer?', history: [] },"
            "  env: { RAG_API_URL: process.env.E2E_CHAT_URL, RAG_API_KEY: process.env.E2E_CHAT_KEY }"
            "});"
            "const fallbackRes = await processChat({"
            "  method: 'POST',"
            "  ip: 'e2e-2',"
            "  payload: { message: 'Tell me about Igris AI Commander', history: [] },"
            "  env: { RAG_API_URL: process.env.E2E_CHAT_URL, RAG_API_KEY: 'wrong-key' }"
            "});"
            "console.log(JSON.stringify({ okRes, fallbackRes }));"
        )

        node_exe = shutil.which("node") or "node"
        env_copy = os.environ.copy()
        env_copy["E2E_CHAT_URL"] = chat_url
        env_copy["E2E_CHAT_KEY"] = "e2e-shared-secret"

        proc = subprocess.run(
            [node_exe, "--input-type=module", "-e", node_script],
            cwd=str(REPO_ROOT),
            env=env_copy,
            capture_output=True,
            text=True,
            timeout=15,
            check=True,
        )

        parsed = json.loads(proc.stdout.strip().splitlines()[-1])
        ok_body = parsed["okRes"]["body"]
        assert parsed["okRes"]["status"] == 200
        assert ok_body["ok"] is True
        assert ok_body["mode"] == "rag"
        assert ok_body["fallback"] is False
        assert "Vanguard" in ok_body["reply"]
        assert len(ok_body["sources"]) >= 1
        assert "Ramesh_Badugu_Resume.pdf" in ok_body["sources"][0]

        fallback_body = parsed["fallbackRes"]["body"]
        assert parsed["fallbackRes"]["status"] == 200
        assert fallback_body["ok"] is True
        assert fallback_body["mode"] == "builtin"
        assert fallback_body["fallback"] is True
        assert "Igris" in fallback_body["reply"]
    finally:
        server.should_exit = True
        thread.join(timeout=5)
