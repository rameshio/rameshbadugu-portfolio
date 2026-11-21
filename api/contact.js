import { checkRateLimit, getClientIp } from './_lib/rateLimit.js';
import { tooLarge } from './_lib/validateChat.js';
import { processContact } from '../server/contact-service.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  if (!(await checkRateLimit(request, response, 'contact'))) return;

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

  const result = await processContact({
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
  return response.status(result.status).json(result.body);
}
