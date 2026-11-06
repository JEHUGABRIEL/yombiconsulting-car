#!/usr/bin/env node
// Inventaire des médias Cloudinary, pour repérer tout téléversement inattendu.
// Usage : npm run cloudinary:audit -- [--days=30] [--prefix=yombi/cms/] [--type=image|video|raw]
//
// Le script interroge l'API Admin en lecture seule (aucune écriture, aucune
// suppression) et distingue les médias du site (dossier yombi/cms/) de ceux
// des autres projets hébergés sur le même compte Cloudinary.

const KNOWN_PREFIX = 'yombi/cms/';
const PAGE_SIZE = 500;
const MAX_PAGES = 20; // garde-fou : 20 × 500 = 10 000 assets au maximum

const args = process.argv.slice(2);

function readFlag(name, fallback) {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const days = Number(readFlag('days', '30'));
const resourceType = readFlag('type', 'image');
const prefix = readFlag('prefix', '');

if (!Number.isFinite(days) || days < 0) {
  console.error('❌ --days doit être un nombre positif (0 = tout l’historique).');
  process.exit(1);
}
if (!['image', 'video', 'raw'].includes(resourceType)) {
  console.error("❌ --type doit valoir 'image', 'video' ou 'raw'.");
  process.exit(1);
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont requis.');
  console.error('   Ajoute-les dans .env.local puis relance : npm run cloudinary:audit');
  process.exit(1);
}

const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
const cutoff = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

async function fetchPage(cursor) {
  const url = new URL(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/${resourceType}/upload`
  );
  url.searchParams.set('max_results', String(PAGE_SIZE));
  url.searchParams.set('direction', 'desc');
  if (prefix) url.searchParams.set('prefix', prefix);
  if (cursor) url.searchParams.set('next_cursor', cursor);

  const res = await fetch(url, { headers: { Authorization: authorization }, cache: 'no-store' });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`API Admin Cloudinary (${res.status}) : ${detail.slice(0, 200)}`);
  }
  return res.json();
}

async function listAssets() {
  const assets = [];
  let cursor;
  let pages = 0;

  do {
    const body = await fetchPage(cursor);
    const batch = Array.isArray(body.resources) ? body.resources : [];
    assets.push(...batch);
    pages += 1;

    cursor = body.next_cursor;
    const oldest = batch.length > 0 ? new Date(batch[batch.length - 1].created_at) : null;
    // Tri décroissant : dès que la page dépasse la fenêtre, on peut s'arrêter.
    if (oldest && cutoff && oldest < cutoff) cursor = undefined;
  } while (cursor && pages < MAX_PAGES);

  return assets.filter((asset) => !cutoff || new Date(asset.created_at) >= cutoff);
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return '?';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mio`;
  return `${Math.max(1, Math.round(bytes / 1024))} Kio`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}`;
}

function folderOf(publicId) {
  const segments = String(publicId).split('/');
  return segments.length > 1 ? segments[0] : '(racine)';
}

try {
  const assets = await listAssets();
  assets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const ours = assets.filter((asset) => String(asset.public_id).startsWith(KNOWN_PREFIX));
  const foreign = assets.filter((asset) => !String(asset.public_id).startsWith(KNOWN_PREFIX));

  const window = days === 0 ? 'tout l’historique' : `${days} dernier(s) jour(s)`;
  console.log(
    `🔎 ${cloudName} · ${resourceType} · ${window}${prefix ? ` · préfixe ${prefix}` : ''} — ${assets.length} asset(s)`
  );
  console.log(`   dont ${ours.length} dans ${KNOWN_PREFIX} et ${foreign.length} ailleurs sur le compte.`);

  if (foreign.length > 0) {
    const byFolder = new Map();
    for (const asset of foreign) {
      const folder = folderOf(asset.public_id);
      byFolder.set(folder, (byFolder.get(folder) ?? 0) + 1);
    }
    const summary = [...byFolder.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([folder, count]) => `${folder} (${count})`)
      .join(', ');
    console.log(`   Dossiers hors site : ${summary}`);
  }

  const rows = assets.slice(0, 50);
  if (rows.length > 0) {
    console.log('');
    console.log('   date (UTC)          taille      type  public_id');
    for (const asset of rows) {
      const own = String(asset.public_id).startsWith(KNOWN_PREFIX);
      const marker = own ? '  ' : '⚠ ';
      console.log(
        `   ${marker}${formatDate(asset.created_at)}  ${formatSize(asset.bytes).padStart(9)}  ${String(asset.format ?? '?').padEnd(5)} ${asset.public_id}`
      );
    }
    if (assets.length > rows.length) {
      console.log(`   … ${assets.length - rows.length} asset(s) plus ancien(s) non affiché(s).`);
    }
  }

  if (ours.length === 0) {
    console.log('');
    console.log(`ℹ️  Aucun média dans ${KNOWN_PREFIX} sur cette période.`);
  }
  if (foreign.length > 0) {
    console.log('');
    console.log('⚠  Les lignes marquées ⚠ viennent d’un autre projet du compte Cloudinary :');
    console.log('   vérifiez qu’elles correspondent à vos autres sites, sinon l’API key est compromise.');
  }
} catch (err) {
  console.error('❌ Échec de l’inventaire :', err instanceof Error ? err.message : err);
  process.exit(1);
}
