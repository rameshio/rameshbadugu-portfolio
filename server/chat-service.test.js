import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAssistantReply,
  processChat,
  resolveAssistantMode,
  validateChatPayload,
} from './chat-service.js';

test('validateChatPayload normalizes valid message and history', () => {
  const result = validateChatPayload({
    message: '  Tell me about Igris AI Commander  ',
    history: [
      { role: 'user', content: 'Hi' },
      { role: 'system', content: 'ignored' },
      { role: 'assistant', content: 'Hello!' },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.message, 'Tell me about Igris AI Commander');
  assert.equal(result.data.history.length, 2);
});

test('validateChatPayload rejects empty or overly long messages', () => {
  assert.equal(validateChatPayload({ message: '   ' }).ok, false);
  assert.equal(validateChatPayload({ message: 'a'.repeat(1501) }).ok, false);
});

test('resolveAssistantMode follows RAG -> Gemini -> OpenAI -> builtin priority', () => {
  assert.equal(
    resolveAssistantMode({ RAG_API_URL: 'http://localhost:8000/chat', GEMINI_API_KEY: 'g', OPENAI_API_KEY: 'o' }),
    'rag',
  );
  assert.equal(resolveAssistantMode({ GEMINI_API_KEY: 'g', OPENAI_API_KEY: 'o' }), 'gemini');
  assert.equal(resolveAssistantMode({ OPENAI_API_KEY: 'o' }), 'openai');
  assert.equal(resolveAssistantMode({}), 'builtin');
});

test('generateAssistantReply uses builtin knowledge when no external provider is configured', async () => {
  const result = await generateAssistantReply(
    { message: 'What experience does Ramesh have at Vanguard?', history: [] },
    {},
  );

  assert.equal(result.mode, 'builtin');
  assert.equal(result.fallback, false);
  assert.match(result.reply, /Vanguard/i);
  assert.ok(result.actions.length > 0);
});

test('generateAssistantReply forwards request and auth header to LangChain RAG endpoint', async () => {
  let captured;
  const fetchImpl = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        answer: 'Ramesh built Igris AI Commander with Node.js and TypeScript.',
        sources: ['resume.pdf', 'igris-readme.md'],
      }),
    };
  };

  const result = await generateAssistantReply(
    { message: 'What stack did Igris use?', history: [{ role: 'user', content: 'Hi' }] },
    { RAG_API_URL: 'http://127.0.0.1:8000/chat', RAG_API_KEY: 'secret-token' },
    fetchImpl,
  );

  assert.equal(captured.url, 'http://127.0.0.1:8000/chat');
  assert.equal(captured.options.headers.Authorization, 'Bearer secret-token');
  const body = JSON.parse(captured.options.body);
  assert.equal(body.message, 'What stack did Igris use?');
  assert.equal(body.question, 'What stack did Igris use?');
  assert.equal(result.mode, 'rag');
  assert.equal(result.fallback, false);
  assert.deepEqual(result.sources, ['resume.pdf', 'igris-readme.md']);
});

test('generateAssistantReply falls back to builtin knowledge when RAG endpoint fails', async () => {
  const fetchImpl = async () => ({ ok: false, status: 502 });

  const result = await generateAssistantReply(
    { message: 'How can I contact Ramesh?', history: [] },
    { RAG_API_URL: 'http://127.0.0.1:8000/chat' },
    fetchImpl,
  );

  assert.equal(result.mode, 'builtin');
  assert.equal(result.fallback, true);
  assert.match(result.reply, /rameshbadugums@gmail\.com/i);
});

test('processChat rejects unsupported HTTP methods', async () => {
  const result = await processChat({ method: 'GET', payload: {}, ip: 'test-method' });
  assert.equal(result.status, 405);
});
