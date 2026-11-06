import { cookies } from 'next/headers';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { checkRateLimit, createRateLimiter, peekRateLimit } from '@/lib/rate-limit';
import { query } from '@/lib/db';
import { burnPasswordCheck, verifyPassword } from '@/lib/password';
import { createSessionToken, isAuthConfigured, sessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 8, label: 'login' });
const ACCOUNT_LIMIT = { windowMs: 15 * 60 * 1000, max: 10 };

export async function POST(req: Request) {
  // Anti-CSRF : un formulaire d'un autre site ne peut pas connecter un visiteur.
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  // Message unique : ne révèle pas quelle variable d'environnement manque.
  if (!isAuthConfigured()) {
    return error('Le back-office n’est pas encore configuré.', 503);
  }

  const body = await readJson<{ email?: unknown; password?: unknown }>(req, 8 * 1024);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) return error('E-mail et mot de passe requis.', 422);

  // Bornes de taille : évite de hacher des charges arbitrairement grosses.
  if (email.length > 254 || password.length > 256) {
    return error('Identifiants incorrects.', 401);
  }

  // Double limite : par IP (contournable via en-tête) et par compte visé.
  // Le quota du compte ne compte que les échecs : on le consulte ici, on ne
  // l'incrémente qu'après un échec d'authentification.
  const accountKey = `login-account:${email}`;
  const [ipAllowed, accountAllowed] = await Promise.all([
    limiter(req),
    peekRateLimit(accountKey, ACCOUNT_LIMIT),
  ]);
  if (!ipAllowed || !accountAllowed) {
    return error('Trop de tentatives. Réessayez dans quelques minutes.', 429);
  }

  try {
    const rows = await query<{
      id: string;
      password_hash: string | null;
      status: string;
      session_version: number | null;
    }>(
      'SELECT id, password_hash, status, session_version FROM admins WHERE lower(email) = $1 OR username = $1',
      email
    );

    const admin = rows[0];
    // Même réponse pour un compte absent, bloqué ou un mot de passe erroné.
    if (!admin || admin.status !== 'active' || !admin.password_hash) {
      // Coût de hachage équivalent : le chronomètre ne dit pas si le compte existe.
      await burnPasswordCheck(password);
      await checkRateLimit(accountKey, ACCOUNT_LIMIT);
      return error('Identifiants incorrects.', 401);
    }
    if (!(await verifyPassword(password, admin.password_hash))) {
      await checkRateLimit(accountKey, ACCOUNT_LIMIT);
      return error('Identifiants incorrects.', 401);
    }

    await query('UPDATE admins SET last_login_at = now() WHERE id = $1', admin.id);

    const token = createSessionToken(admin.id, Number(admin.session_version ?? 0));
    (await cookies()).set(sessionCookie(token));

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'login');
  }
}
