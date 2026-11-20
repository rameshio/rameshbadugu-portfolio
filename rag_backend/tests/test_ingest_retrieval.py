from __future__ import annotations

from pathlib import Path

import pytest

from app.config import REPO_ROOT
from app.embeddings import get_vectorstore
from app.ingest import ingest_resume
from app.rag import format_sources, retrieve_documents

RESUME_PDF = REPO_ROOT / "public" / "resume" / "Ramesh_Badugu_Resume.pdf"


def test_ingest_and_retrieve_resume_pdf(tmp_path: Path) -> None:
    persist_dir = tmp_path / "chroma_test"
    collection_name = "test_resume_collection"

    first_run = ingest_resume(
        pdf_path=RESUME_PDF,
        persist_dir=persist_dir,
        collection_name=collection_name,
        chunk_size=700,
        chunk_overlap=120,
        reset_collection=True,
    )

    assert first_run.pages_loaded >= 1
    assert first_run.chunks_indexed >= 2

    # Re-running with reset_collection=True must not duplicate chunks
    second_run = ingest_resume(
        pdf_path=RESUME_PDF,
        persist_dir=persist_dir,
        collection_name=collection_name,
        chunk_size=700,
        chunk_overlap=120,
        reset_collection=True,
    )
    assert second_run.chunks_indexed == first_run.chunks_indexed

    store = get_vectorstore(
        persist_dir=persist_dir,
        collection_name=collection_name,
    )
    docs = retrieve_documents(store, "What frontend experience does Ramesh have at Vanguard?", k=3)
    assert len(docs) > 0
    combined_text = "\n".join(doc.page_content for doc in docs)
    assert "vanguard" in combined_text.lower() or "react" in combined_text.lower()

    sources = format_sources(docs)
    assert len(sources) >= 1
    assert sources[0]["file"] == "Ramesh_Badugu_Resume.pdf"
    assert sources[0]["page"] >= 1
    assert "Ramesh_Badugu_Resume.pdf" in sources[0]["source"]


def test_ingest_missing_pdf_raises(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        ingest_resume(
            pdf_path=tmp_path / "missing.pdf",
            persist_dir=tmp_path / "chroma_missing",
            collection_name="missing_collection",
        )
