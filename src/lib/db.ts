import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    sql = neon(url);
  }
  return sql;
}

/** Requête paramétrée ($1, $2, …). Renvoie toujours un tableau de lignes. */
export async function query<T = Record<string, unknown>>(
  text: string,
  ...values: unknown[]
): Promise<T[]> {
  return getDb().query(text, values) as Promise<T[]>;
}

/** true si une base est configurée — permet aux pages publiques de dégrader proprement. */
export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/* ── Sérialisation : ligne SQL → objet exposé par l'API ───────── */

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
/** Les drivers renvoient des Date : on expose systématiquement de l'ISO 8601. */
const iso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : '';

export type Locale = 'fr' | 'en';

export type ServiceRecord = ReturnType<typeof serializeService>;
export type FormationRecord = ReturnType<typeof serializeFormation>;
export type ActualiteRecord = ReturnType<typeof serializeActualite>;
export type MessageRecord = ReturnType<typeof serializeMessage>;

export function serializeService(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: { fr: str(row.title_fr), en: str(row.title_en) },
    description: { fr: str(row.description_fr), en: str(row.description_en) },
    list: { fr: arr(row.list_fr), en: arr(row.list_en) },
    subject: str(row.subject),
    image: str(row.image),
    published: row.published !== false,
    position: Number(row.position ?? 0),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function serializeFormation(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: { fr: str(row.title_fr), en: str(row.title_en) },
    category: str(row.category) as 'sec' | 'mgmt' | 'ent',
    description: { fr: str(row.description_fr), en: str(row.description_en) },
    duration: { fr: str(row.duration_fr), en: str(row.duration_en) },
    format: { fr: str(row.format_fr), en: str(row.format_en) },
    objectives: { fr: arr(row.objectives_fr), en: arr(row.objectives_en) },
    publicCible: { fr: str(row.public_cible_fr), en: str(row.public_cible_en) },
    image: str(row.image),
    published: row.published !== false,
    position: Number(row.position ?? 0),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function serializeActualite(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: { fr: str(row.title_fr), en: str(row.title_en) },
    excerpt: { fr: str(row.excerpt_fr), en: str(row.excerpt_en) },
    content: { fr: arr(row.content_fr), en: arr(row.content_en) },
    category: str(row.category),
    image: str(row.image),
    published: row.published !== false,
    publishedAt: iso(row.published_at).slice(0, 10),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function serializeMessage(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    name: str(row.name),
    email: str(row.email),
    phone: str(row.phone),
    company: str(row.company),
    subject: str(row.subject),
    body: str(row.body),
    read: row.read === true,
    createdAt: iso(row.created_at),
  };
}

/** Résout un champ bilingue avec repli sur le français. */
export function pick(field: { fr: string; en: string }, locale: Locale): string {
  return (locale === 'en' ? field.en : field.fr) || field.fr;
}

export function pickList(field: { fr: string[]; en: string[] }, locale: Locale): string[] {
  const value = locale === 'en' ? field.en : field.fr;
  return value.length > 0 ? value : field.fr;
}
