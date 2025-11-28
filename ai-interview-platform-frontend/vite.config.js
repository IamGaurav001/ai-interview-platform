import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://13.60.25.27',
        changeOrigin: true,
        secure: false,
      },
      '/audio': {
        target: 'http://13.60.25.27',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})