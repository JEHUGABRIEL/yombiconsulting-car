import { cookies } from 'next/headers';
import { acceptInvitation } from '@/lib/admins';
import { createSessionToken, isAuthConfigured, sessionCookie } from '@/lib/auth';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Un lien d'invitation ne doit pas pouvoir être deviné par force brute. */
const limiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, label: 'invite-accept' });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  if (!isAuthConfigured()) {
    return error('La connexion est momentanément indisponible.', 503);
  }

  if (!(await limiter(req))) {
    return error('Trop de tentatives. Réessayez dans quelques minutes.', 429);
  }

  const body = await readJson<Record<string, unknown>>(req, 8 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName : '';
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token) return error('Lien d’invitation invalide.', 400);
  if (!password) return error('Mot de passe requis.', 422);

  try {
    const result = await acceptInvitation({ token, displayName, username, password });
    if ('error' in result) return error(result.error, result.status);

    // Le compte vient d'être créé : le jeton doit être postérieur à
    // `password_changed_at`, sinon `getSessionAdmin` refuserait la session.
    const changedAt = new Date(result.admin.passwordChangedAt).getTime();
    const issuedAt = Number.isFinite(changedAt)
      ? Math.max(Date.now(), changedAt + 1000)
      : Date.now();

    (await cookies()).set(
      sessionCookie(
        createSessionToken(result.admin.id, result.admin.sessionVersion, issuedAt)
      )
    );

    await recordAudit({
      req,
      admin: { id: result.admin.id, email: result.admin.email },
      action: 'admin.invite.accept',
      target: result.admin.email,
      detail: `rôle ${result.admin.role}`,
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/invitation/accept');
  }
}
