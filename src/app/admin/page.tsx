import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox,
  MailOpen,
  Briefcase,
  GraduationCap,
  Newspaper,
  ArrowRight,
  Database,
  ShieldCheck,
  CheckCircle2,
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
          LIMIT 5`
      );
      recent = latest.map(serializeMessage);
    } catch (err) {
      console.error('dashboard error:', err);
    }
  }

  const unread = Number(stats.unread);
  const totalMessages = Number(stats.messages);
  const totalContent = Number(stats.services) + Number(stats.formations) + Number(stats.actualites);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const kpis = [
    {
      label: 'Messages non lus',
      value: unread,
      icon: Inbox,
      accent: 'text-blue-soft',
      ring: 'ring-blue/25',
      bar: 'from-blue to-blue-soft',
      share: totalMessages > 0 ? unread / totalMessages : 0,
      sub: unread > 0 ? 'À traiter' : 'Boîte à jour',
    },
    {
      label: 'Messages reçus',
      value: totalMessages,
      icon: MailOpen,
      accent: 'text-emerald-300',
      ring: 'ring-emerald-400/20',
      bar: 'from-emerald-400 to-teal-300',
      share: 1,
      sub: 'Depuis la mise en ligne',
    },
    {
      label: 'Services publiés',
      value: Number(stats.services),
      icon: Briefcase,
      accent: 'text-amber-300',
      ring: 'ring-amber-400/20',
      bar: 'from-amber-400 to-yellow-300',
      share: totalContent > 0 ? Number(stats.services) / totalContent : 0,
      sub: 'Sur le site public',
    },
    {
      label: 'Formations',
      value: Number(stats.formations),
      icon: GraduationCap,
      accent: 'text-violet-300',
      ring: 'ring-violet-400/20',
      bar: 'from-violet-400 to-fuchsia-300',
      share: totalContent > 0 ? Number(stats.formations) / totalContent : 0,
      sub: `${stats.actualites} actualité${Number(stats.actualites) > 1 ? 's' : ''} en ligne`,
    },
  ];

  const content = [
    { label: 'Services', value: Number(stats.services) },
    { label: 'Formations', value: Number(stats.formations) },
    { label: 'Actualités', value: Number(stats.actualites) },
  ];
  const maxContent = Math.max(...content.map((c) => c.value), 1);

  return (
    <AdminShell admin={{ email: admin.email, role: admin.role }} unread={unread}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.025em] leading-tight">
            {greeting}
          </h1>
          <p className="text-[13px] text-white/40 mt-1.5 capitalize">{today}</p>
        </div>
        <Link href="/admin/messages" className="btn btn-primary px-4 py-2.5 text-[12.5px]">
          Ouvrir les messages
          <ArrowRight size={15} strokeWidth={1.9} />
        </Link>
      </div>

      {!configured && (
        <div className="mb-6 text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[12px] px-5 py-4">
          <strong className="font-semibold">Base de données non configurée.</strong> Définissez{' '}
          <code className="font-mono text-[12px]">DATABASE_URL</code> et{' '}
          <code className="font-mono text-[12px]">SESSION_SECRET</code>, puis appliquez les migrations.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="relative overflow-hidden rounded-[14px] bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/[0.12] hover:bg-white/[0.045] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center bg-white/[0.04] ring-1 ${kpi.ring} ${kpi.accent}`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/25">
                  KPI
                </span>
              </div>
              <p className="text-[26px] sm:text-[30px] font-bold tracking-[-0.03em] tabular-nums leading-none">
                {kpi.value}
              </p>
              <p className="text-[12px] text-white/45 mt-2 font-medium">{kpi.label}</p>
              <div className="mt-3.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${kpi.bar}`}
                  style={{ width: `${Math.max(kpi.share * 100, 6)}%` }}
                />
              </div>
              <p className="text-[10.5px] text-white/25 mt-2">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 rounded-[14px] border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-transparent overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-[13.5px] font-semibold">Messages récents</h2>
            {unread > 0 && (
              <span className="text-[10.5px] font-bold bg-blue/20 text-blue-soft px-2 py-1 rounded-full">
                {unread} non lu{unread > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-6 py-10 text-[13px] text-white/35">
              Aucun message pour le moment. Les demandes envoyées via le formulaire de contact
              apparaîtront ici.
            </p>
          ) : (
            <ul>
              {recent.map((message) => (
                <li key={message.id} className="border-b border-white/[0.05] last:border-b-0">
                  <Link
                    href="/admin/messages"
                    className="flex items-start gap-3 px-6 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        message.read ? 'bg-white/15' : 'bg-blue-soft'
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span
                          className={`text-[13px] ${
                            message.read ? 'text-white/60' : 'text-white font-medium'
                          }`}
                        >
                          {message.name}
                        </span>
                        <span className="text-[11px] text-white/30">{message.subject}</span>
                      </span>
                      <span className="block text-[12px] text-white/35 truncate mt-0.5">
                        {message.body}
                      </span>
                    </span>
                    <span className="text-[10.5px] text-white/25 shrink-0 pt-0.5">
                      {message.createdAt ? dateFormatter.format(new Date(message.createdAt)) : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="px-6 py-3 border-t border-white/[0.06]">
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-blue-soft/80 hover:text-blue-soft transition-colors"
            >
              Gérer les messages <ArrowRight size={13} strokeWidth={1.9} />
            </Link>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-[14px] border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-transparent p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-[8px] bg-amber-400/15 flex items-center justify-center">
                <Newspaper size={14} className="text-amber-300" />
              </span>
              <h2 className="text-[13px] font-semibold">Contenus en ligne</h2>
            </div>

            <div className="space-y-4">
              {content.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] text-white/60">{item.label}</span>
                    <span className="text-[11.5px] text-white/35 tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue to-blue-soft"
                      style={{ width: `${Math.max((item.value / maxContent) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[14px] border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-transparent p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-[8px] bg-emerald-400/15 flex items-center justify-center">
                <ShieldCheck size={14} className="text-emerald-300" />
              </span>
              <h2 className="text-[13px] font-semibold">Session</h2>
            </div>

            <dl className="space-y-3 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Compte</dt>
                <dd className="text-white/70 truncate max-w-[150px]" title={admin.email}>
                  {admin.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Rôle</dt>
                <dd className="text-white/70 capitalize">{admin.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Base</dt>
                <dd className="inline-flex items-center gap-1.5 text-emerald-300">
                  {configured ? (
                    <>
                      <CheckCircle2 size={12} /> Connectée
                    </>
                  ) : (
                    <>
                      <Database size={12} /> Non configurée
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
