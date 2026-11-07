'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const fieldClass =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';
const labelClass = 'block text-[11.5px] font-medium text-white/55 mb-1.5';

export default function InviteAcceptForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/invitation/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, displayName, username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Création du compte impossible.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="invite-name" className={labelClass}>
            Nom affiché
          </label>
          <input
            id="invite-name"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
            placeholder="Ex. Jehu Mbi"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="invite-username" className={labelClass}>
            Identifiant <span className="font-normal text-white/35">(facultatif)</span>
          </label>
          <input
            id="invite-username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="jehu.mbi"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="invite-password" className={labelClass}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="invite-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="12 caractères minimum"
            className={`${fieldClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[7px] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="invite-confirm" className={labelClass}>
          Confirmer le mot de passe
        </label>
        <input
          id="invite-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="••••••••••"
          className={fieldClass}
        />
      </div>

      <p className="text-[10.5px] leading-relaxed text-white/35 mb-4">
        Au moins 12 caractères, sans mot de passe courant. La connexion se fera ensuite avec{' '}
        <span className="text-white/55">{email}</span>
        {username.trim() && <> ou votre identifiant</>}.
      </p>

      {error && (
        <p
          role="alert"
          className="text-[12.5px] text-red-300 bg-red-500/10 border border-red-500/25 rounded-[9px] px-3.5 py-2.5 mb-4"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !password || !confirm}
        className="btn btn-primary w-full px-6 py-3.5 text-[14px] disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Création du compte…
          </>
        ) : (
          <>
            Créer mon compte
            <ArrowRight size={18} strokeWidth={1.75} />
          </>
        )}
      </button>
    </form>
  );
}
