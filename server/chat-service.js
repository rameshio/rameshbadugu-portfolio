import { PORTFOLIO_SYSTEM_PROMPT, answerFromPortfolioKnowledge } from './portfolio-knowledge.js';

const MAX_MESSAGE_LENGTH = 1500;
const MAX_HISTORY_ITEMS = 8;
const UPSTREAM_TIMEOUT_MS = 9000;

const chatBuckets = new Map();

export function resolveAssistantMode(env = process.env) {
  if (env.RAG_API_URL) return 'rag';
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.OPENAI_API_KEY) return 'openai';
  return 'builtin';
}

export function validateChatPayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, status: 400, error: 'Invalid request payload.' };
  }

  const message = String(payload.message ?? '').trim();
  if (!message) {
    return { ok: false, status: 400, error: 'Please enter a question.' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, status: 400, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` };
  }

  const rawHistory = Array.isArray(payload.history) ? payload.history : [];
  const history = rawHistory
    .slice(-MAX_HISTORY_ITEMS)
    .filter((entry) => entry && (entry.role === 'user' || entry.role === 'assistant'))
    .map((entry) => ({
      role: entry.role,
      content: String(entry.content ?? '').trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((entry) => entry.content.length > 0);

  return { ok: true, data: { message, history } };
}

export function checkChatRateLimit(ip, now = Date.now()) {
  const key = ip || 'unknown';
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 25;
  const current = chatBuckets.get(key);

  if (!current || now - current.startedAt >= windowMs) {
    chatBuckets.set(key, { count: 1, startedAt: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - current.startedAt)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count };
}

async function fetchWithTimeout(url, options, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function queryLangChainRag({ message, history }, env, fetchImpl) {
  const headers = { 'Content-Type': 'application/json' };
  if (env.RAG_API_KEY) {
    headers.Authorization = `Bearer ${env.RAG_API_KEY}`;
  }

  const response = await fetchWithTimeout(
    env.RAG_API_URL,
    {
      method: 'POST',
      headers,
      // Send common field aliases so any LangChain FastAPI/Express RAG service works out of the box
      body: JSON.stringify({
        message,
        question: message,
        query: message,
        history,
      }),
    },
    fetchImpl,
  );

  if (!response.ok) {
    throw new Error(`RAG endpoint returned ${response.status}.`);
  }

  const data = await response.json();
  const reply = String(
    data?.reply ?? data?.answer ?? data?.output ?? data?.response ?? data?.text ?? data?.result ?? '',
  ).trim();

  if (!reply) {
    throw new Error('RAG endpoint returned an empty reply.');
  }

  const sources = Array.isArray(data?.sources)
    ? data.sources.map((s) => (typeof s === 'string' ? s : s?.source || s?.title || s?.id)).filter(Boolean).slice(0, 5)
    : [];

  return {
    reply,
    sources,
    actions: Array.isArray(data?.actions) ? data.actions.slice(0, 3) : [],
    mode: 'rag',
  };
}

async function queryGemini({ message, history }, env, fetchImpl) {
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const contents = [
    ...history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PORTFOLIO_SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 350,
        },
      }),
    },
    fetchImpl,
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}.`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  if (!reply) {
    throw new Error('Gemini API returned an empty reply.');
  }

  return {
    reply,
    sources: [],
    actions: [],
    mode: 'gemini',
  };
}

async function queryOpenAI({ message, history }, env, fetchImpl) {
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 350,
        messages: [
          { role: 'system', content: PORTFOLIO_SYSTEM_PROMPT },
          ...history.map((item) => ({ role: item.role, content: item.content })),
          { role: 'user', content: message },
        ],
      }),
    },
    fetchImpl,
  );

  if (!response.ok) {
    throw new Error(`OpenAI API returned ${response.status}.`);
  }

  const data = await response.json();
  const reply = String(data?.choices?.[0]?.message?.content ?? '').trim();

  if (!reply) {
    throw new Error('OpenAI API returned an empty reply.');
  }

  return {
    reply,
    sources: [],
    actions: [],
    mode: 'openai',
  };
}

export async function generateAssistantReply(data, env = process.env, fetchImpl = fetch) {
  const mode = resolveAssistantMode(env);

  if (mode === 'builtin') {
    const local = answerFromPortfolioKnowledge(data.message);
    return {
      reply: local.reply,
      actions: local.actions || [],
      sources: local.sources || [],
      mode: 'builtin',
      fallback: false,
    };
  }

  try {
    if (mode === 'rag') return { ...(await queryLangChainRag(data, env, fetchImpl)), fallback: false };
    if (mode === 'gemini') return { ...(await queryGemini(data, env, fetchImpl)), fallback: false };
    return { ...(await queryOpenAI(data, env, fetchImpl)), fallback: false };
  } catch (error) {
    console.error(`[assistant:${mode}]`, error.message);
    const local = answerFromPortfolioKnowledge(data.message);
    return {
      reply: local.reply,
      actions: local.actions || [],
      sources: local.sources || [],
      mode: 'builtin',
      fallback: true,
    };
  }
}

export async function processChat({ method, payload, ip, env = process.env, fetchImpl = fetch }) {
  if (method === 'OPTIONS') return { status: 204, body: null };
  if (method !== 'POST') {
    return { status: 405, body: { ok: false, error: 'Method not allowed.' } };
  }

  const rateLimit = checkChatRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfter) },
      body: { ok: false, error: 'Too many requests. Please try again shortly.' },
    };
  }

  const validation = validateChatPayload(payload);
  if (!validation.ok) {
    return { status: validation.status, body: { ok: false, error: validation.error } };
  }

  const result = await generateAssistantReply(validation.data, env, fetchImpl);
  return {
    status: 200,
    body: {
      ok: true,
      reply: result.reply,
      actions: result.actions,
      sources: result.sources,
      mode: result.mode,
      fallback: result.fallback,
    },
  };
}
