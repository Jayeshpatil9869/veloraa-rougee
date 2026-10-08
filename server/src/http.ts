import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from './env';
import { authGateway, db, ok, one, rows, supabase } from './db';
import { sha256 } from './password';

const KNOWN = new Set([
  'cart_not_found',
  'cart_empty',
  'email_required',
  'address_required',
  'unavailable_stock',
  'invalid_coupon',
  'coupon_limit',
  'coupon_minimum',
  'coupon_not_applicable',
  'invalid_payment_status',
  'payment_not_found',
  'amount_mismatch',
  'order_not_found',
  'order_not_payable',
  'database_unconfigured',
  'unauthorized',
  'forbidden',
  'invalid_credentials',
  'email_taken',
  'not_found',
]);

export function httpError(error: unknown) {
  const message = error instanceof Error ? error.message : 'request_failed';
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (
    message === 'database_unconfigured'
    || code === '28P01'
    || code === 'ENOTFOUND'
    || code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
    || /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|password authentication failed|getaddrinfo|fetch failed/i.test(message)
  ) {
    return { status: 503, error: 'database_unconfigured' };
  }
  if (code === 'FST_ERR_CTP_INVALID_JSON_BODY') return { status: 400, error: 'invalid_request' };
  if (message === 'unauthorized') return { status: 401, error: message };
  if (message === 'forbidden') return { status: 403, error: message };
  if (KNOWN.has(message)) return { status: 400, error: message };
  return { status: 500, error: 'request_failed' };
}

export function cookieBase() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function supabaseAdmin() {
  return authGateway;
}

export interface AdminPrincipal {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  permissions: string[];
}

export async function readAdmin(request: FastifyRequest): Promise<AdminPrincipal | null> {
  if (!supabase) return null;
  const token = request.cookies.vr_admin;
  if (!token) return null;
  const session = await one<{
    admin_users: { id: string; email: string; full_name: string; role_id: string; active: boolean } | { id: string; email: string; full_name: string; role_id: string; active: boolean }[] | null;
  }>(
    db()
      .from('admin_sessions')
      .select('admin_users ( id, email, full_name, role_id, active )')
      .eq('token_hash', sha256(token))
      .gt('expires_at', new Date().toISOString())
      .maybeSingle(),
  );
  const joined = session?.admin_users;
  const admin = Array.isArray(joined) ? joined[0] : joined;
  if (!admin?.active) return null;
  const permissions = await rows<{ permission_id: string }>(
    db().from('role_permissions').select('permission_id').eq('role_id', admin.role_id),
  );
  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    roleId: admin.role_id,
    permissions: permissions.map((row) => row.permission_id),
  };
}

export async function requireAdmin(request: FastifyRequest, permission?: string) {
  const admin = await readAdmin(request);
  if (!admin) throw new Error('unauthorized');
  if (permission && admin.roleId !== 'super_admin' && !admin.permissions.includes(permission)) {
    throw new Error('forbidden');
  }
  return admin;
}

export interface CustomerPrincipal {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  authProvider: string;
}

export async function readCustomer(request: FastifyRequest): Promise<CustomerPrincipal | null> {
  const client = supabaseAdmin();
  if (!client) return null;
  const token = request.cookies.vr_access;
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.email) return null;
  const email = data.user.email.toLowerCase();
  const matches = await rows<{
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    email_verified: boolean;
    auth_user_id: string | null;
    avatar_url: string | null;
    auth_provider: string | null;
  }>(
    db().from('customers').select('id, email, full_name, phone, email_verified, auth_user_id, avatar_url, auth_provider').or(`auth_user_id.eq.${data.user.id},email.eq.${email}`).limit(1),
  );
  const customer = matches[0];
  if (!customer) return null;
  return {
    id: customer.id,
    email: customer.email,
    fullName: customer.full_name,
    phone: customer.phone,
    emailVerified: customer.email_verified || Boolean(data.user.email_confirmed_at),
    avatarUrl: customer.avatar_url,
    authProvider: customer.auth_provider || 'email',
  };
}

export async function requireCustomer(request: FastifyRequest) {
  const customer = await readCustomer(request);
  if (!customer) throw new Error('unauthorized');
  return customer;
}

export async function audit(input: {
  actorType: string;
  actorId?: string;
  actorLabel?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  await ok(db().from('activity_logs').insert({
    actor_type: input.actorType,
    actor_id: input.actorId ?? null,
    actor_label: input.actorLabel ?? '',
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    summary: input.summary,
    metadata: JSON.parse(JSON.stringify(input.metadata ?? {})),
    ip: input.ip ?? null,
  }));
}

type Subscriber = (payload: unknown) => void;
const subscribers = new Set<Subscriber>();

export function subscribeNotifications(send: Subscriber) {
  subscribers.add(send);
  return () => subscribers.delete(send);
}

export async function notify(input: {
  type: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
  href?: string;
}) {
  const inserted = await rows<{
    id: string;
    type: string;
    title: string;
    body: string;
    entity_type: string | null;
    entity_id: string | null;
    href: string | null;
    read_at: string | null;
    created_at: string;
  }>(
    db().from('notifications').insert({
      type: input.type,
      title: input.title,
      body: input.body ?? '',
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      href: input.href ?? null,
    }).select('id, type, title, body, entity_type, entity_id, href, read_at, created_at'),
  );
  const row = inserted[0];
  for (const send of subscribers) send(row);
  return row;
}

export function clientIp(request: FastifyRequest) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
  return request.ip;
}

export function sendError(reply: FastifyReply, error: unknown, log: (error: unknown) => void) {
  const mapped = httpError(error);
  if (mapped.status === 500) log(error);
  return reply.status(mapped.status).send({ error: mapped.error });
}
