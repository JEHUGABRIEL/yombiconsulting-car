import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/* ── Nonce CSP ─────────────────────────────────────────────── */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export default function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  // Le nonce est transmis au rendu Next via les en-têtes de requête internes,
  // mais n'est jamais exposé comme en-tête de réponse au navigateur.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = intlMiddleware(
    new NextRequest(request, { headers: requestHeaders })
  );
  response.headers.set('Content-Security-Policy', csp);
  response.headers.delete('x-nonce');

  return response;
}

export const config = {
  // Match toutes les routes sauf les fichiers statiques et _next,
  // pour que /services soit redirigé vers /fr/services, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
