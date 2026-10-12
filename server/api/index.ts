import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../src/app';

export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedApp: Awaited<ReturnType<typeof buildApp>> | null = null;
let buildPromise: Promise<Awaited<ReturnType<typeof buildApp>>> | null = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  if (!buildPromise) {
    buildPromise = buildApp().then(async (app) => {
      await app.ready();
      cachedApp = app;
      return app;
    });
  }
  return buildPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();

  // Normalise the URL: strip the /api prefix that Vercel adds when
  // routing /api/* → this function, and also handle api.veloraarougee.com
  // where the request arrives with the full original path.
  let url = req.url || '/';

  if (url.startsWith('/api/')) {
    url = url.slice(4); // remove /api prefix → /auth/login etc.
  } else if (url === '/api') {
    url = '/health';
  }

  req.url = url;

  app.server.emit('request', req, res);
}
