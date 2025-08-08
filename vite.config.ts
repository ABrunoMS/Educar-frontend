import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    port: 5000,
  },
  resolve: {
    alias: {
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@metronic': path.resolve(__dirname, './src/_metronic'),
    }
  }
})
