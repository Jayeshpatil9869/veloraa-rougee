import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const apiTarget = 'http://localhost:4000';
const apiPaths = [
  '/admin',
  '/auth',
  '/account',
  '/products',
  '/categories',
  '/cart',
  '/checkout',
  '/payments',
  '/orders',
  '/stories',
  '/homepage',
  '/locations',
  '/legal',
  '/contact',
  '/reviews',
  '/newsletter',
  '/seo',
  '/health',
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(apiPaths.map((path) => [path, {
      target: apiTarget,
      changeOrigin: true,
      bypass(req) {
        const accept = req.headers.accept ?? '';
        if (accept.includes('text/html')) return req.url;
      },
    }])),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Increase inline limit so small SVGs/fonts don't add round trips
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // GSAP + Lenis animation libs → single async chunk (large, only needed post-hydrate)
          if (id.includes('gsap') || id.includes('lenis')) return 'animation';
          // Framer Motion (motion/react) → own chunk (lazy-loaded by ScrollReveal)
          if (id.includes('motion') || id.includes('framer-motion')) return 'motion';
          // Lucide icons → own chunk
          if (id.includes('lucide')) return 'icons';
          // All admin modules → own async chunk (never loaded on storefront)
          if (id.includes('/src/admin/')) return 'admin';
          // Supabase JS client → separate chunk (only used at runtime for auth)
          if (id.includes('@supabase')) return 'supabase';
          // Other node_modules → vendor chunk
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
