import { requireAdmin } from '@/lib/auth';
import { isUploadConfigured, MAX_UPLOAD_BYTES, sniffImageType, uploadImage } from '@/lib/cloudinary';
import { error, internalError, isSameOrigin, json } from '@/lib/http';
import { limitAdminWrites } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return error('Origine non autorisée.', 403);

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return error('Non authentifié.', 401);
  if (!(await limitAdminWrites(admin.id))) {
    return error('Trop d’opérations. Réessayez dans quelques minutes.', 429);
  }
  if (!isUploadConfigured()) {
    return error('Le téléversement d’images n’est pas configuré.', 503);
  }

  // Garde avant lecture : évite de charger un corps démesuré en mémoire.
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + 64 * 1024) {
    return error('Image trop lourde (8 Mo maximum).', 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error('Requête invalide.', 400);
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') return error('Fichier attendu.', 422);
  if (file.size === 0) return error('Fichier vide.', 422);
  if (file.size > MAX_UPLOAD_BYTES) return error('Image trop lourde (8 Mo maximum).', 413);

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = sniffImageType(bytes);
    if (!mimeType) {
      return error('Format non pris en charge (JPEG, PNG, WebP ou AVIF).', 415);
    }

    const { url } = await uploadImage(bytes, mimeType);
    return json({ url }, 201);
  } catch (err) {
    return internalError(err, 'admin/uploads');
  }
}
