import { asOne, db, rows } from './db';

export interface StoreVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  image?: string;
  hexColor?: string;
  images: { id: string; src: string; alt: string }[];
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  images: { id: string; src: string; alt: string; width?: number; height?: number }[];
  variants: StoreVariant[];
  optionName: string;
  defaultVariantId?: string;
  ingredients: string[];
  howToUse: string;
  story: string;
  benefits: string[];
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  status: string;
  rating?: number;
  reviewCount?: number;
}

interface CategoryEmbed {
  id: string;
  slug: string;
  name: string;
  legacy_id: string | null;
}

interface VariantEmbed {
  id: string;
  product_id: string;
  legacy_variant_id: string | null;
  name: string;
  sku: string | null;
  price_paise: number;
  compare_at_paise: number | null;
  stock_on_hand: number;
  stock_reserved: number;
  hex_color: string | null;
  active: boolean;
  is_default: boolean;
  sort_order: number;
  product_variant_images: { id: string; url: string; alt: string; sort_order: number }[] | null;
}

interface ProductEmbed {
  id: string;
  legacy_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  story: string;
  how_to_use: string;
  ingredients: string[] | null;
  benefits: string[] | null;
  option_name: string;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  status: string;
  brand: string;
  product_type: string;
  updated_at: string;
  categories: CategoryEmbed | CategoryEmbed[] | null;
  product_variants: VariantEmbed[] | null;
  product_images: { id: string; url: string; alt: string; width: number | null; height: number | null; sort_order: number }[] | null;
  product_tags: { tag: string }[] | null;
  reviews: { rating: number; status: string }[] | null;
}

export async function loadProducts(options: {
  status?: string | null;
  slug?: string | null;
  legacyVariantId?: string | null;
  q?: string | null;
  category?: string | null;
  limit?: number;
  offset?: number;
}) {
  const q = options.q?.trim().toLowerCase() || '';
  const loaded = await rows<ProductEmbed>(
    db().from('products').select(`
      id, legacy_id, name, slug, short_description, description, story, how_to_use,
      ingredients, benefits, option_name, featured, bestseller, new_arrival, status,
      brand, product_type, updated_at,
      categories ( id, slug, name, legacy_id ),
      product_variants ( id, product_id, legacy_variant_id, name, sku, price_paise, compare_at_paise, stock_on_hand, stock_reserved, hex_color, active, is_default, sort_order, product_variant_images ( id, url, alt, sort_order ) ),
      product_images ( id, url, alt, width, height, sort_order ),
      product_tags ( tag ),
      reviews ( rating, status )
    `).order('updated_at', { ascending: false }),
  );
  const filtered = loaded.filter((row) => {
    const category = asOne(row.categories);
    if (options.status && row.status !== options.status) return false;
    if (options.slug && row.slug !== options.slug) return false;
    if (options.category && category?.slug !== options.category && category?.legacy_id !== options.category) return false;
    if (options.legacyVariantId && !(row.product_variants ?? []).some((variant) => variant.legacy_variant_id === options.legacyVariantId)) return false;
    if (!q) return true;
    const tags = (row.product_tags ?? []).map((tag) => tag.tag.toLowerCase());
    const haystack = [row.name, row.short_description, row.product_type, category?.name ?? '', ...tags].join(' ').toLowerCase();
    return haystack.includes(q);
  });
  const page = filtered.slice(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 100));
  return page.map((row) => {
    const category = asOne(row.categories);
    const productVariants = (row.product_variants ?? []).filter((variant) => variant.active).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const images = (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        src: image.url,
        alt: image.alt,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
      }));
    const mappedVariants: StoreVariant[] = productVariants.map((variant) => {
      const gallery = (variant.product_variant_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({ id: image.id, src: image.url, alt: image.alt }));
      return {
        id: variant.legacy_variant_id || variant.id,
        productId: row.legacy_id || row.id,
        name: variant.name,
        value: variant.name,
        price: variant.price_paise / 100,
        compareAtPrice: variant.compare_at_paise != null ? variant.compare_at_paise / 100 : undefined,
        stock: Math.max(variant.stock_on_hand - variant.stock_reserved, 0),
        sku: variant.sku ?? undefined,
        image: gallery[0]?.src,
        hexColor: variant.hex_color ?? undefined,
        images: gallery,
      };
    });
    const approved = (row.reviews ?? []).filter((review) => review.status === 'approved');
    const reviewCount = approved.length;
    const rating = reviewCount > 0 ? Math.round((approved.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10 : undefined;
    const defaultVariant = productVariants.find((variant) => variant.is_default) ?? productVariants[0];
    return {
      id: row.legacy_id || row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      description: row.description,
      categoryId: category?.legacy_id || category?.slug || 'face',
      categoryName: category?.name || '',
      images,
      variants: mappedVariants,
      optionName: row.option_name,
      defaultVariantId: defaultVariant ? defaultVariant.legacy_variant_id || defaultVariant.id : undefined,
      ingredients: row.ingredients ?? [],
      howToUse: row.how_to_use,
      story: row.story,
      benefits: row.benefits ?? [],
      tags: (row.product_tags ?? []).map((tag) => tag.tag),
      featured: row.featured,
      bestseller: row.bestseller,
      newArrival: row.new_arrival,
      status: row.status,
      rating,
      reviewCount: reviewCount > 0 ? reviewCount : undefined,
      brand: row.brand,
      productType: row.product_type,
      databaseId: row.id,
    };
  });
}

export async function loadCategories() {
  const categories = await rows<{ id: string; legacy_id: string | null; name: string; slug: string; description: string; image_url: string | null; active: boolean; sort_order: number }>(
    db().from('categories').select('id, legacy_id, name, slug, description, image_url, active, sort_order').order('sort_order').order('name'),
  );
  return categories.map((row) => ({
    id: row.legacy_id || row.slug,
    databaseId: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image_url || '',
    active: row.active,
    sortOrder: row.sort_order,
  }));
}
