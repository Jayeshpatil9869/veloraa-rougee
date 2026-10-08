export interface Crumb {
  name: string;
  path: string;
}

export interface SeoDocument {
  title: string;
  description: string;
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogType: string;
  schema: Record<string, unknown>[];
}

export function absoluteUrl(origin: string, path: string) {
  return new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();
}

export function organizationSchema(input: { origin: string; name: string; email: string; logo?: string; taxId?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.origin,
    email: input.email,
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.taxId ? { taxID: input.taxId } : {}),
  };
}

export function websiteSchema(input: { origin: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.origin,
  };
}

export function breadcrumbSchema(origin: string, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(origin, crumb.path),
    })),
  };
}

export function productSchema(input: {
  origin: string;
  name: string;
  description: string;
  slug: string;
  image: string[];
  sku?: string;
  brand: string;
  price: string;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
  ratingValue?: number;
  reviewCount?: number;
  reviews?: { author: string; body: string; rating: number; date: string }[];
}) {
  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.image,
    sku: input.sku,
    brand: { '@type': 'Brand', name: input.brand },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(input.origin, `/en/product/${input.slug}`),
      priceCurrency: input.currency,
      price: input.price,
      availability: `https://schema.org/${input.availability}`,
    },
  };
  if (input.reviewCount && input.reviewCount > 0 && input.ratingValue) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
    };
  }
  if (input.reviews && input.reviews.length > 0) {
    product.review = input.reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewBody: review.body,
      datePublished: review.date,
      reviewRating: { '@type': 'Rating', ratingValue: review.rating },
    }));
  }
  return product;
}

export function collectionSchema(input: { origin: string; name: string; description: string; path: string; items: { name: string; path: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.origin, input.path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absoluteUrl(input.origin, item.path),
      })),
    },
  };
}

export function articleSchema(input: {
  origin: string;
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.origin, input.path),
    ...(input.image ? { image: input.image } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    author: { '@type': 'Organization', name: input.author },
  };
}

export function localBusinessSchema(input: {
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  phone?: string | null;
  mapUrl?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: input.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: input.address,
      addressLocality: input.city,
      addressRegion: input.region,
      addressCountry: input.country,
    },
    ...(input.phone ? { telephone: input.phone } : {}),
    ...(input.mapUrl ? { hasMap: input.mapUrl } : {}),
  };
}

export interface SeoIssue {
  path: string;
  code: string;
  message: string;
}

export function validateSeoRecords(
  pages: {
    path: string;
    title: string;
    description: string;
    h1: string;
    canonical: string;
    indexable: boolean;
    imageAlt?: string;
    hasImage?: boolean;
    price?: string | null;
    availability?: string | null;
    schemaTypes?: string[];
    expectedSchema?: string;
  }[],
): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const page of pages) {
    if (!page.title.trim()) issues.push({ path: page.path, code: 'missing_title', message: 'Missing title' });
    if (!page.description.trim()) issues.push({ path: page.path, code: 'missing_description', message: 'Missing description' });
    if (!page.h1.trim()) issues.push({ path: page.path, code: 'missing_h1', message: 'Missing H1' });
    if (!page.canonical.trim()) issues.push({ path: page.path, code: 'missing_canonical', message: 'Missing canonical' });
    if (page.hasImage && !page.imageAlt?.trim()) {
      issues.push({ path: page.path, code: 'missing_alt', message: 'Missing image alt' });
    }
    if (page.expectedSchema === 'Product') {
      if (!page.schemaTypes?.includes('Product')) issues.push({ path: page.path, code: 'missing_product_schema', message: 'Missing product schema' });
      if (!page.price) issues.push({ path: page.path, code: 'missing_price', message: 'Missing product price' });
      if (!page.availability) issues.push({ path: page.path, code: 'missing_availability', message: 'Missing availability' });
      if (!page.hasImage) issues.push({ path: page.path, code: 'missing_product_image', message: 'Missing product image' });
    }
    if (page.indexable && !page.h1.trim()) {
      issues.push({ path: page.path, code: 'thin_content', message: 'Indexable page has no meaningful heading' });
    }
    const titleKey = page.title.trim().toLowerCase();
    if (titleKey) {
      const existing = titles.get(titleKey);
      if (existing) issues.push({ path: page.path, code: 'duplicate_title', message: `Duplicate title also used on ${existing}` });
      else titles.set(titleKey, page.path);
    }
    const descriptionKey = page.description.trim().toLowerCase();
    if (descriptionKey) {
      const existing = descriptions.get(descriptionKey);
      if (existing) issues.push({ path: page.path, code: 'duplicate_description', message: `Duplicate description also used on ${existing}` });
      else descriptions.set(descriptionKey, page.path);
    }
  }
  return issues;
}

export const PAGE_STRATEGIES = [
  {
    pageKey: 'home',
    pathPattern: '/en',
    primaryTopic: 'beauty products online',
    relatedTerms: ['beauty online shopping', 'beauty cosmetics online', 'beauty makeup online', 'buy beauty products online', 'online purchase beauty products', 'order beauty products online'],
    searchIntent: 'Find the Veloraa Rougee store and shop beauty products.',
    schemaType: 'WebSite',
    robotsIndex: true,
  },
  {
    pageKey: 'shop-all',
    pathPattern: '/en/shop-all',
    primaryTopic: 'makeup products online',
    relatedTerms: ['makeup items online', 'makeup products shop', 'makeup cosmetics online shopping', 'buy cosmetic products online', 'best online place to buy makeup', 'makeup cosmetics shop'],
    searchIntent: 'Browse the full makeup catalog.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'face',
    pathPattern: '/en/collection/face',
    primaryTopic: 'face makeup online',
    relatedTerms: ['buy face makeup', 'face makeup', 'concealer', 'bronzer', 'blush'],
    searchIntent: 'Shop face makeup that the catalog actually sells: concealer, bronzer, and blush.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'lips',
    pathPattern: '/en/collection/lips',
    primaryTopic: 'lipstick shop',
    relatedTerms: ['lip tint online shop', 'lipstick', 'lip makeup', 'lip liner', 'lip gloss', 'lip balm'],
    searchIntent: 'Shop lip products in the catalog.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'eyes',
    pathPattern: '/en/collection/eyes',
    primaryTopic: 'mascara shop',
    relatedTerms: ['eyeliner pencil online shopping', 'kajal stick price', 'eye makeup', 'mascara', 'kajal', 'eyeliner'],
    searchIntent: 'Shop eye makeup in the catalog: mascara, kajal, eyeliner, and palettes.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'brows',
    pathPattern: '/en/collection/brows',
    primaryTopic: 'eyebrow online',
    relatedTerms: ['brows online', 'eyebrow kit price', 'eyebrow products', 'brow pencil', 'brow mascara'],
    searchIntent: 'Shop brow products.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'bundles',
    pathPattern: '/en/collection/bundles',
    primaryTopic: 'makeup bundle sale',
    relatedTerms: ['makeup kit shop', 'makeup sale set', 'beauty bundle', 'makeup set'],
    searchIntent: 'Shop published makeup sets only.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'best-sellers',
    pathPattern: '/en/collection/best-sellers',
    primaryTopic: 'top selling beauty products online',
    relatedTerms: ['best makeup products online shopping', 'best makeup shop', 'popular beauty products'],
    searchIntent: 'Browse products marked as bestsellers.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'stories',
    pathPattern: '/en/stories',
    primaryTopic: 'Veloraa Rougee stories',
    relatedTerms: ['makeup stories', 'beauty journal'],
    searchIntent: 'Read editorial stories.',
    schemaType: 'CollectionPage',
    robotsIndex: true,
  },
  {
    pageKey: 'about',
    pathPattern: '/en/about-us',
    primaryTopic: 'Veloraa Rougee',
    relatedTerms: ['Veloraa Rougee cosmetics', 'Veloraa Rougee beauty', 'Veloraa Rougee makeup'],
    searchIntent: 'Learn about the brand.',
    schemaType: 'Organization',
    robotsIndex: true,
  },
  {
    pageKey: 'locations',
    pathPattern: '/en/locations',
    primaryTopic: 'cosmetics store near me',
    relatedTerms: ['cosmetics shop near me', 'makeup stores near me', 'beauty shop near me'],
    searchIntent: 'Find the published Nashik and Pune counters.',
    schemaType: 'Store',
    robotsIndex: true,
  },
  {
    pageKey: 'contact',
    pathPattern: '/en/contact-us',
    primaryTopic: 'Veloraa Rougee contact',
    relatedTerms: ['Veloraa Rougee support', 'Veloraa Rougee customer care'],
    searchIntent: 'Contact the brand.',
    schemaType: 'Organization',
    robotsIndex: true,
  },
] as const;

export const NOINDEX_PREFIXES = ['/admin', '/en/login', '/login', '/en/signup', '/en/sign-up', '/signup', '/sign-up', '/en/account', '/en/checkout'];
