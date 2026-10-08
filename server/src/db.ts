import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const authGateway: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function db(): SupabaseClient {
  if (!supabase) throw new Error('database_unconfigured');
  return supabase;
}

export async function rows<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function one<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T | null> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? null) as T | null;
}

export async function ok(query: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
