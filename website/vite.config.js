import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const envDir = isProduction
    ? path.resolve(__dirname, '../../')
    : path.resolve(__dirname, 'src/config');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    envDir,
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['geoterra.inii.ucr.ac.cr', 'localhost', '127.0.0.1'],
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    }
  };
});