import { error, internalError, json, readJson } from '@/lib/http';
import { hasDb, query } from '@/lib/db';
import { requireAdmin, UnauthorizedError } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return error('Non authentifié.', 401);
  }

  const { id } = await params;
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);

  const body = await readJson<{ read?: unknown }>(req);
  if (typeof body?.read !== 'boolean') return error('Champ « read » attendu.', 422);

  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const rows = await query('UPDATE messages SET read = $2 WHERE id = $1 RETURNING id', id, body.read);
    if (rows.length === 0) return error('Message introuvable.', 404);
    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/messages/patch');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) return error('Non authentifié.', 401);
    return error('Non authentifié.', 401);
  }

  const { id } = await params;
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);
  if (!hasDb()) return error('Base de données indisponible.', 503);

  try {
    const rows = await query('DELETE FROM messages WHERE id = $1 RETURNING id', id);
    if (rows.length === 0) return error('Message introuvable.', 404);
    return json({ ok: true });
  } catch (err) {
    return internalError(err, 'admin/messages/delete');
  }
}
