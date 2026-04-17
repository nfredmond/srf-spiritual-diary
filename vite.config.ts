import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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

