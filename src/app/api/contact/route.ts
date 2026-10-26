import { clientIp, error, internalError, json, readJson } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { hasDb, query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5, label: 'contact' });

type Payload = {
  name?: unknown;
  organisation?: unknown;
  contact?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';

export async function POST(req: Request) {
  if (!limiter(req)) {
    return error('Trop de demandes envoyées. Merci de réessayer dans quelques minutes.', 429);
  }

  const body = await readJson<Payload>(req);
  if (!body) return error('Requête invalide.', 400);

  // Champ piège : un humain ne le remplit jamais.
  if (clean(body.company, 80).length > 0) {
    return json({ ok: true });
  }

  const name = clean(body.name, 120);
  const organisation = clean(body.organisation, 160);
  const contact = clean(body.contact, 200);
  const subject = clean(body.subject, 160);
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (name.length < 2) return error('Merci d’indiquer votre nom.', 422);
  if (contact.length < 5) return error('Merci d’indiquer un contact (e-mail ou téléphone).', 422);
  if (message.length < 10) return error('Merci de détailler un peu votre demande.', 422);

  const isEmail = contact.includes('@');
  const email = isEmail ? contact : '';
  const phone = isEmail ? '' : contact;

  try {
    if (!hasDb()) {
      // Pas de base configurée : on expose un échec explicite pour que le
      // formulaire propose la solution de repli (e-mail direct).
      return error('Le service de messagerie est momentanément indisponible.', 503);
    }

    await query(
      `INSERT INTO messages (name, email, phone, company, subject, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      name,
      email,
      phone,
      organisation,
      subject || 'Demande de contact',
      message
    );

    return json({ ok: true }, 201);
  } catch (err) {
    console.error('contact error:', err);
    return internalError(err, 'contact');
  }
}
