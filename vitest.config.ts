import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest config lives separately from `vite.config.ts` so the PWA plugin
// doesn't rewrite `index.html` or generate a service worker during test runs.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Component + App integration tests (all .tsx). The `src/lib/*.test.ts`
    // files continue to run under `node --test`, so we scope to .tsx here.
    include: ['src/**/*.test.tsx'],
    globals: true,
    css: true,
  },
});
