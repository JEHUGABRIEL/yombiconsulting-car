import { redirect } from 'next/navigation';
import { KeyRound, ShieldCheck } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import ProfileForm from '@/components/admin/ProfileForm';
import MfaSection from '@/components/admin/MfaSection';
import { mfaState } from '@/lib/mfa';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb, query } from '@/lib/db';
import { unreadMessages } from '@/lib/admin-content';

export const dynamic = 'force-dynamic';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date);
}

export default async function AdminProfilePage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');

  const unread = await unreadMessages().catch(() => 0);

  // Dates de vie du compte : informatives, jamais bloquantes.
  let memberSince: string | null = null;
  let lastLogin: string | null = null;
  let passwordChanged: string | null = null;
  let mfa = { enabled: false, remainingCodes: 0 };

  if (hasDb()) {
    try {
      const rows = await query<{
        created_at: string | null;
        last_login_at: string | null;
        password_changed_at: string | null;
      }>(
        'SELECT created_at, last_login_at, password_changed_at FROM admins WHERE id = $1',
        admin.id
      );
      memberSince = rows[0]?.created_at ?? null;
      lastLogin = rows[0]?.last_login_at ?? null;
      passwordChanged = rows[0]?.password_changed_at ?? null;
    } catch (err) {
      console.error('admin profile dates error:', err);
    }

    try {
      const state = await mfaState(admin.id);
      mfa = { enabled: state.enabled, remainingCodes: state.remainingCodes };
    } catch (err) {
      console.error('admin profile mfa error:', err);
    }
  }

  return (
    <AdminShell
      admin={{
        email: admin.email,
        role: admin.role,
        displayName: admin.displayName,
        jobTitle: admin.jobTitle,
        avatarUrl: admin.avatarUrl,
      }}
      unread={unread}
    >
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-[-0.025em]">Mon profil</h1>
        <p className="text-[13px] text-white/55 mt-1.5">
          Vos informations d’affichage et la sécurité de votre compte.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px] gap-5 items-start">
        <div className="space-y-5">
          <ProfileForm
            admin={{
              email: admin.email,
              username: admin.username,
              displayName: admin.displayName,
              jobTitle: admin.jobTitle,
              avatarUrl: admin.avatarUrl,
            }}
          />

          <MfaSection enabled={mfa.enabled} remainingCodes={mfa.remainingCodes} />
        </div>

        <aside className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} strokeWidth={1.75} className="text-blue-soft" />
            <h2 className="text-[12.5px] font-semibold">Compte</h2>
          </div>

          <dl className="space-y-3 text-[11.5px]">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/45">Rôle</dt>
              <dd className="text-white/80 capitalize">{admin.role}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/45">Créé le</dt>
              <dd className="text-white/80 text-right">{formatDate(memberSince)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/45">Dernière connexion</dt>
              <dd className="text-white/80 text-right">{formatDate(lastLogin)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/45">Mot de passe</dt>
              <dd className="text-white/80 text-right">{formatDate(passwordChanged)}</dd>
            </div>
          </dl>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-start gap-2 text-[10.5px] leading-relaxed text-white/35">
            <KeyRound size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p>
              Les changements de profil sont inscrits dans le journal d’audit du back-office.
            </p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
