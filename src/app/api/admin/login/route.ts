import { cookies } from 'next/headers';
import { error, internalError, json, readJson } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { hasDb, query } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSessionToken, sessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 8, label: 'login' });

export async function POST(req: Request) {
  if (!limiter(req)) {
    return error('Trop de tentatives. Réessayez dans quelques minutes.', 429);
  }

  if (!process.env.SESSION_SECRET) {
    return error('Le back-office n’est pas encore configuré (SESSION_SECRET manquant).', 503);
  }
  if (!hasDb()) {
    return error('Le back-office n’est pas encore configuré (DATABASE_URL manquant).', 503);
  }

  const body = await readJson<{ email?: unknown; password?: unknown }>(req);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) return error('E-mail et mot de passe requis.', 422);

  try {
    const rows = await query<{
      id: string;
      password_hash: string | null;
      status: string;
    }>('SELECT id, password_hash, status FROM admins WHERE lower(email) = $1 OR username = $1', email);

    const admin = rows[0];
    // Même réponse pour un compte absent, bloqué ou un mot de passe erroné.
    if (!admin || admin.status !== 'active' || !admin.password_hash) {
      return error('Identifiants incorrects.', 401);
    }
    if (!verifyPassword(password, admin.password_hash)) {
      return error('Identifiants incorrects.', 401);
    }

    await query('UPDATE admins SET last_login_at = now() WHERE id = $1', admin.id);

    const token = createSessionToken(admin.id);
    (await cookies()).set(sessionCookie(token));

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'login');
  }
}
