'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import ConfirmDialog, { type ConfirmOptions } from '@/components/admin/ConfirmDialog';

const field =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';
const label = 'block text-[11.5px] font-medium text-white/55 mb-1.5';
const card = 'rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6';

type ProfileAdmin = {
  email: string;
  username: string | null;
  displayName: string;
  jobTitle: string;
  avatarUrl: string;
};

function initialsOf(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? fallback).slice(0, 2).toUpperCase();
}

/** Champ mot de passe avec l'œil afficher/masquer, comme à la connexion. */
function SecretInput({
  id,
  label: text,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${field} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[7px] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          {visible ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  );
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

export default function ProfileForm({ admin }: { admin: ProfileAdmin }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(admin.displayName);
  const [jobTitle, setJobTitle] = useState(admin.jobTitle);
  const [email, setEmail] = useState(admin.email);
  const [username, setUsername] = useState(admin.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(admin.avatarUrl);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [sessionsBusy, setSessionsBusy] = useState(false);
  const [sessionsNotice, setSessionsNotice] = useState<string | null>(null);

  const initials = initialsOf(displayName || email, email);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setFormError(null);
    setFormNotice(null);

    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/uploads', { method: 'POST', body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok) {
        setFormError(data.error ?? 'Téléversement impossible.');
        return;
      }
      if (typeof data.url === 'string') {
        setAvatarUrl(data.url);
        setFormNotice('Photo téléversée. Enregistrez pour l’appliquer.');
      }
    } catch {
      setFormError('Réseau indisponible. Réessayez.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFormNotice(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          jobTitle,
          email,
          username,
          avatarUrl,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setFormError(data.error ?? 'Enregistrement impossible.');
        return;
      }

      setFormNotice('Profil mis à jour.');
      router.refresh();
    } catch {
      setFormError('Réseau indisponible. Réessayez.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setPasswordError(data.error ?? 'Changement impossible.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordNotice('Mot de passe modifié. Les autres sessions ont été fermées.');
      router.refresh();
    } catch {
      setPasswordError('Réseau indisponible. Réessayez.');
    } finally {
      setPasswordBusy(false);
    }
  }

  async function revokeSessions() {
    setSessionsBusy(true);
    setSessionsNotice(null);
    try {
      const res = await fetch('/api/admin/profile/sessions', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setSessionsNotice(data.error ?? 'Opération impossible.');
        return;
      }
      setSessionsNotice('Les autres appareils devront se reconnecter.');
    } catch {
      setSessionsNotice('Réseau indisponible. Réessayez.');
    } finally {
      setSessionsBusy(false);
      setConfirmOptions(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <form onSubmit={saveProfile} className={card}>
        <div className="flex items-center gap-2 mb-5">
          <UserRound size={16} strokeWidth={1.75} className="text-blue-soft" />
          <h2 className="text-[13.5px] font-semibold">Identité</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Photo de profil"
              className="w-[68px] h-[68px] rounded-full object-cover ring-2 ring-white/10 shrink-0"
            />
          ) : (
            <span className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-blue to-blue-deep flex items-center justify-center text-white font-bold text-[19px] tracking-wide shrink-0">
              {initials}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAvatar(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-[9px] bg-white/[0.06] border border-white/[0.09] px-3.5 py-2.5 text-[12px] font-semibold text-white/80 hover:bg-white/[0.09] hover:text-white disabled:opacity-60 transition-colors"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} strokeWidth={1.75} />
              )}
              {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="inline-flex items-center gap-1.5 rounded-[9px] px-3 py-2.5 text-[12px] font-medium text-white/45 hover:text-red-300 transition-colors"
              >
                <Trash2 size={13} strokeWidth={1.75} />
                Retirer
              </button>
            )}

            <p className="w-full text-[10.5px] text-white/35">
              JPEG, PNG, WebP ou AVIF · 8 Mo maximum. La photo est hébergée sur Cloudinary.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="profile-name" className={label}>
              Nom affiché
            </label>
            <input
              id="profile-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
              placeholder="Ex. Jehu Mbi"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="profile-job" className={label}>
              Fonction
            </label>
            <input
              id="profile-job"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              maxLength={80}
              placeholder="Ex. Administrateur"
              className={field}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-email" className={label}>
              Adresse e-mail
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="profile-username" className={label}>
              Identifiant de connexion
            </label>
            <input
              id="profile-username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="facultatif"
              className={field}
            />
            <p className="text-[10.5px] text-white/35 mt-1.5">
              3 à 32 caractères : lettres, chiffres, point, tiret ou souligné.
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          {formError && <Notice tone="error">{formError}</Notice>}
          {formNotice && <Notice tone="success">{formNotice}</Notice>}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10.5px] text-white/35">
              L’e-mail et l’identifiant servent tous deux à la connexion.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary px-4 py-2.5 text-[12.5px] disabled:opacity-60 shrink-0"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} strokeWidth={1.75} />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={changePassword} className={card}>
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={16} strokeWidth={1.75} className="text-blue-soft" />
          <h2 className="text-[13.5px] font-semibold">Mot de passe</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SecretInput
            id="profile-current-password"
            label="Mot de passe actuel"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder="••••••••••"
          />
          <SecretInput
            id="profile-new-password"
            label="Nouveau mot de passe"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            placeholder="12 caractères minimum"
          />
          <SecretInput
            id="profile-confirm-password"
            label="Confirmer"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="••••••••••"
          />
        </div>

        <p className="text-[10.5px] text-white/35 mt-2.5">
          Au moins 12 caractères, différent de l’actuel. Toutes les autres sessions seront fermées.
        </p>

        <div className="space-y-3 mt-4">
          {passwordError && <Notice tone="error">{passwordError}</Notice>}
          {passwordNotice && <Notice tone="success">{passwordNotice}</Notice>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                passwordBusy || !currentPassword || !newPassword || !confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-[9px] bg-white/[0.07] border border-white/[0.1] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-white/[0.1] disabled:opacity-50 transition-colors"
            >
              {passwordBusy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} strokeWidth={2} />
              )}
              Modifier le mot de passe
            </button>
          </div>
        </div>
      </form>

      <section className={card}>
        <div className="flex items-center gap-2 mb-2">
          <Mail size={16} strokeWidth={1.75} className="text-blue-soft" />
          <h2 className="text-[13.5px] font-semibold">Sessions</h2>
        </div>
        <p className="text-[12px] leading-relaxed text-white/50">
          Si vous avez utilisé un appareil partagé ou soupçonnez une session ouverte ailleurs,
          fermez toutes les sessions : seul cet appareil restera connecté.
        </p>

        {sessionsNotice && (
          <div className="mt-3">
            <Notice tone="success">{sessionsNotice}</Notice>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setConfirmOptions({
              title: 'Fermer les autres sessions ?',
              description:
                'Tous les autres appareils connectés à ce compte devront se reconnecter. Votre session actuelle reste active.',
              confirmLabel: 'Fermer les sessions',
              tone: 'danger',
            })
          }
          className="mt-4 inline-flex items-center gap-2 rounded-[9px] border border-white/[0.1] px-4 py-2.5 text-[12.5px] font-semibold text-white/75 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <LogOut size={15} strokeWidth={1.75} />
          Déconnecter les autres appareils
        </button>
      </section>

      <ConfirmDialog
        open={confirmOptions !== null}
        options={confirmOptions}
        busy={sessionsBusy}
        onConfirm={revokeSessions}
        onCancel={() => setConfirmOptions(null)}
      />
    </div>
  );
}
