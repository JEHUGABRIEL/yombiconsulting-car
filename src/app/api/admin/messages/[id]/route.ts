import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { hasDb, query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { limitAdminWrites } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const { id } = await params;
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);

  const body = await readJson<{ read?: unknown }>(req, 4 * 1024);
  if (typeof body?.read !== 'boolean') return error('Champ « read » attendu.', 422);

  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const rows = await query('UPDATE messages SET read = $2 WHERE id = $1 RETURNING id', id, body.read);
    if (rows.length === 0) return error('Message introuvable.', 404);

    await recordAudit({
      req,
      admin,
      action: body.read ? 'message.read' : 'message.unread',
      target: id,
    });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/messages/patch');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const { id } = await params;
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);
  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const rows = await query('DELETE FROM messages WHERE id = $1 RETURNING id', id);
    if (rows.length === 0) return error('Message introuvable.', 404);

    await recordAudit({ req, admin, action: 'message.delete', target: id });

    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/messages/delete');
  }
}
