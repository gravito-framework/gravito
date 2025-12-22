import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  root: './src/client',
  build: {
    outDir: '../../static/build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './src/client/app.ts',
    },
  },
  server: {
    origin: 'http://localhost:5173',
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
})
