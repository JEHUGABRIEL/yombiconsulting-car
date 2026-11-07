'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ban,
  Check,
  Copy,
  Fingerprint,
  History,
  Loader2,
  Mail,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import ConfirmDialog, { type ConfirmOptions } from '@/components/admin/ConfirmDialog';
import {
  ROLE_HINTS,
  ROLE_LABELS,
  type AdminRole,
  type AdminStatus,
  type PendingInvitation,
  type TeamMember,
} from '@/lib/admin-team-shared';

const card = 'rounded-[14px] border border-white/[0.06] bg-white/[0.02]';
const field =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';
const label = 'block text-[11.5px] font-medium text-white/55 mb-1.5';
const ghostButton =
  'inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] px-2.5 py-1.5 text-[11.5px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] disabled:opacity-50 transition-colors';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date);
}

function formatDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateTimeFormat.format(date);
}

function initialsOf(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? fallback).slice(0, 2).toUpperCase();
}

function Notice({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`text-[12px] leading-relaxed rounded-[9px] px-3.5 py-2.5 ${
        tone === 'error'
          ? 'text-red-300 bg-red-500/10 border border-red-500/25'
          : 'text-emerald-200 bg-emerald-500/10 border border-emerald-500/25'
      }`}
    >
      {children}
    </p>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        role === 'superadmin'
          ? 'bg-blue/15 text-blue-soft'
          : 'bg-white/[0.07] text-white/60'
      }`}
    >
      <ShieldCheck size={11} strokeWidth={2} />
      {role === 'superadmin' ? 'Superadmin' : 'Admin'}
    </span>
  );
}

export default function AdminsClient({
  currentId,
  admins,
  invitations,
}: {
  currentId: string;
  admins: TeamMember[];
  invitations: PendingInvitation[];
}) {
  const router = useRouter();

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    run: () => Promise<void>;
  } | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [created, setCreated] = useState<{
    link: string;
    email: string;
    role: AdminRole;
    emailSent: boolean;
    emailProblem: 'not_configured' | 'send_failed' | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inviteOpen) return;

    emailRef.current?.focus();
    document.body.classList.add('no-scroll');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setInviteOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('no-scroll');
    };
  }, [inviteOpen]);

  async function patchMember(
    member: TeamMember,
    body: { role?: AdminRole; status?: AdminStatus },
    success: string
  ) {
    setBusyId(member.id);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/admins/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Opération impossible.');
        return;
      }

      setNotice(success);
      router.refresh();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setBusyId(null);
      setConfirmState(null);
    }
  }

  function askRoleChange(member: TeamMember) {
    const promote = member.role !== 'superadmin';
    const next: AdminRole = promote ? 'superadmin' : 'admin';

    setConfirmState({
      options: {
        title: promote ? 'Nommer superadministrateur ?' : 'Rétrograder en administrateur ?',
        description: promote
          ? `${member.email} pourra gérer l’équipe, les rôles et les invitations.`
          : `${member.email} perdra l’accès à la gestion de l’équipe. Ses autres accès restent inchangés.`,
        confirmLabel: promote ? 'Nommer superadmin' : 'Rétrograder',
        tone: promote ? 'primary' : 'danger',
      },
      run: () =>
        patchMember(
          member,
          { role: next },
          `${member.email} est désormais ${ROLE_LABELS[next].toLowerCase()}.`
        ),
    });
  }

  function askStatusChange(member: TeamMember) {
    const block = member.status !== 'blocked';

    setConfirmState({
      options: {
        title: block ? 'Bloquer ce compte ?' : 'Débloquer ce compte ?',
        description: block
          ? `${member.email} sera déconnecté immédiatement et ne pourra plus se connecter tant que le compte reste bloqué.`
          : `${member.email} pourra à nouveau se connecter.`,
        confirmLabel: block ? 'Bloquer le compte' : 'Débloquer',
        tone: block ? 'danger' : 'primary',
      },
      run: () =>
        patchMember(
          member,
          { status: block ? 'blocked' : 'active' },
          block
            ? `${member.email} est bloqué et ses sessions ont été fermées.`
            : `${member.email} peut à nouveau se connecter.`
        ),
    });
  }

  async function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    setInviteBusy(true);
    setInviteError(null);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        link?: string;
        invitation?: { email: string; role: AdminRole };
        emailSent?: boolean;
        emailProblem?: 'not_configured' | 'send_failed' | null;
        error?: string;
      };

      if (!res.ok || !data.link || !data.invitation) {
        setInviteError(data.error ?? 'Invitation impossible.');
        return;
      }

      const emailSent = data.emailSent === true;

      setCreated({
        link: data.link,
        email: data.invitation.email,
        role: data.invitation.role,
        emailSent,
        emailProblem: emailSent ? null : data.emailProblem ?? 'send_failed',
      });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('admin');
      setNotice(
        emailSent
          ? `Invitation envoyée par e-mail à ${data.invitation.email}.`
          : `Invitation créée pour ${data.invitation.email}. L’e-mail n’a pas pu être envoyé : transmettez le lien ci-dessous.`
      );
      router.refresh();
    } catch {
      setInviteError('Réseau indisponible. Réessayez.');
    } finally {
      setInviteBusy(false);
    }
  }

  async function copyLink() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copie impossible : sélectionnez le lien et copiez-le manuellement.');
    }
  }

  function askResetMfa(member: TeamMember) {
    setConfirmState({
      options: {
        title: 'Réinitialiser la double authentification ?',
        description: `${member.email} devra activer un nouveau second facteur à sa prochaine connexion. Son mot de passe reste inchangé ; ses sessions seront fermées. À n’utiliser que si la personne a perdu son téléphone et ses codes de secours.`,
        confirmLabel: 'Réinitialiser la 2FA',
        tone: 'danger',
      },
      run: async () => {
        setBusyId(member.id);
        setError(null);
        setNotice(null);
        try {
          const res = await fetch(`/api/admin/admins/${member.id}/mfa`, { method: 'DELETE' });
          const data = (await res.json().catch(() => ({}))) as { error?: string };

          if (!res.ok) {
            setError(data.error ?? 'Réinitialisation impossible.');
            return;
          }

          setNotice(`Double authentification réinitialisée pour ${member.email}.`);
          router.refresh();
        } catch {
          setError('Réseau indisponible. Réessayez.');
        } finally {
          setBusyId(null);
          setConfirmState(null);
        }
      },
    });
  }

  function askRevoke(invitation: PendingInvitation) {
    setConfirmState({
      options: {
        title: 'Révoquer cette invitation ?',
        description: `Le lien transmis à ${invitation.email} cessera de fonctionner immédiatement.`,
        confirmLabel: 'Révoquer',
        tone: 'danger',
      },
      run: async () => {
        setBusyId(invitation.id);
        setError(null);
        setNotice(null);
        try {
          const res = await fetch(`/api/admin/invitations/${invitation.id}`, {
            method: 'DELETE',
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };

          if (!res.ok) {
            setError(data.error ?? 'Révocation impossible.');
            return;
          }

          setNotice(`Invitation pour ${invitation.email} révoquée.`);
          router.refresh();
        } catch {
          setError('Réseau indisponible. Réessayez.');
        } finally {
          setBusyId(null);
          setConfirmState(null);
        }
      },
    });
  }

  return (
    <>
      <div className="space-y-3 mb-5">
        {error && <Notice tone="error">{error}</Notice>}
        {notice && <Notice tone="success">{notice}</Notice>}
      </div>

      {created && (
        <section className="rounded-[14px] border border-emerald-500/25 bg-emerald-500/[0.07] p-5 mb-5">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0">
              <Check size={17} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">
                {created.emailSent
                  ? `Invitation envoyée à ${created.email}`
                  : `Invitation créée pour ${created.email}`}
              </p>
              <p className="text-[11.5px] leading-relaxed text-white/55 mt-1">
                Lien à usage unique, valable 7 jours, avec le rôle{' '}
                {ROLE_LABELS[created.role].toLowerCase()}.{' '}
                {created.emailSent
                  ? 'Un e-mail vient d’être envoyé ; le lien ci-dessous sert de secours.'
                  : created.emailProblem === 'not_configured'
                    ? 'L’envoi automatique n’est pas configuré (RESEND_API_KEY et EMAIL_FROM) : transmettez ce lien par un canal sûr.'
                    : 'L’envoi de l’e-mail a échoué (domaine d’envoi à vérifier dans Resend) : transmettez ce lien par un canal sûr.'}{' '}
                Il ne sera plus affiché ensuite.
              </p>
              {!created.emailSent && (
                <p className="mt-2 text-[11.5px] leading-relaxed text-amber-200/90">
                  L’invitation reste valable : seul l’envoi du message a échoué.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <input
                  readOnly
                  value={created.link}
                  aria-label="Lien d’invitation"
                  onFocus={(event) => event.currentTarget.select()}
                  className={`${field} font-mono text-[11.5px]`}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-white/[0.08] border border-white/[0.12] px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-white/[0.12] transition-colors shrink-0"
                >
                  {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCreated(null)}
                className="mt-3 text-[11.5px] font-medium text-white/45 hover:text-white transition-colors"
              >
                Masquer le lien
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <h2 className="text-[14px] font-semibold">Équipe</h2>
        <button
          type="button"
          onClick={() => {
            setInviteError(null);
            setInviteOpen(true);
          }}
          className="btn btn-primary px-4 py-2.5 text-[12.5px]"
        >
          <UserPlus size={15} strokeWidth={1.75} />
          Inviter un administrateur
        </button>
      </div>

      <div className={`${card} overflow-hidden`}>
        <ul className="divide-y divide-white/[0.05]">
          {admins.map((member) => {
            const self = member.id === currentId;
            const blocked = member.status === 'blocked';
            const displayName = member.displayName.trim() || member.email;
            const busy = busyId === member.id;

            return (
              <li
                key={member.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 ${
                  blocked ? 'opacity-75' : ''
                }`}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-white/[0.07] text-white/70 text-[12px] font-bold flex items-center justify-center shrink-0">
                    {initialsOf(displayName, member.email)}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold truncate">{displayName}</p>
                    {self && (
                      <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-semibold text-white/55">
                        Vous
                      </span>
                    )}
                    <RoleBadge role={member.role} />
                    {member.mfaEnabled && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                        title="Double authentification activée"
                      >
                        <Fingerprint size={11} strokeWidth={2} />
                        2FA
                      </span>
                    )}
                    {blocked && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                        Bloqué
                      </span>
                    )}
                  </div>

                  <p className="text-[11.5px] text-white/45 truncate mt-0.5">
                    {member.email}
                    {member.username && ` · @${member.username}`}
                  </p>

                  <p className="text-[10.5px] text-white/35 mt-1">
                    {member.lastLoginAt
                      ? `Dernière connexion : ${formatDateTime(member.lastLoginAt)}`
                      : 'Jamais connecté'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/journal?admin=${member.id}`}
                    className={ghostButton}
                    title={`Actions récentes de ${displayName}`}
                  >
                    <History size={13} strokeWidth={1.75} />
                    Activité
                  </Link>

                  {!self && (
                    <>
                    <button
                      type="button"
                      onClick={() => askRoleChange(member)}
                      disabled={busy}
                      className={ghostButton}
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={13} strokeWidth={1.75} />
                      )}
                      {member.role === 'superadmin' ? 'Rétrograder' : 'Nommer superadmin'}
                    </button>

                    {member.mfaEnabled && (
                      <button
                        type="button"
                        onClick={() => askResetMfa(member)}
                        disabled={busy}
                        className={ghostButton}
                        title="Débloquer un compte ayant perdu son téléphone"
                      >
                        {busy ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <RotateCcw size={13} strokeWidth={1.75} />
                        )}
                        Réinitialiser la 2FA
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => askStatusChange(member)}
                      disabled={busy}
                      className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[11.5px] font-medium disabled:opacity-50 transition-colors ${
                        blocked
                          ? 'border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/10'
                          : 'border-red-500/25 text-red-300 hover:bg-red-500/10'
                      }`}
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : blocked ? (
                        <Check size={13} strokeWidth={2} />
                      ) : (
                        <Ban size={13} strokeWidth={1.75} />
                      )}
                      {blocked ? 'Débloquer' : 'Bloquer'}
                    </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[14px] font-semibold">Invitations en attente</h2>
          <p className="text-[11.5px] leading-relaxed text-white/45 mt-1 mb-3">
            Le lien complet n’est affiché qu’au moment de l’envoi. Perdu ? Révoquez
            l’invitation puis créez-en une nouvelle.
          </p>

          <div className={`${card} overflow-hidden`}>
            <ul className="divide-y divide-white/[0.05]">
              {invitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5"
                >
                  <span className="w-8 h-8 rounded-[8px] bg-white/[0.05] text-white/50 flex items-center justify-center shrink-0">
                    <Mail size={14} strokeWidth={1.75} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium truncate">{invitation.email}</p>
                    <p className="text-[10.5px] text-white/40 mt-0.5">
                      {ROLE_LABELS[invitation.role]}
                      {invitation.invitedBy && ` · invitée par ${invitation.invitedBy}`}
                      {' · '}
                      {invitation.expired
                        ? 'lien expiré'
                        : `expire le ${formatDate(invitation.expiresAt)}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => askRevoke(invitation)}
                    disabled={busyId === invitation.id}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-red-500/25 px-2.5 py-1.5 text-[11.5px] font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {busyId === invitation.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <X size={13} strokeWidth={2} />
                    )}
                    Révoquer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        options={confirmState?.options ?? null}
        busy={busyId !== null}
        onConfirm={() => void confirmState?.run()}
        onCancel={() => setConfirmState(null)}
      />

      {inviteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="dialog-backdrop absolute inset-0 bg-[#040A14]/75 backdrop-blur-[3px]"
            onClick={() => {
              if (!inviteBusy) setInviteOpen(false);
            }}
            aria-hidden
          />

          <form
            onSubmit={submitInvite}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            className="dialog-panel relative w-full max-w-[460px] rounded-[16px] border border-white/[0.09] bg-[#0E1D31] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 id="invite-title" className="text-[15px] font-semibold">
                  Inviter un administrateur
                </h2>
                <p className="text-[11.5px] leading-relaxed text-white/50 mt-1">
                  Un e-mail d’invitation sera envoyé à cette adresse. Le lien à usage unique
                  reste affiché une fois, à copier si besoin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                disabled={inviteBusy}
                aria-label="Fermer"
                className="w-8 h-8 -mr-1 -mt-1 rounded-[8px] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] transition-colors shrink-0"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="invite-email" className={label}>
                Adresse e-mail
              </label>
              <input
                ref={emailRef}
                id="invite-email"
                type="email"
                autoComplete="off"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="prenom@yombiconsulting.com"
                className={field}
              />
            </div>

            <div className="mb-4">
              <span className={label}>Rôle</span>
              <div className="grid grid-cols-2 gap-2">
                {(['admin', 'superadmin'] as const).map((role) => {
                  const selected = inviteRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setInviteRole(role)}
                      aria-pressed={selected}
                      className={`rounded-[9px] border px-3 py-2.5 text-[12px] font-semibold text-left transition-colors ${
                        selected
                          ? 'border-blue/60 bg-blue/15 text-white'
                          : 'border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10.5px] leading-relaxed text-white/40 mt-2">
                {ROLE_HINTS[inviteRole]}
              </p>
            </div>

            {inviteError && (
              <div className="mb-4">
                <Notice tone="error">{inviteError}</Notice>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                disabled={inviteBusy}
                className="rounded-[9px] px-4 py-2.5 text-[12.5px] font-semibold text-white/65 hover:text-white hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={inviteBusy || !inviteEmail.trim()}
                className="btn btn-primary px-4 py-2.5 text-[12.5px] disabled:opacity-60"
              >
                {inviteBusy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <UserPlus size={15} strokeWidth={1.75} />
                )}
                Créer l’invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
