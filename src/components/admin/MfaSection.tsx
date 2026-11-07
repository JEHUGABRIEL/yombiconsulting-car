'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Fingerprint, Loader2, ShieldOff, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const card = 'rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6';
const field =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';
const label = 'block text-[11.5px] font-medium text-white/55 mb-1.5';

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

/** Secret groupé par quatre pour une saisie manuelle lisible. */
function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}

export default function MfaSection({
  enabled,
  remainingCodes,
}: {
  enabled: boolean;
  remainingCodes: number;
}) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [enrollment, setEnrollment] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function startEnrollment(event: React.FormEvent) {
    event.preventDefault();
    setStarting(true);
    setStartError(null);

    try {
      const res = await fetch('/api/admin/profile/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        secret?: string;
        uri?: string;
        error?: string;
      };

      if (!res.ok || !data.secret || !data.uri) {
        setStartError(data.error ?? 'Activation impossible.');
        return;
      }

      setPassword('');
      setEnrollment({ secret: data.secret, uri: data.uri });
    } catch {
      setStartError('Réseau indisponible. Réessayez.');
    } finally {
      setStarting(false);
    }
  }

  async function confirmEnrollment(event: React.FormEvent) {
    event.preventDefault();
    setConfirming(true);
    setConfirmError(null);

    try {
      const res = await fetch('/api/admin/profile/mfa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        recoveryCodes?: string[];
        error?: string;
      };

      if (!res.ok || !Array.isArray(data.recoveryCodes)) {
        setConfirmError(data.error ?? 'Vérification impossible.');
        return;
      }

      setCode('');
      setEnrollment(null);
      setRecoveryCodes(data.recoveryCodes);
    } catch {
      setConfirmError('Réseau indisponible. Réessayez.');
    } finally {
      setConfirming(false);
    }
  }

  async function copyCodes() {
    if (!recoveryCodes) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setConfirmError('Copie impossible : notez les codes manuellement.');
    }
  }

  function finishRecovery() {
    setRecoveryCodes(null);
    router.refresh();
  }

  async function disableMfa(event: React.FormEvent) {
    event.preventDefault();
    setDisabling(true);
    setDisableError(null);
    setNotice(null);

    try {
      const res = await fetch('/api/admin/profile/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword, code: disableCode.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setDisableError(data.error ?? 'Désactivation impossible.');
        return;
      }

      setDisablePassword('');
      setDisableCode('');
      setNotice('Double authentification désactivée. Les autres sessions ont été fermées.');
      router.refresh();
    } catch {
      setDisableError('Réseau indisponible. Réessayez.');
    } finally {
      setDisabling(false);
    }
  }

  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Fingerprint size={16} strokeWidth={1.75} className="text-blue-soft" />
          <h2 className="text-[13.5px] font-semibold">Double authentification</h2>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.07] text-white/50'
          }`}
        >
          {enabled ? 'Activée' : 'Désactivée'}
        </span>
      </div>

      {recoveryCodes ? (
        <div>
          <p className="text-[12px] leading-relaxed text-white/55">
            Conservez ces codes en lieu sûr, hors de votre téléphone. Chaque code à usage
            unique remplace un code à 6 chiffres si vous perdez l’accès à votre application.
            <strong className="text-white/80"> Ils ne seront plus jamais affichés.</strong>
          </p>

          <ul className="grid grid-cols-2 gap-2 mt-4 font-mono text-[13px] tracking-[0.08em]">
            {recoveryCodes.map((item) => (
              <li
                key={item}
                className="rounded-[8px] border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-center text-white/85"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={copyCodes}
              className="inline-flex items-center gap-2 rounded-[9px] bg-white/[0.07] border border-white/[0.1] px-3.5 py-2.5 text-[12px] font-semibold text-white/85 hover:bg-white/[0.1] transition-colors"
            >
              {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
              {copied ? 'Copiés' : 'Copier les codes'}
            </button>
            <button
              type="button"
              onClick={finishRecovery}
              className="btn btn-primary px-4 py-2.5 text-[12.5px]"
            >
              J’ai enregistré mes codes
            </button>
          </div>
        </div>
      ) : enrollment ? (
        <div>
          <p className="text-[12px] leading-relaxed text-white/55">
            Scannez ce QR code avec une application d’authentification (Google Authenticator,
            1Password, Authy…), puis saisissez le code à 6 chiffres affiché.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
            <div className="rounded-[12px] bg-white p-3 shrink-0">
              <QRCodeSVG value={enrollment.uri} size={148} marginSize={0} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/40">
                Saisie manuelle
              </p>
              <p className="mt-1 font-mono text-[12px] text-white/70 break-all select-all">
                {formatSecret(enrollment.secret)}
              </p>
              <p className="text-[10.5px] text-white/35 mt-1.5">
                Type : TOTP · SHA1 · 6 chiffres · 30 secondes.
              </p>

              <form onSubmit={confirmEnrollment} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="mfa-confirm-code" className={label}>
                    Code de vérification
                  </label>
                  <input
                    id="mfa-confirm-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    className={`${field} font-mono tracking-[0.3em] text-center`}
                  />
                </div>

                {confirmError && <Notice tone="error">{confirmError}</Notice>}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={confirming || code.trim().length !== 6}
                    className="btn btn-primary px-4 py-2.5 text-[12.5px] disabled:opacity-60"
                  >
                    {confirming ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} strokeWidth={2} />
                    )}
                    Activer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollment(null);
                      setConfirmError(null);
                      setCode('');
                    }}
                    disabled={confirming}
                    className="rounded-[9px] px-3 py-2.5 text-[12px] font-semibold text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : enabled ? (
        <div>
          <p className="text-[12px] leading-relaxed text-white/55">
            Un code à 6 chiffres est demandé à chaque connexion, en plus du mot de passe.{' '}
            {remainingCodes > 0
              ? `${remainingCodes} code${remainingCodes > 1 ? 's' : ''} de secours encore disponible${remainingCodes > 1 ? 's' : ''}.`
              : 'Aucun code de secours ne reste : demandez à un superadministrateur de réinitialiser votre 2FA.'}
          </p>

          {remainingCodes > 0 && remainingCodes <= 3 && (
            <p className="mt-2 text-[11.5px] leading-relaxed text-amber-200/90">
              Il ne reste que {remainingCodes} code{remainingCodes > 1 ? 's' : ''} de secours.
              Demandez une réinitialisation pour en générer de nouveaux avant épuisement.
            </p>
          )}

          {notice && (
            <div className="mt-3">
              <Notice tone="success">{notice}</Notice>
            </div>
          )}

          <form onSubmit={disableMfa} className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <ShieldOff size={14} strokeWidth={1.75} className="text-white/45" />
              <p className="text-[12px] font-semibold text-white/75">Désactiver la 2FA</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="mfa-disable-password" className={label}>
                  Mot de passe actuel
                </label>
                <input
                  id="mfa-disable-password"
                  type="password"
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={(event) => setDisablePassword(event.target.value)}
                  className={field}
                  placeholder="••••••••••"
                />
              </div>
              <div>
                <label htmlFor="mfa-disable-code" className={label}>
                  Code 2FA ou code de secours
                </label>
                <input
                  id="mfa-disable-code"
                  value={disableCode}
                  onChange={(event) => setDisableCode(event.target.value)}
                  autoComplete="one-time-code"
                  maxLength={32}
                  className={`${field} font-mono`}
                  placeholder="123456"
                />
              </div>
            </div>

            {disableError && (
              <div className="mt-3">
                <Notice tone="error">{disableError}</Notice>
              </div>
            )}

            <button
              type="submit"
              disabled={disabling || !disablePassword || !disableCode}
              className="mt-3 inline-flex items-center gap-2 rounded-[9px] border border-red-500/25 px-4 py-2.5 text-[12.5px] font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              {disabling ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ShieldOff size={15} strokeWidth={1.75} />
              )}
              Désactiver
            </button>
          </form>
        </div>
      ) : (
        <div>
          <p className="text-[12px] leading-relaxed text-white/55">
            Protégez votre compte avec une application d’authentification. Le mot de passe
            seul ne suffira plus : chaque connexion demandera aussi un code temporaire, ou un
            code de secours si vous perdez votre téléphone.
          </p>

          <div className="flex items-start gap-2 mt-3 text-[10.5px] leading-relaxed text-white/35">
            <Smartphone size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p>Une application TOTP est nécessaire (Google Authenticator, 1Password, Authy…).</p>
          </div>

          {startError && (
            <div className="mt-3">
              <Notice tone="error">{startError}</Notice>
            </div>
          )}

          <form onSubmit={startEnrollment} className="mt-4 space-y-3">
            <div className="max-w-[320px]">
              <label htmlFor="mfa-start-password" className={label}>
                Confirmez votre mot de passe
              </label>
              <input
                id="mfa-start-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={field}
                placeholder="••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={starting || !password}
              className="btn btn-primary px-4 py-2.5 text-[12.5px] disabled:opacity-60"
            >
              {starting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Fingerprint size={15} strokeWidth={1.75} />
              )}
              Activer la double authentification
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
