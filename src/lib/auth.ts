import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { hasDb, query } from './db';

const SESSION_MS = 1000 * 60 * 60 * 8; // 8 heures

/** Longueur minimale du secret de signature (32 octets en hexadécimal). */
const SECRET_MIN_LENGTH = 32;

/**
 * `__Host-` impose Secure, Path=/ et l'absence de Domain : le cookie ne peut
 * pas être écrasé par un sous-domaine. Ce préfixe exige HTTPS, d'où le nom
 * simple en développement (http://localhost).
 */
const COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-yombi_admin' : 'yombi_admin';

export type AdminUser = {
  id: string;
  email: string;
  username: string | null;
  role: 'superadmin' | 'admin';
  status: 'active' | 'blocked';
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  if (secret.length < SECRET_MIN_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${SECRET_MIN_LENGTH} characters`);
  }
  return secret;
}

/** Auth utilisable : base joignable et secret de longueur suffisante. */
export function isAuthConfigured(): boolean {
  const secret = process.env.SESSION_SECRET;
  return hasDb() && typeof secret === 'string' && secret.length >= SECRET_MIN_LENGTH;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/**
 * Jeton : <exp>.<iat>.<adminId>.<version>.<signature HMAC>.
 * `iat` invalide les sessions émises avant un changement de mot de passe ;
 * `version` permet de révoquer tous les jetons d'un compte (`revokeAdminSessions`).
 */
export function createSessionToken(
  adminId: string,
  sessionVersion = 0,
  issuedAt: number = Date.now()
): string {
  const iat = String(issuedAt);
  const exp = String(issuedAt + SESSION_MS);
  const payload = `${exp}.${iat}.${adminId}.${sessionVersion}`;
  return `${payload}.${sign(payload)}`;
}

type SessionPayload = { exp: number; iat: number; adminId: string; version: number };

function parseSessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 5) return null;
    const [exp, iat, adminId, version, sig] = parts;
    if (!/^\d+$/.test(exp) || !/^\d+$/.test(iat) || !/^\d+$/.test(version) || !adminId) {
      return null;
    }
    if (Date.now() > Number(exp)) return null;

    const expected = sign(`${exp}.${iat}.${adminId}.${version}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    return { exp: Number(exp), iat: Number(iat), adminId, version: Number(version) };
  } catch {
    return null;
  }
}

/**
 * Révoque tous les jetons déjà émis pour cet admin (vol de cookie, départ…).
 * Toute session ouverte sur ce compte devra se reconnecter.
 */
export async function revokeAdminSessions(adminId: string): Promise<void> {
  await query('UPDATE admins SET session_version = session_version + 1 WHERE id = $1', adminId);
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    // Obligatoire pour le préfixe `__Host-`.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_MS / 1000),
  };
}

export function clearedSessionCookie() {
  return { ...sessionCookie(''), maxAge: 0 };
}

/** Admin courant, ou null. Vérifie signature, expiration, statut et rotation de mot de passe. */
export async function getSessionAdmin(): Promise<AdminUser | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = parseSessionToken(token);
    if (!payload) return null;

    const rows = await query<AdminUser & { password_changed_at: string | null; session_version: number | null }>(
      'SELECT id, email, username, role, status, password_changed_at, session_version FROM admins WHERE id = $1',
      payload.adminId
    );
    const admin = rows[0];
    if (!admin || admin.status !== 'active') return null;

    // Jeton émis avant la dernière révocation : refusé.
    if (Number(admin.session_version ?? 0) !== payload.version) return null;

    if (admin.password_changed_at) {
      const changedAt = new Date(admin.password_changed_at).getTime();
      if (Number.isFinite(changedAt) && payload.iat < changedAt) return null;
    }

    return { id: admin.id, email: admin.email, username: admin.username, role: admin.role, status: admin.status };
  } catch {
    return null;
  }
}

/** Renvoie l'admin ou lève une 401 à intercepter dans la route. */
export class UnauthorizedError extends Error {}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getSessionAdmin();
  if (!admin) throw new UnauthorizedError('Non authentifié');
  return admin;
}
