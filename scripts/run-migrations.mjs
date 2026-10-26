#!/usr/bin/env node
// Applique les migrations SQL de migrations/ dans l'ordre alphabétique.
// Les migrations déjà jouées sont enregistrées dans schema_migrations.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { Agent } from 'undici';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas défini.');
  console.error('   Ajoute-le dans .env.local puis relance : npm run db:migrate');
  process.exit(1);
}

const sql = neon(DATABASE_URL, {
  fetchOptions: { dispatcher: new Agent({ connect: { family: 4 } }) },
});

// Découpe un fichier SQL en instructions, en ignorant les ';' contenus
// dans des chaînes littérales et dans les corps $$ ... $$.
function splitStatements(source) {
  const statements = [];
  let current = '';
  let inString = false;
  for (const line of source.split('\n')) {
    if (line.trim().startsWith('--')) continue;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === "'" && line[i - 1] !== '\\') inString = !inString;
      if (ch === ';' && !inString) {
        if (current.trim()) statements.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    current += '\n';
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function runMigrations() {
  console.log('🚀 Migrations en cours…');

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const appliedRows = await sql`SELECT name FROM schema_migrations`;
  const applied = new Set(appliedRows.map((r) => r.name));

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭  ${file} (déjà appliquée)`);
      continue;
    }
    const content = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const statements = splitStatements(content);
    console.log(`  ▶  ${file} — ${statements.length} instruction(s)`);
    for (const stmt of statements) await sql.query(stmt);
    await sql`INSERT INTO schema_migrations (name) VALUES (${file})`;
    ran += 1;
  }

  console.log(ran === 0 ? '✅ Aucune nouvelle migration.' : `✅ ${ran} migration(s) appliquée(s).`);
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Échec de la migration :', err);
    process.exit(1);
  });
