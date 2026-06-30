import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'three';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'recharts';
              }
              if (id.includes('firebase')) {
                return 'firebase';
              }
              if (id.includes('framer-motion')) {
                return 'framer-motion';
              }
              if (id.includes('react-joyride') || id.includes('react-floater')) {
                return 'joyride';
              }
              if (id.includes('react-razorpay')) {
                return 'razorpay';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/audio': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})