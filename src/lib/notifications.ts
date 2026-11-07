import 'server-only';
import { hasDb, query } from './db';
import { auditMeta, type AuditAction } from './audit';
import type { NotificationItem, NotificationTone } from './notification-shared';

/**
 * Notifications du back-office.
 *
 * Les alertes ne sont pas une seconde copie du journal : elles sont dérivées
 * d'`audit_log`, qui enregistre déjà chaque opération sensible. `NOTIFY_ACTIONS`
 * choisit celles qui méritent de faire sonner la cloche ; `notification_reads`
 * retient, par administrateur, ce qui a déjà été lu.
 */

/** Fenêtre d'affichage de la cloche (le journal conserve tout). */
const WINDOW = "30 days";

const NOTIFY_ACTIONS = [
  'login.success',
  'login.failure',
  'login.blocked',
  'content.create',
  'content.update',
  'content.publish',
  'content.unpublish',
  'content.delete',
  'content.seed',
  'message.delete',
  'media.upload',
  'contact.submit',
  'contact.blocked',
  'profile.update',
  'profile.password',
  'profile.sessions',
  'admin.invite',
  'admin.invite.revoke',
  'admin.invite.accept',
  'admin.role',
  'admin.block',
  'admin.unblock',
  'mfa.enable',
  'mfa.disable',
  'mfa.reset',
] as const satisfies readonly AuditAction[];

const PUBLIC_ACTIONS = new Set<string>(['contact.submit', 'contact.blocked']);

const ADMIN_PAGES = new Set<string>(['services', 'formations', 'actualites']);

/** Lien vers l'écran qui permet d'agir sur l'alerte. */
export function notificationHref(action: string, target: string): string {
  if (action === 'contact.submit' || action === 'message.delete') return '/admin/messages';
  if (action === 'mfa.reset') return '/admin/administrateurs';
  if (action.startsWith('mfa.')) return '/admin/profil';
  if (action === 'profile.update' || action.startsWith('profile.')) return '/admin/profil';
  if (action.startsWith('admin.')) return '/admin/administrateurs';
  if (action.startsWith('content.')) {
    const collection = target.split('/')[0];
    return ADMIN_PAGES.has(collection) ? `/admin/${collection}` : '/admin/journal?scope=content';
  }
  if (action.startsWith('media.')) return '/admin/journal?scope=media';
  if (action.startsWith('login.') || action === 'contact.blocked') {
    return '/admin/journal?scope=security';
  }
  return '/admin/journal';
}

/** Libellé, gravité et destination d'une entrée d'audit côté cloche. */
function notificationMeta(action: string, target: string): { label: string; tone: NotificationTone; href: string } {
  const meta = auditMeta(action);
  return {
    label: meta.label,
    tone: meta.tone as NotificationTone,
    href: notificationHref(action, target),
  };
}

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Nombre d'alertes non lues pour cet administrateur. */
export async function unreadNotifications(adminId: string): Promise<number> {
  if (!hasDb()) return 0;

  const rows = await query<{ unread: string | number }>(
    `SELECT count(*)::int AS unread
       FROM audit_log a
      WHERE a.action = ANY($1::text[])
        AND a.created_at > now() - interval '${WINDOW}'
        AND NOT EXISTS (
          SELECT 1 FROM notification_reads r
           WHERE r.audit_id = a.id AND r.admin_id = $2
        )`,
    NOTIFY_ACTIONS,
    adminId
  );

  return Number(rows[0]?.unread ?? 0);
}

/** Dernières alertes, lues et non lues, de la plus récente à la plus ancienne. */
export async function listNotifications(adminId: string, limit = 8): Promise<NotificationItem[]> {
  if (!hasDb()) return [];

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 50) : 8;

  const rows = await query(
    `SELECT a.id, a.action, a.target, a.detail, a.admin_email, a.created_at,
            EXISTS (
              SELECT 1 FROM notification_reads r
               WHERE r.audit_id = a.id AND r.admin_id = $2
            ) AS read
       FROM audit_log a
      WHERE a.action = ANY($1::text[])
        AND a.created_at > now() - interval '${WINDOW}'
      ORDER BY a.id DESC
      LIMIT $3`,
    NOTIFY_ACTIONS,
    adminId,
    safeLimit
  );

  return rows.map((row) => {
    const action = str(row.action);
    const target = str(row.target);
    const meta = notificationMeta(action, target);

    return {
      id: String(row.id),
      action,
      label: meta.label,
      tone: meta.tone,
      href: meta.href,
      detail: str(row.detail),
      actor: str(row.admin_email),
      source: PUBLIC_ACTIONS.has(action) ? 'public' : 'admin',
      read: row.read === true,
      createdAt: iso(row.created_at),
    };
  });
}

/** Marque une alerte comme lue. `false` si l'entrée n'existe pas ou n'est pas notifiable. */
export async function markNotificationRead(adminId: string, auditId: string): Promise<boolean> {
  if (!hasDb()) return false;

  const rows = await query(
    `INSERT INTO notification_reads (audit_id, admin_id)
     SELECT a.id, $2::uuid
       FROM audit_log a
      WHERE a.id = $3::bigint
        AND a.action = ANY($1::text[])
     ON CONFLICT (audit_id, admin_id) DO NOTHING
     RETURNING audit_id`,
    NOTIFY_ACTIONS,
    adminId,
    auditId
  );

  return rows.length > 0;
}

/** Marque toutes les alertes de la fenêtre comme lues pour cet administrateur. */
export async function markAllNotificationsRead(adminId: string): Promise<number> {
  if (!hasDb()) return 0;

  const rows = await query(
    `INSERT INTO notification_reads (audit_id, admin_id)
     SELECT a.id, $2::uuid
       FROM audit_log a
      WHERE a.action = ANY($1::text[])
        AND a.created_at > now() - interval '${WINDOW}'
     ON CONFLICT (audit_id, admin_id) DO NOTHING
     RETURNING audit_id`,
    NOTIFY_ACTIONS,
    adminId
  );

  return rows.length;
}
