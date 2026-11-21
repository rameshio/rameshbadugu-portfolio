export const MAX_MESSAGE = 1500;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_ITEM_CHARS = 2000;
const MAX_HISTORY_TOTAL_CHARS = 10000;
export const MAX_BODY_BYTES = 32 * 1024;

export function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .slice(-MAX_HISTORY_ITEMS)
    .filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_HISTORY_ITEM_CHARS),
    }));

  // Enforce total size, keeping the most recent messages
  let total = 0;
  const out = [];
  for (let i = cleaned.length - 1; i >= 0; i -= 1) {
    total += cleaned[i].content.length;
    if (total > MAX_HISTORY_TOTAL_CHARS) break;
    out.unshift(cleaned[i]);
  }
  return out;
}

export function tooLarge(req) {
  const headerLen = Number(req?.headers?.['content-length'] || 0);
  if (Number.isFinite(headerLen) && headerLen > MAX_BODY_BYTES) {
    return true;
  }

  if (typeof req?.body === 'string') {
    return Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES;
  }

  if (req?.body && typeof req.body === 'object') {
    return Buffer.byteLength(JSON.stringify(req.body), 'utf8') > MAX_BODY_BYTES;
  }

  return false;
}
