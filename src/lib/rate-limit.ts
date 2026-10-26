import { clientIp } from './http';

type Entry = { count: number; resetAt: number };

/**
 * Limiteur en mémoire : suffisant pour protéger le login d'une instance,
 * mais remis à zéro à chaque démarrage et non partagé entre instances.
 */
export function createRateLimiter(options: { windowMs: number; max: number; label: string }) {
  const { windowMs, max, label } = options;
  const hits = new Map<string, Entry>();

  return function check(req: Request): boolean {
    const key = `${label}:${clientIp(req) || 'unknown'}`;
    const now = Date.now();

    for (const [k, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    entry.count += 1;
    return entry.count <= max;
  };
}
