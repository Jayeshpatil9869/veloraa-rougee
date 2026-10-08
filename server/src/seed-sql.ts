import { writeFileSync, mkdirSync } from 'node:fs';
import { CATEGORIES, PRODUCTS } from '../../src/data/products';
import { BRAND_INFO, LEGAL_PAGES_CONTENT, STORE_LOCATIONS, STORY_ARTICLES } from '../../src/data/content';
import { PAGE_STRATEGIES } from '../../shared/seo';

const OPENING_STOCK = 25;
const origin = 'https://veloraarougee.com';

function sqlText(value: string | null | undefined) {
  if (value == null) return 'null';
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlArray(values: string[] | undefined) {
  if (!values?.length) return `array[]::text[]`;
  return `array[${values.map((value) => sqlText(value)).join(',')}]::text[]`;
}

function sqlBool(value: boolean) {
  return value ? 'true' : 'false';
}

const statements: string[] = [];

for (const [index, category] of CATEGORIES.entries()) {
  statements.push(`
insert into public.categories (legacy_id, name, slug, description, image_url, sort_order, active)
values (${sqlText(category.id)}, ${sqlText(category.name)}, ${sqlText(category.slug)}, ${sqlText(category.description ?? '')}, ${sqlText(category.image)}, ${index}, true)
on conflict (slug) do update set name = excluded.name, image_url = excluded.image_url, legacy_id = excluded.legacy_id, description = excluded.description
  `.trim());
}

for (const product of PRODUCTS) {
  statements.push(`
insert into public.products (
  legacy_id, category_id, name, slug, short_description, description, story, how_to_use,
  ingredients, benefits, option_name, featured, bestseller, new_arrival, status, product_type
) values (
  ${sqlText(product.id)},
  (select id from public.categories where legacy_id = ${sqlText(product.categoryId)} or slug = ${sqlText(product.categoryId)} limit 1),
  ${sqlText(product.name)}, ${sqlText(product.slug)}, ${sqlText(product.shortDescription ?? '')}, ${sqlText(product.description ?? '')},
  ${sqlText(product.story ?? '')}, ${sqlText(product.howToUse ?? '')}, ${sqlArray(product.ingredients)}, ${sqlArray(product.benefits)},
  ${sqlText(product.optionName ?? 'Shade')}, ${sqlBool(Boolean(product.featured))}, ${sqlBool(Boolean(product.bestseller))},
  ${sqlBool(Boolean(product.newArrival))}, 'published', ${sqlText(product.categoryName)}
)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, status = 'published', legacy_id = excluded.legacy_id,
  category_id = excluded.category_id, short_description = excluded.short_description, story = excluded.story,
  how_to_use = excluded.how_to_use, ingredients = excluded.ingredients, benefits = excluded.benefits
  `.trim());

  statements.push(`delete from public.product_images where product_id = (select id from public.products where slug = ${sqlText(product.slug)})`);
  statements.push(`delete from public.product_tags where product_id = (select id from public.products where slug = ${sqlText(product.slug)})`);
  for (const [index, image] of product.images.entries()) {
    statements.push(`
insert into public.product_images (product_id, url, alt, sort_order)
values ((select id from public.products where slug = ${sqlText(product.slug)}), ${sqlText(image.src)}, ${sqlText(image.alt)}, ${index})
    `.trim());
  }
  for (const tag of product.tags ?? []) {
    statements.push(`
insert into public.product_tags (product_id, tag)
values ((select id from public.products where slug = ${sqlText(product.slug)}), ${sqlText(tag)})
on conflict do nothing
    `.trim());
  }
  for (const [index, variant] of product.variants.entries()) {
    const pricePaise = Math.round(variant.price * 100);
    const stock = variant.stock ?? OPENING_STOCK;
    statements.push(`
insert into public.product_variants (
  product_id, legacy_variant_id, name, sku, price_paise, stock_on_hand, hex_color, active, is_default, sort_order
) values (
  (select id from public.products where slug = ${sqlText(product.slug)}),
  ${sqlText(variant.id)}, ${sqlText(variant.name)}, ${sqlText(variant.sku ?? null)}, ${pricePaise}, ${stock},
  ${sqlText(variant.hexColor ?? null)}, true, ${sqlBool(variant.id === product.defaultVariantId)}, ${index}
)
on conflict (legacy_variant_id) do update set
  name = excluded.name, price_paise = excluded.price_paise, hex_color = excluded.hex_color, is_default = excluded.is_default
    `.trim());
    if (variant.image) {
      statements.push(`delete from public.product_variant_images where variant_id = (select id from public.product_variants where legacy_variant_id = ${sqlText(variant.id)})`);
      statements.push(`
insert into public.product_variant_images (variant_id, url, alt, sort_order)
values (
  (select id from public.product_variants where legacy_variant_id = ${sqlText(variant.id)}),
  ${sqlText(variant.image)}, ${sqlText(`${product.name} in ${variant.name}`)}, 0
)
      `.trim());
    }
    statements.push(`
insert into public.inventory_movements (variant_id, movement_type, quantity, note, actor)
select id, 'stock_added', stock_on_hand, 'Opening stock from catalog migration', 'seed'
from public.product_variants
where legacy_variant_id = ${sqlText(variant.id)}
  and not exists (
    select 1 from public.inventory_movements m where m.variant_id = public.product_variants.id
  )
    `.trim());
  }
}

for (const article of STORY_ARTICLES) {
  statements.push(`
insert into public.stories (slug, title, excerpt, content, cover_image, kicker, chips, status, published_at)
values (
  ${sqlText(article.slug)}, ${sqlText(article.title)}, ${sqlText(article.intro ?? '')}, ${sqlText(article.paragraphs.join('\n\n'))},
  ${sqlText(article.coverImage)}, ${sqlText(article.kicker)}, ${sqlArray(article.chips)}, 'published', now()
)
on conflict (slug) do update set title = excluded.title, content = excluded.content, status = 'published', cover_image = excluded.cover_image
  `.trim());
  for (const handle of article.linkedProductHandles ?? []) {
    statements.push(`
insert into public.story_products (story_id, product_id)
select s.id, p.id from public.stories s, public.products p
where s.slug = ${sqlText(article.slug)} and p.slug = ${sqlText(handle)}
on conflict do nothing
    `.trim());
  }
}

for (const location of STORE_LOCATIONS) {
  statements.push(`
insert into public.locations (legacy_id, name, address, mall, city, region, country, phone, opening_hours, map_url, active)
values (
  ${sqlText(location.id)}, ${sqlText(location.name)}, ${sqlText(location.address ?? '')}, ${sqlText(location.mall)},
  ${sqlText(location.city)}, ${sqlText(location.state)}, 'India', ${sqlText(location.phone ?? null)},
  ${sqlText(location.timing ?? null)}, ${sqlText(location.mapUrl)}, true
)
on conflict (legacy_id) do update set name = excluded.name, address = excluded.address, active = true
  `.trim());
}

for (const [slug, page] of Object.entries(LEGAL_PAGES_CONTENT)) {
  statements.push(`
insert into public.legal_pages (slug, title, sections)
values (${sqlText(slug)}, ${sqlText(page.title)}, ${sqlText(JSON.stringify(page.sections))}::jsonb)
on conflict (slug) do update set title = excluded.title, sections = excluded.sections
  `.trim());
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
  statements.push(`
insert into public.homepage_sections (section_key, title, enabled, sort_order)
values (${sqlText(key)}, ${sqlText(title)}, true, ${order})
on conflict (section_key) do nothing
  `.trim());
}

for (const strategy of PAGE_STRATEGIES) {
  statements.push(`
insert into public.seo_strategies (page_key, path_pattern, primary_topic, related_terms, search_intent, schema_type, robots_index)
values (
  ${sqlText(strategy.pageKey)}, ${sqlText(strategy.pathPattern)}, ${sqlText(strategy.primaryTopic)}, ${sqlArray([...strategy.relatedTerms])},
  ${sqlText(strategy.searchIntent)}, ${sqlText(strategy.schemaType)}, ${sqlBool(strategy.robotsIndex)}
)
on conflict (page_key) do update set
  primary_topic = excluded.primary_topic, related_terms = excluded.related_terms, search_intent = excluded.search_intent
  `.trim());
  statements.push(`
insert into public.seo_metadata (path, entity_type, seo_title, meta_description, primary_topic, related_terms, canonical_url, schema_type, robots_index)
values (
  ${sqlText(strategy.pathPattern)}, 'page', ${sqlText(`${strategy.primaryTopic} | Veloraa Rougee`)}, ${sqlText(strategy.searchIntent)},
  ${sqlText(strategy.primaryTopic)}, ${sqlArray([...strategy.relatedTerms])}, ${sqlText(`${origin}${strategy.pathPattern}`)},
  ${sqlText(strategy.schemaType)}, true
)
on conflict (path) do nothing
  `.trim());
}

statements.push(`
update public.site_settings set
  announcements = ${sqlText(JSON.stringify(BRAND_INFO.announcements))}::jsonb,
  claim_ticker = ${sqlText(JSON.stringify(BRAND_INFO.claimTicker))}::jsonb,
  support_email = ${sqlText(BRAND_INFO.supportEmail)},
  gst = ${sqlText(BRAND_INFO.gst)}
where id = 1
`.trim());

mkdirSync('tmp-sql', { recursive: true });
const chunks: string[] = [];
let current = '';
for (const statement of statements) {
  const next = `${statement};\n`;
  if (current.length + next.length > 14000 && current) {
    chunks.push(current);
    current = next;
  } else {
    current += next;
  }
}
if (current.trim()) chunks.push(current);
chunks.forEach((chunk, index) => writeFileSync(`tmp-sql/seed-${String(index).padStart(2, '0')}.sql`, chunk));
console.log(`${statements.length} statements in ${chunks.length} files`);
