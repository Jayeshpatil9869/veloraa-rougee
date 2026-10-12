import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Load .env files in local development before parsing process.env
try {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  loadEnv({ path: path.resolve(dir, '../../.env') });
  loadEnv({ path: path.resolve(dir, '../.env') });
  loadEnv();
} catch {
  // Ignored in serverless environments where dotenv/filesystem is not needed
}

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  APP_ORIGIN: z.string().default('https://veloraarougee.com'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  PAYU_KEY: z.string().optional(),
  PAYU_SALT: z.string().optional(),
  PAYU_MODE: z.enum(['test', 'live']).default('test'),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_NAME: z.string().default('Veloraa Admin'),
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  APP_ORIGIN:
    parsed.NODE_ENV === 'production' && parsed.APP_ORIGIN.includes('localhost')
      ? 'https://veloraarougee.com'
      : parsed.APP_ORIGIN,
};

export const payuBase = env.PAYU_MODE === 'live' ? 'https://secure.payu.in' : 'https://test.payu.in';
export const payuVerifyUrl = `${payuBase}/merchant/postservice?form=2`;
