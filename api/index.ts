import type { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
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
    appPromise = buildApp()
      .then(async (app) => {
        await app.ready();
        return app;
      })
      .catch((err) => {
        // Reset so subsequent requests retry instead of latching onto failed promise
        appPromise = null;
        throw err;
      });
  }
  return appPromise;
}

function patchRequest(req: IncomingMessage) {
  // Fastify and Node stream internals check `socket instanceof Stream` and read socket properties.
  // In serverless environments, req.socket may be null or undefined.
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
  setCorsHeaders(req, res);

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
          message: err instanceof Error ? err.message : 'unknown',
        })
      );
    }
  }
}
