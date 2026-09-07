import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Keep the existing hand-written public/manifest.json; don't emit another.
      manifest: false,
      injectRegister: false,
      workbox: {
        // Precache the full app shell + the bundled diary JSON so an offline
        // user still gets any day's reading. JSON added via globPatterns so
        // Workbox fingerprints it with a content hash at build time.
        globPatterns: ['**/*.{js,css,html,ico,svg,webmanifest,json}', 'branding/**/*.png'],
        // The OG image is only for social-link crawlers — no need to precache it.
        globIgnores: ['**/og-image.png'],
        // Tell Workbox the entry point for navigation requests.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Activation requires an explicit reader action after panels close.
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Google Fonts CSS — stale-while-revalidate.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            // Google Fonts files — cache-first, one-year expiration.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split the heavy vendors so the app shell stays small and the big
        // libraries cache independently
        // across deploys.
        manualChunks: {
          'vendor-headless': ['@headlessui/react'],
          'vendor-dates': ['date-fns'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})

