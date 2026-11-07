import { getSessionAdmin } from '@/lib/auth';
import { revokeInvitation } from '@/lib/admins';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  try {
    const invitation = await revokeInvitation(id);
    if (!invitation) {
      return error('Invitation introuvable ou déjà utilisée.', 404);
    }

    await recordAudit({
      req,
      admin,
      action: 'admin.invite.revoke',
      target: invitation.email,
      detail: `rôle ${invitation.role}`,
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/invitations/[id]');
  }
}
