import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasUpstash ? Redis.fromEnv() : null;

const RULES = {
  chat: { max: 10, windowMs: 60_000, upstash: () => Ratelimit.slidingWindow(10, '1 m') },
  chatDaily: { max: 100, windowMs: 86_400_000, upstash: () => Ratelimit.fixedWindow(100, '1 d') },
  contact: { max: 3, windowMs: 600_000, upstash: () => Ratelimit.fixedWindow(3, '10 m') },
};

const limiters = {};
if (redis) {
  for (const [name, rule] of Object.entries(RULES)) {
    limiters[name] = new Ratelimit({ redis, limiter: rule.upstash(), prefix: `rl:${name}` });
  }
}

// Fallback: per-instance memory (only for local dev / missing Upstash env vars)
const mem = new Map();
const MAX_MEM_ENTRIES = 5000;

function memLimit(key, max, windowMs) {
  const now = Date.now();
  if (mem.size >= MAX_MEM_ENTRIES) {
    for (const [entryKey, entry] of mem.entries()) {
      if (now > entry.reset) mem.delete(entryKey);
      if (mem.size < MAX_MEM_ENTRIES) break;
    }
    if (mem.size >= MAX_MEM_ENTRIES) {
      const oldestKey = mem.keys().next().value;
      if (oldestKey !== undefined) mem.delete(oldestKey);
    }
  }

  const entry = mem.get(key);
  if (!entry || now > entry.reset) {
    mem.set(key, { count: 1, reset: now + windowMs });
    return { success: true, reset: now + windowMs };
  }
  entry.count += 1;
  return { success: entry.count <= max, reset: entry.reset };
}

export function getClientIp(req) {
  const xff = req?.headers?.['x-forwarded-for'];
  const firstForwarded = Array.isArray(xff)
    ? xff[0]
    : typeof xff === 'string'
      ? xff.split(',')[0]
      : '';
  const ip = req?.headers?.['x-real-ip'] || firstForwarded || req?.socket?.remoteAddress || 'unknown';
  return String(ip).trim() || 'unknown';
}

export async function evaluateRateLimit(ip, names) {
  const clientIp = String(ip || 'unknown').trim() || 'unknown';
  for (const name of [].concat(names)) {
    const rule = RULES[name];
    if (!rule) continue;
    const result = limiters[name]
      ? await limiters[name].limit(clientIp)
      : memLimit(`${name}:${clientIp}`, rule.max, rule.windowMs);
    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return { allowed: false, retryAfter };
    }
  }
  return { allowed: true, retryAfter: 0 };
}

/** Returns true if allowed. If blocked, sends a 429 and returns false. */
export async function checkRateLimit(req, res, names) {
  const ip = getClientIp(req);
  const verdict = await evaluateRateLimit(ip, names);
  if (!verdict.allowed) {
    res.setHeader('Retry-After', String(verdict.retryAfter));
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' });
    return false;
  }
  return true;
}
