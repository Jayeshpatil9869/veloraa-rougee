import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  PAGE_STRATEGIES,
  articleSchema,
  breadcrumbSchema,
  collectionSchema,
  localBusinessSchema,
  organizationSchema,
  productSchema,
  validateSeoRecords,
  websiteSchema,
} from '../../shared/seo';
import { env } from './env';
import { asOne, db, ok, one, rows } from './db';
import { audit, clientIp, readAdmin, requireAdmin, subscribeNotifications } from './http';
import { loadProducts } from './catalog';

const origin = env.APP_ORIGIN.replace(/\/$/, '');

export async function registerSeo(app: FastifyInstance) {
  app.get('/seo/resolve', async (request) => {
    const query = z.object({ path: z.string().default('/en') }).parse(request.query);
    return resolvePath(query.path);
  });

  app.get('/sitemap.xml', async (_request, reply) => {
    const paths = new Set<string>(['/en', '/en/shop-all', '/en/about-us', '/en/locations', '/en/contact-us', '/en/stories']);
    const categories = await rows<{ slug: string }>(db().from('categories').select('slug').eq('active', true));
    for (const category of categories) paths.add(`/en/collection/${category.slug}`);
    paths.add('/en/collection/best-sellers');
    const products = await rows<{ slug: string }>(db().from('products').select('slug').eq('status', 'published'));
    for (const product of products) paths.add(`/en/product/${product.slug}`);
    const stories = await rows<{ slug: string }>(db().from('stories').select('slug').eq('status', 'published'));
    for (const story of stories) paths.add(`/en/stories/${story.slug}`);
    const legal = await rows<{ slug: string }>(db().from('legal_pages').select('slug'));
    for (const page of legal) paths.add(`/en/legal/${page.slug}`);
    const metadata = await rows<{ path: string; include_in_sitemap: boolean; robots_index: boolean }>(db().from('seo_metadata').select('path, include_in_sitemap, robots_index'));
    for (const row of metadata) {
      if (!row.include_in_sitemap || !row.robots_index) paths.delete(row.path);
    }
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...paths].map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`;
    return reply.type('application/xml').send(body);
  });

  app.get('/robots.txt', async (_request, reply) => {
    const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /en/account
Disallow: /en/checkout
Disallow: /en/login
Disallow: /en/signup
Disallow: /login
Disallow: /signup

Sitemap: ${origin}/sitemap.xml
`;
    return reply.type('text/plain').send(body);
  });

  app.get('/admin/seo', async (request) => {
    await requireAdmin(request, 'seo.write');
    const strategies = await rows(db().from('seo_strategies').select('*').order('page_key'));
    const metadata = await rows(db().from('seo_metadata').select('*').order('path'));
    const redirects = await rows(db().from('redirects').select('*').order('from_path'));
    return { strategies, metadata, redirects };
  });

  app.put('/admin/seo/metadata', async (request) => {
    const admin = await requireAdmin(request, 'seo.write');
    const body = z.object({
      path: z.string().min(1),
      entityType: z.string().default('page'),
      entityId: z.string().optional(),
      seoTitle: z.string().default(''),
      metaDescription: z.string().default(''),
      primaryTopic: z.string().default(''),
      relatedTerms: z.array(z.string()).default([]),
      canonicalUrl: z.string().optional(),
      robotsIndex: z.boolean().default(true),
      robotsFollow: z.boolean().default(true),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      schemaType: z.string().default('WebPage'),
      includeInSitemap: z.boolean().default(true),
    }).parse(request.body);
    await ok(db().from('seo_metadata').upsert({
      path: body.path,
      entity_type: body.entityType,
      entity_id: body.entityId ?? null,
      seo_title: body.seoTitle,
      meta_description: body.metaDescription,
      primary_topic: body.primaryTopic,
      related_terms: body.relatedTerms,
      canonical_url: body.canonicalUrl ?? null,
      robots_index: body.robotsIndex,
      robots_follow: body.robotsFollow,
      og_title: body.ogTitle ?? null,
      og_description: body.ogDescription ?? null,
      og_image: body.ogImage ?? null,
      schema_type: body.schemaType,
      include_in_sitemap: body.includeInSitemap,
    }, { onConflict: 'path' }));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'seo.updated',
      entityType: 'seo_metadata', entityId: body.path, summary: `SEO updated for ${body.path}`, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.post('/admin/seo/redirects', async (request) => {
    await requireAdmin(request, 'seo.write');
    const body = z.object({
      fromPath: z.string().min(1),
      toPath: z.string().min(1),
      statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
    }).parse(request.body);
    const created = await rows(db().from('redirects').upsert({
      from_path: body.fromPath,
      to_path: body.toPath,
      status_code: body.statusCode,
    }, { onConflict: 'from_path' }).select('*'));
    return created[0];
  });

  app.get('/admin/seo/issues', async (request) => {
    await requireAdmin(request, 'seo.write');
    const metadata = await rows<{ path: string; seo_title: string; meta_description: string; canonical_url: string | null; robots_index: boolean }>(
      db().from('seo_metadata').select('path, seo_title, meta_description, canonical_url, robots_index'),
    );
    const products = await loadProducts({ status: 'published', limit: 300 });
    const pages = [
      ...metadata.map((row) => ({
        path: row.path,
        title: row.seo_title,
        description: row.meta_description,
        h1: row.seo_title,
        canonical: row.canonical_url || `${origin}${row.path}`,
        indexable: row.robots_index,
      })),
      ...products.map((product) => ({
        path: `/en/product/${product.slug}`,
        title: product.name,
        description: product.shortDescription || product.description,
        h1: product.name,
        canonical: `${origin}/en/product/${product.slug}`,
        indexable: true,
        hasImage: product.images.length > 0,
        imageAlt: product.images[0]?.alt,
        price: product.variants[0] ? String(product.variants[0].price) : null,
        availability: product.variants.some((variant) => variant.stock > 0) ? 'InStock' : 'OutOfStock',
        schemaTypes: ['Product'],
        expectedSchema: 'Product',
      })),
    ];
    return { issues: validateSeoRecords(pages) };
  });
}

async function resolvePath(path: string) {
  const canonicalPath = path.startsWith('/en/product/')
    ? `/en/product/${path.split('/')[3]}`
    : path;
  const saved = await one<{
    seo_title: string;
    meta_description: string;
    primary_topic: string;
    robots_index: boolean;
    robots_follow: boolean;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    canonical_url: string | null;
    schema_type: string;
  }>(db().from('seo_metadata').select('*').eq('path', canonicalPath).maybeSingle());
  const strategy = PAGE_STRATEGIES.find((item) => item.pathPattern === canonicalPath);
  const brand = await one<{ brand_name: string; support_email: string; gst: string | null }>(
    db().from('site_settings').select('brand_name, support_email, gst').eq('id', 1).maybeSingle(),
  );
  const title = saved?.seo_title || strategy?.primaryTopic || brand?.brand_name || 'Veloraa Rougee';
  const description = saved?.meta_description || strategy?.searchIntent || 'Veloraa Rougee cosmetics.';
  const index = saved?.robots_index ?? strategy?.robotsIndex ?? !canonicalPath.startsWith('/admin');
  const schemas: Record<string, unknown>[] = [];
  if (canonicalPath === '/en') {
    schemas.push(organizationSchema({ origin, name: brand?.brand_name || 'VELORAA ROUGEE', email: brand?.support_email || '', taxId: brand?.gst || undefined, logo: `${origin}/brand/monogram-square.png` }));
    schemas.push(websiteSchema({ origin, name: brand?.brand_name || 'VELORAA ROUGEE' }));
  }
  if (canonicalPath.startsWith('/en/product/')) {
    const slug = canonicalPath.split('/')[3] || '';
    const products = await loadProducts({ slug, status: 'published', limit: 1 });
    const product = products[0];
    if (product) {
      const reviewRows = await rows<{ body: string; rating: number; created_at: string; customers: { full_name: string } | { full_name: string }[] | null }>(
        db().from('reviews').select('body, rating, created_at, customers ( full_name ), products!inner ( slug )').eq('status', 'approved').eq('products.slug', slug),
      );
      const reviews = reviewRows.map((review) => ({
        full_name: asOne(review.customers)?.full_name ?? '',
        body: review.body,
        rating: review.rating,
        created_at: review.created_at,
      }));
      schemas.push(productSchema({
        origin,
        name: product.name,
        description: product.description || product.shortDescription,
        slug: product.slug,
        image: product.images.map((image) => image.src),
        sku: product.variants[0]?.sku,
        brand: product.brand || 'Veloraa Rougee',
        price: String(product.variants[0]?.price ?? 0),
        currency: 'INR',
        availability: product.variants.some((variant) => variant.stock > 0) ? 'InStock' : 'OutOfStock',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        reviews: reviews.map((review) => ({
          author: review.full_name || 'Customer',
          body: review.body,
          rating: review.rating,
          date: review.created_at,
        })),
      }));
      schemas.push(breadcrumbSchema(origin, [
        { name: 'Home', path: '/en' },
        { name: product.categoryName || 'Shop', path: `/en/collection/${product.categoryId}` },
        { name: product.name, path: canonicalPath },
      ]));
    }
  }
  if (canonicalPath.startsWith('/en/collection') || canonicalPath === '/en/shop-all') {
    schemas.push(collectionSchema({
      origin,
      name: title,
      description,
      path: canonicalPath,
      items: [],
    }));
    schemas.push(breadcrumbSchema(origin, [
      { name: 'Home', path: '/en' },
      { name: title, path: canonicalPath },
    ]));
  }
  if (canonicalPath.startsWith('/en/stories/')) {
    const slug = canonicalPath.replace('/en/stories/', '');
    const story = await one<{ title: string; excerpt: string; cover_image: string | null; published_at: string | null }>(
      db().from('stories').select('title, excerpt, cover_image, published_at').eq('slug', slug).eq('status', 'published').maybeSingle(),
    );
    if (story) {
      schemas.push(articleSchema({
        origin,
        title: story.title,
        description: story.excerpt,
        path: canonicalPath,
        image: story.cover_image || undefined,
        datePublished: story.published_at || undefined,
        author: 'Veloraa Rougee',
      }));
    }
  }
  if (canonicalPath === '/en/locations') {
    const locations = await rows<{ name: string; address: string; city: string; region: string; country: string; phone: string | null; map_url: string | null }>(
      db().from('locations').select('name, address, city, region, country, phone, map_url').eq('active', true),
    );
    for (const location of locations) schemas.push(localBusinessSchema(location));
    schemas.push(breadcrumbSchema(origin, [{ name: 'Home', path: '/en' }, { name: 'Locations', path: canonicalPath }]));
  }
  return {
    title,
    description,
    canonical: saved?.canonical_url || `${origin}${canonicalPath}`,
    robots: `${index ? 'index' : 'noindex'}, ${saved?.robots_follow === false ? 'nofollow' : 'follow'}`,
    ogTitle: saved?.og_title || title,
    ogDescription: saved?.og_description || description,
    ogImage: saved?.og_image || `${origin}/brand/monogram-square.png`,
    primaryTopic: saved?.primary_topic || strategy?.primaryTopic || '',
    schema: schemas,
  };
}

export async function registerOps(app: FastifyInstance) {
  app.get('/admin/notifications', async (request) => {
    await requireAdmin(request, 'notifications.read');
    return rows(db().from('notifications').select('*').order('created_at', { ascending: false }).limit(50));
  });

  app.post('/admin/notifications/read', async (request) => {
    await requireAdmin(request, 'notifications.read');
    const body = z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() }).parse(request.body ?? {});
    if (body.all) await ok(db().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null));
    else if (body.id) await ok(db().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', body.id));
    return { ok: true };
  });

  app.get('/admin/notifications/stream', async (request, reply) => {
    const admin = await readAdmin(request);
    if (!admin) return reply.status(401).send({ error: 'unauthorized' });
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const send = (payload: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
    const unsubscribe = subscribeNotifications(send);
    const timer = setInterval(() => reply.raw.write(': ping\n\n'), 25000);
    request.raw.on('close', () => {
      clearInterval(timer);
      unsubscribe();
    });
  });

  app.get('/admin/activity', async (request) => {
    await requireAdmin(request, 'audit.read');
    return rows(db().from('activity_logs').select('id, actor_type, actor_label, action, entity_type, entity_id, summary, created_at').order('created_at', { ascending: false }).limit(200));
  });

  app.get('/admin/analytics', async (request) => {
    await requireAdmin(request, 'analytics.read');
    const paidStatuses = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
    const salesOrders = await rows<{ total_paise: number; status: string }>(db().from('orders').select('total_paise, status').in('status', paidStatuses));
    const revenue = salesOrders.reduce((sum, order) => sum + Number(order.total_paise), 0);
    const paidOrderCount = salesOrders.length;
    const { count: customerCount } = await db().from('customers').select('id', { count: 'exact', head: true });
    const { count: allOrderCount } = await db().from('orders').select('id', { count: 'exact', head: true });
    const paidPaymentRows = await rows<{ amount_paise: number }>(db().from('payments').select('amount_paise').eq('status', 'paid'));
    const paymentTotalPaise = paidPaymentRows.reduce((sum, payment) => sum + Number(payment.amount_paise), 0);
    const { count: productCount } = await db().from('products').select('id', { count: 'exact', head: true }).eq('status', 'published');
    const variants = await rows<{ stock_on_hand: number; stock_reserved: number; low_stock_threshold: number }>(db().from('product_variants').select('stock_on_hand, stock_reserved, low_stock_threshold'));
    const lowStock = variants.filter((variant) => variant.stock_on_hand - variant.stock_reserved <= variant.low_stock_threshold).length;
    const outOfStock = variants.filter((variant) => variant.stock_on_hand - variant.stock_reserved <= 0).length;
    const { count: pendingPayments } = await db().from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: paidPayments } = await db().from('payments').select('id', { count: 'exact', head: true }).eq('status', 'paid');
    const recent = await rows<{ id: string; order_number: string; email: string; status: string; total_paise: number; created_at: string }>(
      db().from('orders').select('id, order_number, email, status, total_paise, created_at').order('created_at', { ascending: false }).limit(5),
    );
    const recentIds = recent.map((order) => order.id);
    const recentItems = recentIds.length
      ? await rows<{ order_id: string; product_name: string; quantity: number }>(db().from('order_items').select('order_id, product_name, quantity').in('order_id', recentIds))
      : [];
    const recentAddresses = recentIds.length
      ? await rows<{ order_id: string; full_name: string }>(db().from('order_addresses').select('order_id, full_name').in('order_id', recentIds))
      : [];
    const recentPayments = recentIds.length
      ? await rows<{ order_id: string; status: string }>(db().from('payments').select('order_id, status').in('order_id', recentIds).order('created_at', { ascending: false }))
      : [];
    const recentOrders = recent.map((order) => ({
      ...order,
      customer_name: recentAddresses.find((address) => address.order_id === order.id)?.full_name ?? '',
      payment_status: recentPayments.find((payment) => payment.order_id === order.id)?.status ?? null,
      items: recentItems.filter((item) => item.order_id === order.id),
    }));
    const sold = await rows<{ quantity: number; products: { name: string } | { name: string }[] | null; orders: { status: string } | { status: string }[] | null }>(
      db().from('order_items').select('quantity, products ( name ), orders!inner ( status )').in('orders.status', paidStatuses),
    );
    const totals = new Map<string, number>();
    for (const item of sold) {
      const name = asOne(item.products)?.name;
      if (!name) continue;
      totals.set(name, (totals.get(name) ?? 0) + Number(item.quantity));
    }
    const bestSellers = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, quantity]) => ({ name, quantity }));
    return {
      revenuePaise: revenue,
      orders: paidOrderCount,
      averageOrderPaise: paidOrderCount > 0 ? Math.round(revenue / paidOrderCount) : 0,
      customers: customerCount ?? 0,
      orderCount: allOrderCount ?? 0,
      paymentTotalPaise,
      products: productCount ?? 0,
      lowStock,
      outOfStock,
      pendingPayments: pendingPayments ?? 0,
      paidPayments: paidPayments ?? 0,
      recentOrders,
      bestSellers,
    };
  });

  app.post('/admin/media', async (request, reply) => {
    await requireAdmin(request, 'media.write');
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'file_required' });
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowed.has(file.mimetype)) return reply.status(400).send({ error: 'unsupported_file' });
    const chunks: Buffer[] = [];
    for await (const chunk of file.file) chunks.push(chunk as Buffer);
    const buffer = Buffer.concat(chunks);
    if (buffer.length > 8 * 1024 * 1024) return reply.status(400).send({ error: 'file_too_large' });
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return reply.status(503).send({ error: 'storage_unconfigured' });
    const safeName = file.filename.toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(0, 80);
    const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${safeName}`;
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/media/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': file.mimetype,
        'x-upsert': 'false',
      },
      body: buffer,
    });
    if (!response.ok) return reply.status(502).send({ error: 'upload_failed' });
    const url = `${env.SUPABASE_URL}/storage/v1/object/public/media/${path}`;
    const alt = String((request.query as { alt?: string }).alt || safeName.replace(/\.[a-z0-9]+$/, '').replace(/-/g, ' '));
    const created = await rows(db().from('media').insert({
      path,
      url,
      alt,
      mime_type: file.mimetype,
      bytes: buffer.length,
    }).select('*'));
    return created[0];
  });

  app.get('/admin/media', async (request) => {
    await requireAdmin(request, 'media.write');
    const query = z.object({ q: z.string().optional() }).parse(request.query);
    let requestQuery = db().from('media').select('*').order('created_at', { ascending: false }).limit(100);
    if (query.q) {
      const term = query.q.replace(/[,()]/g, '');
      requestQuery = requestQuery.or(`alt.ilike.%${term}%,path.ilike.%${term}%`);
    }
    return rows(requestQuery);
  });

  app.delete('/admin/media/:id', async (request, reply) => {
    await requireAdmin(request, 'media.write');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const images = await db().from('product_images').select('id', { count: 'exact', head: true }).eq('media_id', params.id);
    const variantImages = await db().from('product_variant_images').select('id', { count: 'exact', head: true }).eq('media_id', params.id);
    if ((images.count ?? 0) + (variantImages.count ?? 0) > 0) return reply.status(409).send({ error: 'media_in_use' });
    await ok(db().from('media').delete().eq('id', params.id));
    return { ok: true };
  });
}

export function notFound(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send({ error: 'not_found' });
}
