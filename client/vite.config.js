import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    include: ['**/*.jsx', '**/*.js'] // Allow both JS and JSX
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
      external: [
        // Node.js built-in modules
        'fs', 'path', 'os', 'crypto', 'stream', 'http', 'https', 'zlib', 'url',
        'util', 'events', 'buffer', 'querystring', 'child_process', 'net', 'tls',
        'dns', 'assert', 'constants', 'domain', 'module', 'punycode', 'readline',
        'repl', 'string_decoder', 'sys', 'timers', 'tty', 'vm', 'worker_threads',
        
        // Node.js prefixed modules
        'node:fs', 'node:path', 'node:os', 'node:crypto', 'node:stream',
        'node:http', 'node:https', 'node:zlib', 'node:url', 'node:util',
        'node:events', 'node:buffer', 'node:querystring', 'node:child_process',
        
        // Common external packages
        'aws-sdk', 'mock-aws-sdk', 'nock', 'bcrypt', 'bcryptjs',
        'sharp', 'canvas', 'electron', 'pg', 'pg-native', 'mysql',
        'mysql2', 'sqlite3', 'tedious', 'oracledb', 'mariadb',
        'mongodb', 'mongoose', 'redis', 'ioredis', 'memcached',
        'prisma', '@prisma/client', 'typeorm', 'sequelize',
        'express', 'koa', 'fastify', 'hapi', 'next',
        'webpack', 'rollup', 'vite', 'parcel',
        'eslint', 'prettier', 'jest', 'mocha', 'chai',
        'sinon', 'cypress', 'puppeteer', 'playwright',
        
        // Add specific problematic packages from your dependencies
        // Check your package.json for any backend/Node.js specific packages
      ],
      
      // Add this to catch and log the specific module causing issues
      onwarn(warning, defaultHandler) {
        // Log detailed warning information
        if (warning.code === 'UNRESOLVED_IMPORT' || 
            warning.message.includes('externalize') ||
            warning.code === 'MISSING_GLOBAL_NAME') {
          console.error('⚠️ Vite build warning details:');
          console.error('Code:', warning.code);
          console.error('Message:', warning.message);
          console.error('ID/Exporter:', warning.id || warning.exporter);
          console.error('Importer:', warning.importer);
          console.error('---');
        }
        defaultHandler(warning);
      }
    }
  },
  // Optimize dependencies to exclude Node.js modules
  optimizeDeps: {
    exclude: [
      'fs', 'path', 'os', 'crypto', 'stream', 'http', 'https',
      'aws-sdk', 'bcrypt', 'pg', 'mysql', 'sqlite3', 'mongodb',
      'prisma', '@prisma/client', 'express', 'webpack',
    ],
  },
  // Define global variables for browser environment
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'global': 'window',
    'process.browser': true,
    'process.version': '""',
  },
})