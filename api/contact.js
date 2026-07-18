import { processContact } from '../server/contact-service.js';

export default async function handler(request, response) {
  let payload = request.body ?? {};

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return response.status(400).json({ ok: false, error: 'Invalid JSON payload.' });
    }
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || request.socket?.remoteAddress || '').split(',')[0].trim();

  const result = await processContact({
    method: request.method,
    payload,
    ip,
    env: process.env,
  });

  for (const [name, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(name, value);
  }

  response.setHeader('Cache-Control', 'no-store');
  if (result.status === 204) return response.status(204).end();
  return response.status(result.status).json(result.body);
}
