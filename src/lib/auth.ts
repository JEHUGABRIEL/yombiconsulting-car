import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './db';

const COOKIE_NAME = 'yombi_admin';
const SESSION_MS = 1000 * 60 * 60 * 8; // 8 heures

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
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/**
 * Jeton : <exp>.<iat>.<adminId>.<signature HMAC>.
 * `iat` permet d'invalider les sessions émises avant un changement de mot de passe.
 */
export function createSessionToken(adminId: string, issuedAt: number = Date.now()): string {
  const iat = String(issuedAt);
  const exp = String(issuedAt + SESSION_MS);
  return `${exp}.${iat}.${adminId}.${sign(`${exp}.${iat}.${adminId}`)}`;
}

type SessionPayload = { exp: number; iat: number; adminId: string };

function parseSessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [exp, iat, adminId, sig] = parts;
    if (!/^\d+$/.test(exp) || !/^\d+$/.test(iat) || !adminId) return null;
    if (Date.now() > Number(exp)) return null;

    const expected = sign(`${exp}.${iat}.${adminId}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    return { exp: Number(exp), iat: Number(iat), adminId };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
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

    const rows = await query<AdminUser & { password_changed_at: string | null }>(
      'SELECT id, email, username, role, status, password_changed_at FROM admins WHERE id = $1',
      payload.adminId
    );
    const admin = rows[0];
    if (!admin || admin.status !== 'active') return null;

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
