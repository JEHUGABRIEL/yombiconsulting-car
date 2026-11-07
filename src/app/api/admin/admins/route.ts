import { getSessionAdmin } from '@/lib/auth';
import { createInvitation, listInvitations, listTeam } from '@/lib/admins';
import { hasDb } from '@/lib/db';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';
import { recordAudit } from '@/lib/audit';
import { sendAdminInvitationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lien d'invitation absolu, fondé sur l'hôte réellement servi. */
function invitationLink(req: Request, token: string): string {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? url.host;
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return `${proto}://${host}/admin/invitation/${token}`;
}

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return error('Non authentifié.', 401);
  if (admin.role !== 'superadmin') {
    return error('Accès réservé aux superadministrateurs.', 403);
  }
  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const [admins, invitations] = await Promise.all([listTeam(), listInvitations()]);
    return json({ admins, invitations, currentId: admin.id });
  } catch (err) {
    return internalError(err, 'admin/admins');
  }
}

export async function POST(req: Request) {
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

  const body = await readJson<{ email?: unknown; role?: unknown }>(req, 4 * 1024);
  if (!body) return error('Requête invalide.', 400);

  const email = typeof body.email === 'string' ? body.email : '';
  const role = typeof body.role === 'string' ? body.role : 'admin';

  try {
    const result = await createInvitation({ email, role, invitedBy: admin });
    if ('error' in result) return error(result.error, result.status);

    const link = invitationLink(req, result.token);

    // L'envoi est « best effort » : un e-mail refusé ne doit pas annuler
    // l'invitation, le lien reste affiché au superadmin.
    const mail = await sendAdminInvitationEmail({
      to: result.invitation.email,
      role: result.invitation.role,
      link,
      invitedBy: admin.email,
      expiresAt: result.invitation.expiresAt,
    });

    // Le lien complet n'est renvoyé qu'ici : seule son empreinte est en base.
    await recordAudit({
      req,
      admin,
      action: 'admin.invite',
      target: result.invitation.email,
      detail: `rôle ${role} · ${mail.ok ? 'e-mail envoyé' : 'lien à transmettre'}`,
    });

    return json({
      ok: true,
      invitation: result.invitation,
      link,
      emailSent: mail.ok,
      emailProblem: mail.ok ? null : mail.error,
    });
  } catch (err) {
    return internalError(err, 'admin/admins');
  }
}
