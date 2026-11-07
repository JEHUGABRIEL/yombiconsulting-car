import { cookies } from 'next/headers';
import { createSessionToken, getSessionAdmin, sessionCookie } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, limitAdminWrites } from '@/lib/rate-limit';
import { disableTotp } from '@/lib/mfa';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ATTEMPTS = { windowMs: 15 * 60 * 1000, max: 8 };

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await getSessionAdmin();
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const body = await readJson<{ password?: unknown; code?: unknown }>(req, 4 * 1024);
  const password = typeof body?.password === 'string' ? body.password : '';
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!password || !code) {
    return error('Mot de passe et code de vérification requis.', 422);
  }

  if (!(await checkRateLimit(`mfa-disable:${admin.id}`, ATTEMPTS))) {
    return error('Trop de tentatives. Réessayez dans un quart d’heure.', 429);
  }

  try {
    const result = await disableTotp({ adminId: admin.id, password, code });
    if ('error' in result) return error(result.error, result.status);

    // Le changement de version ferme les autres sessions ; celle-ci est réémise.
    (await cookies()).set(
      sessionCookie(createSessionToken(admin.id, result.sessionVersion))
    );

    await recordAudit({
      req,
      admin,
      action: 'mfa.disable',
      target: admin.email,
      detail: 'Sessions fermées',
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/profile/mfa/disable');
  }
}
