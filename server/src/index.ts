import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

// ESM hoists imports, so env.ts also loads dotenv with override:true.
// Keep this for any side-effect imports that read process.env early.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadEnv({ path: path.join(root, '.env'), override: true });
loadEnv({ path: path.join(root, 'server', '.env'), override: true });

import { buildApp } from './app';
import { env, payuBase } from './env';

const app = await buildApp();
await app.listen({ port: env.PORT, host: '0.0.0.0' });
console.info(`API listening on :${env.PORT} | PayU ${env.PAYU_MODE} → ${payuBase}`);
