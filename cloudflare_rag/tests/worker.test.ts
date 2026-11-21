import { describe, expect, it, vi } from "vitest";
import portfolioDocs from "../data/portfolio-documents.json";
import { buildDocumentChunks } from "../src/chunker";
import { createWorkerHandler, type WorkerRuntimeEnv } from "../src/index";
import { isFreeOpenRouterModel, resolveFreeModelChain } from "../src/rag";
import { timingSafeTokenMatch } from "../src/security";
import { processChat } from "../../server/chat-service.js";

interface StoredVector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

function createFakeVectorize(): VectorizeIndex & { records: StoredVector[] } {
  const records: StoredVector[] = [];

  const upsert = async (vectors: VectorizeVector[]) => {
    for (const vec of vectors) {
      const idx = records.findIndex((r) => r.id === vec.id);
      const entry: StoredVector = {
        id: vec.id,
        values: Array.from(vec.values as number[]),
        metadata: vec.metadata as Record<string, unknown>,
      };
      if (idx >= 0) records[idx] = entry;
      else records.push(entry);
    }
    return { mutationId: "mut-test-1" };
  };

  return {
    records,
    upsert,
    insert: upsert,
    async query(vector: VectorFloatArray | number[], options?: VectorizeQueryOptions) {
      const topK = options?.topK ?? 4;
      const q = Array.from(vector as number[]);
      const scored = records.map((rec) => {
        let dot = 0;
        for (let i = 0; i < Math.min(q.length, rec.values.length); i += 1) {
          dot += q[i] * rec.values[i];
        }
        return {
          id: rec.id,
          score: Number(dot.toFixed(4)),
          metadata: rec.metadata,
        };
      });
      scored.sort((a, b) => b.score - a.score);
      const matches = scored.slice(0, topK);
      return { matches, count: matches.length };
    },
    async queryById() {
      return { matches: [], count: 0 };
    },
    async getByIds() {
      return [];
    },
    async deleteByIds() {
      return { mutationId: "del-test-1" };
    },
    async describe() {
      return {
        vectorsCount: records.length,
        dimensions: 384,
        processedUpToDatetime: new Date().toISOString(),
        processedUpToMutation: "mut-test-1",
      };
    },
  } as unknown as VectorizeIndex & { records: StoredVector[] };
}

function deterministicEmbedding(text: string): number[] {
  // Produce a normalized 384-d semantic-proxy vector keyed on domain terms for deterministic ranking
  const vec = new Array<number>(384).fill(0);
  const lower = text.toLowerCase();
  const buckets: Array<[string, number]> = [
    ["vanguard", 0],
    ["react", 1],
    ["infosys", 2],
    ["igris", 3],
    ["telegram", 4],
    ["education", 5],
    ["anthropic", 6],
    ["contact", 7],
  ];
  let norm = 0;
  for (const [term, idx] of buckets) {
    if (lower.includes(term)) {
      vec[idx] = 1;
      norm += 1;
    }
  }
  if (norm === 0) {
    vec[10] = 1;
    norm = 1;
  }
  const scale = 1 / Math.sqrt(norm);
  return vec.map((v) => v * scale);
}

function createFakeAi(): Ai {
  return {
    async run(_model: string, input: { text?: string[] }) {
      const texts = Array.isArray(input?.text) ? input.text : [];
      return {
        shape: [texts.length, 384],
        data: texts.map((t) => deterministicEmbedding(t)),
      };
    },
  } as unknown as Ai;
}

function createFakeR2(): R2Bucket & { storedKeys: string[] } {
  const objects = new Map<string, string>();
  const storedKeys: string[] = [];
  return {
    storedKeys,
    async put(key: string, value: string) {
      objects.set(key, String(value));
      storedKeys.push(key);
      return null;
    },
    async get(key: string) {
      const val = objects.get(key);
      return val ? ({ text: async () => val } as R2ObjectBody) : null;
    },
  } as unknown as R2Bucket & { storedKeys: string[] };
}

function makeEnv(overrides: Partial<WorkerRuntimeEnv> = {}): WorkerRuntimeEnv {
  return {
    ENVIRONMENT: "test",
    EMBEDDING_MODEL: "@cf/baai/bge-small-en-v1.5",
    OPENROUTER_MODEL: "google/gemma-4-26b-a4b-it:free",
    OPENROUTER_FALLBACK_MODELS: "nvidia/nemotron-3.5-lightning:free,openrouter/free",
    OPENROUTER_SITE_URL: "https://rameshbaduguai.com",
    OPENROUTER_APP_NAME: "Test Portfolio RAG",
    RETRIEVAL_TOP_K: "3",
    RATE_LIMIT_MAX_REQUESTS: "20",
    RATE_LIMIT_WINDOW_SECONDS: "900",
    REQUIRE_AUTH: "true",
    ALLOWED_ORIGINS: "",
    OPENROUTER_API_KEY: "test-openrouter-secret",
    RAG_API_KEY: "test-rag-secret",
    AI: createFakeAi(),
    VECTORIZE: createFakeVectorize(),
    ...overrides,
  } as WorkerRuntimeEnv;
}

describe("Cloudflare Portfolio RAG Worker", () => {
  it("reports health status without leaking secrets", async () => {
    const worker = createWorkerHandler();
    const env = makeEnv();

    const response = await worker.fetch(new Request("https://worker.test/health"), env);
    expect(response.status).toBe(200);
    const text = await response.text();
    const body = JSON.parse(text);

    expect(body.ok).toBe(true);
    expect(body.authEnabled).toBe(true);
    expect(body.openrouterConfigured).toBe(true);
    expect(body.model).toBe("google/gemma-4-26b-a4b-it:free");
    expect(body.fallbackModels).toEqual(["nvidia/nemotron-3.5-lightning:free", "openrouter/free"]);
    expect(body.freeModelsOnly).toBe(true);
    expect(body.embeddingModel).toBe("@cf/baai/bge-small-en-v1.5");
    expect(body.vectorizeBound).toBe(true);
    expect(text).not.toContain("test-openrouter-secret");
    expect(text).not.toContain("test-rag-secret");
  });

  it("ingests resume & portfolio documents into Vectorize and optional R2, then retrieves with sources", async () => {
    const vectorize = createFakeVectorize();
    const r2 = createFakeR2();
    const capturedRequests: Array<{ url: string; body: Record<string, unknown>; auth: string | null }> = [];

    const worker = createWorkerHandler({
      fetchImpl: async (input, init) => {
        const url = input instanceof URL ? input.toString() : typeof input === "string" ? input : input.url;
        const headers = new Headers(init?.headers);
        capturedRequests.push({
          url,
          auth: headers.get("authorization"),
          body: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
        });
        return Response.json({
          choices: [
            {
              message: {
                content: "Ramesh built Igris AI Commander using Node.js, TypeScript, and Telegram Bot API.",
              },
            },
          ],
        });
      },
    });

    const env = makeEnv({ VECTORIZE: vectorize, DOCS_BUCKET: r2 });

    const ingestRes = await worker.fetch(
      new Request("https://worker.test/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-rag-secret",
        },
        body: JSON.stringify({ documents: portfolioDocs }),
      }),
      env,
    );

    expect(ingestRes.status).toBe(200);
    const ingestBody = (await ingestRes.json()) as Record<string, unknown>;
    expect(ingestBody.ok).toBe(true);
    expect(ingestBody.documentsProcessed).toBe(portfolioDocs.length);
    expect(Number(ingestBody.chunksUpserted)).toBeGreaterThanOrEqual(portfolioDocs.length);
    expect(ingestBody.r2Archived).toBe(true);
    expect(r2.storedKeys).toContain("latest-ingested-chunks.json");
    expect(vectorize.records[0]?.values.length).toBe(384);

    const chatRes = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-rag-secret",
        },
        body: JSON.stringify({
          query: "Tell me about Igris AI Commander and Telegram",
          history: [{ role: "user", content: "Hi" }],
        }),
      }),
      env,
    );

    expect(chatRes.status).toBe(200);
    const chatBody = (await chatRes.json()) as {
      ok: boolean;
      answer: string;
      reply: string;
      sources: Array<{ source: string; file: string; page: number }>;
      model: string;
    };

    expect(chatBody.ok).toBe(true);
    expect(chatBody.answer).toContain("Igris AI Commander");
    expect(chatBody.reply).toBe(chatBody.answer);
    expect(chatBody.model).toBe("google/gemma-4-26b-a4b-it:free");
    expect(chatBody.sources[0]?.file).toBe("Portfolio_Igris_Capstone.md");
    expect(capturedRequests[0]?.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(capturedRequests[0]?.auth).toBe("Bearer test-openrouter-secret");
    expect(capturedRequests[0]?.body.model).toBe("google/gemma-4-26b-a4b-it:free");
    expect(capturedRequests[0]?.body.models).toEqual([
      "google/gemma-4-26b-a4b-it:free",
      "nvidia/nemotron-3.5-lightning:free",
      "openrouter/free",
    ]);
    expect(capturedRequests[0]?.body.max_tokens).toBe(1200);
    expect(capturedRequests[0]?.body.reasoning).toEqual({ effort: "none", exclude: true });

    const sentMessages = capturedRequests[0]?.body.messages as Array<{ role: string; content: string }>;
    expect(sentMessages[0].content).toContain("Never invent, assume, or extrapolate");
    expect(sentMessages[0].content).toContain("Igris AI Commander");

    // Verify Vercel /api/chat router (server/chat-service.js) connects end-to-end to the Worker and falls back on auth mismatch
    const workerFetchBridge: typeof fetch = async (input, init) => {
      const targetUrl = input instanceof URL ? input.toString() : typeof input === "string" ? input : input.url;
      return worker.fetch(new Request(targetUrl, init), env);
    };

    const vercelOk = await processChat({
      method: "POST",
      ip: "vercel-e2e-1",
      payload: { message: "Tell me about Igris AI Commander", history: [] },
      env: { RAG_API_URL: "https://portfolio-rag.workers.dev/chat", RAG_API_KEY: "test-rag-secret" },
      fetchImpl: workerFetchBridge,
    });

    expect(vercelOk.status).toBe(200);
    expect(vercelOk.body?.ok).toBe(true);
    expect(vercelOk.body?.mode).toBe("rag");
    expect(vercelOk.body?.fallback).toBe(false);
    expect(vercelOk.body?.sources?.[0]).toContain("Portfolio_Igris_Capstone.md");

    const vercelFallback = await processChat({
      method: "POST",
      ip: "vercel-e2e-2",
      payload: { message: "Tell me about Vanguard experience", history: [] },
      env: { RAG_API_URL: "https://portfolio-rag.workers.dev/chat", RAG_API_KEY: "wrong-secret" },
      fetchImpl: workerFetchBridge,
    });

    expect(vercelFallback.status).toBe(200);
    expect(vercelFallback.body?.ok).toBe(true);
    expect(vercelFallback.body?.mode).toBe("builtin");
    expect(vercelFallback.body?.fallback).toBe(true);
  });

  it("enforces timing-safe auth, payload validation, and rate limiting", async () => {
    expect(await timingSafeTokenMatch("abc", "abc")).toBe(true);
    expect(await timingSafeTokenMatch("abc", "abd")).toBe(false);
    expect(await timingSafeTokenMatch("abc", "abcd")).toBe(false);

    const worker = createWorkerHandler();
    const env = makeEnv({ RATE_LIMIT_MAX_REQUESTS: "2" });

    const unauth = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://rameshbaduguai.com",
        },
        body: JSON.stringify({ message: "Hello" }),
      }),
      env,
    );
    expect(unauth.status).toBe(401);
    expect(unauth.headers.get("access-control-allow-origin")).toBeNull();

    const preflight = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "OPTIONS",
        headers: { Origin: "https://evil.example.com" },
      }),
      env,
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBeNull();

    const failClosedEnv = makeEnv({ RAG_API_KEY: "", REQUIRE_AUTH: "true" });
    const failClosed = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello" }),
      }),
      failClosedEnv,
    );
    expect(failClosed.status).toBe(503);

    const emptyPrompt = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-rag-secret",
          "CF-Connecting-IP": "203.0.113.10",
        },
        body: JSON.stringify({ message: "   " }),
      }),
      env,
    );
    expect(emptyPrompt.status).toBe(422);

    const validHeaders = {
      "Content-Type": "application/json",
      Authorization: "Bearer test-rag-secret",
      "CF-Connecting-IP": "203.0.113.10",
    };

    const secondReq = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: validHeaders,
        body: JSON.stringify({ question: "What is his background?" }),
      }),
      env,
    );
    expect(secondReq.status).toBe(200);

    const limited = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: validHeaders,
        body: JSON.stringify({ message: "Third request hits rate limit" }),
      }),
      env,
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();

    // Also verify native Cloudflare RateLimit binding (CHAT_RATE_LIMITER) path
    const rateLimiterCalls: string[] = [];
    const boundLimiterEnv = makeEnv({
      CHAT_RATE_LIMITER: {
        async limit({ key }: { key: string }) {
          rateLimiterCalls.push(key);
          return { success: rateLimiterCalls.length === 1 };
        },
      } as RateLimit,
    });

    const allowedByBinding = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: validHeaders,
        body: JSON.stringify({ message: "First via binding" }),
      }),
      boundLimiterEnv,
    );
    expect(allowedByBinding.status).toBe(200);

    const blockedByBinding = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: validHeaders,
        body: JSON.stringify({ message: "Second via binding" }),
      }),
      boundLimiterEnv,
    );
    expect(blockedByBinding.status).toBe(429);
    expect(rateLimiterCalls).toEqual(["203.0.113.10:chat", "203.0.113.10:chat"]);
  });

  it("handles upstream OpenRouter failures cleanly without leaking secrets", async () => {
    const vectorize = createFakeVectorize();
    const ai = createFakeAi();
    const chunks = buildDocumentChunks(portfolioDocs, { chunkSize: 700, chunkOverlap: 120 });
    const vectors = (await ai.run("@cf/baai/bge-small-en-v1.5" as keyof AiModels, {
      text: chunks.map((c) => c.text),
    } as Record<string, unknown>)) as { data: number[][] };

    await vectorize.upsert(
      chunks.map((c, idx) => ({
        id: c.id,
        values: vectors.data[idx],
        metadata: { source: c.source, page: c.page, chunk_index: c.chunkIndex, text: c.text },
      })),
    );

    const worker = createWorkerHandler({
      fetchImpl: async () => new Response("upstream error", { status: 502 }),
    });
    const env = makeEnv({ VECTORIZE: vectorize, AI: ai });

    const response = await worker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-rag-secret",
        },
        body: JSON.stringify({ message: "Where did Ramesh work?" }),
      }),
      env,
    );

    expect(response.status).toBe(502);
    const text = await response.text();
    expect(JSON.parse(text).ok).toBe(false);
    expect(text).not.toContain("test-openrouter-secret");
  });

  it("retries reasoning-mandatory models on 400 and handles empty reasoning-exhausted content", async () => {
    const vectorize = createFakeVectorize();
    const ai = createFakeAi();
    const chunks = buildDocumentChunks(portfolioDocs, { chunkSize: 700, chunkOverlap: 120 });
    const vectors = (await ai.run("@cf/baai/bge-small-en-v1.5" as keyof AiModels, {
      text: chunks.map((c) => c.text),
    } as Record<string, unknown>)) as { data: number[][] };

    await vectorize.upsert(
      chunks.map((c, idx) => ({
        id: c.id,
        values: vectors.data[idx],
        metadata: { source: c.source, page: c.page, chunk_index: c.chunkIndex, text: c.text },
      })),
    );

    const payloads: Array<Record<string, unknown>> = [];
    const retryWorker = createWorkerHandler({
      fetchImpl: async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        payloads.push(body);
        if (payloads.length === 1) {
          return Response.json(
            { error: { message: "Reasoning is mandatory for this endpoint and effort 'none' is unsupported." } },
            { status: 400 },
          );
        }
        return Response.json({
          choices: [
            {
              message: {
                content: [{ type: "text", text: "Ramesh built Igris AI Commander with Node.js and TypeScript." }],
              },
            },
          ],
        });
      },
    });

    const env = makeEnv({ VECTORIZE: vectorize, AI: ai, OPENROUTER_MODEL: "nvidia/nemotron-3-ultra-550b-a55b:free" });
    const retryRes = await retryWorker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-rag-secret" },
        body: JSON.stringify({ message: "What is Igris AI Commander?" }),
      }),
      env,
    );

    expect(retryRes.status).toBe(200);
    const retryBody = (await retryRes.json()) as { ok: boolean; answer: string };
    expect(retryBody.ok).toBe(true);
    expect(retryBody.answer).toContain("Igris AI Commander");
    expect(payloads[0]?.reasoning).toEqual({ effort: "none", exclude: true });
    expect(payloads[1]?.reasoning).toEqual({ effort: "low", exclude: true });
    expect(payloads[1]?.max_tokens).toBe(1500);

    const emptyReasoningWorker = createWorkerHandler({
      fetchImpl: async () =>
        Response.json({
          choices: [{ finish_reason: "length", message: { content: null, reasoning: "Thinking..." } }],
          usage: { completion_tokens_details: { reasoning_tokens: 400 } },
        }),
    });
    const emptyRes = await emptyReasoningWorker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-rag-secret" },
        body: JSON.stringify({ message: "What is Igris AI Commander?" }),
      }),
      env,
    );
    expect(emptyRes.status).toBe(502);
  });

  it("enforces free-only model chains, reports fallback model responses, and handles all-model 429 failures safely", async () => {
    expect(isFreeOpenRouterModel("google/gemma-4-26b-a4b-it:free")).toBe(true);
    expect(isFreeOpenRouterModel("nvidia/nemotron-3.5-lightning:free")).toBe(true);
    expect(isFreeOpenRouterModel("openrouter/free")).toBe(true);
    expect(isFreeOpenRouterModel("openai/gpt-4o-mini")).toBe(false);
    expect(() => resolveFreeModelChain("openai/gpt-4o-mini", "openrouter/free")).toThrow("paid routing is disabled");
    expect(() =>
      resolveFreeModelChain("google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3.5-lightning:free,openai/gpt-4o-mini"),
    ).toThrow("paid routing is disabled");

    const vectorize = createFakeVectorize();
    const ai = createFakeAi();
    const chunks = buildDocumentChunks(portfolioDocs, { chunkSize: 700, chunkOverlap: 120 });
    const vectors = (await ai.run("@cf/baai/bge-small-en-v1.5" as keyof AiModels, {
      text: chunks.map((c) => c.text),
    } as Record<string, unknown>)) as { data: number[][] };

    await vectorize.upsert(
      chunks.map((c, idx) => ({
        id: c.id,
        values: vectors.data[idx],
        metadata: { source: c.source, page: c.page, chunk_index: c.chunkIndex, text: c.text },
      })),
    );

    let fetchCalls = 0;
    const paidGuardWorker = createWorkerHandler({
      fetchImpl: async () => {
        fetchCalls += 1;
        return Response.json({});
      },
    });
    const paidEnv = makeEnv({
      VECTORIZE: vectorize,
      AI: ai,
      OPENROUTER_FALLBACK_MODELS: "nvidia/nemotron-3.5-lightning:free,openai/gpt-4o-mini",
    });
    const paidBlockedRes = await paidGuardWorker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-rag-secret" },
        body: JSON.stringify({ message: "What is Igris AI Commander?" }),
      }),
      paidEnv,
    );
    expect(paidBlockedRes.status).toBe(503);
    expect(fetchCalls).toBe(0);

    let sentFallbackModels: unknown;
    const fallbackSuccessWorker = createWorkerHandler({
      fetchImpl: async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        sentFallbackModels = body.models;
        return Response.json({
          model: "nvidia/nemotron-3.5-lightning:free",
          choices: [{ message: { content: "Ramesh built Igris AI Commander with Node.js and TypeScript." } }],
        });
      },
    });
    const env = makeEnv({ VECTORIZE: vectorize, AI: ai });
    const fallbackRes = await fallbackSuccessWorker.fetch(
      new Request("https://worker.test/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-rag-secret" },
        body: JSON.stringify({ message: "What is Igris AI Commander?" }),
      }),
      env,
    );
    expect(fallbackRes.status).toBe(200);
    const fallbackBody = (await fallbackRes.json()) as { ok: boolean; model: string; answer: string };
    expect(fallbackBody.ok).toBe(true);
    expect(fallbackBody.model).toBe("nvidia/nemotron-3.5-lightning:free");
    expect(sentFallbackModels).toEqual([
      "google/gemma-4-26b-a4b-it:free",
      "nvidia/nemotron-3.5-lightning:free",
      "openrouter/free",
    ]);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const all429Worker = createWorkerHandler({
        fetchImpl: async () =>
          Response.json(
            {
              error: {
                code: 429,
                message: "Provider returned error",
                metadata: {
                  provider_name: "Google AI Studio",
                  raw: "Upstream rate limit exceeded Authorization: Bearer sk-or-v1-secret123",
                },
              },
            },
            { status: 429 },
          ),
      });
      const failed429Res = await all429Worker.fetch(
        new Request("https://worker.test/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer test-rag-secret" },
          body: JSON.stringify({ message: "What is Igris AI Commander?" }),
        }),
        env,
      );
      expect(failed429Res.status).toBe(502);
      const loggedError = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(loggedError).toContain("provider=Google AI Studio");
      expect(loggedError).toContain("code=429");
      expect(loggedError).not.toContain("sk-or-v1-secret123");
      expect(loggedError).not.toContain("test-openrouter-secret");
      expect(loggedError).not.toContain("test-rag-secret");
      expect(loggedError).not.toContain("Igris AI Commander");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("chunks multi-paragraph resume text recursively with overlap and valid Vectorize IDs", () => {
    const longResume = Array.from({ length: 12 }, (_, idx) =>
      `Experience item ${idx + 1}: Built accessible React interfaces and AI agent workflows with TypeScript and Node.js.`
    ).join("\n\n");

    const chunks = buildDocumentChunks(
      [{ id: "resume:page-1", source: "Ramesh_Badugu_Resume.pdf", page: 1, content: longResume }],
      { chunkSize: 350, chunkOverlap: 60 },
    );

    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0]?.id).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
    expect(chunks[0]?.source).toBe("Ramesh_Badugu_Resume.pdf");
    expect(chunks[0]?.page).toBe(1);
    expect(chunks[1]?.chunkIndex).toBe(1);
  });
});
