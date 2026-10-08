import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { asOne, db, ok, one, rows } from './db';
import { audit, clientIp, notify, requireAdmin } from './http';
import { loadCategories, loadProducts } from './catalog';

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  legacyVariantId: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  hexColor: z.string().optional(),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  barcode: z.string().optional(),
  weightGrams: z.number().int().optional(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().min(1) })).default([]),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().default(''),
  description: z.string().default(''),
  categorySlug: z.string().min(1),
  brand: z.string().default('Veloraa Rougee'),
  productType: z.string().default(''),
  story: z.string().default(''),
  howToUse: z.string().default(''),
  ingredients: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  optionName: z.string().default('Shade'),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().min(1) })).default([]),
  variants: z.array(variantSchema).min(1),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export async function registerCatalogAdmin(app: FastifyInstance) {
  app.get('/products', async (request) => {
    const query = z.object({
      category: z.string().optional(),
      q: z.string().optional(),
    }).parse(request.query);
    const products = await loadProducts({
      status: 'published',
      category: query.category === 'all' || query.category === 'best-sellers' ? null : query.category,
      q: query.q,
      limit: 200,
    });
    if (query.category === 'best-sellers') return products.filter((product) => product.bestseller);
    return products;
  });

  app.get('/products/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string() }).parse(request.params);
    const query = z.object({ preview: z.string().optional() }).parse(request.query);
    let status: string | null = 'published';
    if (query.preview === '1') {
      try {
        await requireAdmin(request, 'products.read');
        status = null;
      } catch {
        status = 'published';
      }
    }
    const products = await loadProducts({ slug: params.slug, status, limit: 1 });
    if (!products[0]) return reply.status(404).send({ error: 'not_found' });
    return products[0];
  });

  app.get('/categories', async () => {
    const categories = await loadCategories();
    return categories.filter((category) => category.active);
  });

  app.get('/admin/products', async (request) => {
    await requireAdmin(request, 'products.read');
    const query = z.object({
      q: z.string().optional(),
      status: z.string().optional(),
      page: z.coerce.number().optional().default(1),
    }).parse(request.query);
    const pageSize = 20;
    const products = await loadProducts({
      status: query.status || null,
      q: query.q,
      limit: pageSize,
      offset: (query.page - 1) * pageSize,
    });
    return { items: products, page: query.page, pageSize };
  });

  app.post('/admin/products', async (request) => {
    const admin = await requireAdmin(request, 'products.write');
    const body = productSchema.parse(request.body);
    const category = await categoryId(body.categorySlug);
    if (!category) throw new Error('not_found');
    const created = await rows<{ id: string }>(db().from('products').insert({
      category_id: category,
      name: body.name,
      slug: slugify(body.slug),
      short_description: body.shortDescription,
      description: body.description,
      brand: body.brand,
      product_type: body.productType,
      story: body.story,
      how_to_use: body.howToUse,
      ingredients: body.ingredients,
      benefits: body.benefits,
      option_name: body.optionName,
      featured: body.featured,
      bestseller: body.bestseller,
      new_arrival: body.newArrival,
      status: body.status,
    }).select('id'));
    const productId = created[0].id;
    await saveImagesAndVariants(productId, body);
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'product.created',
      entityType: 'product', entityId: productId, summary: `Created ${body.name}`, ip: clientIp(request),
    });
    return { id: productId };
  });

  app.put('/admin/products/:id', async (request) => {
    const admin = await requireAdmin(request, 'products.write');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = productSchema.parse(request.body);
    const category = await categoryId(body.categorySlug);
    if (!category) throw new Error('not_found');
    await ok(db().from('products').update({
      category_id: category,
      name: body.name,
      slug: slugify(body.slug),
      short_description: body.shortDescription,
      description: body.description,
      brand: body.brand,
      product_type: body.productType,
      story: body.story,
      how_to_use: body.howToUse,
      ingredients: body.ingredients,
      benefits: body.benefits,
      option_name: body.optionName,
      featured: body.featured,
      bestseller: body.bestseller,
      new_arrival: body.newArrival,
      status: body.status,
    }).eq('id', params.id));
    await ok(db().from('product_tags').delete().eq('product_id', params.id));
    await ok(db().from('product_images').delete().eq('product_id', params.id));
    await saveImagesAndVariants(params.id, body);
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'product.updated',
      entityType: 'product', entityId: params.id, summary: `Updated ${body.name}`, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.post('/admin/products/:id/status', async (request) => {
    const admin = await requireAdmin(request, 'products.publish');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ status: z.enum(['draft', 'published', 'archived']) }).parse(request.body);
    await ok(db().from('products').update({ status: body.status }).eq('id', params.id));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email,
      action: body.status === 'published' ? 'product.published' : 'product.unpublished',
      entityType: 'product', entityId: params.id, summary: `Status set to ${body.status}`, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.post('/admin/products/:id/duplicate', async (request) => {
    const admin = await requireAdmin(request, 'products.write');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const products = await loadProducts({ status: null, limit: 500 });
    const source = products.find((product) => product.databaseId === params.id);
    if (!source) throw new Error('not_found');
    const copy = {
      ...source,
      name: `${source.name} copy`,
      slug: `${source.slug}-copy`,
      status: 'draft' as const,
      categorySlug: source.categoryId,
      brand: source.brand,
      productType: source.productType,
      images: source.images.map((image) => ({ url: image.src, alt: image.alt })),
      variants: source.variants.map((variant) => ({
        name: variant.name,
        sku: variant.sku ? `${variant.sku}-COPY` : undefined,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stock: variant.stock,
        hexColor: variant.hexColor,
        active: true,
        isDefault: variant.id === source.defaultVariantId,
        sortOrder: 0,
        images: variant.images.map((image) => ({ url: image.src, alt: image.alt })),
      })),
    };
    const category = await categoryId(copy.categorySlug);
    const created = await rows<{ id: string }>(db().from('products').insert({
      category_id: category,
      name: copy.name,
      slug: slugify(copy.slug),
      short_description: copy.shortDescription,
      description: copy.description,
      story: copy.story,
      how_to_use: copy.howToUse,
      ingredients: copy.ingredients,
      benefits: copy.benefits,
      option_name: copy.optionName,
      status: 'draft',
    }).select('id'));
    await saveImagesAndVariants(created[0].id, productSchema.parse({ ...copy, categorySlug: copy.categorySlug }));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'product.created',
      entityType: 'product', entityId: created[0].id, summary: `Duplicated ${source.name}`, ip: clientIp(request),
    });
    return { id: created[0].id };
  });

  app.delete('/admin/products/:id', async (request, reply) => {
    const admin = await requireAdmin(request, 'products.write');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const { count } = await db().from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', params.id);
    if ((count ?? 0) > 0) return reply.status(409).send({ error: 'product_has_orders' });
    await ok(db().from('products').delete().eq('id', params.id));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'product.deleted',
      entityType: 'product', entityId: params.id, summary: 'Deleted product with no orders', ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/categories', async (request) => {
    await requireAdmin(request, 'products.read');
    return loadCategories();
  });

  app.post('/admin/categories', async (request) => {
    const admin = await requireAdmin(request, 'categories.write');
    const body = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().default(''),
      image: z.string().optional(),
      active: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    }).parse(request.body);
    const created = await rows<{ id: string }>(db().from('categories').insert({
      name: body.name,
      slug: slugify(body.slug),
      description: body.description,
      image_url: body.image ?? null,
      active: body.active,
      sort_order: body.sortOrder,
    }).select('*'));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'category.updated',
      entityType: 'category', entityId: created[0]?.id, summary: `Category ${body.name}`, ip: clientIp(request),
    });
    return created[0];
  });
}

async function categoryId(slug: string) {
  const match = await one<{ id: string }>(
    db().from('categories').select('id').or(`slug.eq.${slug},legacy_id.eq.${slug}`).limit(1).maybeSingle(),
  );
  return match?.id ?? null;
}

async function saveImagesAndVariants(productId: string, body: z.infer<typeof productSchema>) {
  if (body.images.length) {
    await ok(db().from('product_images').insert(body.images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      alt: image.alt,
      sort_order: index,
    }))));
  }
  await ok(db().from('product_tags').delete().eq('product_id', productId));
  if (body.tags.length) {
    await ok(db().from('product_tags').upsert(
      body.tags.map((tag) => ({ product_id: productId, tag })),
      { onConflict: 'product_id,tag', ignoreDuplicates: true },
    ));
  }
  const existing = await rows<{ id: string }>(db().from('product_variants').select('id').eq('product_id', productId));
  const keep = new Set(body.variants.map((variant) => variant.id).filter(Boolean));
  for (const row of existing) {
    if (keep.has(row.id)) continue;
    const { count } = await db().from('order_items').select('id', { count: 'exact', head: true }).eq('variant_id', row.id);
    if ((count ?? 0) === 0) await ok(db().from('product_variants').delete().eq('id', row.id));
    else await ok(db().from('product_variants').update({ active: false }).eq('id', row.id));
  }
  for (const variant of body.variants) {
    const pricePaise = Math.round(variant.price * 100);
    const compare = variant.compareAtPrice != null ? Math.round(variant.compareAtPrice * 100) : null;
    let variantId = variant.id;
    const fields = {
      name: variant.name,
      sku: variant.sku ?? null,
      price_paise: pricePaise,
      compare_at_paise: compare,
      stock_on_hand: variant.stock,
      low_stock_threshold: variant.lowStockThreshold,
      hex_color: variant.hexColor ?? null,
      active: variant.active,
      is_default: variant.isDefault,
      sort_order: variant.sortOrder,
      barcode: variant.barcode ?? null,
      weight_grams: variant.weightGrams ?? null,
    };
    if (variantId) {
      const current = await one<{ stock_on_hand: number }>(db().from('product_variants').select('stock_on_hand').eq('id', variantId).maybeSingle());
      await ok(db().from('product_variants').update(fields).eq('id', variantId));
      if (current && current.stock_on_hand !== variant.stock) {
        await ok(db().from('inventory_movements').insert({
          variant_id: variantId,
          movement_type: 'stock_adjusted',
          quantity: variant.stock - current.stock_on_hand,
          note: 'Variant editor',
          actor: 'admin',
        }));
      }
      await ok(db().from('product_variant_images').delete().eq('variant_id', variantId));
    } else {
      const inserted = await rows<{ id: string }>(db().from('product_variants').insert({
        product_id: productId,
        legacy_variant_id: variant.legacyVariantId ?? null,
        ...fields,
      }).select('id'));
      variantId = inserted[0].id;
      await ok(db().from('inventory_movements').insert({
        variant_id: variantId,
        movement_type: 'stock_added',
        quantity: variant.stock,
        note: 'Opening stock',
        actor: 'admin',
      }));
    }
    if (variant.images.length) {
      await ok(db().from('product_variant_images').insert(variant.images.map((image, index) => ({
        variant_id: variantId,
        url: image.url,
        alt: image.alt,
        sort_order: index,
      }))));
    }
  }
}

export async function registerContent(app: FastifyInstance) {
  app.get('/stories', async () => {
    const stories = await rows<{ id: string; slug: string; title: string; excerpt: string; content: string; cover_image: string | null; author: string; category: string; tags: string[]; kicker: string; chips: string[]; published_at: string | null }>(
      db().from('stories').select('id, slug, title, excerpt, content, cover_image, author, category, tags, kicker, chips, published_at').eq('status', 'published').order('published_at', { ascending: false, nullsFirst: false }),
    );
    const links = stories.length
      ? await rows<{ story_id: string; products: { slug: string } | { slug: string }[] | null }>(
        db().from('story_products').select('story_id, products ( slug )').in('story_id', stories.map((story) => story.id)),
      )
      : [];
    return stories.map(({ id, ...story }) => ({
      ...story,
      product_slugs: links.filter((link) => link.story_id === id).map((link) => asOne(link.products)?.slug).filter(Boolean),
    }));
  });

  app.get('/stories/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string() }).parse(request.params);
    const story = await one<Record<string, unknown> & { id: string }>(db().from('stories').select('*').eq('slug', params.slug).eq('status', 'published').maybeSingle());
    if (!story) return reply.status(404).send({ error: 'not_found' });
    const products = await rows<{ products: { slug: string } | { slug: string }[] | null }>(
      db().from('story_products').select('products ( slug )').eq('story_id', story.id),
    );
    return { ...story, productSlugs: products.map((row) => asOne(row.products)?.slug).filter(Boolean) };
  });

  app.get('/homepage', async () => {
    const sections = await rows(db().from('homepage_sections').select('*').order('sort_order'));
    const settings = await one(db().from('site_settings').select('*').eq('id', 1).maybeSingle());
    return { sections, settings };
  });

  app.get('/locations', async () => rows(db().from('locations').select('*').eq('active', true).order('city')));

  app.get('/legal/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string() }).parse(request.params);
    const page = await one(db().from('legal_pages').select('*').eq('slug', params.slug).maybeSingle());
    if (!page) return reply.status(404).send({ error: 'not_found' });
    return page;
  });

  app.post('/contact', { config: { rateLimit: { max: 6, timeWindow: '1 minute' } } }, async (request) => {
    const body = z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional().default(''),
      email: z.string().email(),
      phone: z.string().optional().default(''),
      message: z.string().min(4).max(4000),
    }).parse(request.body);
    const created = await rows<{ id: string }>(db().from('contact_enquiries').insert({
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
      message: body.message,
    }).select('id'));
    await notify({ type: 'enquiry.created', title: 'New enquiry', body: body.email, href: '/admin/enquiries' });
    return { id: created[0]?.id };
  });

  app.post('/newsletter', { config: { rateLimit: { max: 6, timeWindow: '1 minute' } } }, async (request) => {
    const body = z.object({ email: z.string().email(), source: z.string().default('footer') }).parse(request.body);
    await ok(db().from('newsletter_subscribers').upsert({
      email: body.email.toLowerCase(),
      source: body.source,
      status: 'subscribed',
      consented_at: new Date().toISOString(),
      unsubscribed_at: null,
    }, { onConflict: 'email' }));
    await notify({ type: 'newsletter.subscribed', title: 'Newsletter signup', body: body.email, href: '/admin/newsletter' });
    return { ok: true };
  });

  app.post('/newsletter/unsubscribe', async (request) => {
    const body = z.object({ email: z.string().email() }).parse(request.body);
    await ok(db().from('newsletter_subscribers').update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    }).eq('email', body.email.toLowerCase()));
    return { ok: true };
  });

  app.get('/admin/customers', async (request) => {
    await requireAdmin(request, 'customers.read');
    const query = z.object({ q: z.string().optional() }).parse(request.query);
    let requestQuery = db().from('customers').select('id, email, full_name, phone, email_verified, created_at, auth_user_id').order('created_at', { ascending: false }).limit(100);
    if (query.q) {
      const term = query.q.replace(/[,()]/g, '');
      requestQuery = requestQuery.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
    }
    return rows(requestQuery);
  });

  app.get('/admin/customers/:id', async (request) => {
    await requireAdmin(request, 'customers.read');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const customer = await one(db().from('customers').select('id, email, full_name, phone, email_verified, created_at').eq('id', params.id).maybeSingle());
    const addresses = await rows(db().from('addresses').select('*').eq('customer_id', params.id));
    const orders = await rows(db().from('orders').select('id, order_number, status, total_paise, created_at').eq('customer_id', params.id).order('created_at', { ascending: false }));
    return { customer, addresses, orders };
  });

  app.get('/admin/reviews', async (request) => {
    await requireAdmin(request, 'reviews.moderate');
    const reviews = await rows<Record<string, unknown> & { product_id: string; customer_id: string }>(db().from('reviews').select('*').order('created_at', { ascending: false }));
    const productIds = [...new Set(reviews.map((review) => review.product_id))];
    const customerIds = [...new Set(reviews.map((review) => review.customer_id))];
    const products = productIds.length ? await rows<{ id: string; name: string }>(db().from('products').select('id, name').in('id', productIds)) : [];
    const customers = customerIds.length ? await rows<{ id: string; email: string }>(db().from('customers').select('id, email').in('id', customerIds)) : [];
    return reviews.map((review) => ({
      ...review,
      product_name: products.find((product) => product.id === review.product_id)?.name ?? '',
      customer_email: customers.find((customer) => customer.id === review.customer_id)?.email ?? '',
    }));
  });

  app.patch('/admin/reviews/:id', async (request) => {
    const admin = await requireAdmin(request, 'reviews.moderate');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ status: z.enum(['pending', 'approved', 'rejected', 'hidden']) }).parse(request.body);
    await ok(db().from('reviews').update({ status: body.status }).eq('id', params.id));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'review.moderated',
      entityType: 'review', entityId: params.id, summary: `Review ${body.status}`, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/enquiries', async (request) => {
    await requireAdmin(request, 'enquiries.manage');
    return rows(db().from('contact_enquiries').select('*').order('created_at', { ascending: false }).limit(200));
  });

  app.patch('/admin/enquiries/:id', async (request) => {
    await requireAdmin(request, 'enquiries.manage');
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      status: z.enum(['open', 'in_progress', 'resolved']),
      notes: z.string().optional(),
    }).parse(request.body);
    const current = body.notes == null
      ? await one<{ notes: string | null }>(db().from('contact_enquiries').select('notes').eq('id', params.id).maybeSingle())
      : null;
    await ok(db().from('contact_enquiries').update({
      status: body.status,
      notes: body.notes ?? current?.notes ?? null,
    }).eq('id', params.id));
    return { ok: true };
  });

  app.get('/admin/newsletter', async (request) => {
    await requireAdmin(request, 'newsletter.read');
    return rows(db().from('newsletter_subscribers').select('id, email, status, source, consented_at, unsubscribed_at').order('consented_at', { ascending: false }));
  });

  app.get('/admin/stories', async (request) => {
    await requireAdmin(request, 'content.write');
    return rows(db().from('stories').select('*').order('updated_at', { ascending: false }));
  });

  app.post('/admin/stories', async (request) => {
    const admin = await requireAdmin(request, 'content.write');
    const body = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      excerpt: z.string().default(''),
      content: z.string().default(''),
      coverImage: z.string().optional(),
      author: z.string().default('Veloraa Rougee'),
      category: z.string().default(''),
      tags: z.array(z.string()).default([]),
      kicker: z.string().default(''),
      chips: z.array(z.string()).default([]),
      status: z.enum(['draft', 'published']).default('draft'),
      productSlugs: z.array(z.string()).default([]),
    }).parse(request.body);
    const created = await rows<{ id: string }>(db().from('stories').insert({
      slug: slugify(body.slug),
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      cover_image: body.coverImage ?? null,
      author: body.author,
      category: body.category,
      tags: body.tags,
      kicker: body.kicker,
      chips: body.chips,
      status: body.status,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    }).select('id'));
    if (body.productSlugs.length) {
      const products = await rows<{ id: string; slug: string }>(db().from('products').select('id, slug').in('slug', body.productSlugs));
      if (products.length) {
        await ok(db().from('story_products').upsert(
          products.map((product) => ({ story_id: created[0].id, product_id: product.id })),
          { onConflict: 'story_id,product_id', ignoreDuplicates: true },
        ));
      }
    }
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'story.updated',
      entityType: 'story', entityId: created[0].id, summary: body.title, ip: clientIp(request),
    });
    return created[0];
  });

  app.get('/admin/homepage', async (request) => {
    await requireAdmin(request, 'homepage.write');
    return rows(db().from('homepage_sections').select('*').order('sort_order'));
  });

  app.put('/admin/homepage/:key', async (request) => {
    const admin = await requireAdmin(request, 'homepage.write');
    const params = z.object({ key: z.string() }).parse(request.params);
    const body = z.object({
      title: z.string().default(''),
      subtitle: z.string().default(''),
      body: z.string().default(''),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      enabled: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    }).parse(request.body);
    await ok(db().from('homepage_sections').upsert({
      section_key: params.key,
      title: body.title,
      subtitle: body.subtitle,
      body: body.body,
      image_url: body.imageUrl ?? null,
      link_url: body.linkUrl ?? null,
      enabled: body.enabled,
      sort_order: body.sortOrder,
    }, { onConflict: 'section_key' }));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'homepage.updated',
      entityType: 'homepage_section', entityId: params.key, summary: `Updated ${params.key}`, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/locations', async (request) => {
    await requireAdmin(request, 'locations.write');
    return rows(db().from('locations').select('*').order('city'));
  });

  app.post('/admin/locations', async (request) => {
    const admin = await requireAdmin(request, 'locations.write');
    const body = z.object({
      name: z.string().min(1),
      address: z.string().default(''),
      mall: z.string().default(''),
      city: z.string().min(1),
      region: z.string().default(''),
      country: z.string().default('India'),
      phone: z.string().optional(),
      email: z.string().optional(),
      openingHours: z.string().optional(),
      mapUrl: z.string().optional(),
      active: z.boolean().default(true),
    }).parse(request.body);
    const created = await rows<{ id: string }>(db().from('locations').insert({
      name: body.name,
      address: body.address,
      mall: body.mall,
      city: body.city,
      region: body.region,
      country: body.country,
      phone: body.phone ?? null,
      email: body.email ?? null,
      opening_hours: body.openingHours ?? null,
      map_url: body.mapUrl ?? null,
      active: body.active,
    }).select('*'));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'location.updated',
      entityType: 'location', entityId: created[0]?.id, summary: body.name, ip: clientIp(request),
    });
    return created[0];
  });

  app.get('/admin/legal', async (request) => {
    await requireAdmin(request, 'content.write');
    return rows(db().from('legal_pages').select('*').order('slug'));
  });

  app.put('/admin/legal/:slug', async (request) => {
    const admin = await requireAdmin(request, 'content.write');
    const params = z.object({ slug: z.string() }).parse(request.params);
    const body = z.object({
      title: z.string().min(1),
      sections: z.array(z.object({ heading: z.string(), body: z.string() })),
    }).parse(request.body);
    await ok(db().from('legal_pages').upsert({ slug: params.slug, title: body.title, sections: body.sections }, { onConflict: 'slug' }));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'legal.updated',
      entityType: 'legal_page', entityId: params.slug, summary: body.title, ip: clientIp(request),
    });
    return { ok: true };
  });

  app.get('/admin/settings', async (request) => {
    await requireAdmin(request, 'settings.write');
    return rows(db().from('site_settings').select('*').eq('id', 1));
  });

  app.put('/admin/settings', async (request) => {
    const admin = await requireAdmin(request, 'settings.write');
    const body = z.object({
      brandName: z.string().min(1),
      supportEmail: z.string().email(),
      gst: z.string().optional(),
      freeShippingThresholdPaise: z.number().int().min(0),
      shippingFlatPaise: z.number().int().min(0),
      announcements: z.array(z.string()),
      claimTicker: z.array(z.string()),
    }).parse(request.body);
    await ok(db().from('site_settings').update({
      brand_name: body.brandName,
      support_email: body.supportEmail,
      gst: body.gst ?? null,
      free_shipping_threshold_paise: body.freeShippingThresholdPaise,
      shipping_flat_paise: body.shippingFlatPaise,
      announcements: body.announcements,
      claim_ticker: body.claimTicker,
    }).eq('id', 1));
    await audit({
      actorType: 'admin', actorId: admin.id, actorLabel: admin.email, action: 'settings.updated',
      entityType: 'site_settings', entityId: '1', summary: 'Updated website settings', ip: clientIp(request),
    });
    return { ok: true };
  });
}
