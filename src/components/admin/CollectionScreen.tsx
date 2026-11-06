import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ContentManager from '@/components/admin/ContentManager';
import { listRecords, unreadMessages } from '@/lib/admin-content';
import { getSessionAdmin } from '@/lib/auth';
import { COLLECTIONS, type AdminRecord, type CollectionKey } from '@/lib/content-config';
import { hasDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CollectionScreen({ collection }: { collection: CollectionKey }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');

  const def = COLLECTIONS[collection];
  const unread = await unreadMessages();
  const configured = hasDb();

  let records: AdminRecord[] = [];
  let failed = false;

  if (configured) {
    try {
      records = await listRecords(def);
    } catch (err) {
      console.error(`admin ${collection} error:`, err);
      failed = true;
    }
  }

  return (
    <AdminShell admin={{ email: admin.email, role: admin.role }} unread={unread}>
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-[-0.025em]">{def.label}</h1>
        <p className="text-[13px] text-white/55 mt-1.5">{def.description}</p>
      </div>

      {!configured || failed ? (
        <div className="text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[12px] px-5 py-4">
          <strong className="font-semibold">
            {configured ? 'Lecture impossible.' : 'Base de données non configurée.'}
          </strong>{' '}
          {configured
            ? 'La base ne répond pas. Vérifiez DATABASE_URL puis rechargez la page.'
            : 'Définissez DATABASE_URL et SESSION_SECRET, puis lancez npm run db:migrate.'}
        </div>
      ) : (
        <ContentManager def={def} initial={records} />
      )}
    </AdminShell>
  );
}
