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
        entryFileNames: 'assets/js/GeoterRA-ReactComponents.js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: ({ name }) => {
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/GeoterRA-ReactComponents.css'
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name ?? '')) {
            return 'assets/fonts/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
    outDir: 'dist', // Asegúrate de que la salida vaya a la carpeta dist
    emptyOutDir: true, // Limpia el directorio de salida antes de construir
  },
  base: './', // Esto es importante para rutas relativas
})