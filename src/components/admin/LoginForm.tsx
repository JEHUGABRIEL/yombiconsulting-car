'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

const fieldClass =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Connexion impossible.');
        setLoading(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Réseau indisponible. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
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
      <input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`${fieldClass} mb-5`}
        placeholder="••••••••••"
      />

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
            <Loader2 size={16} className="animate-spin" />
            Connexion…
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight size={16} strokeWidth={1.9} />
          </>
        )}
      </button>
    </form>
  );
}
