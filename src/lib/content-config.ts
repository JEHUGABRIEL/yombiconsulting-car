/**
 * Description des contenus éditables depuis le back-office.
 * Ce module est partagé par le client (formulaires) et le serveur (API) :
 * il ne doit importer ni base de données ni module Node.
 */

export type CollectionKey = 'services' | 'formations' | 'actualites';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'lines'
  | 'number'
  | 'boolean'
  | 'select'
  | 'date'
  | 'slug'
  | 'image';

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  bilingual?: boolean;
  required?: boolean;
  max?: number;
  hint?: string;
  options?: { value: string; label: string }[];
};

export type CollectionDef = {
  key: CollectionKey;
  label: string;
  singular: string;
  description: string;
  /** Clause ORDER BY : constantes internes uniquement. */
  orderBy: string;
  fields: FieldDef[];
};

export type Bilingual = { fr: string | string[]; en: string | string[] };
export type FieldValue = string | string[] | number | boolean | Bilingual;
export type Values = Record<string, FieldValue>;

export type AdminRecord = {
  id: string;
  updatedAt: string;
  values: Values;
};

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  services: {
    key: 'services',
    label: 'Services',
    singular: 'service',
    description:
      'Les prestations affichées sur la page Services et sur la page d’accueil.',
    orderBy: 'position ASC, created_at ASC',
    fields: [
      { name: 'title', label: 'Titre', kind: 'text', bilingual: true, required: true, max: 120 },
      {
        name: 'slug',
        label: 'Slug (URL)',
        kind: 'slug',
        hint: 'Laisser vide pour le générer depuis le titre français.',
      },
      { name: 'description', label: 'Description', kind: 'textarea', bilingual: true, max: 1200 },
      {
        name: 'list',
        label: 'Prestations',
        kind: 'lines',
        bilingual: true,
        hint: 'Une ligne par prestation.',
      },
      {
        name: 'subject',
        label: 'Objet de l’e-mail',
        kind: 'text',
        max: 160,
        hint: 'Utilisé dans le lien « demander ce service ».',
      },
      {
        name: 'image',
        label: 'Image (chemin ou URL)',
        kind: 'image',
        max: 300,
        hint: 'Chemin local (/images/…) ou URL https://res.cloudinary.com/….',
      },
      { name: 'position', label: 'Ordre d’affichage', kind: 'number' },
      { name: 'published', label: 'Publié sur le site', kind: 'boolean' },
    ],
  },
  formations: {
    key: 'formations',
    label: 'Formations',
    singular: 'formation',
    description: 'Le catalogue de formations, filtres et fiches détaillées.',
    orderBy: 'position ASC, created_at ASC',
    fields: [
      { name: 'title', label: 'Titre', kind: 'text', bilingual: true, required: true, max: 120 },
      {
        name: 'slug',
        label: 'Slug (URL)',
        kind: 'slug',
        hint: 'Laisser vide pour le générer depuis le titre français.',
      },
      {
        name: 'category',
        label: 'Catégorie',
        kind: 'select',
        options: [
          { value: 'sec', label: 'Santé & sécurité' },
          { value: 'mgmt', label: 'Management' },
          { value: 'ent', label: 'Entrepreneuriat' },
        ],
      },
      { name: 'description', label: 'Description', kind: 'textarea', bilingual: true, max: 1200 },
      { name: 'duration', label: 'Durée', kind: 'text', bilingual: true, max: 80 },
      { name: 'format', label: 'Format', kind: 'text', bilingual: true, max: 80 },
      {
        name: 'objectives',
        label: 'Objectifs',
        kind: 'lines',
        bilingual: true,
        hint: 'Une ligne par objectif.',
      },
      { name: 'public_cible', label: 'Public visé', kind: 'text', bilingual: true, max: 200 },
      {
        name: 'image',
        label: 'Image (chemin ou URL)',
        kind: 'image',
        max: 300,
        hint: 'Chemin local (/images/…) ou URL https://res.cloudinary.com/….',
      },
      { name: 'position', label: 'Ordre d’affichage', kind: 'number' },
      { name: 'published', label: 'Publié sur le site', kind: 'boolean' },
    ],
  },
  actualites: {
    key: 'actualites',
    label: 'Actualités',
    singular: 'actualité',
    description: 'Les articles publiés sur le site, du plus récent au plus ancien.',
    orderBy: 'published_at DESC, created_at DESC',
    fields: [
      { name: 'title', label: 'Titre', kind: 'text', bilingual: true, required: true, max: 160 },
      {
        name: 'slug',
        label: 'Slug (URL)',
        kind: 'slug',
        hint: 'Laisser vide pour le générer depuis le titre français.',
      },
      { name: 'published_at', label: 'Date de publication', kind: 'date' },
      { name: 'category', label: 'Rubrique', kind: 'text', max: 80 },
      { name: 'excerpt', label: 'Résumé', kind: 'textarea', bilingual: true, max: 600 },
      {
        name: 'content',
        label: 'Corps de l’article',
        kind: 'lines',
        bilingual: true,
        hint: 'Un paragraphe par ligne.',
      },
      {
        name: 'image',
        label: 'Image (chemin ou URL)',
        kind: 'image',
        max: 300,
        hint: 'Chemin local (/images/…) ou URL https://res.cloudinary.com/….',
      },
      { name: 'published', label: 'Publié sur le site', kind: 'boolean' },
    ],
  },
};

/**
 * Hôtes d'images distants autorisés (doit rester aligné avec `img-src` dans
 * `src/middleware.ts`).
 */
const IMAGE_HOSTS = new Set(['res.cloudinary.com']);

/**
 * Une image doit être un chemin du site (`/images/…`) ou une URL https d'un
 * hôte autorisé. On refuse `javascript:`, `data:`, les URL protocol-relative
 * et tout domaine tiers (fuite des visiteurs, contournement de la CSP).
 */
export function isAllowedImageUrl(value: string): boolean {
  if (!value) return true;
  if (/^\/(?!\/)/.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function getCollection(key: string): CollectionDef | null {
  if (!Object.prototype.hasOwnProperty.call(COLLECTIONS, key)) return null;
  return COLLECTIONS[key as CollectionKey];
}

/* ── Lecture tolérante des valeurs ─────────────────────────── */

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function asText(value: unknown): string {
  return asString(value);
}

export function asLines(value: unknown): string[] {
  return asStringArray(value);
}

export function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}

export function asBilingualText(value: unknown): { fr: string; en: string } {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return { fr: asString(record.fr), en: asString(record.en) };
}

export function asBilingualLines(value: unknown): { fr: string[]; en: string[] } {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return { fr: asStringArray(record.fr), en: asStringArray(record.en) };
}

/* ── Conversion ligne SQL → enregistrement éditable ────────── */

const isoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  return asString(value);
};

const isoDate = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return asString(value).slice(0, 10);
};

export function toAdminRecord(def: CollectionDef, row: Record<string, unknown>): AdminRecord {
  const values: Values = {};

  for (const field of def.fields) {
    if (field.bilingual) {
      values[field.name] = {
        fr: field.kind === 'lines' ? asStringArray(row[`${field.name}_fr`]) : asString(row[`${field.name}_fr`]),
        en: field.kind === 'lines' ? asStringArray(row[`${field.name}_en`]) : asString(row[`${field.name}_en`]),
      };
      continue;
    }

    if (field.kind === 'boolean') values[field.name] = row[field.name] === true;
    else if (field.kind === 'number') values[field.name] = Number(row[field.name] ?? 0);
    else if (field.kind === 'date') values[field.name] = isoDate(row[field.name]);
    else values[field.name] = asString(row[field.name]);
  }

  return {
    id: asString(row.id),
    updatedAt: isoString(row.updated_at) || new Date().toISOString(),
    values,
  };
}

export function emptyValues(def: CollectionDef): Values {
  const values: Values = {};
  const today = new Date().toISOString().slice(0, 10);

  for (const field of def.fields) {
    if (field.bilingual) {
      values[field.name] = { fr: field.kind === 'lines' ? [] : '', en: field.kind === 'lines' ? [] : '' };
      continue;
    }
    if (field.kind === 'boolean') values[field.name] = true;
    else if (field.kind === 'number') values[field.name] = 0;
    else if (field.kind === 'date') values[field.name] = today;
    else if (field.kind === 'select') values[field.name] = field.options?.[0]?.value ?? '';
    else values[field.name] = '';
  }

  return values;
}

/* ── Validation et conversion en colonnes SQL ──────────────── */

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export type ParsedValues = {
  columns: string[];
  params: unknown[];
  /** Cast SQL requis (jsonb pour les listes). */
  casts: (string | null)[];
};

const cleanLines = (value: unknown): string[] =>
  asStringArray(value)
    .map((item) => item.trim())
    .filter(Boolean);

export function parseValues(def: CollectionDef, input: unknown): ParsedValues | { error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Données invalides.' };
  }

  const source = input as Record<string, unknown>;
  const columns: string[] = [];
  const params: unknown[] = [];
  const casts: (string | null)[] = [];

  const push = (column: string, value: unknown, cast: string | null = null) => {
    columns.push(column);
    params.push(value);
    casts.push(cast);
  };

  for (const field of def.fields) {
    const raw = source[field.name];

    if (field.bilingual) {
      const bilingual =
        raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

      for (const lang of ['fr', 'en'] as const) {
        if (field.kind === 'lines') {
          const list = cleanLines(bilingual[lang]);
          if (list.length > 40) return { error: `${field.label} : 40 lignes maximum.` };
          if (list.some((item) => item.length > 500)) {
            return { error: `${field.label} : 500 caractères maximum par ligne.` };
          }
          push(`${field.name}_${lang}`, JSON.stringify(list), 'jsonb');
          continue;
        }

        const value = asString(bilingual[lang]).trim();
        const max = field.max ?? (field.kind === 'textarea' ? 5000 : 300);
        if (value.length > max) return { error: `${field.label} : ${max} caractères maximum.` };
        if (lang === 'fr' && field.required && !value) {
          return { error: `${field.label} est obligatoire en français.` };
        }
        push(`${field.name}_${lang}`, value);
      }
      continue;
    }

    switch (field.kind) {
      case 'slug': {
        const title = source.title;
        const titleFr =
          title && typeof title === 'object' && !Array.isArray(title)
            ? asString((title as Record<string, unknown>).fr)
            : '';
        const value = asString(raw).trim() || slugify(titleFr);
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return { error: 'Slug invalide : minuscules, chiffres et tirets uniquement.' };
        }
        if (value.length > 80) return { error: 'Slug : 80 caractères maximum.' };
        push('slug', value);
        break;
      }

      case 'boolean':
        push(field.name, raw === true);
        break;

      case 'number': {
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || value > 999) {
          return { error: `${field.label} : nombre entre 0 et 999 attendu.` };
        }
        push(field.name, Math.trunc(value));
        break;
      }

      case 'select': {
        const value = asString(raw).trim();
        if (!field.options?.some((option) => option.value === value)) {
          return { error: `${field.label} : valeur inconnue.` };
        }
        push(field.name, value);
        break;
      }

      case 'date': {
        const value = asString(raw).trim() || new Date().toISOString().slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return { error: `${field.label} : date invalide.` };
        }
        push(field.name, value);
        break;
      }

      case 'image': {
        const value = asString(raw).trim();
        const max = field.max ?? 300;
        if (value.length > max) return { error: `${field.label} : ${max} caractères maximum.` };
        if (!isAllowedImageUrl(value)) {
          return {
            error: `${field.label} : chemin /… ou URL https://res.cloudinary.com/… attendu.`,
          };
        }
        push(field.name, value);
        break;
      }

      default: {
        const value = asString(raw).trim();
        const max = field.max ?? 300;
        if (value.length > max) return { error: `${field.label} : ${max} caractères maximum.` };
        if (field.required && !value) return { error: `${field.label} est obligatoire.` };
        push(field.name, value);
      }
    }
  }

  return { columns, params, casts };
}
