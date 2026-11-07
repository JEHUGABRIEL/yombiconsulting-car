import { redirect } from 'next/navigation';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminsClient from '@/components/admin/AdminsClient';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import { listInvitations, listTeam } from '@/lib/admins';
import { unreadMessages } from '@/lib/admin-content';
import type { PendingInvitation, TeamMember } from '@/lib/admin-team-shared';

export const dynamic = 'force-dynamic';

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-5 py-4 flex items-center gap-4">
      <span className="w-9 h-9 rounded-[9px] bg-blue/15 text-blue-soft flex items-center justify-center shrink-0">
        <Icon size={17} strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-[22px] font-bold tracking-[-0.03em] tabular-nums leading-none">
          {value}
        </span>
        <span className="block text-[10.5px] text-white/50 mt-1.5">{label}</span>
      </span>
    </div>
  );
}

export default async function AdminsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect('/admin/login');
  // La page n'existe pas pour un administrateur simple.
  if (admin.role !== 'superadmin') redirect('/admin');

  const unread = await unreadMessages().catch(() => 0);

  let admins: TeamMember[] = [];
  let invitations: PendingInvitation[] = [];
  let failed = false;

  if (hasDb()) {
    try {
      [admins, invitations] = await Promise.all([listTeam(), listInvitations()]);
    } catch (err) {
      console.error('admin team error:', err);
      failed = true;
    }
  }

  const active = admins.filter((member) => member.status === 'active').length;
  const superadmins = admins.filter(
    (member) => member.role === 'superadmin' && member.status === 'active'
  ).length;
  const pending = invitations.filter((invitation) => !invitation.expired).length;

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
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-[-0.025em]">
          Administrateurs
        </h1>
        <p className="text-[13px] text-white/55 mt-1.5">
          Invitez des collègues, ajustez les rôles et coupez l’accès d’un compte en un clic.
        </p>
      </div>

      {!hasDb() || failed ? (
        <div className="text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[12px] px-5 py-4">
          <strong className="font-semibold">
            {hasDb() ? 'Lecture impossible.' : 'Base de données non configurée.'}
          </strong>{' '}
          {hasDb()
            ? 'L’équipe n’a pas pu être chargée. Vérifiez que la migration 006_admin_invitations.sql a été appliquée, puis rechargez la page.'
            : 'Définissez DATABASE_URL et SESSION_SECRET, puis lancez npm run db:migrate.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Comptes actifs" value={active} icon={Users} />
            <Stat label="Superadministrateurs" value={superadmins} icon={ShieldCheck} />
            <Stat label="Invitations en attente" value={pending} icon={UserPlus} />
          </div>

          <AdminsClient
            currentId={admin.id}
            admins={admins}
            invitations={invitations}
          />
        </>
      )}
    </AdminShell>
  );
}
