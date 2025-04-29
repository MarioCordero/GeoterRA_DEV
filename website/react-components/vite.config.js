import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'assets/css/[name]-[hash][extname]' // CSS con hash
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp)$/)) {
            return 'assets/images/[name][extname]' // Imágenes SIN hash (nombres originales)
          }
          return 'assets/[name]-[hash][extname]' // Otros assets con hash
        },
        chunkFileNames: 'assets/js/[name]-[hash].js', // JS con hash
        entryFileNames: 'assets/js/[name]-[hash].js' // JS con hash
      }
    },
    emptyOutDir: true
  }
})