import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest config lives separately from `vite.config.ts` so the PWA plugin
// doesn't rewrite `index.html` or generate a service worker during test runs.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Only component tests — `src/lib/*.test.ts` files continue to run under
    // `node --test` so we don't have to rewrite existing coverage.
    include: ['src/components/**/*.test.{ts,tsx}'],
    globals: true,
    css: true,
  },
});
