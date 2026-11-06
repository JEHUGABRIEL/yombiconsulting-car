import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { seedCollection } from '@/lib/admin-content';
import { getCollection } from '@/lib/content-config';
import { error, internalError, isSameOrigin, json } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }

  const { collection } = await params;
  const def = getCollection(collection);
  if (!def) return error('Collection inconnue.', 404);

  try {
    const result = await seedCollection(def);
    revalidatePath('/', 'layout');
    return json(result);
  } catch (err) {
    return internalError(err, `admin/content/${def.key}/seed`);
  }
}
