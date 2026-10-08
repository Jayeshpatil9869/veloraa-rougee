import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from './env';
import { db, ok, one, rows } from './db';
import { audit, clientIp, cookieBase, notify, readAdmin, readCustomer, requireAdmin, requireCustomer, supabaseAdmin } from './http';
import { hashPassword, randomToken, sha256, verifyPassword } from './password';

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(30).optional(),
});

async function upsertCustomer(input: { authUserId: string; email: string; fullName?: string; phone?: string; verified: boolean }) {
  const email = input.email.toLowerCase();
  const existing = await one<{ id: string; full_name: string; phone: string | null; email_verified: boolean }>(
    db().from('customers').select('id, full_name, phone, email_verified').eq('email', email).maybeSingle(),
  );
  if (!existing) {
    const created = await rows<{ id: string }>(
      db().from('customers').insert({
        auth_user_id: input.authUserId,
        email,
        full_name: input.fullName ?? '',
        phone: input.phone ?? null,
        email_verified: input.verified,
      }).select('id'),
    );
    return created[0]?.id;
  }
  await ok(db().from('customers').update({
    auth_user_id: input.authUserId,
    full_name: existing.full_name === '' ? (input.fullName ?? '') : existing.full_name,
    phone: existing.phone ?? input.phone ?? null,
    email_verified: existing.email_verified || input.verified,
  }).eq('id', existing.id));
  return existing.id;
}

function setSessionCookies(reply: { setCookie: Function }, access: string, refresh: string, expiresIn: number) {
  const base = cookieBase();
  reply.setCookie('vr_access', access, { ...base, maxAge: expiresIn });
  reply.setCookie('vr_refresh', refresh, { ...base, maxAge: 60 * 60 * 24 * 14 });
}

export async function registerAuth(app: FastifyInstance) {
  app.post('/auth/signup', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = credentials.parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    const { data, error } = await client.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { full_name: body.fullName ?? '', phone: body.phone ?? '' } },
    });
    if (error || !data.user) return reply.status(400).send({ error: error?.message || 'signup_failed' });
    await upsertCustomer({
      authUserId: data.user.id,
      email: body.email,
      fullName: body.fullName,
      phone: body.phone,
      verified: Boolean(data.user.email_confirmed_at),
    });
    await notify({
      type: 'customer.registered',
      title: 'New customer',
      body: body.email,
      entityType: 'customer',
      entityId: data.user.id,
      href: '/admin/customers',
    });
    if (data.session) {
      setSessionCookies(reply, data.session.access_token, data.session.refresh_token, data.session.expires_in ?? 3600);
    }
    return { needsVerification: !data.session, email: body.email.toLowerCase() };
  });

  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = credentials.pick({ email: true, password: true }).parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    const { data, error } = await client.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error || !data.user || !data.session) return reply.status(401).send({ error: 'invalid_credentials' });
    await upsertCustomer({
      authUserId: data.user.id,
      email: data.user.email || body.email,
      fullName: String(data.user.user_metadata?.full_name ?? ''),
      verified: Boolean(data.user.email_confirmed_at),
    });
    setSessionCookies(reply, data.session.access_token, data.session.refresh_token, data.session.expires_in ?? 3600);
    return { ok: true, email: (data.user.email || body.email).toLowerCase() };
  });

  app.get('/auth/google', async (_request, reply) => {
    const client = supabaseAdmin();
    if (!client || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return reply.status(503).send({ error: 'google_unconfigured' });
    }
    const redirectTo = `${env.APP_ORIGIN}/en/auth/callback`;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true, queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
    if (error || !data.url) return reply.status(503).send({ error: 'google_unconfigured' });
    return reply.redirect(data.url);
  });

  app.post('/auth/exchange', async (request, reply) => {
    const body = z.object({ code: z.string().min(4) }).parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    const { data, error } = await client.auth.exchangeCodeForSession(body.code);
    if (error || !data.user?.email || !data.session) return reply.status(401).send({ error: 'invalid_credentials' });
    if (!data.user.email_confirmed_at && !data.user.identities?.some((identity) => identity.provider === 'google')) {
      return reply.status(400).send({ error: 'email_unverified' });
    }
    await upsertCustomer({
      authUserId: data.user.id,
      email: data.user.email,
      fullName: String(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? ''),
      verified: true,
    });
    setSessionCookies(reply, data.session.access_token, data.session.refresh_token, data.session.expires_in ?? 3600);
    await notify({
      type: 'customer.google',
      title: 'Google sign-in',
      body: data.user.email,
      entityType: 'customer',
      href: '/admin/customers',
    });
    return { email: data.user.email.toLowerCase() };
  });

  app.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('vr_access', { path: '/' });
    reply.clearCookie('vr_refresh', { path: '/' });
    return { ok: true };
  });

  app.get('/auth/me', async (request) => {
    const customer = await readCustomer(request);
    return { customer };
  });

  app.post('/auth/forgot-password', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = z.object({ email: z.string().email() }).parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    await client.auth.resetPasswordForEmail(body.email, { redirectTo: `${env.APP_ORIGIN}/en/reset-password` });
    return { ok: true };
  });

  app.post('/auth/reset-password', async (request, reply) => {
    const body = z.object({ accessToken: z.string().min(10), password: z.string().min(8).max(200) }).parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    const user = await client.auth.getUser(body.accessToken);
    if (user.error || !user.data.user) return reply.status(401).send({ error: 'unauthorized' });
    const updated = await client.auth.admin.updateUserById(user.data.user.id, { password: body.password });
    if (updated.error) return reply.status(400).send({ error: 'reset_failed' });
    return { ok: true };
  });

  app.patch('/auth/profile', async (request) => {
    const customer = await requireCustomer(request);
    const body = z.object({ fullName: z.string().min(1).max(120), phone: z.string().max(30).optional() }).parse(request.body);
    await ok(db().from('customers').update({ full_name: body.fullName, phone: body.phone ?? null }).eq('id', customer.id));
    return { ok: true };
  });

  app.get('/account/addresses', async (request) => {
    const customer = await requireCustomer(request);
    return rows(db().from('addresses').select('*').eq('customer_id', customer.id).order('is_default', { ascending: false }).order('created_at', { ascending: false }));
  });

  app.post('/account/addresses', async (request) => {
    const customer = await requireCustomer(request);
    const body = z.object({
      fullName: z.string().min(1),
      phone: z.string().min(5),
      line1: z.string().min(1),
      line2: z.string().optional().default(''),
      city: z.string().min(1),
      region: z.string().optional().default(''),
      postalCode: z.string().min(3),
      country: z.string().optional().default('India'),
      isDefault: z.boolean().optional().default(false),
    }).parse(request.body);
    if (body.isDefault) await ok(db().from('addresses').update({ is_default: false }).eq('customer_id', customer.id));
    const created = await rows(
      db().from('addresses').insert({
        customer_id: customer.id,
        full_name: body.fullName,
        phone: body.phone,
        line1: body.line1,
        line2: body.line2,
        city: body.city,
        region: body.region,
        postal_code: body.postalCode,
        country: body.country,
        is_default: body.isDefault,
      }).select('*'),
    );
    return created[0];
  });

  app.delete('/account/addresses/:id', async (request) => {
    const customer = await requireCustomer(request);
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    await ok(db().from('addresses').delete().eq('id', params.id).eq('customer_id', customer.id));
    return { ok: true };
  });

  app.post('/admin/auth/login', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).parse(request.body);
    const admin = await one<{ id: string; email: string; full_name: string; password_hash: string; role_id: string; active: boolean }>(
      db().from('admin_users').select('id, email, full_name, password_hash, role_id, active').eq('email', body.email.toLowerCase()).maybeSingle(),
    );
    if (!admin || !admin.active || !(await verifyPassword(body.password, admin.password_hash))) {
      return reply.status(401).send({ error: 'invalid_credentials' });
    }
    const token = randomToken();
    await ok(db().from('admin_sessions').insert({
      admin_user_id: admin.id,
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      ip: clientIp(request),
      user_agent: request.headers['user-agent'] ?? null,
    }));
    await ok(db().from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id));
    reply.setCookie('vr_admin', token, { ...cookieBase(), maxAge: 60 * 60 * 12 });
    await audit({
      actorType: 'admin',
      actorId: admin.id,
      actorLabel: admin.email,
      action: 'admin.login',
      entityType: 'admin_user',
      entityId: admin.id,
      summary: `${admin.email} signed in`,
      ip: clientIp(request),
    });
    return { email: admin.email, roleId: admin.role_id, fullName: admin.full_name };
  });

  app.post('/admin/auth/logout', async (request, reply) => {
    const token = request.cookies.vr_admin;
    if (token) {
      await ok(db().from('admin_sessions').delete().eq('token_hash', sha256(token)));
    }
    reply.clearCookie('vr_admin', { path: '/' });
    return { ok: true };
  });

  app.post('/auth/session', async (request, reply) => {
    const body = z.object({
      accessToken: z.string().min(10),
      refreshToken: z.string().min(10),
    }).parse(request.body);
    const client = supabaseAdmin();
    if (!client) return reply.status(503).send({ error: 'auth_unconfigured' });
    const user = await client.auth.getUser(body.accessToken);
    if (user.error || !user.data.user?.email) return reply.status(401).send({ error: 'unauthorized' });
    const google = user.data.user.identities?.some((identity) => identity.provider === 'google');
    if (!user.data.user.email_confirmed_at && !google) return reply.status(400).send({ error: 'email_unverified' });
    await upsertCustomer({
      authUserId: user.data.user.id,
      email: user.data.user.email,
      fullName: String(user.data.user.user_metadata?.full_name ?? user.data.user.user_metadata?.name ?? ''),
      verified: Boolean(user.data.user.email_confirmed_at || google),
    });
    setSessionCookies(reply, body.accessToken, body.refreshToken, 3600);
    if (google) {
      await notify({
        type: 'customer.google',
        title: 'Google sign-in',
        body: user.data.user.email,
        entityType: 'customer',
        href: '/admin/customers',
      });
    }
    return { email: user.data.user.email.toLowerCase() };
  });

  app.get('/admin/auth/me', async (request, reply) => {
    const admin = await readAdmin(request);
    if (!admin) return reply.status(401).send({ error: 'unauthorized' });
    return { admin };
  });

  app.post('/admin/users', async (request) => {
    const actor = await requireAdmin(request, 'admins.manage');
    const body = z.object({
      email: z.string().email(),
      fullName: z.string().min(1),
      password: z.string().min(8),
      roleId: z.enum(['super_admin', 'content_manager', 'order_manager', 'inventory_manager', 'support_manager', 'seo_manager']),
    }).parse(request.body);
    const created = await rows<{ id: string; email: string; full_name: string; role_id: string; active: boolean }>(
      db().from('admin_users').insert({
        email: body.email.toLowerCase(),
        full_name: body.fullName,
        password_hash: await hashPassword(body.password),
        role_id: body.roleId,
      }).select('id, email, full_name, role_id, active'),
    );
    await audit({
      actorType: 'admin',
      actorId: actor.id,
      actorLabel: actor.email,
      action: 'admin.permission_changed',
      entityType: 'admin_user',
      entityId: created[0]?.id,
      summary: `Created admin ${body.email} as ${body.roleId}`,
      ip: clientIp(request),
    });
    return created[0];
  });
}
