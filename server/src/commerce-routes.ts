import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { amountToPaise, payuRequestHash, payuVerifyCommandHash, verifyPayuHash } from '../../shared/payu';
import { formatInr } from '../../shared/commerce';
import { env, payuBase, payuVerifyUrl } from './env';
import { asOne, db, ok, one, rows } from './db';
import { audit, clientIp, cookieBase, notify, readCustomer, requireAdmin, requireCustomer } from './http';
import { randomToken, sha256 } from './password';

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(5),
  line1: z.string().min(1),
  line2: z.string().optional().default(''),
  city: z.string().min(1),
  region: z.string().optional().default(''),
  postalCode: z.string().min(3),
  country: z.string().optional().default('India'),
});

async function cartIdFor(request: { cookies: Record<string, string | undefined> }, reply: { setCookie: Function }, customerId?: string) {
  if (customerId) {
    const existing = await one<{ id: string }>(db().from('carts').select('id').eq('customer_id', customerId).maybeSingle());
    if (existing) return existing.id;
    const created = await rows<{ id: string }>(db().from('carts').insert({ customer_id: customerId }).select('id'));
    return created[0].id;
  }
  const token = request.cookies.vr_cart;
  if (token) {
    const existing = await one<{ id: string }>(db().from('carts').select('id').eq('guest_token', token).maybeSingle());
    if (existing) return existing.id;
  }
  const next = randomToken();
  reply.setCookie('vr_cart', next, { ...cookieBase(), maxAge: 60 * 60 * 24 * 30 });
  const created = await rows<{ id: string }>(db().from('carts').insert({ guest_token: next }).select('id'));
  return created[0].id;
}

async function findVariant(variantId: string) {
  const query = db()
    .from('product_variants')
    .select('id, stock_on_hand, stock_reserved, active, products!inner ( status )')
    .eq('active', true)
    .eq('products.status', 'published');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
  const found = await rows<{ id: string; stock_on_hand: number; stock_reserved: number; active: boolean }>(
    isUuid ? query.or(`legacy_variant_id.eq.${variantId},id.eq.${variantId}`) : query.eq('legacy_variant_id', variantId),
  );
  return found[0] ?? null;
}

async function variantIdsFor(variantId: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
  const query = db().from('product_variants').select('id');
  const found = await rows<{ id: string }>(
    isUuid ? query.or(`legacy_variant_id.eq.${variantId},id.eq.${variantId}`) : query.eq('legacy_variant_id', variantId),
  );
  return found.map((row) => row.id);
}

async function cartPayload(cartId: string) {
  const items = await rows<{
    quantity: number;
    product_variants: {
      id: string;
      legacy_variant_id: string | null;
      name: string;
      sku: string | null;
      price_paise: number;
      hex_color: string | null;
      stock_on_hand: number;
      stock_reserved: number;
      product_id: string;
      products: { name: string; slug: string } | { name: string; slug: string }[] | null;
      product_variant_images: { url: string; sort_order: number }[] | null;
    } | null;
  }>(
    db().from('cart_items').select(`
      quantity,
      product_variants (
        id, legacy_variant_id, name, sku, price_paise, hex_color, stock_on_hand, stock_reserved, product_id,
        products ( name, slug ),
        product_variant_images ( url, sort_order )
      )
    `).eq('cart_id', cartId),
  );
  const productIds = items.map((item) => item.product_variants?.product_id).filter((id): id is string => Boolean(id));
  const productImages = productIds.length
    ? await rows<{ product_id: string; url: string; sort_order: number }>(
      db().from('product_images').select('product_id, url, sort_order').in('product_id', productIds).order('sort_order'),
    )
    : [];
  const settings = await one<{ free_shipping_threshold_paise: number; shipping_flat_paise: number }>(
    db().from('site_settings').select('free_shipping_threshold_paise, shipping_flat_paise').eq('id', 1).maybeSingle(),
  );
  const subtotalPaise = items.reduce((sum, item) => sum + Number(item.product_variants?.price_paise ?? 0) * Number(item.quantity), 0);
  const threshold = settings?.free_shipping_threshold_paise ?? 99900;
  return {
    items: items.flatMap((item) => {
      const variant = item.product_variants;
      if (!variant) return [];
      const product = asOne(variant.products);
      const variantImage = (variant.product_variant_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
      const productImage = productImages.find((image) => image.product_id === variant.product_id)?.url;
      return [{
        variantId: variant.legacy_variant_id || variant.id,
        name: product?.name ?? '',
        variantName: variant.name,
        slug: product?.slug ?? '',
        sku: variant.sku,
        quantity: item.quantity,
        price: Number(variant.price_paise) / 100,
        image: variantImage || productImage,
        hexColor: variant.hex_color,
        available: Math.max(Number(variant.stock_on_hand) - Number(variant.stock_reserved), 0),
      }];
    }),
    subtotal: subtotalPaise / 100,
    freeShippingThreshold: threshold / 100,
    shipping: subtotalPaise >= threshold ? 0 : (settings?.shipping_flat_paise ?? 0) / 100,
  };
}

function payuFields(input: { txnId: string; amountPaise: number; email: string; firstName: string; orderNumber: string; phone: string }) {
  if (!env.PAYU_KEY || !env.PAYU_SALT) return null;
  const amount = formatInr(input.amountPaise);
  const productinfo = `Veloraa Rougee ${input.orderNumber}`;
  const firstname = input.firstName.slice(0, 60);
  const hash = payuRequestHash({
    key: env.PAYU_KEY,
    txnid: input.txnId,
    amount,
    productinfo,
    firstname,
    email: input.email,
    udf1: input.orderNumber,
    salt: env.PAYU_SALT,
  });
  return {
    action: `${payuBase}/_payment`,
    key: env.PAYU_KEY,
    txnid: input.txnId,
    amount,
    productinfo,
    firstname,
    email: input.email,
    phone: input.phone,
    surl: undefined as string | undefined,
    furl: undefined as string | undefined,
    hash,
    udf1: input.orderNumber,
  };
}

export async function registerCommerce(app: FastifyInstance) {
  const callbackBase = process.env.API_PUBLIC_URL || `http://localhost:${env.PORT}`;

  app.get('/cart', async (request, reply) => {
    const customer = await readCustomer(request);
    const id = await cartIdFor(request, reply, customer?.id);
    return cartPayload(id);
  });

  app.post('/cart/items', async (request, reply) => {
    const body = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(10) }).parse(request.body);
    const customer = await readCustomer(request);
    const id = await cartIdFor(request, reply, customer?.id);
    const variant = await findVariant(body.variantId);
    if (!variant) return reply.status(404).send({ error: 'not_found' });
    const available = variant.stock_on_hand - variant.stock_reserved;
    if (available < body.quantity) return reply.status(400).send({ error: 'unavailable_stock' });
    const current = await one<{ quantity: number }>(db().from('cart_items').select('quantity').eq('cart_id', id).eq('variant_id', variant.id).maybeSingle());
    const quantity = Math.min((current?.quantity ?? 0) + body.quantity, available);
    await ok(db().from('cart_items').upsert({ cart_id: id, variant_id: variant.id, quantity }, { onConflict: 'cart_id,variant_id' }));
    return cartPayload(id);
  });

  app.patch('/cart/items/:variantId', async (request, reply) => {
    const params = z.object({ variantId: z.string() }).parse(request.params);
    const body = z.object({ quantity: z.number().int().min(0).max(10) }).parse(request.body);
    const customer = await readCustomer(request);
    const id = await cartIdFor(request, reply, customer?.id);
    const variantIds = await variantIdsFor(params.variantId);
    if (variantIds.length > 0) {
      if (body.quantity === 0) await ok(db().from('cart_items').delete().eq('cart_id', id).in('variant_id', variantIds));
      else await ok(db().from('cart_items').update({ quantity: body.quantity }).eq('cart_id', id).in('variant_id', variantIds));
    }
    return cartPayload(id);
  });

  app.delete('/cart/items/:variantId', async (request, reply) => {
    const params = z.object({ variantId: z.string() }).parse(request.params);
    const customer = await readCustomer(request);
    const id = await cartIdFor(request, reply, customer?.id);
    const variantIds = await variantIdsFor(params.variantId);
    if (variantIds.length > 0) await ok(db().from('cart_items').delete().eq('cart_id', id).in('variant_id', variantIds));
    return cartPayload(id);
  });

  app.post('/cart/merge', async (request, reply) => {
    const customer = await requireCustomer(request);
    const guest = request.cookies.vr_cart;
    const id = await cartIdFor(request, reply, customer.id);
    if (guest) {
      const guestCart = await one<{ id: string }>(db().from('carts').select('id').eq('guest_token', guest).maybeSingle());
      const guestId = guestCart?.id;
      if (guestId && guestId !== id) {
        const items = await rows<{ variant_id: string; quantity: number }>(db().from('cart_items').select('variant_id, quantity').eq('cart_id', guestId));
        for (const item of items) {
          const current = await one<{ quantity: number }>(db().from('cart_items').select('quantity').eq('cart_id', id).eq('variant_id', item.variant_id).maybeSingle());
          await ok(db().from('cart_items').upsert({
            cart_id: id,
            variant_id: item.variant_id,
            quantity: (current?.quantity ?? 0) + item.quantity,
          }, { onConflict: 'cart_id,variant_id' }));
        }
        await ok(db().from('carts').delete().eq('id', guestId));
      }
      reply.clearCookie('vr_cart', { path: '/' });
    }
    return cartPayload(id);
  });

  app.post('/checkout', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const body = z.object({
      email: z.string().email(),
      address: addressSchema,
      couponCode: z.string().max(40).optional(),
    }).parse(request.body);
    const customer = await readCustomer(request);
    const id = await cartIdFor(request, reply, customer?.id);
    const { data, error } = await db().rpc('create_order_from_cart', {
      p_cart_id: id,
      p_email: body.email,
      p_address: body.address,
      p_coupon_code: body.couponCode ?? null,
    });
    if (error) throw new Error(error.message);
    const raw = (data ?? {}) as Record<string, unknown>;
    const result = {
      txnId: String(raw.txnId ?? ''),
      amountPaise: Number(raw.amountPaise ?? 0),
      email: String(raw.email ?? body.email),
      firstName: String(raw.firstName ?? body.address.fullName),
      orderNumber: String(raw.orderNumber ?? ''),
      viewToken: String(raw.viewToken ?? ''),
    };
    const fields = payuFields({
      txnId: result.txnId,
      amountPaise: result.amountPaise,
      email: result.email,
      firstName: result.firstName,
      orderNumber: result.orderNumber,
      phone: body.address.phone,
    });
    if (fields) {
      fields.surl = `${callbackBase}/payments/payu/callback`;
      fields.furl = `${callbackBase}/payments/payu/callback`;
    }
    return {
      orderNumber: result.orderNumber,
      viewToken: result.viewToken,
      amount: result.amountPaise / 100,
      payu: fields,
    };
  });

  app.post('/payments/payu/callback', async (request, reply) => {
    const body = request.body as Record<string, string>;
    if (!env.PAYU_KEY || !env.PAYU_SALT || !verifyPayuHash(body, env.PAYU_KEY, env.PAYU_SALT)) {
      return reply.status(400).send({ error: 'invalid_payment_signature' });
    }
    const verified = await verifyWithPayu(body.txnid);
    const paid = body.status === 'success' && verified.ok && verified.amountPaise === amountToPaise(body.amount);
    const { data, error } = await db().rpc('apply_payment_result', {
      p_txn_id: body.txnid,
      p_gateway_txn_id: body.mihpayid ?? '',
      p_status: paid ? 'paid' : 'failed',
      p_amount_paise: amountToPaise(body.amount) ?? 0,
      p_payload: { status: body.status, error: body.error_Message || body.field9 || '' },
    });
    if (error) throw new Error(error.message);
    const raw = (data ?? {}) as Record<string, unknown>;
    const orderNumber = String(raw.orderNumber ?? '');
    const target = new URL('/en/checkout/return', env.APP_ORIGIN);
    target.searchParams.set('order', orderNumber);
    return reply.redirect(target.toString());
  });

  app.get('/orders/lookup', async (request, reply) => {
    const query = z.object({ order: z.string(), token: z.string().min(10) }).parse(request.query);
    const order = await one<{ id: string; order_number: string; status: string; email: string; subtotal_paise: number; discount_paise: number; shipping_paise: number; total_paise: number; created_at: string }>(
      db().from('orders').select('id, order_number, status, email, subtotal_paise, discount_paise, shipping_paise, total_paise, created_at').eq('order_number', query.order).eq('view_token_hash', sha256(query.token)).maybeSingle(),
    );
    if (!order) return reply.status(404).send({ error: 'not_found' });
    const payment = await one<{ status: string }>(db().from('payments').select('status').eq('order_id', order.id).order('created_at', { ascending: false }).limit(1).maybeSingle());
    const items = await rows(db().from('order_items').select('product_name, variant_name, sku, quantity, unit_price_paise, image_url').eq('order_id', order.id));
    return { order: { ...order, payment_status: payment?.status ?? null }, items };
  });

  app.get('/account/orders', async (request) => {
    const customer = await requireCustomer(request);
    const orders = await rows<{ id: string; order_number: string; status: string; total_paise: number; created_at: string }>(
      db().from('orders').select('id, order_number, status, total_paise, created_at').eq('customer_id', customer.id).order('created_at', { ascending: false }),
    );
    const payments = orders.length
      ? await rows<{ order_id: string; status: string; created_at: string }>(db().from('payments').select('order_id, status, created_at').in('order_id', orders.map((order) => order.id)).order('created_at', { ascending: false }))
      : [];
    return orders.map((order) => ({
      ...order,
      payment_status: payments.find((payment) => payment.order_id === order.id)?.status ?? null,
    }));
  });

  app.get('/account/orders/:orderNumber', async (request, reply) => {
    const customer = await requireCustomer(request);
    const params = z.object({ orderNumber: z.string() }).parse(request.params);
    const order = await one<Record<string, unknown> & { id: string }>(
      db().from('orders').select('*').eq('order_number', params.orderNumber).eq('customer_id', customer.id).maybeSingle(),
    );
    if (!order) return reply.status(404).send({ error: 'not_found' });
    const items = await rows(db().from('order_items').select('*').eq('order_id', order.id));
    const address = await one(db().from('order_addresses').select('*').eq('order_id', order.id).maybeSingle());
    const payments = await rows(db().from('payments').select('id, status, amount_paise, gateway, failure_reason, created_at').eq('order_id', order.id).order('created_at'));
    return { order, items, address, payments };
  });

  app.get('/account/payments', async (request) => {
    const customer = await requireCustomer(request);
    const orders = await rows<{ id: string; order_number: string }>(db().from('orders').select('id, order_number').eq('customer_id', customer.id));
    if (!orders.length) return [];
    const payments = await rows<{ id: string; order_id: string; status: string; amount_paise: number; gateway: string; created_at: string }>(
      db().from('payments').select('id, order_id, status, amount_paise, gateway, created_at').in('order_id', orders.map((order) => order.id)).order('created_at', { ascending: false }),
    );
    return payments.map((payment) => ({
      ...payment,
      order_number: orders.find((order) => order.id === payment.order_id)?.order_number ?? '',
    }));
  });

  app.get('/account/wishlist', async (request) => {
    const customer = await requireCustomer(request);
    const saved = await rows<{ variant_id: string; created_at: string; product_variants: { id: string; legacy_variant_id: string | null; name: string; products: { name: string; slug: string } | { name: string; slug: string }[] | null } | { id: string; legacy_variant_id: string | null; name: string; products: { name: string; slug: string } | { name: string; slug: string }[] | null }[] | null }>(
      db().from('wishlists').select('variant_id, created_at, product_variants ( id, legacy_variant_id, name, products ( name, slug ) )').eq('customer_id', customer.id).order('created_at', { ascending: false }),
    );
    return saved.map((row) => {
      const variant = asOne(row.product_variants);
      const product = asOne(variant?.products ?? null);
      return {
        variantId: variant?.legacy_variant_id || variant?.id || row.variant_id,
        databaseVariantId: row.variant_id,
        shade: variant?.name ?? '',
        productName: product?.name ?? '',
        slug: product?.slug ?? '',
        createdAt: row.created_at,
      };
    });
  });

  app.post('/account/wishlist', async (request, reply) => {
    const customer = await requireCustomer(request);
    const body = z.object({ variantId: z.string().min(1) }).parse(request.body);
    const variant = await one<{ id: string }>(
      db().from('product_variants').select('id').or(`id.eq.${body.variantId},legacy_variant_id.eq.${body.variantId}`).limit(1).maybeSingle(),
    );
    if (!variant) return reply.status(404).send({ error: 'not_found' });
    await ok(db().from('wishlists').upsert({ customer_id: customer.id, variant_id: variant.id }, { onConflict: 'customer_id,variant_id', ignoreDuplicates: true }));
    return { ok: true };
  });

  app.delete('/account/wishlist/:variantId', async (request) => {
    const customer = await requireCustomer(request);
    const params = z.object({ variantId: z.string().min(1) }).parse(request.params);
    const variant = await one<{ id: string }>(
      db().from('product_variants').select('id').or(`id.eq.${params.variantId},legacy_variant_id.eq.${params.variantId}`).limit(1).maybeSingle(),
    );
    if (variant) await ok(db().from('wishlists').delete().eq('customer_id', customer.id).eq('variant_id', variant.id));
    return { ok: true };
  });

  app.post('/orders/:orderNumber/retry', async (request, reply) => {
    const params = z.object({ orderNumber: z.string() }).parse(request.params);
    const body = z.object({ token: z.string().min(10) }).parse(request.body);
    const order = await one<{ id: string; email: string }>(
      db().from('orders').select('id, email').eq('order_number', params.orderNumber).eq('view_token_hash', sha256(body.token)).maybeSingle(),
    );
    if (!order) return reply.status(404).send({ error: 'not_found' });
    const { data, error } = await db().rpc('retry_order_payment', { p_order_id: order.id });
    if (error) throw new Error(error.message);
    const raw = (data ?? {}) as Record<string, unknown>;
    const fields = payuFields({
      txnId: String(raw.txnId ?? raw.txnid),
      amountPaise: Number(raw.amountPaise ?? raw.amountpaise),
      email: order.email,
      firstName: 'Customer',
      orderNumber: params.orderNumber,
      phone: '',
    });
    if (fields) {
      fields.surl = `${callbackBase}/payments/payu/callback`;
      fields.furl = `${callbackBase}/payments/payu/callback`;
    }
    return { payu: fields };
  });

  app.post('/reviews', async (request) => {
    const customer = await requireCustomer(request);
    const body = z.object({
      productSlug: z.string(),
      variantId: z.string().optional(),
      rating: z.number().int().min(1).max(5),
      title: z.string().max(120).optional().default(''),
      body: z.string().min(4).max(2000),
    }).parse(request.body);
    const product = await one<{ id: string }>(db().from('products').select('id').eq('slug', body.productSlug).maybeSingle());
    if (!product) throw new Error('not_found');
    const saved = await rows<{ id: string }>(
      db().from('reviews').upsert({
        product_id: product.id,
        customer_id: customer.id,
        rating: body.rating,
        title: body.title,
        body: body.body,
        status: 'pending',
      }, { onConflict: 'product_id,customer_id' }).select('id'),
    );
    await notify({ type: 'review.created', title: 'New review', body: body.productSlug, href: '/admin/reviews' });
    return saved[0];
  });

  app.get('/admin/orders', async (request) => {
    await requireAdmin(request, 'orders.read');
    const query = z.object({
      q: z.string().optional(),
      status: z.string().optional(),
      page: z.coerce.number().optional().default(1),
    }).parse(request.query);
    const size = 20;
    const offset = (query.page - 1) * size;
    let orderQuery = db().from('orders').select('*').order('created_at', { ascending: false }).range(offset, offset + size - 1);
    if (query.status) orderQuery = orderQuery.eq('status', query.status);
    if (query.q) {
      const term = query.q.replace(/[,()]/g, '');
      orderQuery = orderQuery.or(`order_number.ilike.%${term}%,email.ilike.%${term}%`);
    }
    const orders = await rows<Record<string, unknown> & { id: string }>(orderQuery);
    const orderIds = orders.map((order) => order.id);
    const payments = orderIds.length
      ? await rows<{ order_id: string; status: string; created_at: string }>(db().from('payments').select('order_id, status, created_at').in('order_id', orderIds).order('created_at', { ascending: false }))
      : [];
    const addresses = orderIds.length
      ? await rows<{ order_id: string; full_name: string; phone: string; line1: string; city: string; postal_code: string }>(db().from('order_addresses').select('order_id, full_name, phone, line1, city, postal_code').in('order_id', orderIds))
      : [];
    const items = orderIds.length
      ? await rows<{ order_id: string; product_name: string; variant_name: string; quantity: number; line_total_paise: number }>(db().from('order_items').select('order_id, product_name, variant_name, quantity, line_total_paise').in('order_id', orderIds))
      : [];
    return orders.map((order) => ({
      ...order,
      payment_status: payments.find((payment) => payment.order_id === order.id)?.status ?? null,
      customer_name: addresses.find((address) => address.order_id === order.id)?.full_name ?? '',
      address: addresses.find((address) => address.order_id === order.id) ?? null,
      items: items.filter((item) => item.order_id === order.id),
    }));
  });

  app.get('/admin/orders/:id', async (request, reply) => {
    await requireAdmin(request, 'orders.read');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const order = await one<Record<string, unknown> & { id: string }>(db().from('orders').select('*').eq('id', params.id).maybeSingle());
    if (!order) return reply.status(404).send({ error: 'not_found' });
    const items = await rows(db().from('order_items').select('*').eq('order_id', order.id));
    const address = await one(db().from('order_addresses').select('*').eq('order_id', order.id).maybeSingle());
    const payments = await rows(db().from('payments').select('id, status, amount_paise, gateway, gateway_txn_id, failure_reason, created_at').eq('order_id', order.id).order('created_at', { ascending: false }));
    return { order, items, address, payments };
  });

  app.patch('/admin/orders/:id/status', async (request) => {
    const admin = await requireAdmin(request, 'orders.write');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']),
      note: z.string().optional().default(''),
    }).parse(request.body);
    const current = await one<{ status: string; order_number: string }>(db().from('orders').select('status, order_number').eq('id', params.id).maybeSingle());
    if (!current) throw new Error('not_found');
    await ok(db().from('orders').update({ status: body.status }).eq('id', params.id));
    await ok(db().from('order_status_history').insert({
      order_id: params.id,
      from_status: current.status,
      to_status: body.status,
      note: body.note,
      actor: admin.email,
    }));
    if (body.status === 'cancelled' || body.status === 'refunded') {
      await notify({
        type: body.status === 'refunded' ? 'order.refunded' : 'order.cancelled',
        title: `${body.status} ${current.order_number}`,
        href: `/admin/orders/${params.id}`,
      });
    }
    await audit({
      actorType: 'admin',
      actorId: admin.id,
      actorLabel: admin.email,
      action: 'order.status',
      entityType: 'order',
      entityId: params.id,
      summary: `${current.order_number} moved from ${current.status} to ${body.status}`,
      ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/payments', async (request) => {
    await requireAdmin(request, 'payments.read');
    const query = z.object({ days: z.enum(['7', '15', '30']).optional() }).parse(request.query);
    let paymentQuery = db().from('payments').select('id, status, amount_paise, currency, gateway, gateway_txn_id, failure_reason, created_at, order_id').order('created_at', { ascending: false }).limit(500);
    if (query.days) {
      const since = new Date(Date.now() - Number(query.days) * 24 * 60 * 60 * 1000).toISOString();
      paymentQuery = paymentQuery.gte('created_at', since);
    }
    const payments = await rows<{
      id: string;
      status: string;
      amount_paise: number;
      currency: string;
      gateway: string;
      gateway_txn_id: string | null;
      failure_reason: string | null;
      created_at: string;
      order_id: string;
    }>(paymentQuery);
    const orderIds = [...new Set(payments.map((payment) => payment.order_id))];
    const orders = orderIds.length
      ? await rows<{ id: string; order_number: string; email: string }>(db().from('orders').select('id, order_number, email').in('id', orderIds))
      : [];
    return payments.map((payment) => {
      const order = orders.find((item) => item.id === payment.order_id);
      return { ...payment, order_number: order?.order_number ?? null, email: order?.email ?? null };
    });
  });

  app.post('/admin/inventory/adjust', async (request) => {
    const admin = await requireAdmin(request, 'inventory.write');
    const body = z.object({
      variantId: z.string().uuid(),
      stockOnHand: z.number().int().min(0),
      note: z.string().optional().default(''),
    }).parse(request.body);
    const current = await one<{ stock_on_hand: number; stock_reserved: number; low_stock_threshold: number; name: string }>(
      db().from('product_variants').select('stock_on_hand, stock_reserved, low_stock_threshold, name').eq('id', body.variantId).maybeSingle(),
    );
    if (!current) throw new Error('not_found');
    if (body.stockOnHand < current.stock_reserved) throw new Error('unavailable_stock');
    const delta = body.stockOnHand - current.stock_on_hand;
    await ok(db().from('product_variants').update({ stock_on_hand: body.stockOnHand }).eq('id', body.variantId));
    await ok(db().from('inventory_movements').insert({
      variant_id: body.variantId,
      movement_type: delta >= 0 ? 'stock_added' : 'stock_adjusted',
      quantity: delta,
      note: body.note,
      actor: admin.email,
    }));
    const available = body.stockOnHand - current.stock_reserved;
    if (available <= current.low_stock_threshold) {
      await notify({
        type: available <= 0 ? 'inventory.out' : 'inventory.low',
        title: available <= 0 ? 'Out of stock' : 'Low stock',
        body: current.name,
        href: '/admin/inventory',
      });
    }
    await audit({
      actorType: 'admin',
      actorId: admin.id,
      actorLabel: admin.email,
      action: 'inventory.adjusted',
      entityType: 'variant',
      entityId: body.variantId,
      summary: `Stock set to ${body.stockOnHand}`,
      ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/inventory', async (request) => {
    await requireAdmin(request, 'inventory.read');
    const variants = await rows<{
      id: string;
      name: string;
      sku: string | null;
      stock_on_hand: number;
      stock_reserved: number;
      low_stock_threshold: number;
      product_id: string;
    }>(db().from('product_variants').select('id, name, sku, stock_on_hand, stock_reserved, low_stock_threshold, product_id').limit(200));
    const productIds = [...new Set(variants.map((variant) => variant.product_id))];
    const products = productIds.length
      ? await rows<{ id: string; name: string; slug: string }>(db().from('products').select('id, name, slug').in('id', productIds))
      : [];
    return variants
      .map((variant) => {
        const product = products.find((item) => item.id === variant.product_id);
        return {
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          stock_on_hand: variant.stock_on_hand,
          stock_reserved: variant.stock_reserved,
          low_stock_threshold: variant.low_stock_threshold,
          product_name: product?.name ?? '',
          slug: product?.slug ?? '',
        };
      })
      .sort((a, b) => (a.stock_on_hand - a.stock_reserved) - (b.stock_on_hand - b.stock_reserved) || a.product_name.localeCompare(b.product_name));
  });

  app.get('/admin/coupons', async (request) => {
    await requireAdmin(request, 'coupons.write');
    return rows(db().from('coupons').select('*').order('created_at', { ascending: false }));
  });

  app.post('/admin/coupons', async (request) => {
    const admin = await requireAdmin(request, 'coupons.write');
    const body = z.object({
      code: z.string().min(2).max(40),
      discountType: z.enum(['percent', 'fixed']),
      discountValue: z.number().positive(),
      productIds: z.array(z.string().uuid()).min(1),
      minOrderPaise: z.number().int().min(0).default(0),
      maxDiscountPaise: z.number().int().positive().nullable().optional(),
      startsAt: z.string().nullable().optional(),
      endsAt: z.string().nullable().optional(),
      usageLimit: z.number().int().positive().nullable().optional(),
      perCustomerLimit: z.number().int().positive().nullable().optional(),
      active: z.boolean().default(true),
    }).parse(request.body);
    const discountValue = body.discountType === 'percent'
      ? Math.round(body.discountValue)
      : Math.round(body.discountValue * 100);
    const created = await rows<{ id: string }>(
      db().from('coupons').insert({
        code: body.code.toUpperCase(),
        discount_type: body.discountType,
        discount_value: discountValue,
        min_order_paise: body.minOrderPaise,
        max_discount_paise: body.maxDiscountPaise ?? null,
        starts_at: body.startsAt ?? null,
        ends_at: body.endsAt ?? null,
        usage_limit: body.usageLimit ?? null,
        per_customer_limit: body.perCustomerLimit ?? null,
        active: body.active,
        applicable_product_ids: body.productIds,
      }).select('*'),
    );
    await audit({
      actorType: 'admin',
      actorId: admin.id,
      actorLabel: admin.email,
      action: 'coupon.changed',
      entityType: 'coupon',
      entityId: created[0]?.id,
      summary: `Coupon ${body.code} saved`,
      ip: clientIp(request),
    });
    return created[0];
  });
}

async function verifyWithPayu(txnid: string) {
  if (!env.PAYU_KEY || !env.PAYU_SALT || !txnid) return { ok: false, amountPaise: null as number | null };
  const form = new URLSearchParams({
    key: env.PAYU_KEY,
    command: 'verify_payment',
    var1: txnid,
    hash: payuVerifyCommandHash(env.PAYU_KEY, txnid, env.PAYU_SALT),
  });
  const response = await fetch(payuVerifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!response.ok) return { ok: false, amountPaise: null };
  const payload = (await response.json()) as {
    status?: number;
    transaction_details?: Record<string, { status?: string; amt?: string }>;
  };
  const detail = payload.transaction_details?.[txnid];
  return {
    ok: detail?.status === 'success',
    amountPaise: detail?.amt ? amountToPaise(detail.amt) : null,
  };
}
