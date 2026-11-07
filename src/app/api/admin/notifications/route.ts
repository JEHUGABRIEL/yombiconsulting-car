import { requireAdmin } from '@/lib/auth';
import { error, isSameOrigin, json, readJson } from '@/lib/http';
import { hasDb } from '@/lib/db';
import { limitAdminWrites } from '@/lib/rate-limit';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotifications,
} from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BIGINT = /^\d{1,18}$/;

/** Alimente la cloche : compteur + dernières alertes. */
export async function GET() {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);

  // Base indisponible ou migration non jouée : la cloche reste silencieuse
  // plutôt que d'afficher une erreur au milieu du back-office.
  if (!hasDb()) return json({ ready: false, unread: 0, notifications: [] });

  try {
    const [unread, notifications] = await Promise.all([
      unreadNotifications(admin.id),
      listNotifications(admin.id),
    ]);
    return json({ ready: true, unread, notifications });
  } catch (err) {
    console.error('notifications read error:', err);
    return json({ ready: false, unread: 0, notifications: [] });
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const body = await readJson<{ all?: unknown; id?: unknown }>(req, 4 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const all = body.all === true;
  const id = typeof body.id === 'string' ? body.id : '';

  if (!all && !BIGINT.test(id)) return error('Notification introuvable.', 422);
  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    if (all) {
      await markAllNotificationsRead(admin.id);
    } else if (!(await markNotificationRead(admin.id, id))) {
      return error('Notification introuvable.', 404);
    }

    return json({ ok: true, unread: await unreadNotifications(admin.id) });
  } catch (err) {
    // Marquer comme lu n'est jamais bloquant : la cloche se resynchronise au
    // prochain passage.
    console.error('notifications write error:', err);
    return error('Notification non enregistrée.', 503);
  }
}
