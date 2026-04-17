import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keep the existing hand-written public/manifest.json; don't emit another.
      manifest: false,
      injectRegister: 'auto',
      workbox: {
        // Precache the full app shell + the 346-entry diary JSON so an offline
        // user still gets any day's reading. JSON added via globPatterns so
        // Workbox fingerprints it with a content hash at build time.
        globPatterns: ['**/*.{js,css,html,ico,svg,webmanifest,json}', 'branding/**/*.png'],
        // Skip the oversized crawler/screenshot images + CSS hero art; those
        // are runtime-cached below on first visit instead of precached up-front.
        globIgnores: [
          '**/og-image.png',
          '**/screenshot-*.png',
          '**/art/**',
          '**/branding/favicon-transparent.png',
          '**/branding/logo-transparent.png',
        ],
        // Tell Workbox the entry point for navigation requests.
        navigateFallback: '/index.html',
        // Kick the old SW immediately so updates don't wait on a full tab close.
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Same-origin hero art + any large branding PNG not in precache.
            // Cache-first on first visit so offline users still get the full
            // UI.
            urlPattern: /\/(art|branding)\/.*\.(png|svg|jpg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Live Supabase REST reads — stale-while-revalidate: serve from
            // cache instantly, refresh in the background for next visit.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-rest',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Daily-render PNGs — cache-first; each date's image is effectively
            // immutable once uploaded.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/daily-renders\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'daily-renders',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
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
        // libraries (framer-motion, Supabase, date-fns) cache independently
        // across deploys.
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-headless': ['@headlessui/react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-dates': ['date-fns'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})

