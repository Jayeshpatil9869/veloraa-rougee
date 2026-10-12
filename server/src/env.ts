import { z } from 'zod';

// In production (Vercel), env vars come directly from process.env set in the dashboard.
// In local development, .env is loaded by the dev script (scripts/dev.mjs) or tsx.
// We do NOT use dotenv here to avoid path issues in serverless environments.

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
