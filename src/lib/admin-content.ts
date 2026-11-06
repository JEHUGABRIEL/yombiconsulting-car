import 'server-only';
import { query } from './db';
import { actualites, actualitesEn } from '@/data/actualites';
import { formations, formationsEn } from '@/data/formations';
import { services, servicesEn } from '@/data/services';
import {
  parseValues,
  toAdminRecord,
  type AdminRecord,
  type CollectionDef,
  type Values,
} from './content-config';

export async function listRecords(def: CollectionDef): Promise<AdminRecord[]> {
  const rows = await query(`SELECT * FROM ${def.key} ORDER BY ${def.orderBy}`);
  return rows.map((row) => toAdminRecord(def, row));
}

export async function unreadMessages(): Promise<number> {
  try {
    const rows = await query<{ total: string }>(
      'SELECT count(*)::int AS total FROM messages WHERE read = false'
    );
    return Number(rows[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

function placeholders(parsed: { columns: string[]; casts: (string | null)[] }): string {
  return parsed.columns
    .map((_, index) => (parsed.casts[index] ? `$${index + 1}::${parsed.casts[index]}` : `$${index + 1}`))
    .join(', ');
}

function assignments(parsed: { columns: string[]; casts: (string | null)[] }, offset = 0): string {
  return parsed.columns
    .map((column, index) => {
      const position = offset + index + 1;
      const cast = parsed.casts[index] ? `::${parsed.casts[index]}` : '';
      return `${column} = $${position}${cast}`;
    })
    .join(', ');
}

export async function createRecord(
  def: CollectionDef,
  input: unknown
): Promise<{ record: AdminRecord } | { error: string }> {
  const parsed = parseValues(def, input);
  if ('error' in parsed) return { error: parsed.error };

  const rows = await query(
    `INSERT INTO ${def.key} (${parsed.columns.join(', ')})
     VALUES (${placeholders(parsed)})
     RETURNING *`,
    ...parsed.params
  );

  return { record: toAdminRecord(def, rows[0]) };
}

export async function updateRecord(
  def: CollectionDef,
  id: string,
  input: unknown
): Promise<{ record: AdminRecord } | { error: string } | { missing: true }> {
  const parsed = parseValues(def, input);
  if ('error' in parsed) return { error: parsed.error };

  const rows = await query(
    `UPDATE ${def.key}
        SET ${assignments(parsed)}, updated_at = now()
      WHERE id = $${parsed.params.length + 1}
      RETURNING *`,
    ...parsed.params,
    id
  );

  if (
    !rows[0] ||
    (typeof rows[0].id === 'string' && rows[0].id !== id)
  ) {
    return { missing: true };
  }

  return { record: toAdminRecord(def, rows[0]) };
}

export async function deleteRecord(def: CollectionDef, id: string): Promise<boolean> {
  const rows = await query(`DELETE FROM ${def.key} WHERE id = $1 RETURNING id`, id);
  return rows.length > 0;
}

/* ── Amorçage : reprendre le contenu actuellement codé en dur ── */

function seedValues(def: CollectionDef): Values[] {
  if (def.key === 'services') {
    const english = new Map(servicesEn.map((item) => [item.slug, item]));
    return services.map((item, index) => {
      const en = english.get(item.slug);
      return {
        title: { fr: item.title, en: en?.title ?? '' },
        slug: item.slug,
        description: { fr: item.description, en: en?.description ?? '' },
        list: { fr: item.list, en: en?.list ?? [] },
        subject: item.subject,
        image: item.image,
        position: index,
        published: true,
      };
    });
  }

  if (def.key === 'formations') {
    const english = new Map(formationsEn.map((item) => [item.slug, item]));
    return formations.map((item, index) => {
      const en = english.get(item.slug);
      return {
        title: { fr: item.title, en: en?.title ?? '' },
        slug: item.slug,
        category: item.category,
        description: { fr: item.description, en: en?.description ?? '' },
        duration: { fr: item.duration, en: en?.duration ?? '' },
        format: { fr: item.format, en: en?.format ?? '' },
        objectives: { fr: item.objectives, en: en?.objectives ?? [] },
        public_cible: { fr: item.public_cible, en: en?.public_cible ?? '' },
        image: item.image,
        position: index,
        published: true,
      };
    });
  }

  const english = new Map(actualitesEn.map((item) => [item.slug, item]));
  return actualites.map((item) => {
    const en = english.get(item.slug);
    return {
      title: { fr: item.title, en: en?.title ?? '' },
      slug: item.slug,
      published_at: item.dateISO,
      category: item.category,
      excerpt: { fr: item.excerpt, en: en?.excerpt ?? '' },
      content: { fr: item.content, en: en?.content ?? [] },
      image: item.image,
      published: true,
    };
  });
}

/**
 * Insère le contenu d'origine uniquement si la table est vide.
 * Les modifications ultérieures faites dans le back-office ne sont jamais écrasées.
 */
export async function seedCollection(
  def: CollectionDef
): Promise<{ inserted: number; records: AdminRecord[] }> {
  const existing = await query(`SELECT 1 FROM ${def.key} LIMIT 1`);
  let inserted = 0;

  if (existing.length === 0) {
    for (const values of seedValues(def)) {
      const parsed = parseValues(def, values);
      if ('error' in parsed) throw new Error(parsed.error);

      await query(
        `INSERT INTO ${def.key} (${parsed.columns.join(', ')})
         VALUES (${placeholders(parsed)})
         ON CONFLICT (slug) DO NOTHING`,
        ...parsed.params
      );
      inserted += 1;
    }
  }

  return { inserted, records: await listRecords(def) };
}

/** Erreur de contrainte d'unicité (slug déjà pris). */
export function isUniqueViolation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /duplicate key|unique constraint/i.test(message);
}
