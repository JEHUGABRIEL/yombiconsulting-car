import 'server-only';
import crypto from 'node:crypto';

/**
 * Téléversement d'images vers Cloudinary, sans SDK : la signature est un
 * simple SHA-1 (via `node:crypto`) des paramètres triés, comme le spécifie
 * Cloudinary, et l'envoi se fait avec `fetch` + `FormData`.
 */

/** 8 Mo : au-delà, l'image n'a pas sa place dans un contenu éditorial. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Dossier Cloudinary des médias du site. */
const FOLDER = 'yombi/cms';

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
} as const;

export type ImageMime = keyof typeof MIME_EXTENSIONS;

type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

function readConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isUploadConfigured(): boolean {
  return readConfig() !== null;
}

/**
 * Détecte le format réel à partir des premiers octets : le type déclaré par le
 * navigateur ne prouve rien. SVG est volontairement absent (script embarqué).
 */
export function sniffImageType(bytes: Uint8Array): ImageMime | null {
  const at = (index: number): number => bytes[index] ?? -1;
  const ascii = (start: number, length: number): string =>
    String.fromCharCode(...bytes.subarray(start, start + length));

  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'image/jpeg';
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return 'image/png';
  if (bytes.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp';
  if (bytes.length > 12 && ascii(4, 4) === 'ftyp' && ascii(8, 4) === 'avif') return 'image/avif';
  return null;
}

/** Paramètres triés par clé, concaténés au secret, puis hachés en SHA-1. */
function sign(params: Record<string, string>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(payload + secret).digest('hex');
}

export async function uploadImage(
  bytes: Uint8Array<ArrayBuffer>,
  mimeType: ImageMime
): Promise<{ url: string; publicId: string }> {
  const config = readConfig();
  if (!config) throw new Error('Cloudinary is not configured');

  const timestamp = String(Math.floor(Date.now() / 1000));
  // Identifiant unique imposé : sans lui, deux fichiers de même nom
  // pourraient s'écraser chez Cloudinary.
  const publicId = `${FOLDER}/${crypto.randomUUID()}`;
  const signature = sign({ public_id: publicId, timestamp }, config.apiSecret);

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType }), `upload.${MIME_EXTENSIONS[mimeType]}`);
  form.append('api_key', config.apiKey);
  form.append('timestamp', timestamp);
  form.append('public_id', publicId);
  form.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form, cache: 'no-store' });

  if (!res.ok) {
    // Le corps d'erreur Cloudinary ne contient pas de secret : utile en logs.
    const detail = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { secure_url?: unknown; public_id?: unknown };
  const url = typeof data.secure_url === 'string' ? data.secure_url : '';
  // Une réponse détournée ne doit pas pouvoir injecter une URL arbitraire.
  if (!url.startsWith('https://res.cloudinary.com/')) {
    throw new Error('Unexpected Cloudinary response');
  }

  return { url, publicId: typeof data.public_id === 'string' ? data.public_id : '' };
}
