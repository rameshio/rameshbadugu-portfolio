from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


@lru_cache(maxsize=2)
def get_embedding_model(model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> HuggingFaceEmbeddings:
    """Load and cache the local Hugging Face embedding model."""
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def get_vectorstore(
    *,
    persist_dir: Path,
    collection_name: str,
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> Chroma:
    """Open or initialize the persistent ChromaDB vector store."""
    persist_dir.mkdir(parents=True, exist_ok=True)
    embeddings = get_embedding_model(embedding_model_name)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=str(persist_dir),
    )
