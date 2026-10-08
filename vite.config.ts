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
});

