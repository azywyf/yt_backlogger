import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Forward API calls to the Elysia server so the browser never needs CORS.
  server: { proxy: { '/videos': 'http://localhost:3000' } },
})
