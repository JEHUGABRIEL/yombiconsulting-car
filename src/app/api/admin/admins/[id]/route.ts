import { getSessionAdmin } from '@/lib/auth';
import { updateTeamMember } from '@/lib/admins';
import { hasDb, query } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
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
  const body = await readJson<{ role?: unknown; status?: unknown }>(req, 2 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const role = typeof body.role === 'string' ? body.role : undefined;
  const status = typeof body.status === 'string' ? body.status : undefined;
  if (role === undefined && status === undefined) {
    return error('Aucune modification demandée.', 422);
  }

  try {
    // État initial : sert uniquement à décrire les changements dans le journal.
    const current = await query<{ email: string; role: string; status: string }>(
      'SELECT email, role, status FROM admins WHERE id = $1',
      id
    );
    const before = current[0];
    if (!before) return error('Administrateur introuvable.', 404);

    const result = await updateTeamMember({
      actorId: admin.id,
      targetId: id,
      role,
      status,
    });
    if ('error' in result) return error(result.error, result.status);

    const member = result.member;

    if (member.role !== before.role) {
      await recordAudit({
        req,
        admin,
        action: 'admin.role',
        target: member.email,
        detail: `${before.role} → ${member.role}`,
      });
    }

    if (member.status !== before.status) {
      await recordAudit({
        req,
        admin,
        action: member.status === 'blocked' ? 'admin.block' : 'admin.unblock',
        target: member.email,
        detail:
          member.status === 'blocked'
            ? 'Sessions fermées'
            : 'Accès rétabli',
      });
    }

    return json({ ok: true, member });
  } catch (err) {
    return internalError(err, 'admin/admins/[id]');
  }
}
