#!/usr/bin/env node
// Crée (ou met à jour) un administrateur du back-office.
// Usage : node scripts/create-admin.mjs <email> <motDePasse> [--role=superadmin]

import { randomBytes, scryptSync } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL n'est pas défini.");
  console.error('   Ajoute-le dans .env.local puis relance : npm run db:create-admin');
  process.exit(1);
}

const [emailArg, passwordArg, ...rest] = process.argv.slice(2);
const email = (emailArg || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = passwordArg || process.env.ADMIN_PASSWORD || '';
const roleFlag = rest.find((arg) => arg.startsWith('--role='));
const role = roleFlag ? roleFlag.split('=')[1] : 'admin';

if (!email || !email.includes('@')) {
  console.error('❌ E-mail valide requis.');
  console.error('   node scripts/create-admin.mjs prenom@yombiconsulting.com "MotDePasseSolide"');
  process.exit(1);
}
if (password.length < 12) {
  console.error('❌ Le mot de passe doit contenir au moins 12 caractères.');
  process.exit(1);
}
if (!['admin', 'superadmin'].includes(role)) {
  console.error("❌ Rôle invalide : 'admin' ou 'superadmin' attendu.");
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const passwordHash = `scrypt$${salt}$${hash}`;

const sql = neon(DATABASE_URL);

try {
  const rows = await sql`
    INSERT INTO admins (email, password_hash, role, status, password_changed_at)
    VALUES (${email}, ${passwordHash}, ${role}, 'active', now())
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          status = 'active',
          password_changed_at = now()
    RETURNING id, email, role
  `;

  console.log(`✅ Administrateur prêt : ${rows[0].email} (${rows[0].role})`);
  console.log(`   id = ${rows[0].id}`);
} catch (err) {
  console.error('❌ Échec :', err);
  process.exit(1);
}
