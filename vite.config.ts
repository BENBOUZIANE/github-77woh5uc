import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { randomBytes } from 'crypto';

function cspPlugin(): Plugin {
  let nonce: string;

  return {
    name: 'csp-nonce',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        nonce = randomBytes(16).toString('base64');
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'self'; ` +
          `script-src 'self' 'nonce-${nonce}'; ` +
          `style-src 'self' 'nonce-${nonce}'; ` +
          `img-src 'self' data: https:; ` +
          `font-src 'self' data:; ` +
          `connect-src 'self' http://localhost:8080 http://192.168.1.109:8080 https:; ` +
          `object-src 'none'; ` +
          `base-uri 'self'; ` +
          `form-action 'self'; ` +
          `frame-ancestors 'none';`
        );
        next();
      });
    },
    transformIndexHtml(html) {
      return html.replace(
        /<script/g,
        `<script nonce="${nonce}"`
      ).replace(
        /<style/g,
        `<style nonce="${nonce}"`
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
