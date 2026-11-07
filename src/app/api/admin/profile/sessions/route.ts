import { cookies } from 'next/headers';
import { createSessionToken, requireAdmin, revokeAdminSessions, sessionCookie } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Ferme toutes les sessions du compte, puis rouvre la session courante. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const version = await revokeAdminSessions(admin.id);
    (await cookies()).set(sessionCookie(createSessionToken(admin.id, version)));

    await recordAudit({
      req,
      admin,
      action: 'profile.sessions',
      target: admin.email,
      detail: 'Sessions des autres appareils fermées',
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/profile/sessions');
  }
}
