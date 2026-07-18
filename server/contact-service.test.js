import test from 'node:test';
import assert from 'node:assert/strict';
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
