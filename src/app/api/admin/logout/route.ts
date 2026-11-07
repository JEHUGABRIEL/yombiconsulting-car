import { NextResponse } from 'next/server';
import { clearedSessionCookie, getSessionAdmin, revokeAdminSessions } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { isSameOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return new NextResponse('Origine non autorisée.', { status: 403 });
  }

  // Révoque tous les jetons du compte : un cookie copié cesse d'être utilisable.
  // (Le panneau est mono-utilisateur : les autres onglets devront se reconnecter.)
  const admin = await getSessionAdmin();
  if (admin) {
    try {
      await revokeAdminSessions(admin.id);
    } catch (err) {
      console.error('logout revoke error:', err);
    }
    await recordAudit({ req, admin, action: 'logout' });
  }

  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303);
  res.cookies.set(clearedSessionCookie());
  return res;
}
