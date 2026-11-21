const ALLOWED_HOSTS = new Set([
  'rameshbaduguai.com',
  'www.rameshbaduguai.com',
  'github.com',
  'linkedin.com',
  'www.linkedin.com',
]);
const ALLOWED_MAILTO = 'mailto:rameshbadugums@gmail.com';

export function isSafeHref(href) {
  if (typeof href !== 'string' || href.length > 300) return false;
  if (href.startsWith('#')) return /^#[a-z0-9-]+$/i.test(href);
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  if (href === ALLOWED_MAILTO) return true;
  try {
    const u = new URL(href);
    return u.protocol === 'https:' && ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}
