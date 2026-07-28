import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Evita CORS en desarrollo y permite usar rutas relativas en el cliente de API.
      '/api': {
        target: 'http://localhost:5153',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5153',
        changeOrigin: true,
      },
    },
  },
})
