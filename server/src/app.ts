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
import { registerOps, registerSeo } from './seo-routes';

export async function buildApp() {
  const app = Fastify({ logger: true, trustProxy: true });
  await app.register(cors, { origin: env.APP_ORIGIN, credentials: true });
  await app.register(cookie);
  await app.register(formbody);
  await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024 } });
  await app.register(rateLimit, { global: false });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'invalid_request' });
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
  await registerContent(app);
  await registerSeo(app);
  await registerOps(app);

  return app;
}
