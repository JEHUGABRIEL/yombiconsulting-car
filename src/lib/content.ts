import 'server-only';
import {
  hasDb,
  pick,
  pickList,
  query,
  serializeActualite,
  serializeFormation,
  serializeService,
} from './db';
import { getActualites, getActualiteBySlug, type Actualite } from '@/data/actualites';
import { getFormations, getFormationBySlug, type Formation } from '@/data/formations';
import { getServices, getServiceBySlug, type Service } from '@/data/services';

type ContentLocale = 'fr' | 'en';

const asLocale = (locale: string): ContentLocale => (locale === 'en' ? 'en' : 'fr');

function formatDate(value: string, locale: ContentLocale): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** La table contient-elle au moins une ligne, publiée ou non ? */
async function tableHasRows(
  table: 'services' | 'formations' | 'actualites'
): Promise<boolean> {
  const rows = await query(`SELECT 1 FROM ${table} LIMIT 1`);
  return rows.length > 0;
}

function toService(row: Record<string, unknown>, locale: ContentLocale): Service {
  const service = serializeService(row);
  return {
    slug: service.slug,
    title: pick(service.title, locale),
    description: pick(service.description, locale),
    list: pickList(service.list, locale),
    subject: service.subject,
    image: service.image,
  };
}

function toFormation(row: Record<string, unknown>, locale: ContentLocale): Formation {
  const formation = serializeFormation(row);
  return {
    slug: formation.slug,
    title: pick(formation.title, locale),
    category: formation.category,
    description: pick(formation.description, locale),
    duration: pick(formation.duration, locale),
    format: pick(formation.format, locale),
    objectives: pickList(formation.objectives, locale),
    public_cible: pick(formation.publicCible, locale),
    image: formation.image,
  };
}

function toActualite(row: Record<string, unknown>, locale: ContentLocale): Actualite {
  const actualite = serializeActualite(row);
  return {
    slug: actualite.slug,
    dateISO: actualite.publishedAt || '',
    date: formatDate(actualite.publishedAt, locale),
    category: actualite.category,
    title: pick(actualite.title, locale),
    excerpt: pick(actualite.excerpt, locale),
    content: pickList(actualite.content, locale),
    image: actualite.image,
  };
}

/* ── Services ──────────────────────────────────────────────── */

export async function getPublicServices(locale: string): Promise<Service[]> {
  const l = asLocale(locale);
  if (!hasDb()) return getServices(l);

  try {
    const rows = await query(
      'SELECT * FROM services WHERE published = true ORDER BY position ASC, created_at ASC'
    );
    if (rows.length === 0) return (await tableHasRows('services')) ? [] : getServices(l);
    return rows.map((row) => toService(row, l));
  } catch (err) {
    console.error('public services error:', err);
    return getServices(l);
  }
}

export async function getPublicService(slug: string, locale: string): Promise<Service | undefined> {
  const l = asLocale(locale);
  if (!hasDb()) return getServiceBySlug(slug, l);

  try {
    const rows = await query(
      'SELECT * FROM services WHERE slug = $1 AND published = true LIMIT 1',
      slug
    );
    if (rows[0]) return toService(rows[0], l);
    if (await tableHasRows('services')) return undefined;
    return getServiceBySlug(slug, l);
  } catch (err) {
    console.error('public service error:', err);
    return getServiceBySlug(slug, l);
  }
}

/* ── Formations ────────────────────────────────────────────── */

export async function getPublicFormations(locale: string): Promise<Formation[]> {
  const l = asLocale(locale);
  if (!hasDb()) return getFormations(l);

  try {
    const rows = await query(
      'SELECT * FROM formations WHERE published = true ORDER BY position ASC, created_at ASC'
    );
    if (rows.length === 0) return (await tableHasRows('formations')) ? [] : getFormations(l);
    return rows.map((row) => toFormation(row, l));
  } catch (err) {
    console.error('public formations error:', err);
    return getFormations(l);
  }
}

export async function getPublicFormation(
  slug: string,
  locale: string
): Promise<Formation | undefined> {
  const l = asLocale(locale);
  if (!hasDb()) return getFormationBySlug(slug, l);

  try {
    const rows = await query(
      'SELECT * FROM formations WHERE slug = $1 AND published = true LIMIT 1',
      slug
    );
    if (rows[0]) return toFormation(rows[0], l);
    if (await tableHasRows('formations')) return undefined;
    return getFormationBySlug(slug, l);
  } catch (err) {
    console.error('public formation error:', err);
    return getFormationBySlug(slug, l);
  }
}

/* ── Actualités ────────────────────────────────────────────── */

export async function getPublicActualites(locale: string): Promise<Actualite[]> {
  const l = asLocale(locale);
  if (!hasDb()) return getActualites(l);

  try {
    const rows = await query(
      'SELECT * FROM actualites WHERE published = true ORDER BY published_at DESC, created_at DESC'
    );
    if (rows.length === 0) return (await tableHasRows('actualites')) ? [] : getActualites(l);
    return rows.map((row) => toActualite(row, l));
  } catch (err) {
    console.error('public actualites error:', err);
    return getActualites(l);
  }
}

export async function getPublicActualite(
  slug: string,
  locale: string
): Promise<Actualite | undefined> {
  const l = asLocale(locale);
  if (!hasDb()) return getActualiteBySlug(slug, l);

  try {
    const rows = await query(
      'SELECT * FROM actualites WHERE slug = $1 AND published = true LIMIT 1',
      slug
    );
    if (rows[0]) return toActualite(rows[0], l);
    if (await tableHasRows('actualites')) return undefined;
    return getActualiteBySlug(slug, l);
  } catch (err) {
    console.error('public actualite error:', err);
    return getActualiteBySlug(slug, l);
  }
}
