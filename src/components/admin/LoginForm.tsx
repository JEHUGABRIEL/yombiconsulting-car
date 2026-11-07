'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, Loader2 } from 'lucide-react';

const fieldClass =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/55 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Défi signé remis par la première étape : ni session, ni cookie tant que le
  // second facteur n'est pas validé.
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState('');

  function finishLogin() {
    router.replace('/admin');
    router.refresh();
  }

  async function onPasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        mfaRequired?: boolean;
        challenge?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data?.error ?? 'Connexion impossible.');
        return;
      }

      if (data.mfaRequired && typeof data.challenge === 'string') {
        setChallenge(data.challenge);
        setPassword('');
        setCode('');
        return;
      }

      finishLogin();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  async function onCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge, code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data?.error ?? 'Vérification impossible.');
        return;
      }

      finishLogin();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  if (challenge) {
    return (
      <form onSubmit={onCodeSubmit} noValidate>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-full bg-blue/15 text-blue-soft flex items-center justify-center">
            <Fingerprint size={18} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-[13px] font-semibold leading-tight">Double authentification</p>
            <p className="text-[11px] text-white/45">Code de votre application d’authentification</p>
          </div>
        </div>

        <label htmlFor="admin-totp" className="block text-[12px] font-medium text-white/55 mb-1.5">
          Code à 6 chiffres
        </label>
        <input
          id="admin-totp"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={32}
          required
          className={`${fieldClass} mb-2 font-mono tracking-[0.25em]`}
          placeholder="123456"
        />
        <p className="text-[10.5px] text-white/40 mb-4">
          Un code de secours (format ABCDE-FGHJK) est également accepté.
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
          disabled={loading || !code.trim()}
          className="btn btn-primary w-full px-6 py-3.5 text-[14px] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Vérification…
            </>
          ) : (
            <>
              Vérifier
              <ArrowRight size={18} strokeWidth={1.75} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setChallenge(null);
            setCode('');
            setError(null);
          }}
          disabled={loading}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-white/45 hover:text-white transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
          Revenir à la connexion
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onPasswordSubmit} noValidate>
      <label htmlFor="admin-email" className="block text-[12px] font-medium text-white/55 mb-1.5">
        Adresse e-mail
      </label>
      <input
        id="admin-email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${fieldClass} mb-4`}
        placeholder="prenom@yombiconsulting.com"
      />

      <label htmlFor="admin-password" className="block text-[12px] font-medium text-white/55 mb-1.5">
        Mot de passe
      </label>
      <div className="relative mb-5">
        <input
          id="admin-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${fieldClass} pr-12`}
          placeholder="••••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={showPassword}
          title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[7px] flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          {showPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
        </button>
      </div>

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
        disabled={loading}
        className="btn btn-primary w-full px-6 py-3.5 text-[14px] disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Connexion…
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight size={18} strokeWidth={1.75} />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-white/30 mt-4">
        <KeyRound size={11} strokeWidth={1.75} />
        Connexion protégée · 2FA disponible depuis votre profil
      </p>
    </form>
  );
}
