import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/**
 * Mots de passe trop devinables : mêmes règles que `scripts/create-admin.mjs`,
 * pour qu'un changement de mot de passe ne puisse pas contourner la politique
 * appliquée à la création du compte.
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'motdepasse', 'motdepasse123', 'azertyuiop',
  'qwertyuiop', '123456789012', '1234567890123', 'admin123456789',
  'administrateur', 'bienvenue123', 'welcome12345', 'letmein12345',
  'changeme1234', 'password1234', 'qwerty123456', 'azerty123456',
  'iloveyou1234', 'monkey123456', 'dragon123456', 'soleil123456',
  'bonjour12345', 'yombi123456', 'consulting123', 'bangui123456',
]);

/** Message d'erreur si le mot de passe est refusé, `null` s'il convient. */
export function passwordProblem(password: string, email = ''): string | null {
  if (password.length < 12) {
    return 'Le mot de passe doit contenir au moins 12 caractères.';
  }
  if (password.length > 256) {
    return 'Le mot de passe est trop long (256 caractères maximum).';
  }

  const lowered = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lowered)) return 'Ce mot de passe est trop courant.';

  const address = email.trim().toLowerCase();
  if (address && lowered === address) {
    return 'Le mot de passe ne peut pas être votre adresse e-mail.';
  }

  return null;
}

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
