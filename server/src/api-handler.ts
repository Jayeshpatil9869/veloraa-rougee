import type { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_ORIGINS = new Set([
  'https://veloraarougee.com',
  'https://www.veloraarougee.com',
  'https://admin.veloraarougee.com',
  'https://api.veloraarougee.com',
]);

function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers['origin'];
  if (!origin) return;
  const isAllowed =
    ALLOWED_ORIGINS.has(origin) ||
    origin.endsWith('.veloraarougee.com') ||
    origin.endsWith('.vercel.app');
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.setHeader('Vary', 'Origin');
  }
}

function patchRequest(req: IncomingMessage) {
  if (!req.socket) {
    const socket = new Socket();
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : '127.0.0.1';
    Object.defineProperty(socket, 'remoteAddress', { value: ip, writable: true });
    Object.defineProperty(socket, 'remotePort', { value: 0, writable: true });
    Object.defineProperty(socket, 'encrypted', { value: true, writable: true });
    (req as IncomingMessage & { socket: Socket }).socket = socket;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Diagnostic ping route to verify execution of this exact function on Vercel
  const rawUrl = req.url || '/';
  if (rawUrl.includes('__diag=1') || rawUrl.endsWith('/diag')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, runtime: 'vercel-node', timestamp: new Date().toISOString() }));
    return;
  }

  try {
    patchRequest(req);
    // Lazy-load Fastify and routes inside handler wrapped in try/catch to report any boot errors
    const { buildApp } = await import('./app');
    const app = await buildApp();
    await app.ready();

    let targetUrl = rawUrl;
    try {
      const parsed = new URL(rawUrl, 'http://localhost');
      const customPath = parsed.searchParams.get('__path');
      if (customPath) {
        parsed.searchParams.delete('__path');
        const search = parsed.searchParams.toString();
        targetUrl = customPath + (search ? `?${search}` : '');
      } else {
        if (targetUrl.startsWith('/api/')) {
          targetUrl = targetUrl.slice(4);
        } else if (targetUrl === '/api' || targetUrl === '') {
          targetUrl = '/health';
        }
      }
    } catch {
      if (targetUrl.startsWith('/api/')) targetUrl = targetUrl.slice(4);
      else if (targetUrl === '/api') targetUrl = '/health';
    }

    req.url = targetUrl;
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('Vercel API handler error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'internal_server_error',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        })
      );
    }
  }
}
