import { clientIp } from './http';
import { hasDb, query } from './db';

type Entry = { count: number; resetAt: number };

/**
 * Compteur partagé en base (table `rate_limits`, migration 002) : la limite
 * survit aux redéploiements et s'applique à toutes les instances.
 * Repli mémoire si la base est absente ou indisponible.
 */
export async function checkRateLimit(
  key: string,
  options: { windowMs: number; max: number }
): Promise<boolean> {
  const { windowMs, max } = options;

  if (hasDb()) {
    try {
      const rows = await query<{ allowed: boolean }>(
        `WITH cleanup AS (
           DELETE FROM rate_limits WHERE reset_at < now() - interval '1 hour'
         )
         INSERT INTO rate_limits (key, count, reset_at)
         VALUES ($1, 1, now() + ($2::int * interval '1 millisecond'))
         ON CONFLICT (key) DO UPDATE
           SET count = CASE
                 WHEN rate_limits.reset_at <= now() THEN 1
                 ELSE rate_limits.count + 1
               END,
               reset_at = CASE
                 WHEN rate_limits.reset_at <= now()
                   THEN now() + ($2::int * interval '1 millisecond')
                 ELSE rate_limits.reset_at
               END
         RETURNING count <= $3 AS allowed`,
        key,
        windowMs,
        max
      );
      if (rows[0]) return rows[0].allowed === true;
    } catch (err) {
      // Base indisponible ou migration non jouée : on ne bloque pas l'appel.
      console.error('rate-limit error:', err);
    }
  }

  return memoryLimit(key, options);
}

/**
 * Contrôle sans incrémenter le compteur : permet de n'enregistrer que les
 * échecs (une connexion réussie ne consomme pas le quota du compte).
 */
export async function peekRateLimit(
  key: string,
  options: { windowMs: number; max: number }
): Promise<boolean> {
  const { max } = options;

  if (hasDb()) {
    try {
      const rows = await query<{ limited: boolean }>(
        `SELECT (count >= $2 AND reset_at > now()) AS limited
         FROM rate_limits WHERE key = $1`,
        key,
        max
      );
      const row = rows[0];
      // Pas d'entrée : aucune tentative récente pour cette clé.
      return row ? row.limited !== true : true;
    } catch (err) {
      console.error('rate-limit error:', err);
    }
  }

  return memoryPeek(key, max);
}

function memoryPeek(key: string, max: number): boolean {
  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt <= Date.now()) return true;
  return entry.count < max;
}

const memoryHits = new Map<string, Entry>();
const MEMORY_MAX_KEYS = 10_000;

function memoryLimit(key: string, { windowMs, max }: { windowMs: number; max: number }): boolean {
  const now = Date.now();

  if (memoryHits.size > MEMORY_MAX_KEYS) {
    for (const [k, entry] of memoryHits) {
      if (entry.resetAt <= now) memoryHits.delete(k);
    }
  }

  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= max;
}

/**
 * Écritures du back-office : garde-fou par administrateur (session copiée,
 * client qui boucle), pour ne pas marteler la base. Les lectures ne sont pas
 * comptées.
 */
const ADMIN_WRITE_LIMIT = { windowMs: 10 * 60 * 1000, max: 120 };

export function limitAdminWrites(adminId: string): Promise<boolean> {
  return checkRateLimit(`admin-write:${adminId}`, ADMIN_WRITE_LIMIT);
}

/** Limiteur clé sur l'IP du client, pour les routes publiques. */
export function createRateLimiter(options: { windowMs: number; max: number; label: string }) {
  return function check(req: Request): Promise<boolean> {
    return checkRateLimit(`${options.label}:${clientIp(req) || 'unknown'}`, options);
  };
}
