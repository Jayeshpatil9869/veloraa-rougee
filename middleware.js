const API = (process.env.API_PUBLIC_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function seoBlock(seo) {
  const schema = JSON.stringify(seo.schema?.length === 1 ? seo.schema[0] : seo.schema || []);
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.ogDescription)}" />`,
    `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
    `<script id="vr-schema" type="application/ld+json">${schema}</script>`,
  ].join('\n');
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase();

  // If request is directed to api subdomain or /api path, pass through cleanly to serverless function
  if (host.startsWith('api.') || url.pathname.startsWith('/api')) {
    return;
  }

  // If request is directed to admin subdomain or /admin path, pass through to SPA without SEO hydration
  if (host.startsWith('admin.') || url.pathname.startsWith('/admin')) {
    return;
  }

  if (url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml') {
    if (!API) return;
    return fetch(`${API}${url.pathname}`);
  }
  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html') || !API) return;
  if (url.pathname.startsWith('/assets') || url.pathname.startsWith('/fonts')) return;
  const seoResponse = await fetch(`${API}/seo/resolve?path=${encodeURIComponent(url.pathname)}`).catch(() => null);
  if (!seoResponse || !seoResponse.ok) return;
  const seo = await seoResponse.json();
  const htmlResponse = await fetch(new URL('/index.html', url.origin));
  if (!htmlResponse.ok) return;
  const html = await htmlResponse.text();
  const next = html.replace(/<!--vr-seo-->[\s\S]*?<!--\/vr-seo-->/, `<!--vr-seo-->\n${seoBlock(seo)}\n<!--/vr-seo-->`);
  return new Response(next, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' },
  });
}
