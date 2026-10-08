import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: '../.env' });
loadEnv();

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  APP_ORIGIN: z.string().default('http://localhost:3000'),
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

export const env = schema.parse(process.env);

export const payuBase = env.PAYU_MODE === 'live' ? 'https://secure.payu.in' : 'https://test.payu.in';
export const payuVerifyUrl = `${payuBase}/merchant/postservice?form=2`;
