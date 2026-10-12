import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../server/src/app';

export const config = {
  api: {
    bodyParser: false,
  },
};

let appPromise: ReturnType<typeof buildApp> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = buildApp().then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
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
        const headerUrl =
          (req.headers['x-matched-path'] as string | undefined) ||
          (req.headers['x-invoke-path'] as string | undefined) ||
          (req.headers['x-original-url'] as string | undefined);
        if (headerUrl && headerUrl !== '/api') {
          targetUrl = headerUrl;
        }
      }
    } catch {
      // fallback
    }

    if (targetUrl.startsWith('/api/')) {
      targetUrl = targetUrl.slice(4);
    } else if (targetUrl === '/api' || targetUrl === '') {
      targetUrl = '/health';
    }

    req.url = targetUrl;

    app.server.emit('request', req, res);
  } catch (err) {
    console.error('Vercel API error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'internal_server_error' }));
    }
  }
}
