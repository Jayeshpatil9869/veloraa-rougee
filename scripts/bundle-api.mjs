import { build } from 'esbuild';

try {
  await build({
    entryPoints: ['server/src/api-handler.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',        // CJS is required: Fastify & plugins use require() internally
    packages: 'bundle',   // bundle all deps so Vercel doesn't need node_modules
    outfile: 'api/index.js',
    // No banner needed — CJS uses require() natively
    external: [],         // bundle everything; Vercel's Node runtime provides only built-ins
  });
  console.log('✓ API bundled to api/index.js (CJS format)');
} catch (error) {
  console.error('Failed to bundle API:', error);
  process.exit(1);
}
