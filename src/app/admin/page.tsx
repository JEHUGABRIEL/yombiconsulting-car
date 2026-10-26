import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox,
  MailOpen,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb, query, serializeMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Stats = {
  unread: string;
  messages: string;
  services: string;
  formations: string;
  actualites: string;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function AdminDashboardPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');

  const configured = hasDb();

  let stats: Stats = { unread: '0', messages: '0', services: '0', formations: '0', actualites: '0' };
  let recent: ReturnType<typeof serializeMessage>[] = [];

  if (configured) {
    try {
      const rows = await query<Stats>(
        `SELECT
           (SELECT count(*) FROM messages WHERE read = false) AS unread,
           (SELECT count(*) FROM messages) AS messages,
           (SELECT count(*) FROM services) AS services,
           (SELECT count(*) FROM formations) AS formations,
           (SELECT count(*) FROM actualites) AS actualites`
      );
      if (rows[0]) stats = rows[0];

      const latest = await query(
        `SELECT id, name, email, phone, company, subject, body, read, created_at
           FROM messages
          ORDER BY created_at DESC
          LIMIT 4`
      );
      recent = latest.map(serializeMessage);
    } catch (err) {
      console.error('dashboard error:', err);
    }
  }

  const cards = [
    {
      label: 'Messages non lus',
      value: stats.unread,
      icon: Inbox,
      href: '/admin/messages',
      highlight: Number(stats.unread) > 0,
    },
    { label: 'Messages reçus', value: stats.messages, icon: MailOpen, href: '/admin/messages' },
    { label: 'Services publiés', value: stats.services, icon: Briefcase, href: '/fr/services' },
    { label: 'Formations', value: stats.formations, icon: GraduationCap, href: '/fr/formations' },
  ];

  return (
    <AdminShell admin={{ email: admin.email, role: admin.role }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-ink tracking-[-0.02em]">Tableau de bord</h1>
          <p className="text-[13.5px] text-mut mt-1">
            Vue d’ensemble de l’activité du site.
          </p>
        </div>
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue text-white text-[13.5px] font-semibold hover:bg-blue-deep transition-colors"
        >
          Consulter les messages
          <ArrowRight size={15} strokeWidth={1.9} />
        </Link>
      </div>

      {!configured && (
        <div className="mb-6 text-[13.5px] leading-relaxed text-[#8A4B08] bg-[#FFFAEB] border border-[#FEDF89] rounded-[12px] px-5 py-4">
          <strong className="font-semibold">Base de données non configurée.</strong> Définissez{' '}
          <code className="font-mono text-[12.5px]">DATABASE_URL</code> et{' '}
          <code className="font-mono text-[12.5px]">SESSION_SECRET</code>, lancez{' '}
          <code className="font-mono text-[12.5px]">npm run db:migrate</code> puis{' '}
          <code className="font-mono text-[12.5px]">npm run db:create-admin</code>.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#FCFDFE] border border-line rounded-[12px] p-5 hover:border-line-2 transition-colors"
            >
              <span className="flex items-center justify-between mb-3">
                <Icon size={17} strokeWidth={1.8} className="text-blue" />
                {card.highlight && (
                  <span className="w-2 h-2 rounded-full bg-blue" aria-label="Nouveaux messages" />
                )}
              </span>
              <span className="block text-[26px] font-bold text-ink leading-none tracking-[-0.02em]">
                {card.value}
              </span>
              <span className="block text-[12.5px] text-mut mt-2">{card.label}</span>
            </Link>
          );
        })}
      </div>

      <section className="bg-[#FCFDFE] border border-line rounded-[12px] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[14.5px] font-semibold text-ink">Derniers messages</h2>
          <Link
            href="/admin/messages"
            className="text-[12.5px] font-semibold text-blue hover:underline"
          >
            Tout voir
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-8 text-[13.5px] text-mut">
            Aucun message reçu pour le moment.
          </p>
        ) : (
          <ul>
            {recent.map((message) => (
              <li key={message.id} className="border-b border-line last:border-b-0">
                <Link
                  href="/admin/messages"
                  className="flex items-start gap-4 px-5 py-4 hover:bg-sky/60 transition-colors"
                >
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      message.read ? 'bg-line-2' : 'bg-blue'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span
                        className={`text-[13.5px] ${
                          message.read ? 'font-medium text-ink' : 'font-semibold text-ink'
                        }`}
                      >
                        {message.name}
                      </span>
                      <span className="text-[12px] text-mut">{message.subject}</span>
                    </span>
                    <span className="block text-[12.5px] text-mut truncate mt-0.5">
                      {message.body}
                    </span>
                  </span>
                  <span className="text-[11.5px] text-mut shrink-0">
                    {message.createdAt
                      ? dateFormatter.format(new Date(message.createdAt))
                      : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
        <Link href="/admin/messages" className="inline-flex items-center gap-1.5 text-blue font-medium hover:underline">
          Boîte de réception <ArrowRight size={14} strokeWidth={1.9} />
        </Link>
        <a
          href="/fr/services"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-mut hover:text-ink"
        >
          Page services publique <ExternalLink size={13} strokeWidth={1.8} />
        </a>
        <a
          href="/fr/actualites"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-mut hover:text-ink"
        >
          {stats.actualites} actualités en ligne <ExternalLink size={13} strokeWidth={1.8} />
        </a>
      </div>
    </AdminShell>
  );
}
