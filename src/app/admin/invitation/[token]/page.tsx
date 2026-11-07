import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import InviteAcceptForm from '@/components/admin/InviteAcceptForm';
import { findInvitation } from '@/lib/admins';
import { hasDb } from '@/lib/db';
import { ROLE_LABELS, type InvitationLookup } from '@/lib/admin-team-shared';

export const metadata: Metadata = {
  title: 'Invitation · Back-office Yo Mbi Consulting',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const INVALID: InvitationLookup = {
  state: 'unknown',
  email: '',
  role: 'admin',
  expiresAt: '',
};

const MESSAGES: Record<string, { title: string; body: string }> = {
  unknown: {
    title: 'Lien inconnu',
    body: 'Ce lien ne correspond à aucune invitation. Vérifiez qu’il a été copié en entier, ou demandez une nouvelle invitation à un superadministrateur.',
  },
  used: {
    title: 'Invitation déjà utilisée',
    body: 'Un compte a déjà été créé avec cette invitation. Connectez-vous avec vos identifiants.',
  },
  revoked: {
    title: 'Invitation révoquée',
    body: 'Cette invitation a été annulée par un superadministrateur. Demandez-en une nouvelle.',
  },
  expired: {
    title: 'Invitation expirée',
    body: 'Un lien d’invitation reste valable 7 jours. Demandez une nouvelle invitation à un superadministrateur.',
  },
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let invitation: InvitationLookup = INVALID;
  let failed = false;

  if (hasDb()) {
    try {
      invitation = await findInvitation(token);
    } catch (err) {
      console.error('admin invitation error:', err);
      failed = true;
    }
  }

  const invalid = MESSAGES[invitation.state];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="w-10 h-10 rounded-[10px] bg-blue flex items-center justify-center">
            <ShieldCheck size={20} strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold">Cabinet Yo Mbi Consulting</p>
            <p className="text-[11.5px] text-white/55">Espace d’administration</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-7">
          {failed ? (
            <div className="text-[13px] leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[9px] px-4 py-3.5">
              L’invitation n’a pas pu être vérifiée. Réessayez dans quelques instants.
            </div>
          ) : invitation.state === 'valid' ? (
            <>
              <h1 className="text-[18px] font-semibold tracking-[-0.01em] mb-1">
                Rejoindre le back-office
              </h1>
              <p className="text-[13px] leading-relaxed text-white/55 mb-1">
                Invitation pour <span className="text-white/80">{invitation.email}</span> —
                rôle {ROLE_LABELS[invitation.role].toLowerCase()}.
              </p>
              {invitation.expiresAt && (
                <p className="text-[11px] text-white/35 mb-6">
                  Lien valable jusqu’au {dateFormat.format(new Date(invitation.expiresAt))}.
                </p>
              )}

              <InviteAcceptForm token={token} email={invitation.email} />
            </>
          ) : (
            <>
              <span className="w-10 h-10 rounded-[10px] bg-amber-400/15 text-amber-200 flex items-center justify-center mb-4">
                <AlertTriangle size={20} strokeWidth={1.75} />
              </span>
              <h1 className="text-[17px] font-semibold tracking-[-0.01em] mb-1.5">
                {invalid?.title ?? 'Invitation indisponible'}
              </h1>
              <p className="text-[12.5px] leading-relaxed text-white/55">
                {invalid?.body ?? 'Ce lien n’est plus utilisable.'}
              </p>
            </>
          )}

          <p className="text-[11.5px] text-white/45 mt-6 pt-5 border-t border-white/[0.06]">
            <Link href="/admin/login" className="text-blue-soft hover:text-white transition-colors">
              Aller à la connexion
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-white/55 mt-8">
          © {new Date().getFullYear()} Cabinet Yo Mbi Consulting
        </p>
      </div>
    </div>
  );
}
