import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * TOTP compatible Google Authenticator / 1Password (RFC 6238) :
 * HMAC-SHA1, 6 chiffres, pas de 30 secondes.
 */

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

/** Alphabet des codes de secours : sans I, O, 0 ni 1 (confusions de lecture). */
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_LENGTH = 10;

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];

  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/** 160 bits, comme recommandé pour SHA-1. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));

  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

/**
 * Vérifie un code à ±1 pas (petite dérive d'horloge).
 * `lastStep` bloque la réutilisation d'un code déjà consommé.
 */
export function verifyTotp(
  secret: string,
  code: string,
  lastStep = 0
): { ok: true; step: number } | { ok: false } {
  const normalized = code.replace(/\s+/g, '');
  if (!new RegExp(`^\\d{${DIGITS}}$`).test(normalized)) return { ok: false };

  const current = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (const step of [current - 1, current, current + 1]) {
    if (step <= lastStep) continue;
    const expected = Buffer.from(totpCode(secret, step));
    const candidate = Buffer.from(normalized);
    if (expected.length === candidate.length && timingSafeEqual(expected, candidate)) {
      return { ok: true, step };
    }
  }

  return { ok: false };
}

/** URI à encoder dans le QR code. */
export function totpUri(secret: string, email: string): string {
  const issuer = 'Cabinet Yo Mbi Consulting';
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

/** Codes de secours en clair : à afficher une seule fois, jamais relus ensuite. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const raw = Array.from(randomBytes(RECOVERY_CODE_LENGTH))
      .map((byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length])
      .join('');
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

/** Forme canonique pour la vérification : sans tirets ni espaces, en majuscules. */
export function normalizeRecoveryCode(code: string): string {
  return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** Un code de secours ressemble à `ABCDE-FGHJK` : ni 6 chiffres, ni phrase. */
export function looksLikeRecoveryCode(code: string): boolean {
  return normalizeRecoveryCode(code).length === RECOVERY_CODE_LENGTH;
}
