import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match toutes les routes sauf les fichiers statiques et _next,
  // pour que /services soit redirigé vers /fr/services, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
