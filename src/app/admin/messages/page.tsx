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

  return (
    <AdminShell admin={{ email: admin.email, role: admin.role }}>
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-ink tracking-[-0.02em]">Messages</h1>
        <p className="text-[13.5px] text-mut mt-1">
          Demandes reçues via le formulaire de contact du site.
        </p>
      </div>

      {configured ? (
        <MessagesClient initial={messages} />
      ) : (
        <div className="text-[13.5px] leading-relaxed text-[#8A4B08] bg-[#FFFAEB] border border-[#FEDF89] rounded-[12px] px-5 py-4">
          La base de données n’est pas configurée : les messages ne peuvent pas être affichés.
          Définissez <code className="font-mono text-[12.5px]">DATABASE_URL</code> puis lancez{' '}
          <code className="font-mono text-[12.5px]">npm run db:migrate</code>.
        </div>
      )}
    </AdminShell>
  );
}
