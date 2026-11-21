import test from 'node:test';
import assert from 'node:assert/strict';
import contactHandler from '../api/contact.js';
import { deliverContact, processContact, validateContact } from './contact-service.js';

const validPayload = {
  from_name: 'Ada Lovelace',
  from_email: 'ADA@example.com',
  subject: 'Portfolio collaboration',
  message: 'I would like to discuss a project.',
  website: '',
};

test('validateContact normalizes a valid payload', () => {
  const result = validateContact(validPayload);
  assert.equal(result.ok, true);
  assert.equal(result.data.from_email, 'ada@example.com');
});
test('validateContact rejects invalid email and honeypot submissions', () => {
  assert.equal(validateContact({ ...validPayload, from_email: 'invalid' }).ok, false);
  assert.equal(validateContact({ ...validPayload, website: 'spam.example' }).ok, false);
});

test('deliverContact sends the expected EmailJS request', async () => {
  let captured;
  const fetchImpl = async (url, options) => {
    captured = { url, options };
    return { ok: true, status: 200 };
  };

  await deliverContact(validPayload, {
    EMAILJS_SERVICE_ID: 'service',
    EMAILJS_TEMPLATE_ID: 'template',
    EMAILJS_PUBLIC_KEY: 'public',
  }, fetchImpl);

  assert.equal(captured.url, 'https://api.emailjs.com/api/v1.0/email/send');
  assert.equal(JSON.parse(captured.options.body).template_params.reply_to, 'ADA@example.com');
});

test('processContact rejects unsupported methods', async () => {
  const result = await processContact({ method: 'GET', payload: validPayload, ip: 'method-test' });
  assert.equal(result.status, 405);
});

test('validateContact enforces field length caps and /api/contact enforces 413 & 3 req/10m rate limit', async () => {
  assert.equal(validateContact({ ...validPayload, from_name: 'a'.repeat(101) }).ok, false);
  assert.equal(validateContact({ ...validPayload, from_email: `${'a'.repeat(190)}@example.com` }).ok, false);
  assert.equal(validateContact({ ...validPayload, subject: 'a'.repeat(201) }).ok, false);
  assert.equal(validateContact({ ...validPayload, message: 'a'.repeat(5001) }).ok, false);

  const prevMode = process.env.CONTACT_DELIVERY_MODE;
  process.env.CONTACT_DELIVERY_MODE = 'console';
  const makeRes = () => {
    const headers = {};
    let statusCode = 200;
    let body = null;
    return {
      headers,
      get statusCode() {
        return statusCode;
      },
      get body() {
        return body;
      },
      setHeader(name, value) {
        headers[name] = value;
      },
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        body = data;
        return this;
      },
      end() {
        return this;
      },
    };
  };

  try {
    const bigRes = makeRes();
    await contactHandler(
      {
        method: 'POST',
        headers: { 'x-real-ip': '198.51.100.71' },
        body: { ...validPayload, message: 'x'.repeat(1024 * 1024) },
      },
      bigRes,
    );
    assert.equal(bigRes.statusCode, 413);

    for (let i = 0; i < 3; i += 1) {
      const res = makeRes();
      await contactHandler(
        {
          method: 'POST',
          headers: { 'x-real-ip': '198.51.100.72' },
          body: validPayload,
        },
        res,
      );
      assert.equal(res.statusCode, 200);
    }

    const limited = makeRes();
    await contactHandler(
      {
        method: 'POST',
        headers: { 'x-real-ip': '198.51.100.72' },
        body: validPayload,
      },
      limited,
    );
    assert.equal(limited.statusCode, 429);
    assert.ok(Number(limited.headers['Retry-After']) >= 1);
  } finally {
    if (prevMode === undefined) delete process.env.CONTACT_DELIVERY_MODE;
    else process.env.CONTACT_DELIVERY_MODE = prevMode;
  }
});
