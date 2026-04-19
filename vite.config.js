import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During local dev: proxy /api/* to the Vercel dev server (port 3000)
      // Run `vercel dev` in one terminal, `npm run dev` in another.
      // Or set VITE_USE_LOCAL_DB=true to skip the proxy and use src/lib/db.js directly.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
