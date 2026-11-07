import { getSessionAdmin } from '@/lib/auth';
import { hasDb, query } from '@/lib/db';
import { error, internalError, isSameOrigin, json } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { resetTotp } from '@/lib/mfa';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Réinitialisation par un superadmin : compte ayant perdu son téléphone. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await getSessionAdmin();
  if (!admin) return error('Non authentifié.', 401);
  if (admin.role !== 'superadmin') {
    return error('Accès réservé aux superadministrateurs.', 403);
  }
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  const { id } = await params;
  if (!UUID.test(id)) return error('Administrateur introuvable.', 404);
  // Passer par la réinitialisation d'un autre superadmin évite de contourner
  // ses propres codes de secours.
  if (id === admin.id) {
    return error('Utilisez « Désactiver » depuis votre profil pour votre propre compte.', 409);
  }

  try {
    const rows = await query<{ email: string; totp_enabled_at: string | null }>(
      'SELECT email, totp_enabled_at FROM admins WHERE id = $1',
      id
    );
    const target = rows[0];
    if (!target) return error('Administrateur introuvable.', 404);
    if (!target.totp_enabled_at) {
      return error('La double authentification n’est pas activée sur ce compte.', 409);
    }

    const done = await resetTotp(id);
    if (!done) return error('Administrateur introuvable.', 404);

    await recordAudit({
      req,
      admin,
      action: 'mfa.reset',
      target: target.email,
      detail: 'Réinitialisation par un superadministrateur, sessions fermées',
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/admins/[id]/mfa');
  }
}
