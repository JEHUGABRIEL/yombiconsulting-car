import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/** Format stocké : scrypt$<salt hex>$<hash hex>. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/**
 * Consomme le même coût qu'une vérification réelle, afin que l'absence de
 * compte (ou un compte sans mot de passe) ne se détecte pas au chronomètre.
 * Sel fixe et public : aucun secret n'est impliqué.
 */
const DUMMY_SALT = '00000000000000000000000000000000';

export async function burnPasswordCheck(password: string): Promise<void> {
  try {
    await scryptAsync(password, DUMMY_SALT, 64);
  } catch {
    // Aucune information à exploiter : on equalise seulement le temps passé.
  }
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
    const [, salt, hash] = parts;
    const candidate = await scryptAsync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
