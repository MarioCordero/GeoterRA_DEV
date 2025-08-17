// vite.config.js - Optimal for complete virtual host
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                          
  ],
  server: {
    host: 'geoterra.com',
    port: 5173
    // No proxy needed since your virtual host handles everything!
  }
})