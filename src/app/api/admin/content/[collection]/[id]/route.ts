import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { deleteRecord, isUniqueViolation, updateRecord } from '@/lib/admin-content';
import { getCollection, type CollectionDef } from '@/lib/content-config';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = { params: Promise<{ collection: string; id: string }> };

function resolve(collection: string): CollectionDef | null {
  return getCollection(collection);
}

export async function PATCH(req: Request, { params }: Params) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const { collection, id } = await params;
  const def = resolve(collection);
  if (!def) return error('Collection inconnue.', 404);
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);

  const body = await readJson<{ values?: unknown }>(req, 256 * 1024);
  if (!body || typeof body.values !== 'object' || body.values === null) {
    return error('Contenu attendu.', 422);
  }

  try {
    const result = await updateRecord(def, id, body.values);
    if ('error' in result) return error(result.error, 422);
    if ('missing' in result) return error('Contenu introuvable.', 404);

    revalidatePath('/', 'layout');
    return json({ record: result.record });
  } catch (err) {
    if (isUniqueViolation(err)) return error('Ce slug est déjà utilisé.', 409);
    return internalError(err, `admin/content/${def.key}/update`);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const { collection, id } = await params;
  const def = resolve(collection);
  if (!def) return error('Collection inconnue.', 404);
  if (!UUID.test(id)) return error('Identifiant invalide.', 422);

  try {
    const removed = await deleteRecord(def, id);
    if (!removed) return error('Contenu introuvable.', 404);

    revalidatePath('/', 'layout');
    return json({ ok: true });
  } catch (err) {
    return internalError(err, `admin/content/${def.key}/delete`);
  }
}
