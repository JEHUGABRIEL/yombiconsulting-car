import { revalidatePath } from 'next/cache';
import { requireAdmin, UnauthorizedError } from '@/lib/auth';
import { createRecord, isUniqueViolation, listRecords } from '@/lib/admin-content';
import { getCollection, type CollectionDef } from '@/lib/content-config';
import { error, internalError, isSameOrigin, json, readJson } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ collection: string }> };

function resolve(params: { collection: string }): CollectionDef | null {
  return getCollection(params.collection);
}

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) return error('Non authentifié.', 401);
    return error('Non authentifié.', 401);
  }

  const def = resolve(await params);
  if (!def) return error('Collection inconnue.', 404);

  try {
    return json({ records: await listRecords(def) });
  } catch (err) {
    return internalError(err, `admin/content/${def.key}`);
  }
}

export async function POST(req: Request, { params }: Params) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const def = resolve(await params);
  if (!def) return error('Collection inconnue.', 404);

  const body = await readJson<{ values?: unknown }>(req, 256 * 1024);
  if (!body || typeof body.values !== 'object' || body.values === null) {
    return error('Contenu attendu.', 422);
  }

  try {
    const result = await createRecord(def, body.values);
    if ('error' in result) return error(result.error, 422);

    revalidatePath('/', 'layout');
    return json({ record: result.record }, 201);
  } catch (err) {
    if (isUniqueViolation(err)) return error('Ce slug est déjà utilisé.', 409);
    return internalError(err, `admin/content/${def.key}/create`);
  }
}
