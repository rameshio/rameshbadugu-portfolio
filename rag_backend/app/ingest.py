from __future__ import annotations

import argparse
import logging
import sys
from dataclasses import dataclass
from pathlib import Path

import chromadb
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import get_settings
from app.embeddings import get_embedding_model

logger = logging.getLogger("rag_backend.ingest")


@dataclass(frozen=True)
class IngestionResult:
    pdf_path: Path
    pages_loaded: int
    chunks_indexed: int
    collection_name: str
    persist_dir: Path


def ingest_resume(
    *,
    pdf_path: Path,
    persist_dir: Path,
    collection_name: str,
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
    chunk_size: int = 700,
    chunk_overlap: int = 120,
    reset_collection: bool = True,
) -> IngestionResult:
    """Load, split, embed, and persist resume PDF chunks into ChromaDB."""
    resolved_pdf = pdf_path.expanduser().resolve()
    if not resolved_pdf.is_file():
        raise FileNotFoundError(f"Resume PDF not found at: {resolved_pdf}")

    loader = PyPDFLoader(str(resolved_pdf))
    pages = loader.load()
    non_empty_pages = [page for page in pages if page.page_content and page.page_content.strip()]
    if not non_empty_pages:
        raise ValueError(f"No extractable text found in PDF: {resolved_pdf.name}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "• ", ". ", " ", ""],
    )
    chunks = splitter.split_documents(non_empty_pages)
    if not chunks:
        raise ValueError(f"Text splitter produced 0 chunks for: {resolved_pdf.name}")

    for idx, chunk in enumerate(chunks):
        raw_page = chunk.metadata.get("page", 0)
        page_number = int(raw_page) + 1 if isinstance(raw_page, (int, float)) else 1
        chunk.metadata = {
            "source": resolved_pdf.name,
            "page": page_number,
            "chunk_index": idx,
            "document_type": "resume",
        }

    resolved_persist = persist_dir.expanduser().resolve()
    resolved_persist.mkdir(parents=True, exist_ok=True)

    if reset_collection:
        client = chromadb.PersistentClient(path=str(resolved_persist))
        existing_names = [
            col.name if hasattr(col, "name") else str(col)
            for col in client.list_collections()
        ]
        if collection_name in existing_names:
            client.delete_collection(name=collection_name)

    embeddings = get_embedding_model(embedding_model_name)
    vectorstore = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=str(resolved_persist),
    )
    ids = [f"{resolved_pdf.stem}-chunk-{idx}" for idx in range(len(chunks))]
    vectorstore.add_documents(documents=chunks, ids=ids)

    return IngestionResult(
        pdf_path=resolved_pdf,
        pages_loaded=len(non_empty_pages),
        chunks_indexed=len(chunks),
        collection_name=collection_name,
        persist_dir=resolved_persist,
    )


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    settings = get_settings()

    parser = argparse.ArgumentParser(description="Ingest resume PDF into persistent ChromaDB.")
    parser.add_argument("--pdf", type=Path, default=settings.resume_pdf_path, help="Path to resume PDF.")
    parser.add_argument("--persist-dir", type=Path, default=settings.chroma_persist_dir, help="ChromaDB directory.")
    parser.add_argument("--collection", type=str, default=settings.chroma_collection_name, help="Collection name.")
    parser.add_argument("--chunk-size", type=int, default=settings.chunk_size, help="Chunk size in characters.")
    parser.add_argument("--chunk-overlap", type=int, default=settings.chunk_overlap, help="Chunk overlap in characters.")
    args = parser.parse_args(argv)

    result = ingest_resume(
        pdf_path=args.pdf,
        persist_dir=args.persist_dir,
        collection_name=args.collection,
        embedding_model_name=settings.embedding_model_name,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        reset_collection=True,
    )
    logger.info(
        "Indexed %d chunks from %d page(s) of %s into collection '%s' at %s",
        result.chunks_indexed,
        result.pages_loaded,
        result.pdf_path.name,
        result.collection_name,
        result.persist_dir,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
