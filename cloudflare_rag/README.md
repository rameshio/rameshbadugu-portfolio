# Cloudflare Workers RAG Backend

Cloudflare-native RAG backend for Ramesh Badugu's portfolio chatbot, running alongside the existing Vercel frontend and Node `/api/chat` gateway (keeping `rag_backend/` as the Python LangChain fallback).

## Architecture

- **Cloudflare Workers (TypeScript):** Hosts `GET /health`, `POST /chat`, and authenticated `POST /ingest` (`src/index.ts`).
- **Cloudflare Workers AI (`@cf/baai/bge-small-en-v1.5`):** Generates `384`-dimension text embeddings directly via the `env.AI` binding.
- **Cloudflare Vectorize V2 (`portfolio-rag-index`):** Stores `384`-dimension cosine embeddings and source metadata (`source`, `title`, `section`, `page`, `chunk_index`, `text`).
- **OpenRouter:** Generates strictly grounded recruiter-facing answers from retrieved Vectorize chunks using `OPENROUTER_API_KEY` and configurable `OPENROUTER_MODEL`.
- **Cloudflare R2 (Optional):** `DOCS_BUCKET` archives ingested chunks when configured.

## Local Testing (No Cloudflare Deployment Required)

From `cloudflare_rag/`:

```powershell
# 1. Install dependencies
npm install

# 2. Generate Wrangler binding types & typecheck
npm run types
npm run typecheck

# 3. Extract & chunk resume PDF + portfolio documents (dry run)
npm run ingest:dry-run

# 4. Run Cloudflare Workers runtime tests (Miniflare / workerd via @cloudflare/vitest-plugin)
npm test
```

## Deployment Checklist (Run Only After Approval)

```powershell
# 1. Create the Vectorize V2 index (384 dimensions matches @cf/baai/bge-small-en-v1.5)
node ./node_modules/wrangler/bin/wrangler.js vectorize create portfolio-rag-index --dimensions=384 --metric=cosine

# 2. Set Worker secrets (never commit to wrangler.jsonc or Git)
node ./node_modules/wrangler/bin/wrangler.js secret put OPENROUTER_API_KEY
node ./node_modules/wrangler/bin/wrangler.js secret put RAG_API_KEY

# 3. Deploy the Worker
npm run deploy

# 4. Index resume PDF + portfolio docs into Vectorize
$env:RAG_INGEST_URL="https://rameshbadugu-portfolio-rag.<your-subdomain>.workers.dev/ingest"
$env:RAG_API_KEY="your-shared-secret"
node ./scripts/ingest.mjs
```

Then configure Vercel environment variables:
- `RAG_API_URL=https://rameshbadugu-portfolio-rag.<your-subdomain>.workers.dev/chat`
- `RAG_API_KEY=<matching-secret>`
