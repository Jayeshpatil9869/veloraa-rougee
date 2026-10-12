// Load .env for local development BEFORE importing any modules that read process.env
// In production (Vercel), env vars are injected by the platform - dotenv is a no-op.
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../.env' }); // root .env
loadEnv();                     // server/.env (if exists)

import { buildApp } from './app';
import { env } from './env';

const app = await buildApp();
await app.listen({ port: env.PORT, host: '0.0.0.0' });
