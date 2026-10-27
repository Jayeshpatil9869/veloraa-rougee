import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { env } from './env';
import { supabase } from './db';
import { httpError } from './http';
import { registerAuth } from './auth-routes';
import { registerCatalogAdmin, registerContent } from './content-routes';
import { registerCommerce } from './commerce-routes';
import { registerShipping } from './shipping-routes';
import { registerOps, registerSeo } from './seo-routes';

export async function buildApp() {
  const app = Fastify({ logger: true, trustProxy: true });
  const ALLOWED_ORIGINS = new Set([
    'https://veloraarougee.com',
    'https://www.veloraarougee.com',
    'https://admin.veloraarougee.com',
    'https://api.veloraarougee.com',
  ]);

  if (env.APP_ORIGIN) {
    ALLOWED_ORIGINS.add(env.APP_ORIGIN.replace(/\/$/, ''));
  }

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        ALLOWED_ORIGINS.has(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('veloraarougee.com') ||
        /^https?:\/\/([a-z0-9-]+\.)?veloraarougee\.com$/.test(origin)
      ) {
        return cb(null, true);
      }
      if (env.NODE_ENV !== 'production') {
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return cb(null, true);
        }
      }
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });
  await app.register(cookie);
  await app.register(formbody);
  await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024 } });
  await app.register(rateLimit, { global: false });

  app.addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      const path = first?.path?.length ? first.path.join('.') : '';
      const detail = first ? `${path ? `${path}: ` : ''}${first.message}` : 'invalid_request';
      return reply.status(400).send({ error: 'invalid_request', detail, issues: error.issues.slice(0, 8) });
    }
    const mapped = httpError(error);
    if (mapped.status === 500) request.log.error(error);
    return reply.status(mapped.status).send({ error: mapped.error });
  });

  app.get('/health', async () => {
    if (!supabase) return { ok: true, db: 'unconfigured' };
    const { error } = await supabase.from('site_settings').select('id').eq('id', 1).limit(1);
    if (error) {
      app.log.warn({ message: error.message }, 'database health check failed');
      return { ok: true, db: 'down' };
    }
    return { ok: true, db: 'up' };
  });

  await registerAuth(app);
  await registerCatalogAdmin(app);
  await registerCommerce(app);
  await registerShipping(app);
  await registerContent(app);
  await registerSeo(app);
  await registerOps(app);

  return app;
}
