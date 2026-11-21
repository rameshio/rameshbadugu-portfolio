import { checkRateLimit, getClientIp } from './_lib/rateLimit.js';
import { sanitizeActions } from './_lib/safeActions.js';
import { tooLarge } from './_lib/validateChat.js';
import { processChat } from '../server/chat-service.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  if (!(await checkRateLimit(request, response, ['chat', 'chatDaily']))) return;

  if (tooLarge(request)) {
    return response.status(413).json({ ok: false, error: 'Request too large.' });
  }

  let payload = request.body ?? {};

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return response.status(400).json({ ok: false, error: 'Invalid JSON payload.' });
    }
  }

  const result = await processChat({
    method: request.method,
    payload,
    ip: getClientIp(request),
    env: process.env,
    skipRateLimit: true,
  });

  for (const [name, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(name, value);
  }

  if (result.status === 204) return response.status(204).end();
  const body =
    result.body && Array.isArray(result.body.actions)
      ? { ...result.body, actions: sanitizeActions(result.body.actions) }
      : result.body;
  return response.status(result.status).json(body);
}
