import { error, internalError, json } from '@/lib/http';
import { hasDb, query, serializeMessage } from '@/lib/db';
import { requireAdmin, UnauthorizedError } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    if (!hasDb()) return json({ messages: [] });

    const rows = await query(
      `SELECT id, name, email, phone, company, subject, body, read, created_at
         FROM messages
        ORDER BY created_at DESC
        LIMIT 200`
    );

    return json({ messages: rows.map(serializeMessage) });
  } catch (err) {
    if (err instanceof UnauthorizedError) return error('Non authentifié.', 401);
    return internalError(err, 'admin/messages');
  }
}
