import type { DocumentChunk } from "./chunker";

export const DEFAULT_EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5";
export const DEFAULT_OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";
export const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "openrouter/free",
] as const;
const MAX_OPENROUTER_FALLBACK_CHAIN = 3;

export const GROUNDED_SYSTEM_PROMPT = `You are the AI portfolio assistant for Ramesh Badugu.
Answer the visitor's or recruiter's question using ONLY the retrieved context excerpts below.

Strict grounding rules:
1. Never invent, assume, or extrapolate skills, employers, job titles, dates, metrics, degrees, certifications, or project details that are not explicitly stated in the retrieved context.
2. If the retrieved context does not contain enough information to answer, say clearly that the indexed portfolio and resume documents do not specify that detail and suggest contacting Ramesh directly via the Contact section (rameshbadugums@gmail.com).
3. Keep answers concise, factual, and helpful for recruiters and hiring managers.
4. Preserve exact company names, dates, technologies, and project names from the retrieved context.`;

export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SourceAttribution {
  source: string;
  file: string;
  title?: string;
  page: number;
  chunk_index?: number;
  score?: number;
}

export interface RagWorkerEnv {
  AI: Ai;
  VECTORIZE: Pick<Vectorize | VectorizeIndex, "query" | "upsert">;
  DOCS_BUCKET?: R2Bucket;
  EMBEDDING_MODEL?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_FALLBACK_MODELS?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_SITE_URL?: string;
  OPENROUTER_APP_NAME?: string;
  OPENROUTER_TIMEOUT_MS?: string;
  RETRIEVAL_TOP_K?: string;
}

export interface RagResult {
  answer: string;
  sources: SourceAttribution[];
  model: string;
  retrievedChunks: number;
}

interface EmbeddingOutput {
  data?: number[][];
}

export async function generateEmbeddings(
  ai: Ai,
  texts: string[],
  modelName: string = DEFAULT_EMBEDDING_MODEL,
): Promise<number[][]> {
  if (!texts.length) return [];
  const result = (await ai.run(modelName as keyof AiModels, {
    text: texts,
  } as Record<string, unknown>)) as EmbeddingOutput;

  if (!result || !Array.isArray(result.data) || result.data.length !== texts.length) {
    throw new Error("Workers AI returned an invalid embedding payload.");
  }

  return result.data;
}

interface RetrievedChunk {
  text: string;
  source: string;
  title?: string;
  page: number;
  chunkIndex?: number;
  score: number;
}

export async function retrieveRelevantChunks(
  env: RagWorkerEnv,
  question: string,
  topK: number,
): Promise<RetrievedChunk[]> {
  const embeddingModel = env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  const [queryVector] = await generateEmbeddings(env.AI, [question], embeddingModel);
  if (!queryVector?.length) {
    throw new Error("Failed to compute query embedding.");
  }

  const queryResult = await env.VECTORIZE.query(queryVector, {
    topK,
    returnMetadata: "all",
  });

  const chunks: RetrievedChunk[] = [];
  for (const match of queryResult.matches ?? []) {
    const meta = (match.metadata ?? {}) as Record<string, unknown>;
    const text = typeof meta.text === "string" ? meta.text.trim() : "";
    if (!text) continue;

    const file = typeof meta.source === "string" && meta.source.trim()
      ? meta.source.trim()
      : "Ramesh_Badugu_Resume.pdf";
    const title = typeof meta.title === "string" ? meta.title.trim() : undefined;
    const page = typeof meta.page === "number" && Number.isFinite(meta.page) ? meta.page : 1;
    const chunkIndex = typeof meta.chunk_index === "number" ? meta.chunk_index : undefined;

    chunks.push({
      text,
      source: file,
      title,
      page,
      chunkIndex,
      score: match.score,
    });
  }

  return chunks;
}

export function formatSources(chunks: RetrievedChunk[]): SourceAttribution[] {
  const seen = new Set<string>();
  const sources: SourceAttribution[] = [];

  for (const chunk of chunks) {
    const dedupeKey = `${chunk.source}:${chunk.page}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    sources.push({
      source: `${chunk.source} (p. ${chunk.page})`,
      file: chunk.source,
      title: chunk.title,
      page: chunk.page,
      chunk_index: chunk.chunkIndex,
      score: Number(chunk.score.toFixed(4)),
    });
  }

  return sources;
}

function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, idx) =>
        `[Excerpt ${idx + 1} | Source: ${chunk.source}, Page ${chunk.page}]\n${chunk.text}`,
    )
    .join("\n\n");
}

const DEFAULT_OPENROUTER_TIMEOUT_MS = 8000;
const DEFAULT_OPENROUTER_MAX_TOKENS = 1200;
const RETRY_OPENROUTER_MAX_TOKENS = 1500;

interface OpenRouterChoice {
  finish_reason?: string | null;
  message?: {
    content?: string | Array<{ type?: string; text?: string }> | null;
    reasoning?: string | null;
  };
}

interface OpenRouterCompletionResponse {
  model?: string | null;
  choices?: OpenRouterChoice[];
  usage?: {
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

export function isFreeOpenRouterModel(modelId: string): boolean {
  const normalized = modelId.trim();
  return normalized === "openrouter/free" || (normalized.length > 5 && normalized.endsWith(":free"));
}

export function resolveFreeModelChain(
  primaryRaw?: string,
  fallbacksRaw?: string,
): { primaryModel: string; fallbackModels: string[]; models: string[] } {
  const primaryModel = (primaryRaw ?? "").trim() || DEFAULT_OPENROUTER_MODEL;
  if (!isFreeOpenRouterModel(primaryModel)) {
    throw new Error(`Configured OPENROUTER_MODEL '${primaryModel}' is not a free model; paid routing is disabled.`);
  }

  const parsedFallbacks =
    fallbacksRaw === undefined
      ? [...DEFAULT_OPENROUTER_FALLBACK_MODELS]
      : fallbacksRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  for (const candidate of parsedFallbacks) {
    if (!isFreeOpenRouterModel(candidate)) {
      throw new Error(
        `Configured OPENROUTER_FALLBACK_MODELS entry '${candidate}' is not a free model; paid routing is disabled.`,
      );
    }
  }

  const models: string[] = [];
  for (const candidate of [primaryModel, ...parsedFallbacks]) {
    if (!models.includes(candidate)) {
      models.push(candidate);
    }
    if (models.length >= MAX_OPENROUTER_FALLBACK_CHAIN) break;
  }

  return {
    primaryModel,
    fallbackModels: models.slice(1),
    models,
  };
}

function sanitizeDiagnosticSnippet(text: string, maxLength = 300): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-or-[A-Za-z0-9_-]+/gi, "[REDACTED_KEY]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function extractOpenRouterText(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }
  return "";
}

async function readSafeUpstreamError(response: Response): Promise<string> {
  const raw = (await response.text().catch(() => "")).trim();
  if (!raw) return "No error body";

  try {
    const parsed = JSON.parse(raw) as {
      error?: {
        code?: unknown;
        message?: unknown;
        metadata?: {
          provider_name?: unknown;
          raw?: unknown;
        };
      };
      message?: unknown;
    };
    const msg = parsed?.error?.message ?? parsed?.message;
    const code = parsed?.error?.code;
    const providerName = parsed?.error?.metadata?.provider_name;
    const providerRaw = parsed?.error?.metadata?.raw;

    const details: string[] = [];
    if (typeof code === "string" || typeof code === "number") details.push(`code=${String(code)}`);
    if (typeof providerName === "string" && providerName.trim()) {
      details.push(`provider=${providerName.trim()}`);
    }
    if (typeof providerRaw === "string" && providerRaw.trim()) {
      details.push(`raw=${sanitizeDiagnosticSnippet(providerRaw, 160)}`);
    }

    if (typeof msg === "string" && msg.trim()) {
      const base = sanitizeDiagnosticSnippet(msg, 180);
      return details.length ? `${base} [${details.join(", ")}]`.slice(0, 320) : base;
    }
  } catch {
    // Non-JSON upstream error body; fall back to bounded plain text snippet.
  }

  return sanitizeDiagnosticSnippet(raw, 240);
}

export async function callOpenRouter(options: {
  apiKey: string;
  model: string;
  fallbackModels?: string[];
  question: string;
  contextBlock: string;
  history: ChatHistoryTurn[];
  siteUrl?: string;
  appName?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<{ answer: string; model: string }> {
  const modelChain = resolveFreeModelChain(options.model, options.fallbackModels?.join(","));
  const fetchFn = options.fetchImpl ?? fetch;
  const timeoutMs =
    typeof options.timeoutMs === "number" && Number.isFinite(options.timeoutMs)
      ? Math.min(Math.max(Math.round(options.timeoutMs), 1000), 30000)
      : DEFAULT_OPENROUTER_TIMEOUT_MS;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${options.apiKey}`,
  };
  if (options.siteUrl) headers["HTTP-Referer"] = options.siteUrl;
  if (options.appName) headers["X-Title"] = options.appName;

  const messages = [
    {
      role: "system",
      content: `${GROUNDED_SYSTEM_PROMPT}\n\nRETRIEVED PORTFOLIO & RESUME CONTEXT:\n${options.contextBlock}`,
    },
    ...options.history.slice(-8).map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: "user", content: options.question },
  ];

  const signal = AbortSignal.timeout(timeoutMs);
  const sendCompletion = async (payload: Record<string, unknown>): Promise<Response> => {
    try {
      return await fetchFn("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        signal,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new Error(`OpenRouter request timed out after ${timeoutMs}ms.`);
      }
      throw error;
    }
  };

  let response = await sendCompletion({
    model: modelChain.primaryModel,
    models: modelChain.models,
    temperature: 0.1,
    max_tokens: DEFAULT_OPENROUTER_MAX_TOKENS,
    reasoning: { effort: "none", exclude: true },
    messages,
  });

  if (response.status === 400) {
    const errorDetail = await readSafeUpstreamError(response);
    if (/\breasoning\b/i.test(errorDetail)) {
      const supportsLowEffort = !/unsupported\s+parameter|unknown\s+field|invalid\s+field/i.test(errorDetail);
      const retryPayload: Record<string, unknown> = {
        model: modelChain.primaryModel,
        models: modelChain.models,
        temperature: 0.1,
        max_tokens: RETRY_OPENROUTER_MAX_TOKENS,
        messages,
      };
      if (supportsLowEffort) {
        retryPayload.reasoning = { effort: "low", exclude: true };
      }
      response = await sendCompletion(retryPayload);
    } else {
      throw new Error(`OpenRouter API returned 400: ${errorDetail}`);
    }
  }

  if (!response.ok) {
    const errorDetail = await readSafeUpstreamError(response);
    throw new Error(`OpenRouter API returned ${response.status}: ${errorDetail}`);
  }

  const data = (await response.json()) as OpenRouterCompletionResponse;
  const choice = data?.choices?.[0];
  const answer = extractOpenRouterText(choice?.message?.content);
  if (!answer) {
    const finishReason = choice?.finish_reason ?? "unknown";
    const hasReasoning = typeof choice?.message?.reasoning === "string" && choice.message.reasoning.trim().length > 0;
    const reasoningTokens = data?.usage?.completion_tokens_details?.reasoning_tokens;
    throw new Error(
      `OpenRouter returned an empty response (finish_reason=${finishReason}, has_reasoning=${hasReasoning}, reasoning_tokens=${reasoningTokens ?? "unknown"}).`,
    );
  }
  const resolvedModel =
    typeof data?.model === "string" && data.model.trim() ? data.model.trim() : modelChain.primaryModel;
  return { answer, model: resolvedModel };
}

export async function answerWithCloudflareRag(options: {
  env: RagWorkerEnv;
  question: string;
  history: ChatHistoryTurn[];
  fetchImpl?: typeof fetch;
}): Promise<RagResult> {
  const { env, question, history, fetchImpl } = options;
  const { primaryModel, fallbackModels } = resolveFreeModelChain(
    env.OPENROUTER_MODEL,
    env.OPENROUTER_FALLBACK_MODELS,
  );
  const apiKey = (env.OPENROUTER_API_KEY ?? "").trim();

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured on the Worker.");
  }

  const parsedTopK = Number.parseInt(env.RETRIEVAL_TOP_K ?? "4", 10);
  const topK = Number.isFinite(parsedTopK) ? Math.min(Math.max(parsedTopK, 1), 10) : 4;

  const chunks = await retrieveRelevantChunks(env, question, topK);
  if (chunks.length === 0) {
    return {
      answer:
        "The portfolio vector index does not have matching context yet. Please run document ingestion first or contact Ramesh at rameshbadugums@gmail.com.",
      sources: [],
      model: primaryModel,
      retrievedChunks: 0,
    };
  }

  const parsedTimeoutMs = Number.parseInt(env.OPENROUTER_TIMEOUT_MS ?? "", 10);
  const timeoutMs = Number.isFinite(parsedTimeoutMs) ? parsedTimeoutMs : DEFAULT_OPENROUTER_TIMEOUT_MS;

  const contextBlock = buildContextBlock(chunks);
  const sources = formatSources(chunks);
  const completion = await callOpenRouter({
    apiKey,
    model: primaryModel,
    fallbackModels,
    question,
    contextBlock,
    history,
    siteUrl: env.OPENROUTER_SITE_URL,
    appName: env.OPENROUTER_APP_NAME,
    timeoutMs,
    fetchImpl,
  });

  return {
    answer: completion.answer,
    sources,
    model: completion.model,
    retrievedChunks: chunks.length,
  };
}

export async function upsertChunksIntoVectorize(
  env: RagWorkerEnv,
  chunks: DocumentChunk[],
): Promise<{ upserted: number; mutationId?: string }> {
  if (!chunks.length) return { upserted: 0 };

  const embeddingModel = env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  const batchSize = 20;
  let totalUpserted = 0;
  let lastMutationId: string | undefined;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const vectors = await generateEmbeddings(
      env.AI,
      batch.map((c) => c.text),
      embeddingModel,
    );

    const vectorRecords: VectorizeVector[] = batch.map((chunk, idx) => ({
      id: chunk.id,
      values: vectors[idx],
      metadata: {
        source: chunk.source,
        title: chunk.title,
        section: chunk.section,
        page: chunk.page,
        chunk_index: chunk.chunkIndex,
        text: chunk.text,
      },
    }));

    const result = await env.VECTORIZE.upsert(vectorRecords);
    if (result && "mutationId" in result && typeof result.mutationId === "string") {
      lastMutationId = result.mutationId;
    }
    totalUpserted += batch.length;
  }

  return { upserted: totalUpserted, mutationId: lastMutationId };
}
