import { CATEGORIES, PRODUCTS } from '../../src/data/products';
import { BRAND_INFO, LEGAL_PAGES_CONTENT, STORE_LOCATIONS, STORY_ARTICLES } from '../../src/data/content';
import { PAGE_STRATEGIES } from '../../shared/seo';
import { db, ok, one, rows } from './db';
import { env } from './env';
import { hashPassword } from './password';

const OPENING_STOCK = 25;

async function main() {
  for (const [index, category] of CATEGORIES.entries()) {
    await ok(db().from('categories').upsert({
      legacy_id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      image_url: category.image,
      sort_order: index,
      active: true,
    }, { onConflict: 'slug' }));
  }

  for (const product of PRODUCTS) {
    const category = await one<{ id: string }>(
      db().from('categories').select('id').or(`legacy_id.eq.${product.categoryId},slug.eq.${product.categoryId}`).limit(1).maybeSingle(),
    );
    const savedProducts = await rows<{ id: string }>(db().from('products').upsert({
      legacy_id: product.id,
      category_id: category?.id ?? null,
      name: product.name,
      slug: product.slug,
      short_description: product.shortDescription ?? '',
      description: product.description ?? '',
      story: product.story ?? '',
      how_to_use: product.howToUse ?? '',
      ingredients: product.ingredients ?? [],
      benefits: product.benefits ?? [],
      option_name: product.optionName ?? 'Shade',
      featured: Boolean(product.featured),
      bestseller: Boolean(product.bestseller),
      new_arrival: Boolean(product.newArrival),
      status: 'published',
      product_type: product.categoryName,
    }, { onConflict: 'slug' }).select('id'));
    const productId = savedProducts[0]?.id;
    if (!productId) throw new Error(`product_seed_failed:${product.slug}`);
    await ok(db().from('product_images').delete().eq('product_id', productId));
    await ok(db().from('product_tags').delete().eq('product_id', productId));
    if (product.images.length > 0) {
      await ok(db().from('product_images').insert(product.images.map((image, index) => ({
        product_id: productId,
        url: image.src,
        alt: image.alt,
        sort_order: index,
      }))));
    }
    if ((product.tags ?? []).length > 0) {
      await ok(db().from('product_tags').upsert(
        (product.tags ?? []).map((tag) => ({ product_id: productId, tag })),
        { onConflict: 'product_id,tag', ignoreDuplicates: true },
      ));
    }
    for (const [index, variant] of product.variants.entries()) {
      const pricePaise = Math.round(variant.price * 100);
      const existing = await one<{ id: string; stock_on_hand: number }>(
        db().from('product_variants').select('id, stock_on_hand').eq('legacy_variant_id', variant.id).maybeSingle(),
      );
      const variantId = existing
        ? existing.id
        : (await rows<{ id: string }>(db().from('product_variants').insert({
          product_id: productId,
          legacy_variant_id: variant.id,
          name: variant.name,
          sku: variant.sku ?? null,
          price_paise: pricePaise,
          stock_on_hand: variant.stock ?? OPENING_STOCK,
          hex_color: variant.hexColor ?? null,
          active: true,
          is_default: variant.id === product.defaultVariantId,
          sort_order: index,
        }).select('id')))[0]?.id;
      if (!variantId) throw new Error(`variant_seed_failed:${variant.id}`);
      if (existing) {
        await ok(db().from('product_variants').update({
          name: variant.name,
          price_paise: pricePaise,
          hex_color: variant.hexColor ?? null,
          is_default: variant.id === product.defaultVariantId,
          sort_order: index,
        }).eq('id', variantId));
      }
      if (variant.image) {
        await ok(db().from('product_variant_images').delete().eq('variant_id', variantId));
        await ok(db().from('product_variant_images').insert({
          variant_id: variantId,
          url: variant.image,
          alt: `${product.name} in ${variant.name}`,
          sort_order: 0,
        }));
      }
      const { count } = await db().from('inventory_movements').select('id', { count: 'exact', head: true }).eq('variant_id', variantId);
      if ((count ?? 0) === 0) {
        const stock = existing?.stock_on_hand ?? variant.stock ?? OPENING_STOCK;
        await ok(db().from('inventory_movements').insert({
          variant_id: variantId,
          movement_type: 'stock_added',
          quantity: stock,
          note: 'Opening stock from catalog migration',
          actor: 'seed',
        }));
      }
    }
  }

  for (const article of STORY_ARTICLES) {
    const savedStories = await rows<{ id: string }>(db().from('stories').upsert({
      slug: article.slug,
      title: article.title,
      excerpt: article.intro ?? '',
      content: article.paragraphs.join('\n\n'),
      cover_image: article.coverImage,
      kicker: article.kicker,
      chips: article.chips,
      status: 'published',
      published_at: new Date().toISOString(),
    }, { onConflict: 'slug' }).select('id'));
    const storyId = savedStories[0]?.id;
    if (!storyId) continue;
    for (const handle of article.linkedProductHandles ?? []) {
      const linked = await one<{ id: string }>(db().from('products').select('id').eq('slug', handle).maybeSingle());
      if (!linked) continue;
      await ok(db().from('story_products').upsert(
        { story_id: storyId, product_id: linked.id },
        { onConflict: 'story_id,product_id', ignoreDuplicates: true },
      ));
    }
  }

  for (const location of STORE_LOCATIONS) {
    await ok(db().from('locations').upsert({
      legacy_id: location.id,
      name: location.name,
      address: location.address ?? '',
      mall: location.mall,
      city: location.city,
      region: location.state,
      country: 'India',
      phone: location.phone ?? null,
      opening_hours: location.timing ?? null,
      map_url: location.mapUrl,
      active: true,
    }, { onConflict: 'legacy_id' }));
  }

  for (const [slug, page] of Object.entries(LEGAL_PAGES_CONTENT)) {
    await ok(db().from('legal_pages').upsert({
      slug,
      title: page.title,
      sections: page.sections,
    }, { onConflict: 'slug' }));
  }

  const sections = [
    ['hero', 'Hero', 0],
    ['best-sellers', 'Best sellers', 1],
    ['feel-good', 'Feel good', 2],
    ['shop-by-category', 'Shop by category', 3],
    ['spotlight', 'Spotlight', 4],
    ['stories', 'Stories', 5],
    ['explore-feed', 'Explore', 6],
  ] as const;
  for (const [key, title, order] of sections) {
    await ok(db().from('homepage_sections').upsert({
      section_key: key,
      title,
      enabled: true,
      sort_order: order,
    }, { onConflict: 'section_key', ignoreDuplicates: true }));
  }

  const origin = env.APP_ORIGIN.replace(/\/$/, '');
  for (const strategy of PAGE_STRATEGIES) {
    await ok(db().from('seo_strategies').upsert({
      page_key: strategy.pageKey,
      path_pattern: strategy.pathPattern,
      primary_topic: strategy.primaryTopic,
      related_terms: strategy.relatedTerms,
      search_intent: strategy.searchIntent,
      schema_type: strategy.schemaType,
      robots_index: strategy.robotsIndex,
    }, { onConflict: 'page_key' }));
    await ok(db().from('seo_metadata').upsert({
      path: strategy.pathPattern,
      entity_type: 'page',
      seo_title: `${strategy.primaryTopic} | Veloraa Rougee`,
      meta_description: strategy.searchIntent,
      primary_topic: strategy.primaryTopic,
      related_terms: strategy.relatedTerms,
      canonical_url: `${origin}${strategy.pathPattern}`,
      schema_type: strategy.schemaType,
      robots_index: true,
    }, { onConflict: 'path', ignoreDuplicates: true }));
  }

  await ok(db().from('site_settings').update({
    announcements: BRAND_INFO.announcements,
    claim_ticker: BRAND_INFO.claimTicker,
    support_email: BRAND_INFO.supportEmail,
    gst: BRAND_INFO.gst,
  }).eq('id', 1));

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await ok(db().from('admin_users').upsert({
      email: env.ADMIN_EMAIL.toLowerCase(),
      full_name: env.ADMIN_NAME,
      password_hash: await hashPassword(env.ADMIN_PASSWORD),
      role_id: 'super_admin',
    }, { onConflict: 'email', ignoreDuplicates: true }));
  }

  console.log(`Seeded ${PRODUCTS.length} products and ${CATEGORIES.length} categories.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'seed_failed');
  process.exit(1);
});
