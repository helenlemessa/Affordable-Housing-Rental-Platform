import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react({
      include: ['**/*.jsx', '**/*.js'] // Allow both JS and JSX
    })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
         
      }
    }
  }
})
