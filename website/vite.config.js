// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                          
  ],
  server: {
    host: 'geoterra.com',  // Add this
    port: 5173             // Add this
  }
})