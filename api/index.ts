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
  const app = await getApp();

  const originalUrl = (req.headers['x-original-url'] as string | undefined) || req.url || '/';
  let targetUrl = originalUrl;

  if (targetUrl.startsWith('/api/')) {
    targetUrl = targetUrl.replace(/^\/api/, '');
  } else if (targetUrl === '/api') {
    targetUrl = '/health';
  }

  req.url = targetUrl;

  app.server.emit('request', req, res);
}
