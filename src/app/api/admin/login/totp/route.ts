import { cookies } from 'next/headers';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, createRateLimiter, peekRateLimit } from '@/lib/rate-limit';
import { query } from '@/lib/db';
import { recordAudit } from '@/lib/audit';
import {
  createSessionToken,
  isAuthConfigured,
  parseMfaChallenge,
  sessionCookie,
} from '@/lib/auth';
import { verifySecondFactor } from '@/lib/mfa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Le code à 6 chiffres se devine : plafond par IP et par compte. */
const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20, label: 'login-totp' });
const ACCOUNT_LIMIT = { windowMs: 15 * 60 * 1000, max: 10 };

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);
  if (!isAuthConfigured()) {
    return error('Le back-office n’est pas encore configuré.', 503);
  }

  const body = await readJson<{ challenge?: unknown; code?: unknown }>(req, 4 * 1024);
  const challenge = typeof body?.challenge === 'string' ? body.challenge : '';
  const code = typeof body?.code === 'string' ? body.code.trim() : '';

  if (!challenge || !code) return error('Code de vérification requis.', 422);
  if (code.length > 32) return error('Code de vérification invalide.', 401);

  // Le défi prouve que le mot de passe a été vérifié il y a moins de 5 minutes.
  const adminId = parseMfaChallenge(challenge);
  if (!adminId) {
    return error('Session de connexion expirée. Recommencez la connexion.', 401);
  }

  const accountKey = `login-totp-account:${adminId}`;
  const [ipAllowed, accountAllowed] = await Promise.all([
    limiter(req),
    peekRateLimit(accountKey, ACCOUNT_LIMIT),
  ]);
  if (!ipAllowed || !accountAllowed) {
    await recordAudit({
      req,
      action: 'login.blocked',
      target: adminId,
      detail: 'Trop de codes de vérification essayés',
    });
    return error('Trop de tentatives. Réessayez dans quelques minutes.', 429);
  }

  try {
    const rows = await query<{
      id: string;
      email: string;
      status: string;
      session_version: number | null;
      totp_secret: string | null;
      totp_enabled_at: string | null;
      totp_last_step: string | number | null;
    }>(
      `SELECT id, email, status, session_version, totp_secret, totp_enabled_at, totp_last_step
         FROM admins WHERE id = $1`,
      adminId
    );

    const admin = rows[0];
    if (!admin || admin.status !== 'active' || !admin.totp_enabled_at) {
      return error('Session de connexion expirée. Recommencez la connexion.', 401);
    }

    const check = await verifySecondFactor({
      adminId: admin.id,
      storedSecret: admin.totp_secret,
      lastStep: Number(admin.totp_last_step ?? 0),
      code,
    });

    if (!check.ok) {
      await checkRateLimit(accountKey, ACCOUNT_LIMIT);
      await recordAudit({
        req,
        action: 'login.failure',
        target: admin.email,
        detail: 'Code de vérification erroné',
      });
      return error('Code invalide ou déjà utilisé.', 401);
    }

    await query('UPDATE admins SET last_login_at = now() WHERE id = $1', admin.id);

    const token = createSessionToken(admin.id, Number(admin.session_version ?? 0));
    (await cookies()).set(sessionCookie(token));

    await recordAudit({
      req,
      admin: { id: admin.id, email: admin.email },
      action: 'login.success',
      detail:
        check.method === 'recovery'
          ? `Code de secours utilisé (${check.remainingCodes} restant${check.remainingCodes > 1 ? 's' : ''})`
          : 'Double authentification validée',
    });

    return json({ ok: true, remainingCodes: check.remainingCodes });
  } catch (err) {
    return internalError(err, 'admin/login/totp');
  }
}
