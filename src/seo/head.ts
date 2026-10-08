export interface SeoPayload {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  schema: Record<string, unknown>[];
}

function upsert(selector: string, tag: 'meta' | 'link', attrs: Record<string, string>) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tag);
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
}

export function applySeoHead(seo: SeoPayload) {
  document.title = seo.title;
  upsert('meta[name="description"]', 'meta', { name: 'description', content: seo.description });
  upsert('meta[name="robots"]', 'meta', { name: 'robots', content: seo.robots });
  upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: seo.canonical });
  upsert('meta[property="og:title"]', 'meta', { property: 'og:title', content: seo.ogTitle });
  upsert('meta[property="og:description"]', 'meta', { property: 'og:description', content: seo.ogDescription });
  upsert('meta[property="og:image"]', 'meta', { property: 'og:image', content: seo.ogImage });
  upsert('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: seo.ogTitle });
  upsert('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: seo.ogDescription });
  let script = document.getElementById('vr-schema');
  if (!script) {
    const created = document.createElement('script');
    created.id = 'vr-schema';
    created.type = 'application/ld+json';
    document.head.appendChild(created);
    script = created;
  }
  script.textContent = JSON.stringify(seo.schema.length === 1 ? seo.schema[0] : seo.schema);
}
