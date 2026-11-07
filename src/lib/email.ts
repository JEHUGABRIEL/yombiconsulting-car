import 'server-only';
import { ROLE_LABELS, type AdminRole } from './admin-team-shared';

/**
 * Envoi des invitations d'administrateur par e-mail, via l'API HTTP de Resend.
 *
 * Volontairement sans SDK : un `fetch` signé suffit, et l'absence de clé ne doit
 * jamais empêcher la création de l'invitation — le superadmin garde alors le
 * lien à transmettre lui-même.
 */

const ENDPOINT = 'https://api.resend.com/emails';
const SITE = 'Cabinet Yo Mbi Consulting';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

export type InvitationEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: 'not_configured' | 'send_failed' };

/** L'envoi automatique n'est possible que si la clé et l'expéditeur sont définis. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendAdminInvitationEmail({
  to,
  role,
  link,
  invitedBy,
  expiresAt,
}: {
  to: string;
  role: AdminRole;
  link: string;
  invitedBy: string;
  expiresAt: string;
}): Promise<InvitationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: 'not_configured' };

  const roleLabel = ROLE_LABELS[role].toLowerCase();
  const expiry = new Date(expiresAt);
  const expires = Number.isNaN(expiry.getTime()) ? '' : dateFormat.format(expiry);
  const inviter = invitedBy.trim();
  const safeLink = escapeHtml(link);

  const subject = `Invitation au back-office · ${SITE}`;

  const text = [
    `Vous avez été invité(e) à rejoindre le back-office du ${SITE}.`,
    '',
    `Rôle : ${roleLabel}${inviter ? ` — invitation de ${inviter}` : ''}`,
    '',
    'Créez votre compte et choisissez votre mot de passe :',
    link,
    '',
    expires ? `Ce lien est valable jusqu’au ${expires} et ne peut servir qu’une fois.` : 'Ce lien ne peut servir qu’une fois.',
    '',
    'Si vous n’attendiez pas cette invitation, ignorez cet e-mail : aucun compte n’est créé tant que le lien n’est pas utilisé.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#F4F7FC;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E2E9F3;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 0;">
                <p style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.02em;color:#0C2440;">
                  ${SITE}
                </p>
                <p style="margin:4px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5B6C86;">
                  Back-office
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;">
                <h1 style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:21px;line-height:1.35;color:#0C2440;">
                  Vous êtes invité(e) à rejoindre le back-office
                </h1>
                <p style="margin:12px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#5B6C86;">
                  Rôle : <strong style="color:#13294A;">${escapeHtml(roleLabel)}</strong>${
                    inviter ? ` — invitation de ${escapeHtml(inviter)}` : ''
                  }.
                </p>
                <p style="margin:12px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#5B6C86;">
                  Choisissez votre mot de passe pour activer votre accès.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 0;">
                <a href="${safeLink}" style="display:inline-block;background:#2557E6;color:#FFFFFF;text-decoration:none;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;padding:13px 22px;border-radius:9px;">
                  Créer mon compte
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;">
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#5B6C86;">
                  Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
                </p>
                <p style="margin:6px 0 0;font-family:Consolas,Menlo,monospace;font-size:11px;line-height:1.6;color:#2557E6;word-break:break-all;">
                  ${safeLink}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px;">
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.65;color:#5B6C86;">
                  ${
                    expires
                      ? `Ce lien est valable jusqu’au <strong style="color:#13294A;">${escapeHtml(expires)}</strong> et ne peut servir qu’une fois.`
                      : 'Ce lien ne peut servir qu’une fois.'
                  }
                </p>
                <p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.65;color:#8A99B0;">
                  Si vous n’attendiez pas cette invitation, ignorez cet e-mail : aucun compte
                  n’est créé tant que le lien n’est pas utilisé.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok || !data?.id) {
      // Détail côté serveur uniquement : l'interface n'affiche qu'un code.
      console.error(
        'invitation email error:',
        response.status,
        data?.message ?? data?.name ?? 'réponse invalide'
      );
      return { ok: false, error: 'send_failed' };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.error('invitation email error:', err);
    return { ok: false, error: 'send_failed' };
  }
}
