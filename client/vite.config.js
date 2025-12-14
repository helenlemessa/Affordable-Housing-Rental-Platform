import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    include: ['**/*.jsx', '**/*.js']
  })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Log the warning to see which module is problematic
        console.log('Rollup warning:', warning.code, warning.message);
        
        if (warning.code === 'UNRESOLVED_IMPORT' || 
            warning.code === 'MISSING_GLOBAL_NAME' ||
            warning.message.includes('externalize')) {
          console.log('Problematic module might be:', warning.exporter || warning.id);
        }
        
        // Call the default warn function
        warn(warning);
      }
    }
  }
})