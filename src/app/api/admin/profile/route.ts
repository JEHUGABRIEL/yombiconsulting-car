import { requireAdmin } from '@/lib/auth';
import { hasDb, query } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';
import { isUniqueViolation } from '@/lib/admin-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-zA-Z0-9._-]{3,32}$/;
/** Seules les images servies par Cloudinary sont acceptées (cf. CSP `img-src`). */
const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\//;

const MAX_NAME = 80;

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const body = await readJson<Record<string, unknown>>(req, 8 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const displayName =
    typeof body.displayName === 'string' ? body.displayName.trim() : admin.displayName;
  const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : admin.jobTitle;
  const email = (typeof body.email === 'string' ? body.email : admin.email).trim().toLowerCase();
  const rawUsername =
    typeof body.username === 'string' ? body.username.trim().toLowerCase() : admin.username ?? '';
  const username = rawUsername || null;
  const avatarUrl =
    typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : admin.avatarUrl;

  if (displayName.length > MAX_NAME) {
    return error(`Le nom affiché est limité à ${MAX_NAME} caractères.`, 422);
  }
  if (jobTitle.length > MAX_NAME) {
    return error(`La fonction est limitée à ${MAX_NAME} caractères.`, 422);
  }
  if (email.length > 254 || !EMAIL.test(email)) {
    return error('Adresse e-mail invalide.', 422);
  }
  if (username && !USERNAME.test(username)) {
    return error(
      'Identifiant invalide : 3 à 32 caractères, lettres, chiffres, point, tiret ou souligné.',
      422
    );
  }
  if (avatarUrl && !CLOUDINARY_URL.test(avatarUrl)) {
    return error('Image de profil invalide.', 422);
  }

  const changed: string[] = [];
  if (displayName !== admin.displayName) changed.push('nom affiché');
  if (jobTitle !== admin.jobTitle) changed.push('fonction');
  if (avatarUrl !== admin.avatarUrl) changed.push('photo');
  if (email !== admin.email) changed.push('e-mail');
  if (username !== admin.username) changed.push('identifiant');

  const current = { email, username, displayName, jobTitle, avatarUrl };
  if (changed.length === 0) return json({ ok: true, admin: current });

  try {
    // Unicité vérifiée à la main pour renvoyer un message précis ; la contrainte
    // de la base reste la garantie en cas de course entre deux requêtes.
    const clashes = await query<{ email: string; username: string | null }>(
      `SELECT email, username FROM admins
        WHERE id <> $1
          AND (lower(email) = $2 OR ($3::text IS NOT NULL AND username = $3))`,
      admin.id,
      email,
      username
    );

    if (clashes.some((row) => row.email.trim().toLowerCase() === email)) {
      return error('Cette adresse e-mail est déjà utilisée.', 409);
    }
    if (username && clashes.some((row) => row.username === username)) {
      return error('Cet identifiant est déjà pris.', 409);
    }

    await query(
      `UPDATE admins
          SET email = $2, username = $3, display_name = $4, job_title = $5, avatar_url = $6
        WHERE id = $1`,
      admin.id,
      email,
      username,
      displayName,
      jobTitle,
      avatarUrl
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      return error('Ces informations sont déjà utilisées par un autre compte.', 409);
    }
    return internalError(err, 'admin/profile');
  }

  // Le détail ne contient que les champs modifiés : ni mot de passe, ni valeurs.
  await recordAudit({
    req,
    admin,
    action: 'profile.update',
    target: email,
    detail: changed.join(', '),
  });

  return json({ ok: true, admin: current });
}
