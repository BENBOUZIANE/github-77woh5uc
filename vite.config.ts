import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Construit connect-src pour la CSP à partir de .env :
 * - VITE_CSP_ALLOWED_HTTP_HOSTS (ex: localhost,127.0.0.1,192.168.1.109)
 * - VITE_CSP_ALLOW_PRIVATE_NETWORK_HTTP (true = ajoute http://*:port)
 * - Port déduit de VITE_API_URL (ex: http://localhost:8080/api -> 8080)
 */
function buildCspConnectSrc(env: Record<string, string>): string {
  const base = "'self' https:";
  const apiUrl = env.VITE_API_URL || '';
  let port = '8080';
  try {
    if (apiUrl) {
      const u = new URL(apiUrl);
      if (u.port) port = u.port;
    }
  } catch (_) {}
  const hostsStr = env.VITE_CSP_ALLOWED_HTTP_HOSTS || 'localhost,127.0.0.1';
  const allowPrivate = env.VITE_CSP_ALLOW_PRIVATE_NETWORK_HTTP === 'true';
  const hosts = hostsStr
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
    .map((h) => `http://${h}:${port}`)
    .join(' ');
  let connect = base;
  if (hosts) connect += ' ' + hosts;
  if (allowPrivate) connect += ' http://*:' + port;
  return connect;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const connectSrc = buildCspConnectSrc(env);

  return {
    plugins: [
      react(),
      {
        name: 'html-csp-inject',
        transformIndexHtml(html) {
          return html.replace('__VITE_CSP_CONNECT_SRC__', connectSrc);
        },
      },
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_DEV_PORT || '5137', 10),
      headers: {
        'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSrc}; frame-ancestors 'none';`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
      },
    },
  };
});
