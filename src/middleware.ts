import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/* ── Nonce CSP ─────────────────────────────────────────────── */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  // Le nonce est aussi exposé aux layouts via un header interne
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  // Match toutes les routes sauf les fichiers statiques et _next,
  // pour que /services soit redirigé vers /fr/services, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
