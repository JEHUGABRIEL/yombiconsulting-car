import { NextResponse } from 'next/server';
import { ipAddress } from '@vercel/functions';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Ne fuite le détail d'une exception qu'en développement. */
export function internalError(err: unknown, context: string) {
  console.error(`${context} error:`, err);
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json(
    { error: isDev && err instanceof Error ? err.message : 'Erreur interne du serveur' },
    { status: 500 }
  );
}

/**
 * IP du client, telle qu'établie par la plateforme (`x-real-ip`, positionné par
 * le proxy Vercel et non falsifiable par le navigateur). Hors Vercel, aucune IP
 * fiable n'existe : on renvoie une chaîne vide, ce qui fait partager un même
 * quota plutôt que de croire un en-tête fourni par le client.
 */
export function clientIp(req: Request): string {
  return ipAddress(req) ?? '';
}

/**
 * Anti-CSRF sur les requêtes mutantes : un navigateur envoie `Origin`, qui doit
 * correspondre à l'hôte servi. Les clients non-navigateur (curl, scripts) n'en
 * envoient pas : on les laisse passer, `SameSite=Lax` restant la seconde barrière.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Taille maximale par défaut d'un corps JSON (64 Kio). */
export const MAX_JSON_BYTES = 64 * 1024;

/**
 * Lit un corps JSON en tolérant un corps vide, malformé ou trop volumineux.
 * La lecture est bornée : au-delà de `maxBytes`, le flux est interrompu et
 * `null` est renvoyé, sans jamais charger la charge complète en mémoire.
 */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
  maxBytes: number = MAX_JSON_BYTES
): Promise<T | null> {
  // Un formulaire HTML (`text/plain`, `x-www-form-urlencoded`) ne peut pas se
  // faire passer pour un appel JSON de l'application.
  const contentType = req.headers.get('content-type');
  if (contentType) {
    const media = contentType.split(';')[0].trim().toLowerCase();
    if (media !== 'application/json' && !media.endsWith('+json')) return null;
  }

  // En-tête déclaratif : rejet immédiat, sans lire le corps.
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!req.body) return null;

  try {
    const reader = req.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();

    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
