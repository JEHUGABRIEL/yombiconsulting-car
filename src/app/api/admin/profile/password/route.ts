import { cookies } from 'next/headers';
import { createSessionToken, requireAdmin, sessionCookie } from '@/lib/auth';
import { hasDb, query } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, limitAdminWrites } from '@/lib/rate-limit';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/password';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tentatives de changement de mot de passe par compte. */
const ATTEMPTS = { windowMs: 15 * 60 * 1000, max: 6 };

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const body = await readJson<{ currentPassword?: unknown; newPassword?: unknown }>(req, 8 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return error('Mot de passe actuel et nouveau mot de passe requis.', 422);
  }

  if (!(await checkRateLimit(`admin-password:${admin.id}`, ATTEMPTS))) {
    return error('Trop de tentatives. Réessayez dans un quart d’heure.', 429);
  }

  const problem = passwordProblem(newPassword, admin.email);
  if (problem) return error(problem, 422);

  try {
    const rows = await query<{ password_hash: string | null }>(
      'SELECT password_hash FROM admins WHERE id = $1',
      admin.id
    );
    const stored = rows[0]?.password_hash;
    if (!stored) return error('Aucun mot de passe défini pour ce compte.', 409);

    if (!(await verifyPassword(currentPassword, stored))) {
      return error('Mot de passe actuel incorrect.', 422);
    }
    if (await verifyPassword(newPassword, stored)) {
      return error('Le nouveau mot de passe doit être différent de l’actuel.', 422);
    }

    const hash = await hashPassword(newPassword);

    // Changer le mot de passe ferme toutes les sessions ouvertes (y compris une
    // session volée) ; la session courante est réémise avec la nouvelle version.
    const updated = await query<{ session_version: number; password_changed_at: string }>(
      `UPDATE admins
          SET password_hash = $2, password_changed_at = now(),
              session_version = session_version + 1
        WHERE id = $1
        RETURNING session_version, password_changed_at`,
      admin.id,
      hash
    );

    // Le nouveau jeton doit être postérieur à `password_changed_at`, sinon
    // `getSessionAdmin` le refuserait. Une petite marge couvre l'écart d'horloge
    // entre la base et l'application.
    const changedAt = new Date(updated[0]?.password_changed_at ?? 0).getTime();
    const issuedAt = Number.isFinite(changedAt)
      ? Math.max(Date.now(), changedAt + 1000)
      : Date.now();

    (await cookies()).set(
      sessionCookie(
        createSessionToken(admin.id, Number(updated[0]?.session_version ?? 0), issuedAt)
      )
    );

    await recordAudit({ req, admin, action: 'profile.password', target: admin.email });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/profile/password');
  }
}
