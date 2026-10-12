import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../server/src/app';

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

let appPromise: ReturnType<typeof buildApp> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = buildApp().then(async (app) => {
      await app.ready();
      return app;
    }).catch((err) => {
      // Reset so next request retries
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

function patchRequest(req: IncomingMessage) {
  // Vercel serverless functions may not have a real socket attached.
  // Fastify reads req.socket for IP address and other metadata, so we
  // provide a minimal stub to prevent runtime crashes.
  if (!req.socket) {
    (req as IncomingMessage & { socket: unknown }).socket = {
      remoteAddress: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ?? '127.0.0.1',
      remotePort: 0,
      encrypted: true,
      destroy: () => {},
    };
  }
}

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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Always set CORS headers before anything else so preflight never fails
  setCorsHeaders(req, res);

  // Handle OPTIONS preflight immediately – no need to hit Fastify
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    patchRequest(req);
    const app = await getApp();

    const rawUrl = req.url || '/';
    let targetUrl = rawUrl;

    try {
      const parsed = new URL(rawUrl, 'http://localhost');
      const customPath = parsed.searchParams.get('__path');
      if (customPath) {
        // __path was injected by the Vercel rewrite rule, e.g.
        // /api?__path=/auth/me  →  /auth/me
        parsed.searchParams.delete('__path');
        const search = parsed.searchParams.toString();
        targetUrl = customPath + (search ? `?${search}` : '');
      } else {
        // No __path: strip /api prefix if present (direct same-origin call)
        // e.g. /api/auth/session → /auth/session
        if (targetUrl.startsWith('/api/')) {
          targetUrl = targetUrl.slice(4); // '/api/auth' → '/auth'
        } else if (targetUrl === '/api' || targetUrl === '') {
          targetUrl = '/health';
        }
      }
    } catch {
      // fallback: strip /api prefix if present
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
      res.end(JSON.stringify({ error: 'internal_server_error', message: err instanceof Error ? err.message : 'unknown' }));
    }
  }
}
