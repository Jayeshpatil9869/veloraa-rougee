import { build } from 'esbuild';

try {
  await build({
    entryPoints: ['api/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: 'api/index.js',
  });
  console.log('✓ API bundled successfully to api/index.js');
} catch (error) {
  console.error('Failed to bundle API:', error);
  process.exit(1);
}
