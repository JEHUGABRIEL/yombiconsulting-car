import { getSessionAdmin } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, limitAdminWrites } from '@/lib/rate-limit';
import { startTotpEnrollment } from '@/lib/mfa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Vérifications de mot de passe pour l'activation du second facteur. */
const ATTEMPTS = { windowMs: 15 * 60 * 1000, max: 8 };

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await getSessionAdmin();
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const body = await readJson<{ password?: unknown }>(req, 2 * 1024);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password) return error('Mot de passe requis.', 422);
  if (password.length > 256) return error('Mot de passe incorrect.', 401);

  if (!(await checkRateLimit(`mfa-start:${admin.id}`, ATTEMPTS))) {
    return error('Trop de tentatives. Réessayez dans un quart d’heure.', 429);
  }

  try {
    const result = await startTotpEnrollment({
      adminId: admin.id,
      email: admin.email,
      password,
    });
    if ('error' in result) return error(result.error, result.status);

    return json({ ok: true, secret: result.secret, uri: result.uri });
  } catch (err) {
    return internalError(err, 'admin/profile/mfa');
  }
}
