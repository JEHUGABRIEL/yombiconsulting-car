'use client';

import { useState } from 'react';
import {
  Download,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  asBilingualLines,
  asBilingualText,
  asBoolean,
  emptyValues,
  type AdminRecord,
  type Bilingual,
  type CollectionDef,
  type FieldDef,
  type FieldValue,
  type Values,
} from '@/lib/content-config';

const inputClass =
  'w-full rounded-[9px] bg-white/[0.04] border border-white/[0.09] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-blue/70 focus:bg-white/[0.06] transition-colors';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function Label({ field }: { field: FieldDef }) {
  return (
    <>
      {field.label}
      {field.required && <span className="text-blue-soft"> *</span>}
    </>
  );
}

function Control({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: FieldDef;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  switch (field.kind) {
    case 'textarea':
      return (
        <textarea
          id={id}
          rows={4}
          className={inputClass}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'lines': {
      const text = Array.isArray(value) ? value.join('\n') : '';
      return (
        <textarea
          id={id}
          rows={5}
          className={inputClass}
          value={text}
          onChange={(event) => onChange(event.target.value.split('\n'))}
        />
      );
    }

    case 'select':
      return (
        <select
          id={id}
          className={inputClass}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0A1728]">
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'number':
      return (
        <input
          id={id}
          type="number"
          min={0}
          max={999}
          className={inputClass}
          value={typeof value === 'number' ? value : 0}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
      );

    case 'date':
      return (
        <input
          id={id}
          type="date"
          className={inputClass}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'image':
      return <ImageControl id={id} value={value} onChange={onChange} />;

    default:
      return (
        <input
          id={id}
          type="text"
          className={inputClass}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

/**
 * Champ image : on peut coller une URL existante ou téléverser un fichier.
 * L'envoi passe par notre serveur, qui signe la requête Cloudinary ; le secret
 * ne quitte donc jamais le serveur et la CSP reste `connect-src 'self'`.
 */
function ImageControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const url = typeof value === 'string' ? value : '';

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Réinitialise pour pouvoir sélectionner deux fois le même fichier.
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/uploads', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadError(data?.error ?? 'Téléversement impossible.');
        return;
      }
      onChange(data.url);
    } catch {
      setUploadError('Réseau indisponible. Réessayez.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <input
        id={id}
        type="text"
        className={inputClass}
        value={url}
        placeholder="/images/… ou https://res.cloudinary.com/…"
        onChange={(event) => onChange(event.target.value)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 rounded-[8px] border border-white/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-white/70 transition-colors ${
            uploading ? 'opacity-60' : 'cursor-pointer hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} strokeWidth={1.75} />
          )}
          {uploading ? 'Envoi…' : 'Téléverser'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={uploading}
            onChange={onFile}
          />
        </label>
        <span className="text-[10.5px] text-white/35">JPEG, PNG, WebP, AVIF · 8 Mo max</span>
      </div>

      {uploadError && (
        <p role="alert" className="text-[11.5px] text-red-300">
          {uploadError}
        </p>
      )}

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-20 w-auto max-w-[280px] rounded-[8px] border border-white/[0.08] object-cover"
        />
      )}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
}) {
  if (field.bilingual) {
    const bilingual = field.kind === 'lines' ? asBilingualLines(value) : asBilingualText(value);

    return (
      <div className="md:col-span-2">
        <span className="block text-[11.5px] font-medium text-white/55 mb-1.5">
          <Label field={field} />
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['fr', 'en'] as const).map((lang) => (
            <div key={lang}>
              <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1">
                {lang}
              </span>
              <Control
                id={`${field.name}-${lang}`}
                field={field}
                value={bilingual[lang]}
                onChange={(next) => onChange({ ...bilingual, [lang]: next } as Bilingual)}
              />
            </div>
          ))}
        </div>
        {field.hint && <p className="text-[11px] text-white/40 mt-1.5">{field.hint}</p>}
      </div>
    );
  }

  if (field.kind === 'boolean') {
    return (
      <div className="flex items-end pb-1">
        <label className="inline-flex items-center gap-2.5 text-[12.5px] text-white/70 cursor-pointer">
          <input
            id={field.name}
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 rounded accent-[#2f74d0]"
          />
          <Label field={field} />
        </label>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={field.name} className="block text-[11.5px] font-medium text-white/55 mb-1.5">
        <Label field={field} />
      </label>
      <Control id={field.name} field={field} value={value} onChange={onChange} />
      {field.hint && <p className="text-[11px] text-white/40 mt-1.5">{field.hint}</p>}
    </div>
  );
}

export default function ContentManager({
  def,
  initial,
}: {
  def: CollectionDef;
  initial: AdminRecord[];
}) {
  const [records, setRecords] = useState<AdminRecord[]>(initial);
  const [draft, setDraft] = useState<Values | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setError(null);
    setEditingId(null);
    setDraft(emptyValues(def));
  }

  function startEdit(record: AdminRecord) {
    setError(null);
    setEditingId(record.id);
    setDraft({ ...record.values });
  }

  function cancel() {
    setDraft(null);
    setEditingId(null);
  }

  function setValue(name: string, value: FieldValue) {
    setDraft((current) => (current ? { ...current, [name]: value } : current));
  }

  async function save() {
    if (!draft) return;
    setBusy('save');
    setError(null);

    try {
      const res = await fetch(
        editingId
          ? `/api/admin/content/${def.key}/${editingId}`
          : `/api/admin/content/${def.key}`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: draft }),
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? 'Enregistrement impossible.');
        return;
      }

      const record = data.record as AdminRecord;
      setRecords((list) =>
        editingId ? list.map((item) => (item.id === record.id ? record : item)) : [...list, record]
      );
      cancel();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function togglePublished(record: AdminRecord) {
    setError(null);
    setBusy(record.id);

    try {
      const res = await fetch(`/api/admin/content/${def.key}/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: { ...record.values, published: !asBoolean(record.values.published) },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Mise à jour impossible.');
        return;
      }
      const updated = data.record as AdminRecord;
      setRecords((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function remove(record: AdminRecord) {
    const title = asBilingualText(record.values.title).fr || 'ce contenu';
    if (!window.confirm(`Supprimer définitivement « ${title} » ?`)) return;

    setError(null);
    setBusy(record.id);

    try {
      const res = await fetch(`/api/admin/content/${def.key}/${record.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? 'Suppression impossible.');
        return;
      }
      setRecords((list) => list.filter((item) => item.id !== record.id));
      if (editingId === record.id) cancel();
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function seed() {
    setSeeding(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/content/${def.key}/seed`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Import impossible.');
        return;
      }
      setRecords(data.records as AdminRecord[]);
    } catch {
      setError('Réseau indisponible. Réessayez.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-[12.5px] text-white/55">
          {records.length} {def.label.toLowerCase()} en base ·{' '}
          {records.filter((record) => asBoolean(record.values.published)).length} en ligne
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {records.length === 0 && (
            <button
              type="button"
              onClick={seed}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-[9px] border border-white/[0.12] px-4 py-2.5 text-[12.5px] font-semibold text-white/75 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={1.75} />}
              Importer le contenu actuel
            </button>
          )}
          <button
            type="button"
            onClick={startCreate}
            className="btn btn-primary px-4 py-2.5 text-[12.5px]"
          >
            <Plus size={16} strokeWidth={1.75} />
            Nouveau {def.singular}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-[12.5px] text-red-300 bg-red-500/10 border border-red-500/25 rounded-[9px] px-3.5 py-2.5 mb-4"
        >
          {error}
        </p>
      )}

      {draft && (
        <section className="mb-6 rounded-[14px] border border-blue/30 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[14.5px] font-semibold">
                {editingId ? `Modifier ${def.singular}` : `Nouveau ${def.singular}`}
              </h2>
              <p className="text-[12px] text-white/50 mt-1">
                Les champs français et anglais sont côte à côte. Le slug sert d’adresse sur le site.
              </p>
            </div>
            <button
              type="button"
              onClick={cancel}
              aria-label="Fermer le formulaire"
              className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.07] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {def.fields.map((field) => (
              <FieldControl
                key={field.name}
                field={field}
                value={draft[field.name]}
                onChange={(value) => setValue(field.name, value)}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              type="button"
              onClick={save}
              disabled={busy === 'save'}
              className="btn btn-primary px-5 py-2.5 text-[12.5px] disabled:opacity-60"
            >
              {busy === 'save' && <Loader2 size={16} className="animate-spin" />}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12.5px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Annuler
            </button>
          </div>
        </section>
      )}

      {records.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-5 py-12 text-center">
          <p className="text-[13px] text-white/60">
            Aucun contenu en base pour l’instant.
          </p>
          <p className="text-[12px] text-white/45 mt-1.5">
            Le site public affiche le contenu d’origine. Utilisez « Importer le contenu actuel »
            pour le reprendre ici et le modifier.
          </p>
        </div>
      ) : (
        <ul className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.05] overflow-hidden">
          {records.map((record) => {
            const published = asBoolean(record.values.published);
            const title = asBilingualText(record.values.title).fr || '(sans titre)';
            const slug = typeof record.values.slug === 'string' ? record.values.slug : '';
            const isActualite = def.key === 'actualites';
            const date = isActualite ? String(record.values.published_at ?? '') : '';
            const subtitle = isActualite
              ? [slug, date ? dateFormatter.format(new Date(`${date}T12:00:00`)) : '']
                  .filter(Boolean)
                  .join(' · ')
              : [slug, `position ${Number(record.values.position ?? 0)}`].filter(Boolean).join(' · ');

            return (
              <li key={record.id} className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    published ? 'bg-blue-soft' : 'bg-white/20'
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-white truncate">{title}</p>
                  <p className="text-[11.5px] text-white/45 truncate mt-0.5">{subtitle}</p>
                </div>
                <span
                  className={`text-[10.5px] font-semibold px-2 py-1 rounded-full ${
                    published ? 'bg-blue/20 text-blue-soft' : 'bg-white/[0.06] text-white/50'
                  }`}
                >
                  {published ? 'En ligne' : 'Brouillon'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(record)}
                    title="Modifier"
                    aria-label={`Modifier ${title}`}
                    className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.07] transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(record)}
                    disabled={busy === record.id}
                    title={published ? 'Dépublier' : 'Publier'}
                    aria-label={published ? `Dépublier ${title}` : `Publier ${title}`}
                    className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.07] transition-colors disabled:opacity-40"
                  >
                    {published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(record)}
                    disabled={busy === record.id}
                    title="Supprimer"
                    aria-label={`Supprimer ${title}`}
                    className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/55 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
