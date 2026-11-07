import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { query } from './db';
import { hashPassword, verifyPassword } from './password';
import {
  generateRecoveryCodes,
  generateTotpSecret,
  normalizeRecoveryCode,
  totpUri,
  verifyTotp,
} from './totp';

/**
 * Double authentification des administrateurs.
 *
 * Le secret TOTP est chiffré au repos avec AES-256-GCM, la clé étant dérivée de
 * `SESSION_SECRET` : une lecture seule de la base ne permet pas de fabriquer des
 * codes. Les codes de secours, eux, ne sont conservés que hachés (scrypt).
 */

let cachedKey: Buffer | null = null;

function encryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  cachedKey = scryptSync(secret, 'yombi-totp-secret-v1', 32);
  return cachedKey;
}

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

/** `null` si la valeur est absente, tronquée ou chiffrée avec une autre clé. */
export function decryptTotpSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const [version, iv, tag, data] = stored.split('.');
    if (version !== 'v1' || !iv || !tag || !data) return null;

    const decipher = createDecipheriv(
      'aes-256-gcm',
      encryptionKey(),
      Buffer.from(iv, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, 'base64url')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

export type MfaState = { enabled: boolean; remainingCodes: number; enabledAt: string };

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';

export async function mfaState(adminId: string): Promise<MfaState> {
  const rows = await query<{
    totp_enabled_at: string | null;
    remaining: number | string | null;
  }>(
    `SELECT a.totp_enabled_at,
            (SELECT count(*) FROM admin_recovery_codes c
              WHERE c.admin_id = a.id AND c.used_at IS NULL) AS remaining
       FROM admins a
      WHERE a.id = $1`,
    adminId
  );

  const row = rows[0];
  return {
    enabled: Boolean(row?.totp_enabled_at),
    remainingCodes: Number(row?.remaining ?? 0),
    enabledAt: iso(row?.totp_enabled_at),
  };
}

/* ── Activation ─────────────────────────────────────────────── */

export type StartEnrollmentResult =
  | { secret: string; uri: string }
  | { error: string; status: number };

/**
 * Vérifie le mot de passe avant de générer un secret : une session volée ne
 * suffit pas à ajouter un second facteur à l'insu du titulaire.
 */
export async function startTotpEnrollment({
  adminId,
  email,
  password,
}: {
  adminId: string;
  email: string;
  password: string;
}): Promise<StartEnrollmentResult> {
  const rows = await query<{
    password_hash: string | null;
    totp_enabled_at: string | null;
  }>('SELECT password_hash, totp_enabled_at FROM admins WHERE id = $1', adminId);

  const admin = rows[0];
  if (!admin) return { error: 'Compte introuvable.', status: 404 };
  if (admin.totp_enabled_at) {
    return { error: 'La double authentification est déjà activée.', status: 409 };
  }
  if (!admin.password_hash || !(await verifyPassword(password, admin.password_hash))) {
    return { error: 'Mot de passe incorrect.', status: 401 };
  }

  const secret = generateTotpSecret();
  await query(
    `UPDATE admins
        SET totp_secret = $2, totp_enabled_at = NULL, totp_last_step = NULL
      WHERE id = $1`,
    adminId,
    encryptTotpSecret(secret)
  );

  return { secret, uri: totpUri(secret, email) };
}

export type ConfirmEnrollmentResult =
  | { codes: string[] }
  | { error: string; status: number };

export async function confirmTotpEnrollment(
  adminId: string,
  code: string
): Promise<ConfirmEnrollmentResult> {
  const rows = await query<{
    totp_secret: string | null;
    totp_enabled_at: string | null;
  }>('SELECT totp_secret, totp_enabled_at FROM admins WHERE id = $1', adminId);

  const admin = rows[0];
  if (!admin) return { error: 'Compte introuvable.', status: 404 };
  if (admin.totp_enabled_at) {
    return { error: 'La double authentification est déjà activée.', status: 409 };
  }
  const secret = decryptTotpSecret(admin.totp_secret);
  if (!secret) {
    return { error: 'Commencez par générer un nouveau secret.', status: 409 };
  }

  const check = verifyTotp(secret, code);
  if (!check.ok) {
    return { error: 'Code invalide. Vérifiez l’horloge de votre téléphone.', status: 422 };
  }

  const codes = generateRecoveryCodes();
  const hashes = await Promise.all(codes.map((item) => hashPassword(normalizeRecoveryCode(item))));

  await query(
    `UPDATE admins
        SET totp_enabled_at = now(), totp_last_step = $2
      WHERE id = $1`,
    adminId,
    check.step
  );

  await query('DELETE FROM admin_recovery_codes WHERE admin_id = $1', adminId);
  for (const hash of hashes) {
    await query(
      'INSERT INTO admin_recovery_codes (admin_id, code_hash) VALUES ($1, $2)',
      adminId,
      hash
    );
  }

  return { codes };
}

/* ── Vérification ───────────────────────────────────────────── */

export type SecondFactorResult =
  | { ok: true; method: 'totp' | 'recovery'; remainingCodes: number }
  | { ok: false };

/**
 * Accepte un code TOTP à 6 chiffres ou un code de secours.
 * Le pas consommé est enregistré pour qu'un même code ne serve jamais deux fois.
 */
export async function verifySecondFactor({
  adminId,
  storedSecret,
  lastStep,
  code,
}: {
  adminId: string;
  storedSecret: string | null;
  lastStep: number;
  code: string;
}): Promise<SecondFactorResult> {
  const trimmed = code.trim();

  if (/^\d{6}$/.test(trimmed)) {
    const secret = decryptTotpSecret(storedSecret);
    if (!secret) return { ok: false };

    const check = verifyTotp(secret, trimmed, lastStep);
    if (!check.ok) return { ok: false };

    // Garde anti-rejeu atomique : deux requêtes simultanées ne peuvent pas
    // consommer le même pas.
    const updated = await query(
      `UPDATE admins SET totp_last_step = $2
        WHERE id = $1 AND (totp_last_step IS NULL OR totp_last_step < $2)
        RETURNING id`,
      adminId,
      check.step
    );
    if (updated.length === 0) return { ok: false };

    const remaining = await query<{ total: number }>(
      'SELECT count(*)::int AS total FROM admin_recovery_codes WHERE admin_id = $1 AND used_at IS NULL',
      adminId
    );
    return { ok: true, method: 'totp', remainingCodes: Number(remaining[0]?.total ?? 0) };
  }

  const normalized = normalizeRecoveryCode(trimmed);
  if (normalized.length !== 10) return { ok: false };

  const stored = await query<{ id: string; code_hash: string }>(
    `SELECT id, code_hash FROM admin_recovery_codes
      WHERE admin_id = $1 AND used_at IS NULL`,
    adminId
  );

  for (const candidate of stored) {
    if (!(await verifyPassword(normalized, candidate.code_hash))) continue;

    const used = await query(
      `UPDATE admin_recovery_codes SET used_at = now()
        WHERE id = $1 AND used_at IS NULL
        RETURNING id`,
      candidate.id
    );
    if (used.length === 0) continue;

    const remaining = await query<{ total: number }>(
      'SELECT count(*)::int AS total FROM admin_recovery_codes WHERE admin_id = $1 AND used_at IS NULL',
      adminId
    );
    return { ok: true, method: 'recovery', remainingCodes: Number(remaining[0]?.total ?? 0) };
  }

  return { ok: false };
}

/* ── Désactivation et réinitialisation ──────────────────────── */

export type DisableMfaResult =
  | { ok: true; sessionVersion: number }
  | { error: string; status: number };

/** Exige mot de passe **et** second facteur : la simple session ne suffit pas. */
export async function disableTotp({
  adminId,
  password,
  code,
}: {
  adminId: string;
  password: string;
  code: string;
}): Promise<DisableMfaResult> {
  const rows = await query<{
    password_hash: string | null;
    totp_secret: string | null;
    totp_enabled_at: string | null;
    totp_last_step: string | number | null;
  }>(
    `SELECT password_hash, totp_secret, totp_enabled_at, totp_last_step
       FROM admins WHERE id = $1`,
    adminId
  );

  const admin = rows[0];
  if (!admin) return { error: 'Compte introuvable.', status: 404 };
  if (!admin.totp_enabled_at) {
    return { error: 'La double authentification n’est pas activée.', status: 409 };
  }
  if (!admin.password_hash || !(await verifyPassword(password, admin.password_hash))) {
    return { error: 'Mot de passe incorrect.', status: 401 };
  }

  const check = await verifySecondFactor({
    adminId,
    storedSecret: admin.totp_secret,
    lastStep: Number(admin.totp_last_step ?? 0),
    code,
  });
  if (!check.ok) {
    return { error: 'Code de vérification invalide.', status: 401 };
  }

  const updated = await query<{ session_version: number }>(
    `UPDATE admins
        SET totp_secret = NULL, totp_enabled_at = NULL, totp_last_step = NULL,
            session_version = session_version + 1
      WHERE id = $1
      RETURNING session_version`,
    adminId
  );
  await query('DELETE FROM admin_recovery_codes WHERE admin_id = $1', adminId);

  return { ok: true, sessionVersion: Number(updated[0]?.session_version ?? 0) };
}

/** Réinitialisation par un superadmin : débloque un compte ayant perdu son appareil. */
export async function resetTotp(adminId: string): Promise<boolean> {
  const rows = await query(
    `UPDATE admins
        SET totp_secret = NULL, totp_enabled_at = NULL, totp_last_step = NULL,
            session_version = session_version + 1
      WHERE id = $1
      RETURNING id`,
    adminId
  );
  await query('DELETE FROM admin_recovery_codes WHERE admin_id = $1', adminId);
  return rows.length > 0;
}
