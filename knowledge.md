# Project knowledge

## What this is
- **Cabinet Yo Mbi Consulting** — bilingual (French/English) marketing site for a Bangui-based HSSE consulting/training firm, plus a small admin back-office.
- Stack: Next.js 15 App Router, React 18, TypeScript (strict), Tailwind CSS 3, `next-intl` 4, Framer Motion, Lucide icons, Neon serverless Postgres (`@neondatabase/serverless`).
- UI copy and comments are in French; the `/en` locale is fully translated. Keep that convention when editing.

## Commands
- First run: `npm install` → copy `.env.example` to `.env.local` and fill `DATABASE_URL` + `SESSION_SECRET` → `npm run db:migrate` → `npm run db:create-admin -- <email> <password>` → `npm run dev`.
- Install: `npm install`
- Dev: `npm run dev`
- Build / serve: `npm run build`, `npm run start`
- Apply DB migrations: `npm run db:migrate` (reads `migrations/*.sql` in filename order, tracks applied files in `schema_migrations`)
- Create/reset an admin: `npm run db:create-admin -- <email> <password> [--role=superadmin]` (password must be ≥12 chars)
- Lint: `npm run lint`. ESLint is **not** in `devDependencies`, so this may prompt to install on a fresh clone — don't treat a prompt/failure as a code problem.
- There is no test suite or test script.

## Where code lives
- `src/app/[locale]/` — public localized routes: home, `services`, `formations`, `actualites` (index + `[slug]` detail), `a-propos`, and legal pages (`mentions`, `cgu`, `confidentialite`, `cookies`).
- `src/components/` — public UI sections (`Header`, `Hero`, `Services`, `Formations`, `Contact`, `Footer`, FAQ, testimonials, `ScrollReveal`, …). Most are client components using `useTranslations`.
- `src/app/admin/` + `src/components/admin/` — back-office: `page.tsx` dashboard, `messages/`, `login/`, plus `AdminShell`, `LoginForm`, `MessagesClient`.
- `src/app/api/` — `contact` (public form), `admin/login`, `admin/logout`, `admin/messages`, `admin/messages/[id]`.
- `src/lib/` — `db.ts` (Neon client, parameterized `query()`, row serializers, `hasDb()`), `auth.ts` (HMAC session cookie), `password.ts` (scrypt), `rate-limit.ts`, `http.ts` (JSON/error helpers), `safeJsonLd.ts`.
- `src/data/` — static bilingual content (`services.ts`, `formations.ts`, `actualites.ts`); public pages read from here, **not** from Postgres.
- `src/i18n/` — `config.ts` (locales `fr`/`en`, default `fr`), `routing.ts`, `request.ts`, `navigation.ts`.
- `messages/fr.json` / `messages/en.json` — translations; keep keys aligned.
- `migrations/001_init.sql` — `admins`, `services`, `formations`, `actualites`, `messages` tables (bilingual `*_fr`/`*_en` columns, `jsonb` list fields). `migrations/002_rate_limits.sql` — shared rate-limit counters.
- `scripts/` — `run-migrations.mjs`, `create-admin.mjs`. `.github/` — Dependabot config and auto-merge/Slack workflows.

## Architecture / data flow
- Two content sources: public pages render static data from `src/data/*`, while Postgres holds `services`/`formations`/`actualites` tables that are currently **unused** by the site (only `messages` and `admins` are queried). Don't assume editing a DB row changes a public page.
- Contact form (`Contact.tsx`) → `POST /api/contact` → validates/sanitizes, honeypot field `company`, rate limit → `INSERT INTO messages`. If no DB is configured the API returns 503 and the form falls back to a mailto link.
- Admin auth: `POST /api/admin/login` verifies scrypt hash, sets an httpOnly session cookie (`__Host-yombi_admin` in production, `yombi_admin` in dev) containing `exp.iat.adminId.version.HMAC-SHA256` (`SESSION_SECRET` ≥ 32 chars, 8h). `getSessionAdmin()` re-checks signature, expiry, `status`, `password_changed_at` and `admins.session_version` (migration 003); `isAuthConfigured()` gates the login route and page. Logging out calls `revokeAdminSessions()`, which increments the version and invalidates every outstanding token for that account.
- Pages under `/admin` redirect to `/admin/login` when unauthenticated; API routes use `requireAdmin()` and return 401.
- Missing `DATABASE_URL`/`SESSION_SECRET` (or a secret shorter than 32 characters) degrades gracefully: the login page shows a neutral notice in production (setup details only in dev) instead of crashing.

## Conventions and gotchas
- Import alias `@/*` → `src/*`. TypeScript is `strict` with `noEmit`.
- `src/middleware.ts` skips `next-intl` for `/admin` (back-office is not localized) and generates a nonce-based CSP; `next.config.mjs` adds the static security headers (`poweredByHeader: false`). Any new script/style/font/image origin must be allowed in **both** places as appropriate, and admin pages set `X-Robots-Tag: noindex`.
- Image upload: `POST /api/admin/uploads` (multipart, authenticated + same-origin + `limitAdminWrites`) verifies magic bytes (JPEG/PNG/WebP/AVIF, 8 MB max), signs the Cloudinary params with SHA-1 inside `src/lib/cloudinary.ts` and returns `secure_url`; `CLOUDINARY_API_SECRET` stays server-side, so the CSP keeps `connect-src 'self'`. The admin form offers both a paste-URL field and an upload button.
- Images from the CMS (`kind: 'image'`) are validated by `isAllowedImageUrl()`: same-site path (`/images/…`) or `https://res.cloudinary.com/…` only. The host list must stay aligned with `img-src` in the CSP; `style-src 'unsafe-inline'` is required by inline `style={{…}}` in components.
- `src/lib/db.ts`, `content.ts`, `admin-content.ts` and `auth.ts` import `server-only`: importing them from a client component fails the build (that is intended). `src/lib/content-config.ts` stays isomorphic on purpose.
- Public routes are locale-prefixed (`/fr/…`, `/en/…`); use `Link`/`redirect` from `src/i18n/navigation.ts` instead of hardcoding locales.
- Route params are Promises in Next 15 (`params: Promise<{...}>`) — always `await` them.
- DB access goes through `query(text, ...values)` with `$1, $2` placeholders. **Never** concatenate SQL strings; rows are normalized in `src/lib/db.ts` serializers (`str`/`arr`/`iso`) before being exposed.
- API routes set `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`; reuse `json`/`error`/`internalError` from `src/lib/http.ts` so exception details never leak in production.
- Run `npm run db:migrate` for migrations 002 (`rate_limits`) and 003 (`admins.session_version`) — login fails without the latter.
- Rate limiting is stored in Postgres (`rate_limits`, migration 002) with an in-memory fallback when the DB is missing or unreachable; login is limited per IP and per account (only failures consume the account quota, via `peekRateLimit` + `checkRateLimit`), contact per IP. Run `npm run db:migrate` after pulling so the table exists.
- `clientIp()` relies on `ipAddress()` from `@vercel/functions` (platform-set `x-real-ip`) and returns `''` elsewhere: never trust a client-supplied `x-forwarded-for` for quotas. Mutating routes call `isSameOrigin()` (Origin vs Host) as a CSRF backstop, and `readJson(req, maxBytes)` only accepts `application/json` (+json), enforces a per-route size cap (default 64 KiB) and streams instead of buffering arbitrary bodies. Admin writes additionally go through `limitAdminWrites(adminId)` (120 / 10 min), counted after authentication only.
- Passwords use Node `scrypt` (`scrypt$salt$hash`), not bcrypt/argon2; verify with `verifyPassword` and keep the format in sync with `scripts/create-admin.mjs`.
- Colors/typography come from `tailwind.config.js` (`blue`, `navy`, `ink`, `mut`, `sky`, `tint`, `line`, Plus Jakarta Sans); reuse those tokens rather than raw hex in public UI. Admin UI uses a dark palette with arbitrary values.
- Keep `prefers-reduced-motion` support in `globals.css` and the fixed header/`#contact` anchor when changing layout.
- Env vars live in `.env.local` (gitignored, template in `.env.example`): `DATABASE_URL` (Neon pooled), `SESSION_SECRET` (`openssl rand -hex 32`, minimum 32 characters), and for uploads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Never commit real values.
- `prompts/` holds reusable audit prompt files; the root `*.txt` files are ad-hoc audit/notes, not app input.
