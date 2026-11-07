import 'server-only';
import { hasDb, query } from './db';
import { clientIp } from './http';

/**
 * Journal d'audit du back-office.
 * Toute écriture est « best effort » : si la base refuse la trace, l'action
 * demandée n'échoue pas — on ne veut pas bloquer une publication parce que le
 * journal est indisponible.
 */

export type AuditAction =
  | 'login.success'
  | 'login.failure'
  | 'login.blocked'
  | 'logout'
  | 'content.create'
  | 'content.update'
  | 'content.publish'
  | 'content.unpublish'
  | 'content.delete'
  | 'content.seed'
  | 'message.read'
  | 'message.unread'
  | 'message.delete'
  | 'media.upload'
  | 'contact.submit'
  | 'contact.blocked'
  | 'contact.spam'
  | 'profile.update'
  | 'profile.password'
  | 'profile.sessions'
  | 'admin.invite'
  | 'admin.invite.revoke'
  | 'admin.invite.accept'
  | 'admin.role'
  | 'admin.block'
  | 'admin.unblock'
  | 'mfa.enable'
  | 'mfa.disable'
  | 'mfa.reset';

export type AuditTone = 'info' | 'success' | 'warn' | 'danger';

type AuditMeta = { label: string; tone: AuditTone };

const META: Record<AuditAction, AuditMeta> = {
  'login.success': { label: 'Connexion réussie', tone: 'success' },
  'login.failure': { label: 'Connexion refusée', tone: 'danger' },
  'login.blocked': { label: 'Connexion bloquée (trop de tentatives)', tone: 'danger' },
  logout: { label: 'Déconnexion', tone: 'info' },
  'content.create': { label: 'Contenu créé', tone: 'success' },
  'content.update': { label: 'Contenu modifié', tone: 'info' },
  'content.publish': { label: 'Contenu publié', tone: 'success' },
  'content.unpublish': { label: 'Contenu dépublié', tone: 'warn' },
  'content.delete': { label: 'Contenu supprimé', tone: 'danger' },
  'content.seed': { label: 'Import du contenu', tone: 'warn' },
  'message.read': { label: 'Message marqué lu', tone: 'info' },
  'message.unread': { label: 'Message marqué non lu', tone: 'info' },
  'message.delete': { label: 'Message supprimé', tone: 'danger' },
  'media.upload': { label: 'Image téléversée', tone: 'info' },
  'contact.submit': { label: 'Demande de contact reçue', tone: 'success' },
  'contact.blocked': { label: 'Envoi bloqué sur le site public', tone: 'warn' },
  'contact.spam': { label: 'Formulaire piégé (robot)', tone: 'warn' },
  'profile.update': { label: 'Profil modifié', tone: 'info' },
  'profile.password': { label: 'Mot de passe modifié', tone: 'warn' },
  'profile.sessions': { label: 'Sessions révoquées', tone: 'warn' },
  'admin.invite': { label: 'Administrateur invité', tone: 'info' },
  'admin.invite.revoke': { label: 'Invitation révoquée', tone: 'warn' },
  'admin.invite.accept': { label: 'Invitation acceptée', tone: 'success' },
  'admin.role': { label: 'Rôle modifié', tone: 'warn' },
  'admin.block': { label: 'Compte administrateur bloqué', tone: 'danger' },
  'admin.unblock': { label: 'Compte administrateur débloqué', tone: 'success' },
  'mfa.enable': { label: 'Double authentification activée', tone: 'success' },
  'mfa.disable': { label: 'Double authentification désactivée', tone: 'warn' },
  'mfa.reset': { label: 'Double authentification réinitialisée', tone: 'warn' },
};

export function auditMeta(action: string): AuditMeta {
  return META[action as AuditAction] ?? { label: action, tone: 'info' };
}

const clean = (value: string, max: number): string =>
  value.replace(/\s+/g, ' ').trim().slice(0, max);

export async function recordAudit({
  req,
  admin,
  action,
  target = '',
  detail = '',
}: {
  req?: Request;
  admin?: { id: string; email: string } | null;
  action: AuditAction;
  target?: string;
  detail?: string;
}): Promise<void> {
  if (!hasDb()) return;

  try {
    await query(
      `INSERT INTO audit_log (admin_id, admin_email, action, target, detail, ip)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      admin?.id ?? null,
      clean(admin?.email ?? '', 254),
      action,
      clean(target, 160),
      clean(detail, 300),
      req ? clientIp(req) : ''
    );
  } catch (err) {
    // Table absente (migration non appliquée) ou base injoignable : on continue.
    console.error('audit error:', err);
  }
}

/* ── Lecture pour la page Journal ───────────────────────────── */

export const AUDIT_SCOPES = ['all', 'security', 'content', 'messages', 'media'] as const;
export type AuditScope = (typeof AUDIT_SCOPES)[number];

export const SCOPE_LABELS: Record<AuditScope, string> = {
  all: 'Tout',
  security: 'Sécurité',
  content: 'Contenus',
  messages: 'Messages',
  media: 'Médias',
};

/** Conditions constantes (jamais construites depuis l'entrée utilisateur). */
const SCOPE_WHERE: Record<Exclude<AuditScope, 'all'>, string> = {
  security:
    "(action LIKE 'login.%' OR action = 'logout' OR action IN ('contact.blocked', 'contact.spam') OR action LIKE 'profile.%' OR action LIKE 'admin.%' OR action LIKE 'mfa.%')",
  content: "action LIKE 'content.%'",
  messages: "(action LIKE 'message.%' OR action = 'contact.submit')",
  media: "action LIKE 'media.%'",
};

export function normalizeScope(value: unknown): AuditScope {
  return typeof value === 'string' && (AUDIT_SCOPES as readonly string[]).includes(value)
    ? (value as AuditScope)
    : 'all';
}

export type AuditEntry = {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
  createdAt: string;
};

export const AUDIT_PAGE_SIZE = 40;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Identifiant d'administrateur à filtrer, ou `null` si absent ou invalide. */
export function normalizeAdminId(value: unknown): string | null {
  return typeof value === 'string' && UUID.test(value) ? value : null;
}

export type AuditActor = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

/**
 * Identité du compte dont on consulte l'activité. Un compte supprimé garde son
 * e-mail dans le journal (colonne recopiée à chaque écriture).
 */
export async function auditActor(adminId: string): Promise<AuditActor | null> {
  if (!UUID.test(adminId)) return null;

  const rows = await query<{ email: string; display_name: string | null; role: string }>(
    'SELECT email, display_name, role FROM admins WHERE id = $1',
    adminId
  );
  const row = rows[0];
  if (row) {
    return {
      id: adminId,
      email: typeof row.email === 'string' ? row.email : '',
      displayName: typeof row.display_name === 'string' ? row.display_name : '',
      role: typeof row.role === 'string' ? row.role : '',
    };
  }

  const trace = await query<{ admin_email: string }>(
    'SELECT admin_email FROM audit_log WHERE admin_id = $1 ORDER BY id DESC LIMIT 1',
    adminId
  );
  if (!trace[0]) return null;

  return {
    id: adminId,
    email: typeof trace[0].admin_email === 'string' ? trace[0].admin_email : '',
    displayName: '',
    role: '',
  };
}

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';

export async function listAuditLog(
  scope: AuditScope,
  page: number,
  adminId: string | null = null
): Promise<{ entries: AuditEntry[]; total: number; page: number; pages: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (scope !== 'all') conditions.push(SCOPE_WHERE[scope]);
  if (adminId && UUID.test(adminId)) {
    params.push(adminId);
    conditions.push(`admin_id = $${params.length}::uuid`);
  }
  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
  const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

  const counted = await query<{ total: string }>(
    `SELECT count(*)::int AS total FROM audit_log${where}`,
    ...params
  );
  const total = Number(counted[0]?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const current = Math.min(safePage, pages);

  const rows = await query(
    `SELECT id, admin_email, action, target, detail, ip, created_at
       FROM audit_log${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ${AUDIT_PAGE_SIZE} OFFSET ${(current - 1) * AUDIT_PAGE_SIZE}`,
    ...params
  );

  return {
    total,
    page: current,
    pages,
    entries: rows.map((row) => ({
      id: String(row.id),
      adminEmail: typeof row.admin_email === 'string' ? row.admin_email : '',
      action: typeof row.action === 'string' ? row.action : '',
      target: typeof row.target === 'string' ? row.target : '',
      detail: typeof row.detail === 'string' ? row.detail : '',
      ip: typeof row.ip === 'string' ? row.ip : '',
      createdAt: iso(row.created_at),
    })),
  };
}

export async function auditStats(): Promise<{ last24: number; failures: number; total: number }> {
  const rows = await query<{ last24: string; failures: string; total: string }>(
    `SELECT
       count(*) FILTER (WHERE created_at >= now() - interval '24 hours') AS last24,
       count(*) FILTER (WHERE action = 'login.failure' AND created_at >= now() - interval '7 days') AS failures,
       count(*) AS total
     FROM audit_log`
  );
  const row = rows[0];
  return {
    last24: Number(row?.last24 ?? 0),
    failures: Number(row?.failures ?? 0),
    total: Number(row?.total ?? 0),
  };
}
