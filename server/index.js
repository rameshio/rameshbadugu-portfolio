import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deliveryConfigured, processContact } from './contact-service.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

try {
  process.loadEnvFile(join(root, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const port = Number(process.env.PORT || 8787);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(body ? JSON.stringify(body) : undefined);
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 16_384) throw new Error('Payload too large.');
  }
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(pathname, response) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const safePath = normalize(requested)
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/^[/\\]+/, '');
  let filePath = join(dist, safePath);

  try {
    const details = await stat(filePath);
    if (details.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    filePath = join(dist, 'index.html');
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    });
    response.end(file);
  } catch {
    sendJson(response, 404, { ok: false, error: 'Build the frontend before starting the production server.' });
  }
}

export function startServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/api/health') {
      return sendJson(response, 200, {
        ok: true,
        service: 'rameshbadugu-portfolio-api',
        contactDelivery: deliveryConfigured(process.env) || process.env.CONTACT_DELIVERY_MODE === 'console',
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === '/api/contact') {
      try {
        const payload = request.method === 'POST' ? await readJson(request) : {};
        const result = await processContact({
          method: request.method,
          payload,
          ip: request.socket.remoteAddress,
          env: process.env,
        });
        return sendJson(response, result.status, result.body, result.headers);
      } catch (error) {
        const status = error.message === 'Payload too large.' ? 413 : 400;
        return sendJson(response, status, { ok: false, error: error.message });
      }
    }

    return serveStatic(url.pathname, response);
  });

  return server.listen(port, () => {
    console.info(`Portfolio server listening on http://localhost:${port}`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) startServer();
