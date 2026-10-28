# VELORAA ROUGEE

**Luxury cosmetics, built for the way people actually shop.**

VELORAA ROUGEE is a modern beauty brand storefront — soft cream canvases, gold accents, and product storytelling that feels editorial rather than transactional. Behind that look sits a full commerce stack: catalog, cart, checkout, accounts, wishlist, payments, shipping, and a private admin console for the team that runs the brand day to day.

Live site: [veloraarougee.com](https://veloraarougee.com)

---

## What this project is

This repository is the complete Veloraa Rougee web experience:

- A polished customer storefront (shop, product pages, stories, about, locations, legal)
- Guest and signed-in shopping (cart, wishlist, checkout, order history)
- PayU payment flow with callback and webhook handling
- Shiprocket-backed shipping and logistics tools
- An admin app for products, collections, orders, payments, coupons, reviews, stories, and enquiries
- SEO head resolution, sitemap-friendly routing, and brand assets served from `public/`

It is not a throwaway landing page. The storefront and API are designed to work together in development and on Vercel in production.

---

## Stack at a glance

| Layer | Choice |
| --- | --- |
| Storefront | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Motion | Lenis smooth scroll, GSAP ScrollTrigger, Motion |
| API | Fastify (auth, catalog, commerce, shipping, SEO, content) |
| Data | Supabase (Postgres + auth-friendly client) |
| Payments | PayU |
| Shipping | Shiprocket |
| Deploy | Vercel (`veloraarougee.com`, `admin.*`, `api.*`) |

Design direction lives in `colors.md` — Warm Velvet Luxury & Gold Editorial (cream, champagne, gold, rose gold, deep brown).

---

## Project layout

```text
├── src/                 Storefront + lazy-loaded admin UI
│   ├── pages/           Shop, product, checkout, account, stories, …
│   ├── components/      Layout, product, sections, brand, motion
│   ├── admin/           Dashboard modules (orders, payments, shipping, …)
│   ├── services/        Catalog, cart, content hydration
│   ├── seo/             Client SEO head helpers
│   └── lib/             API client and shared frontend utilities
├── server/              Fastify API (local + bundled for Vercel)
├── shared/              Shared commerce, PayU, SEO, permission helpers
├── api/                 Vercel serverless entry that mounts the API
├── public/              Brand marks, fonts, hero and product imagery
├── scripts/             Dev orchestrator and API bundle helpers
├── supabase/            Supabase CLI / local project metadata
└── colors.md            Brand color system
```

---

## Features

### For shoppers
- Collection browsing and product detail with variants
- Search, cart drawer, and wishlist
- Checkout with PayU return handling
- Account, orders, and password reset flows
- Light / dark theme with a zero-FOUC boot script
- Editorial pages: About, Stories, Locations, Contact, Legal

### For the brand team
- Admin console (products, categories, orders, shipping, payments audit)
- Coupons, reviews moderation, stories / SEO content, concierge enquiries
- Inventory adjustments and payment reconcile helpers
- Rate-limited contact and checkout endpoints

---

## Getting started

### Prerequisites
- Node.js 20+ (22 works well)
- A Supabase project (or local Postgres + Supabase keys)
- Optional for full commerce: PayU keys, Shiprocket credentials

### 1. Install

```bash
npm install
npm install --prefix server
```

### 2. Environment

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

You will need at least:

- `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ORIGIN` (usually `http://localhost:3000`)
- `API_PUBLIC_URL` / `PORT` (API defaults to `4000`)
- `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- PayU and admin seed values when you want checkout and admin login

Never commit `.env`. Secrets stay local or in your host’s env dashboard.

### 3. Seed (optional)

If your database is empty and seed scripts are configured:

```bash
npm run seed
```

### 4. Run locally

One command starts the Vite storefront and the Fastify API together:

```bash
npm run dev
```

Then open:

- Storefront → [http://localhost:3000](http://localhost:3000)
- API health → [http://localhost:4000/health](http://localhost:4000/health)

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Web + API together |
| `npm run dev:web` | Storefront only |
| `npm run dev:api` | API only |
| `npm run build` | Production web + API bundle |
| `npm run lint` | Typecheck |
| `npm test` | Vitest |

> **Windows note:** the repo folder name includes `&`, which can break naive `vite` shell wrappers. Prefer `npm run dev` / `npm run dev:web` (they call Vite through Node) instead of invoking broken `.cmd` shims by hand.

---

## Production shape

Vercel builds the static storefront into `dist/` and serves the Fastify app through `api/index.js`. Host-aware rewrites support:

- `veloraarougee.com` — storefront
- `admin.veloraarougee.com` — admin console
- `api.veloraarougee.com` — API

Security headers (nosniff, referrer policy, permissions policy) are applied in both the Vite deploy config and the API response hooks.

---

## Brand notes

Veloraa Rougee sits in a warm, velvet-luxury space — cream and champagne surfaces, gold CTAs, rose-gold hover, deep brown type. Wordmarks and monograms live under `public/brand/`. Product and hero photography live under `public/images/`.

If you change the palette, update `colors.md` and the CSS tokens together so the editorial system stays coherent.

---

## Contributing / working style

Keep changes focused. Prefer extending existing services and admin modules over inventing parallel paths. When you touch commerce (cart, checkout, payments, shipping), validate against the Fastify routes in `server/src` and the shared helpers in `shared/`.

Human review still matters for copy, pricing, and published brand claims — this codebase should not invent testimonials, certifications, or numbers.

---

## License

Private project. All rights reserved unless a separate license is added to this repository.
