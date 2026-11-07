import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Ban,
  Bug,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  ImageUp,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  MonitorSmartphone,
  Pencil,
  Plus,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  UserRound,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { unreadMessages } from '@/lib/admin-content';
import {
  AUDIT_SCOPES,
  SCOPE_LABELS,
  auditActor,
  auditMeta,
  auditStats,
  listAuditLog,
  normalizeAdminId,
  normalizeScope,
  type AuditActor,
  type AuditEntry,
  type AuditScope,
} from '@/lib/audit';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const ICONS: Record<string, typeof ScrollText> = {
  'login.success': LogIn,
  'login.failure': ShieldAlert,
  'login.blocked': ShieldAlert,
  logout: LogOut,
  'content.create': Plus,
  'content.update': Pencil,
  'content.publish': Eye,
  'content.unpublish': EyeOff,
  'content.delete': Trash2,
  'content.seed': Download,
  'message.read': MailOpen,
  'message.unread': Mail,
  'message.delete': Trash2,
  'media.upload': ImageUp,
  'contact.submit': Mail,
  'contact.blocked': Ban,
  'contact.spam': Bug,
  'profile.update': UserRound,
  'profile.password': KeyRound,
  'profile.sessions': MonitorSmartphone,
  'admin.invite': UserPlus,
  'admin.invite.revoke': UserMinus,
  'admin.invite.accept': UserCheck,
  'admin.role': ShieldCheck,
  'admin.block': Ban,
  'admin.unblock': ShieldCheck,
  'mfa.enable': Fingerprint,
  'mfa.disable': Fingerprint,
  'mfa.reset': RotateCcw,
};

const TONES: Record<string, string> = {
  info: 'bg-white/[0.06] text-white/70',
  success: 'bg-emerald-500/15 text-emerald-300',
  warn: 'bg-amber-400/15 text-amber-200',
  danger: 'bg-red-500/15 text-red-300',
};

const QUERY = '/admin/journal';

function journalHref(scope: AuditScope, page = 1, adminId: string | null = null): string {
  const params = new URLSearchParams();
  if (scope !== 'all') params.set('scope', scope);
  if (page > 1) params.set('page', String(page));
  if (adminId) params.set('admin', adminId);
  const query = params.toString();
  return query ? `${QUERY}?${query}` : QUERY;
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">{label}</p>
      <p className="text-[24px] font-bold tracking-[-0.03em] tabular-nums leading-none mt-2">
        {value}
      </p>
      <p className="text-[10.5px] text-white/45 mt-2">{hint}</p>
    </div>
  );
}

function Row({ entry }: { entry: AuditEntry }) {
  const meta = auditMeta(entry.action);
  const Icon = ICONS[entry.action] ?? ScrollText;
  const [resource, ...rest] = entry.target.split('/');
  const slug = rest.join('/');

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 sm:px-5 py-3.5">
      <span
        className={`mt-0.5 w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${
          TONES[meta.tone] ?? TONES.info
        }`}
        aria-hidden
      >
        <Icon size={15} strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white">{meta.label}</p>
        <p className="text-[11.5px] text-white/50 mt-0.5 break-words">
          {entry.target ? (
            <>
              <span className="text-white/60">{resource}</span>
              {slug && <span className="text-white/45"> / {slug}</span>}
            </>
          ) : (
            <span className="text-white/35">—</span>
          )}
          {entry.detail && <span className="text-white/45"> · {entry.detail}</span>}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[11px] text-white/55 tabular-nums">
          {entry.createdAt ? dateFormatter.format(new Date(entry.createdAt)) : ''}
        </p>
        <p className="text-[10.5px] text-white/40 mt-0.5">
          {entry.adminEmail || 'inconnu'}
          {entry.ip && ` · ${entry.ip}`}
        </p>
      </div>
    </li>
  );
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; page?: string; admin?: string }>;
}) {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');

  const unread = await unreadMessages();
  const params = await searchParams;
  const scope = normalizeScope(params.scope);
  const requestedPage = Number.parseInt(params.page ?? '1', 10);
  const actorId = normalizeAdminId(params.admin);
  const href = (nextScope: AuditScope, nextPage = 1) => journalHref(nextScope, nextPage, actorId);

  let entries: AuditEntry[] = [];
  let total = 0;
  let page = 1;
  let pages = 1;
  let stats = { last24: 0, failures: 0, total: 0 };
  let actor: AuditActor | null = null;
  let failed = false;

  if (hasDb()) {
    try {
      actor = actorId ? await auditActor(actorId) : null;
      const result = await listAuditLog(scope, requestedPage, actorId);
      entries = result.entries;
      total = result.total;
      page = result.page;
      pages = result.pages;
      stats = await auditStats();
    } catch (err) {
      console.error('admin journal error:', err);
      failed = true;
    }
  }

  return (
    <AdminShell admin={{
          email: admin.email,
          role: admin.role,
          displayName: admin.displayName,
          jobTitle: admin.jobTitle,
          avatarUrl: admin.avatarUrl,
        }} unread={unread}>
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-[-0.025em]">
          Journal d’audit
        </h1>          <p className="text-[13px] text-white/55 mt-1.5">
            Historique des actions sensibles du back-office : connexions, publications,
            suppressions, imports et téléversements. Chaque administrateur de la page
            Équipe dispose d’un accès direct à ses propres actions.
          </p>
      </div>

      {!hasDb() || failed ? (
        <div className="text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[12px] px-5 py-4">
          <strong className="font-semibold">
            {hasDb() ? 'Lecture impossible.' : 'Base de données non configurée.'}
          </strong>{' '}
          {hasDb()
            ? 'Le journal n’a pas pu être lu. Vérifiez que la migration 004_audit_log.sql a été appliquée, puis rechargez la page.'
            : 'Définissez DATABASE_URL et SESSION_SECRET, puis lancez npm run db:migrate.'}
        </div>
      ) : (
        <>
          {!actorId && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Événements (24 h)" value={stats.last24} hint="Toutes actions confondues" />
            <Stat
              label="Connexions refusées (7 j)"
              value={stats.failures}
              hint={stats.failures > 0 ? 'Tentatives à surveiller' : 'Aucune tentative suspecte'}
            />
            <Stat label="Total conservé" value={stats.total} hint="Depuis l’ouverture du journal" />
          </div>
          )}

          {actorId && (
            <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-blue/25 bg-blue/[0.07] px-4 py-3 mb-5">
              <span className="w-8 h-8 rounded-full bg-blue/15 text-blue-soft flex items-center justify-center shrink-0">
                <UserRound size={15} strokeWidth={1.75} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold truncate">
                  Activité de {actor?.displayName.trim() || actor?.email || 'cet administrateur'}
                </p>
                <p className="text-[11px] text-white/50 truncate">
                  {actor?.email || 'Compte supprimé'} · actions extraites du journal d’audit
                </p>
              </div>

              <Link
                href={QUERY}
                className="rounded-[8px] border border-white/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              >
                Voir tout le journal
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1 p-1 mb-5 w-fit rounded-[9px] border border-white/[0.07] bg-white/[0.03]">
            {AUDIT_SCOPES.map((item) => (
              <Link
                key={item}
                href={href(item)}
                aria-current={scope === item ? 'true' : undefined}
                className={`px-3 py-1.5 rounded-[7px] text-[12px] font-semibold transition-colors ${
                  scope === item
                    ? 'bg-white/[0.09] text-white'
                    : 'text-white/55 hover:text-white/80'
                }`}
              >
                {SCOPE_LABELS[item]}
              </Link>
            ))}
          </div>

          {entries.length === 0 ? (
            <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-5 py-14 text-center">
              <p className="text-[13px] text-white/60">Aucun événement dans cette vue.</p>
              <p className="text-[12px] text-white/45 mt-1.5">
                Les prochaines actions effectuées dans le back-office apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <ul className="divide-y divide-white/[0.05]">
                {entries.map((entry) => (
                  <Row key={entry.id} entry={entry} />
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <p className="text-[11.5px] text-white/55">
              {total} événement{total > 1 ? 's' : ''} · page {page} / {pages}
            </p>

            {pages > 1 && (
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={href(scope, page - 1)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <ChevronLeft size={14} strokeWidth={1.75} />
                    Plus récent
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.06] px-3 py-1.5 text-[11.5px] text-white/25">
                    <ChevronLeft size={14} strokeWidth={1.75} />
                    Plus récent
                  </span>
                )}

                {page < pages ? (
                  <Link
                    href={href(scope, page + 1)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Plus ancien
                    <ChevronRight size={14} strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.06] px-3 py-1.5 text-[11.5px] text-white/25">
                    Plus ancien
                    <ChevronRight size={14} strokeWidth={1.75} />
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
