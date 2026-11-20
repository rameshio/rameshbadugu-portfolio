# Ramesh Badugu Portfolio — Python LangChain RAG Backend

FastAPI + LangChain retrieval-augmented generation (RAG) service that indexes your resume PDF into persistent ChromaDB using local Hugging Face embeddings (`sentence-transformers/all-MiniLM-L6-v2`) and generates grounded answers via `ChatOpenRouter`.

## Architecture

1. **Document Ingestion (`app/ingest.py`)**
   - Loads `public/resume/Ramesh_Badugu_Resume.pdf` via `PyPDFLoader`.
   - Splits text with `RecursiveCharacterTextSplitter`.
   - Embeds chunks locally with `sentence-transformers/all-MiniLM-L6-v2` and stores them in persistent ChromaDB (`rag_backend/chroma_db`).
2. **Retrieval & Grounded Generation (`app/rag.py`)**
   - Retrieves top-k matching resume chunks with similarity scores and source metadata (`source`, `page`, `chunk_index`).
   - Calls LangChain `ChatOpenRouter` (`OPENROUTER_API_KEY` + `OPENROUTER_MODEL`) with strict grounding instructions so experience and project details are never fabricated.
3. **FastAPI Service (`app/main.py`)**
   - `GET /health` — service, vector store chunk count, and OpenRouter/auth configuration status.
   - `POST /chat` — accepts `{ message | question | query, history }` and returns `{ ok, answer, reply, sources, model }`.
   - Enforces Bearer / `X-API-Key` backend authentication (`RAG_API_KEY`), per-IP rate limiting, strict Pydantic input validation, and safe error/logging handling.

## Windows Setup

From the repository root:

```powershell
# 1. Create and activate Python 3.12 virtual environment
py -3.12 -m venv rag_backend\.venv
.\rag_backend\.venv\Scripts\Activate.ps1

# 2. Install Python dependencies
pip install -r rag_backend\requirements.txt
```

## Environment Variables

Configure these in the repository root `.env` (never commit `.env` to Git):

```env
# Required for ChatOpenRouter generation
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini

# Shared secret between Node/Vercel /api/chat and Python FastAPI /chat
RAG_API_URL=http://127.0.0.1:8000/chat
RAG_API_KEY=replace_with_a_long_random_secret
```

## 1. Index Your Resume PDF

Run the standalone ingestion script whenever your resume changes:

```powershell
cd rag_backend
.\.venv\Scripts\python.exe -m app.ingest
```

Optional overrides: `--pdf ..\public\resume\Ramesh_Badugu_Resume.pdf --chunk-size 700 --chunk-overlap 120`.

## 2. Run the FastAPI RAG Server Locally

```powershell
cd rag_backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Then run the portfolio frontend + Node API proxy from the repository root in a second terminal:

```powershell
npm run dev
```

## 3. Run Local Tests

```powershell
# Python RAG backend tests (ingestion, retrieval, OpenRouter grounding, auth, rate limit, FastAPI)
cd rag_backend
.\.venv\Scripts\python.exe -m pytest -v

# Node /api/chat connector tests (from repository root)
node --test server\*.test.js
```
