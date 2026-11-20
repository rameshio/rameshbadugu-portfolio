import { buildDocumentChunks, type TextChunkInput } from "./chunker";
import {
  answerWithCloudflareRag,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_OPENROUTER_FALLBACK_MODELS,
  DEFAULT_OPENROUTER_MODEL,
  resolveFreeModelChain,
  upsertChunksIntoVectorize,
  type ChatHistoryTurn,
} from "./rag";
import {
  checkRateLimit,
  extractClientIp,
  extractProvidedToken,
  timingSafeTokenMatch,
  type RateLimitBucket,
} from "./security";

type StringVarKeys =
  | "ENVIRONMENT"
  | "EMBEDDING_MODEL"
  | "OPENROUTER_MODEL"
  | "OPENROUTER_FALLBACK_MODELS"
  | "OPENROUTER_SITE_URL"
  | "OPENROUTER_APP_NAME"
  | "OPENROUTER_TIMEOUT_MS"
  | "RETRIEVAL_TOP_K"
  | "RATE_LIMIT_MAX_REQUESTS"
  | "RATE_LIMIT_WINDOW_SECONDS"
  | "REQUIRE_AUTH"
  | "ALLOWED_ORIGINS";

export interface WorkerRuntimeEnv extends Omit<Env, StringVarKeys | "CHAT_RATE_LIMITER"> {
  CHAT_RATE_LIMITER?: RateLimit;
  ENVIRONMENT?: string;
  EMBEDDING_MODEL?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_FALLBACK_MODELS?: string;
  OPENROUTER_SITE_URL?: string;
  OPENROUTER_APP_NAME?: string;
  OPENROUTER_TIMEOUT_MS?: string;
  RETRIEVAL_TOP_K?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  RATE_LIMIT_WINDOW_SECONDS?: string;
  REQUIRE_AUTH?: string;
  ALLOWED_ORIGINS?: string;
  OPENROUTER_API_KEY?: string;
  RAG_API_KEY?: string;
  RAG_ADMIN_KEY?: string;
  DOCS_BUCKET?: R2Bucket;
}

const MAX_PROMPT_LENGTH = 1500;
const MAX_HISTORY_TURNS = 8;

const rateBuckets = new Map<string, RateLimitBucket>();

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function getCorsHeaders(request: Request, env: WorkerRuntimeEnv): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};

  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!allowed.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    Vary: "Origin",
  };
}

function parseIntSetting(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function validateChatBody(rawBody: unknown):
  | { ok: true; question: string; history: ChatHistoryTurn[] }
  | { ok: false; status: number; error: string } {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return { ok: false, status: 400, error: "Invalid JSON payload." };
  }

  const record = rawBody as Record<string, unknown>;
  const rawPrompt = record.message ?? record.question ?? record.query ?? "";
  const question = typeof rawPrompt === "string" ? rawPrompt.trim() : "";

  if (!question) {
    return { ok: false, status: 422, error: "One of 'message', 'question', or 'query' must be a non-empty string." };
  }

  if (question.length > MAX_PROMPT_LENGTH) {
    return { ok: false, status: 422, error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` };
  }

  const rawHistory = Array.isArray(record.history) ? record.history : [];
  const history: ChatHistoryTurn[] = [];
  for (const item of rawHistory.slice(-MAX_HISTORY_TURNS)) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    if (entry.role !== "user" && entry.role !== "assistant") continue;
    const content = typeof entry.content === "string" ? entry.content.trim().slice(0, MAX_PROMPT_LENGTH) : "";
    if (!content) continue;
    history.push({ role: entry.role, content });
  }

  return { ok: true, question, history };
}

async function authorizeRequest(
  request: Request,
  expectedToken: string | undefined,
  requireAuth: boolean,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const secret = (expectedToken ?? "").trim();
  if (!secret) {
    if (requireAuth) {
      return {
        ok: false,
        response: jsonResponse(
          { ok: false, error: "Backend authentication is required but RAG_API_KEY is not configured." },
          503,
        ),
      };
    }
    return { ok: true };
  }

  const provided = extractProvidedToken(request);
  const matched = await timingSafeTokenMatch(provided, secret);
  if (!matched) {
    return {
      ok: false,
      response: jsonResponse(
        { ok: false, error: "Invalid or missing authentication credentials." },
        401,
        { "WWW-Authenticate": "Bearer" },
      ),
    };
  }

  return { ok: true };
}

export function createWorkerHandler(
  deps: {
    fetchImpl?: typeof fetch;
    buckets?: Map<string, RateLimitBucket>;
  } = {},
) {
  const buckets = deps.buckets ?? rateBuckets;

  return {
    async fetch(request: Request, env: WorkerRuntimeEnv): Promise<Response> {
      const url = new URL(request.url);
      const corsHeaders = getCorsHeaders(request, env);

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (url.pathname === "/health" && request.method === "GET") {
        const requireAuth = (env.REQUIRE_AUTH ?? "true").toLowerCase() !== "false";
        let healthModel = env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
        let healthFallbacks: string[] = [...DEFAULT_OPENROUTER_FALLBACK_MODELS];
        let freeModelsOnly = true;
        try {
          const chain = resolveFreeModelChain(env.OPENROUTER_MODEL, env.OPENROUTER_FALLBACK_MODELS);
          healthModel = chain.primaryModel;
          healthFallbacks = chain.fallbackModels;
        } catch {
          freeModelsOnly = false;
        }
        return jsonResponse(
          {
            ok: true,
            service: "rameshbadugu-portfolio-rag-worker",
            environment: env.ENVIRONMENT ?? "production",
            authEnabled: Boolean(env.RAG_API_KEY?.trim()),
            authRequired: requireAuth,
            openrouterConfigured: Boolean(env.OPENROUTER_API_KEY?.trim()),
            model: healthModel,
            fallbackModels: healthFallbacks,
            freeModelsOnly,
            embeddingModel: env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
            vectorizeBound: Boolean(env.VECTORIZE),
            r2Bound: Boolean(env.DOCS_BUCKET),
            timestamp: new Date().toISOString(),
          },
          200,
          corsHeaders,
        );
      }

      if (url.pathname === "/chat") {
        if (request.method !== "POST") {
          return jsonResponse({ ok: false, error: "Method not allowed." }, 405, corsHeaders);
        }

        const requireAuth = (env.REQUIRE_AUTH ?? "true").toLowerCase() !== "false";
        const authCheck = await authorizeRequest(request, env.RAG_API_KEY, requireAuth);
        if (!authCheck.ok) {
          return new Response(authCheck.response.body, {
            status: authCheck.response.status,
            headers: {
              ...Object.fromEntries(authCheck.response.headers.entries()),
              ...corsHeaders,
            },
          });
        }

        const clientIp = extractClientIp(request);
        if (env.CHAT_RATE_LIMITER) {
          const { success } = await env.CHAT_RATE_LIMITER.limit({ key: `${clientIp}:chat` });
          if (!success) {
            return jsonResponse(
              { ok: false, error: "Too many requests. Please try again shortly." },
              429,
              {
                ...corsHeaders,
                "Retry-After": "60",
              },
            );
          }
        } else {
          const maxRequests = parseIntSetting(env.RATE_LIMIT_MAX_REQUESTS, 30);
          const windowSeconds = parseIntSetting(env.RATE_LIMIT_WINDOW_SECONDS, 900);
          const limitDecision = checkRateLimit(buckets, clientIp, {
            maxRequests,
            windowMs: windowSeconds * 1000,
          });
          if (!limitDecision.allowed) {
            return jsonResponse(
              { ok: false, error: "Too many requests. Please try again shortly." },
              429,
              {
                ...corsHeaders,
                "Retry-After": String(limitDecision.retryAfter),
              },
            );
          }
        }

        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400, corsHeaders);
        }

        const validation = validateChatBody(rawBody);
        if (!validation.ok) {
          return jsonResponse({ ok: false, error: validation.error }, validation.status, corsHeaders);
        }

        try {
          const result = await answerWithCloudflareRag({
            env,
            question: validation.question,
            history: validation.history,
            fetchImpl: deps.fetchImpl,
          });

          console.log(
            JSON.stringify({
              event: "rag_chat_success",
              chars: validation.question.length,
              retrievedChunks: result.retrievedChunks,
              model: result.model,
            }),
          );

          return jsonResponse(
            {
              ok: true,
              answer: result.answer,
              reply: result.answer,
              sources: result.sources,
              model: result.model,
            },
            200,
            corsHeaders,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(
            JSON.stringify({
              event: "rag_chat_error",
              model: env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
              error: message,
            }),
          );
          const isConfigError =
            message.includes("OPENROUTER_API_KEY") || message.includes("paid routing is disabled");
          const status = isConfigError ? 503 : 502;
          return jsonResponse(
            { ok: false, error: "RAG generation service is temporarily unavailable." },
            status,
            corsHeaders,
          );
        }
      }

      if (url.pathname === "/ingest") {
        if (request.method !== "POST") {
          return jsonResponse({ ok: false, error: "Method not allowed." }, 405, corsHeaders);
        }

        const expectedAdminToken = env.RAG_ADMIN_KEY?.trim() || env.RAG_API_KEY?.trim();
        const authCheck = await authorizeRequest(request, expectedAdminToken, true);
        if (!authCheck.ok) {
          return new Response(authCheck.response.body, {
            status: authCheck.response.status,
            headers: {
              ...Object.fromEntries(authCheck.response.headers.entries()),
              ...corsHeaders,
            },
          });
        }

        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400, corsHeaders);
        }

        const record = (rawBody ?? {}) as Record<string, unknown>;
        const rawDocs = Array.isArray(record.documents) ? record.documents : [];
        if (!rawDocs.length || rawDocs.length > 50) {
          return jsonResponse(
            { ok: false, error: "Provide between 1 and 50 documents to ingest." },
            422,
            corsHeaders,
          );
        }

        const validDocs: TextChunkInput[] = [];
        for (const doc of rawDocs) {
          if (!doc || typeof doc !== "object") continue;
          const item = doc as Record<string, unknown>;
          const id = typeof item.id === "string" ? item.id.trim() : "";
          const source = typeof item.source === "string" ? item.source.trim() : "";
          const content = typeof item.content === "string" ? item.content.trim() : "";
          if (!id || !source || !content) continue;
          validDocs.push({
            id,
            source,
            title: typeof item.title === "string" ? item.title.trim() : source,
            section: typeof item.section === "string" ? item.section.trim() : "general",
            page: typeof item.page === "number" ? item.page : 1,
            content,
          });
        }

        if (!validDocs.length) {
          return jsonResponse({ ok: false, error: "No valid documents supplied." }, 422, corsHeaders);
        }

        try {
          const chunks = buildDocumentChunks(validDocs, { chunkSize: 700, chunkOverlap: 120 });
          const upsertResult = await upsertChunksIntoVectorize(env, chunks);

          if (env.DOCS_BUCKET) {
            await env.DOCS_BUCKET.put(
              "latest-ingested-chunks.json",
              JSON.stringify({ updatedAt: new Date().toISOString(), chunks }, null, 2),
              { httpMetadata: { contentType: "application/json" } },
            );
          }

          console.log(
            JSON.stringify({
              event: "rag_ingest_success",
              documents: validDocs.length,
              chunks: upsertResult.upserted,
            }),
          );

          return jsonResponse(
            {
              ok: true,
              documentsProcessed: validDocs.length,
              chunksUpserted: upsertResult.upserted,
              mutationId: upsertResult.mutationId ?? null,
              r2Archived: Boolean(env.DOCS_BUCKET),
            },
            200,
            corsHeaders,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(JSON.stringify({ event: "rag_ingest_error", error: message }));
          return jsonResponse({ ok: false, error: "Vector ingestion failed." }, 502, corsHeaders);
        }
      }

      return jsonResponse({ ok: false, error: "Not found." }, 404, corsHeaders);
    },
  };
}

export default createWorkerHandler();
