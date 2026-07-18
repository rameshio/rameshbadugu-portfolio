const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  from_name: 80,
  from_email: 160,
  subject: 140,
  message: 4000,
};

const buckets = new Map();

export function validateContact(payload = {}) {
  const clean = {
    from_name: String(payload.from_name ?? '').trim(),
    from_email: String(payload.from_email ?? '').trim().toLowerCase(),
    subject: String(payload.subject ?? '').trim(),
    message: String(payload.message ?? '').trim(),
    website: String(payload.website ?? '').trim(),
  };

  if (clean.website) {
    return { ok: false, status: 400, error: 'Unable to process this request.' };
  }

  for (const field of ['from_name', 'from_email', 'subject', 'message']) {
    if (!clean[field]) {
      return { ok: false, status: 400, error: 'Please complete every required field.' };
    }

    if (clean[field].length > LIMITS[field]) {
      return { ok: false, status: 400, error: `${field.replace('_', ' ')} is too long.` };
    }
  }

  if (!EMAIL_PATTERN.test(clean.from_email)) {
    return { ok: false, status: 400, error: 'Please enter a valid email address.' };
  }

  return { ok: true, data: clean };
}
export function checkRateLimit(ip, now = Date.now()) {
  const key = ip || 'unknown';
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;
  const current = buckets.get(key);

  if (!current || now - current.startedAt >= windowMs) {
    buckets.set(key, { count: 1, startedAt: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - current.startedAt)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count };
}

export function deliveryConfigured(env = process.env) {
  return Boolean(
    env.EMAILJS_SERVICE_ID &&
    env.EMAILJS_TEMPLATE_ID &&
    env.EMAILJS_PUBLIC_KEY,
  );
}

export async function deliverContact(data, env = process.env, fetchImpl = fetch) {
  if (env.CONTACT_DELIVERY_MODE === 'console') {
    console.info('[contact]', {
      from: data.from_email,
      name: data.from_name,
      subject: data.subject,
      receivedAt: new Date().toISOString(),
    });
    return;
  }

  if (!deliveryConfigured(env)) {
    throw new Error('Contact delivery is not configured.');
  }

  const request = {
    service_id: env.EMAILJS_SERVICE_ID,
    template_id: env.EMAILJS_TEMPLATE_ID,
    user_id: env.EMAILJS_PUBLIC_KEY,
    template_params: {
      from_name: data.from_name,
      from_email: data.from_email,
      reply_to: data.from_email,
      subject: data.subject,
      message: data.message,
    },
  };

  if (env.EMAILJS_PRIVATE_KEY) request.accessToken = env.EMAILJS_PRIVATE_KEY;

  const response = await fetchImpl('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}.`);
  }
}

export async function processContact({ method, payload, ip, env, fetchImpl }) {
  if (method === 'OPTIONS') return { status: 204, body: null };
  if (method !== 'POST') {
    return { status: 405, body: { ok: false, error: 'Method not allowed.' } };
  }

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfter) },
      body: { ok: false, error: 'Too many messages. Please try again later.' },
    };
  }

  const validation = validateContact(payload);
  if (!validation.ok) {
    return { status: validation.status, body: { ok: false, error: validation.error } };
  }

  try {
    await deliverContact(validation.data, env, fetchImpl);
    return { status: 200, body: { ok: true, message: 'Message delivered successfully.' } };
  } catch (error) {
    console.error('[contact delivery]', error.message);
    return {
      status: 503,
      body: { ok: false, error: 'Message delivery is temporarily unavailable. Please email me directly.' },
    };
  }
}
