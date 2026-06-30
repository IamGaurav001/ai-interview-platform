import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        ...(isProduction ? {
          'react-dom/client': 'react-dom/profiling',
          'react-dom': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        } : {})
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