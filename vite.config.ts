import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000,
    target: 'es2020',
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
} as any);
