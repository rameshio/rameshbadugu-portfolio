export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export interface RateLimitBucket {
  count: number;
  startedAt: number;
}

const MAX_TRACKED_KEYS = 2000;

export function checkRateLimit(
  buckets: Map<string, RateLimitBucket>,
  clientKey: string,
  options: { maxRequests: number; windowMs: number; now?: number },
): RateLimitResult {
  const now = options.now ?? Date.now();
  const key = clientKey || "unknown";

  if (buckets.size >= MAX_TRACKED_KEYS) {
    for (const [entryKey, entry] of buckets.entries()) {
      if (now - entry.startedAt >= options.windowMs) {
        buckets.delete(entryKey);
      }
      if (buckets.size < MAX_TRACKED_KEYS) break;
    }
    if (buckets.size >= MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
  }

  const current = buckets.get(key);
  if (!current || now - current.startedAt >= options.windowMs) {
    buckets.set(key, { count: 1, startedAt: now });
    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - 1),
      retryAfter: 0,
    };
  }

  if (current.count >= options.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((options.windowMs - (now - current.startedAt)) / 1000));
    return { allowed: false, remaining: 0, retryAfter };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - current.count),
    retryAfter: 0,
  };
}

export function extractProvidedToken(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader) {
    const spaceIdx = authHeader.indexOf(" ");
    if (spaceIdx > 0) {
      const scheme = authHeader.slice(0, spaceIdx).toLowerCase();
      const token = authHeader.slice(spaceIdx + 1).trim();
      if (scheme === "bearer" && token) {
        return token;
      }
    }
  }

  return (request.headers.get("x-api-key") ?? "").trim();
}

export async function timingSafeTokenMatch(provided: string, expected: string): Promise<boolean> {
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

export function extractClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
