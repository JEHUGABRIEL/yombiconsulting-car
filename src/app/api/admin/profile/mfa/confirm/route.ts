import { getSessionAdmin } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, limitAdminWrites } from '@/lib/rate-limit';
import { confirmTotpEnrollment } from '@/lib/mfa';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ATTEMPTS = { windowMs: 15 * 60 * 1000, max: 10 };

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await getSessionAdmin();
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const body = await readJson<{ code?: unknown }>(req, 2 * 1024);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!code) return error('Code à 6 chiffres requis.', 422);

  if (!(await checkRateLimit(`mfa-confirm:${admin.id}`, ATTEMPTS))) {
    return error('Trop de tentatives. Réessayez dans un quart d’heure.', 429);
  }

  try {
    const result = await confirmTotpEnrollment(admin.id, code);
    if ('error' in result) return error(result.error, result.status);

    await recordAudit({
      req,
      admin,
      action: 'mfa.enable',
      target: admin.email,
      detail: `${result.codes.length} codes de secours générés`,
    });

    // Seule occasion où les codes en clair existent : ils ne sont plus jamais
    // relus ensuite (la base n'en garde que l'empreinte).
    return json({ ok: true, recoveryCodes: result.codes });
  } catch (err) {
    return internalError(err, 'admin/profile/mfa/confirm');
  }
}
