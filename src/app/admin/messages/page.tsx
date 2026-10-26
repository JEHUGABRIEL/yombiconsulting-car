import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import MessagesClient, { type AdminMessage } from '@/components/admin/MessagesClient';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb, query, serializeMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');

  const configured = hasDb();
  let messages: AdminMessage[] = [];

  if (configured) {
    try {
      const rows = await query(
        `SELECT id, name, email, phone, company, subject, body, read, created_at
           FROM messages
          ORDER BY created_at DESC
          LIMIT 200`
      );
      messages = rows.map(serializeMessage) as AdminMessage[];
    } catch (err) {
      console.error('admin messages error:', err);
    }
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminShell admin={{ email: admin.email, role: admin.role }} unread={unread}>
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-[-0.025em]">Messages</h1>
        <p className="text-[13px] text-white/40 mt-1.5">
          Demandes reçues via le formulaire de contact du site.
        </p>
      </div>

      {configured ? (
        <MessagesClient initial={messages} />
      ) : (
        <div className="text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[12px] px-5 py-4">
          La base de données n’est pas configurée : les messages ne peuvent pas être affichés.
          Définissez <code className="font-mono text-[12px]">DATABASE_URL</code> puis lancez{' '}
          <code className="font-mono text-[12px]">npm run db:migrate</code>.
        </div>
      )}
    </AdminShell>
  );
}
