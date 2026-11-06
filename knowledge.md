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
- `migrations/001_init.sql` — `admins`, `services`, `formations`, `actualites`, `messages` tables (bilingual `*_fr`/`*_en` columns, `jsonb` list fields).
- `scripts/` — `run-migrations.mjs`, `create-admin.mjs`. `.github/` — Dependabot config and auto-merge/Slack workflows.

## Architecture / data flow
- Two content sources: public pages render static data from `src/data/*`, while Postgres holds `services`/`formations`/`actualites` tables that are currently **unused** by the site (only `messages` and `admins` are queried). Don't assume editing a DB row changes a public page.
- Contact form (`Contact.tsx`) → `POST /api/contact` → validates/sanitizes, honeypot field `company`, rate limit → `INSERT INTO messages`. If no DB is configured the API returns 503 and the form falls back to a mailto link.
- Admin auth: `POST /api/admin/login` verifies scrypt hash, sets an httpOnly `yombi_admin` cookie containing `exp.iat.adminId.HMAC-SHA256` (`SESSION_SECRET`, 8h). `getSessionAdmin()` re-checks signature, expiry, `status`, and `password_changed_at`.
- Pages under `/admin` redirect to `/admin/login` when unauthenticated; API routes use `requireAdmin()` and return 401.
- Missing `DATABASE_URL`/`SESSION_SECRET` degrades gracefully: UI shows a "not configured" notice instead of crashing.

## Conventions and gotchas
- Import alias `@/*` → `src/*`. TypeScript is `strict` with `noEmit`.
- `src/middleware.ts` skips `next-intl` for `/admin` (back-office is not localized) and generates a nonce-based CSP; `next.config.mjs` adds the static security headers. Any new script/style/font/image origin must be allowed in **both** places as appropriate, and admin pages set `X-Robots-Tag: noindex`.
- Public routes are locale-prefixed (`/fr/…`, `/en/…`); use `Link`/`redirect` from `src/i18n/navigation.ts` instead of hardcoding locales.
- Route params are Promises in Next 15 (`params: Promise<{...}>`) — always `await` them.
- DB access goes through `query(text, ...values)` with `$1, $2` placeholders. **Never** concatenate SQL strings; rows are normalized in `src/lib/db.ts` serializers (`str`/`arr`/`iso`) before being exposed.
- API routes set `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`; reuse `json`/`error`/`internalError` from `src/lib/http.ts` so exception details never leak in production.
- Rate limiting is in-memory per process (resets on deploy, not shared across instances) — fine for one instance, not for horizontal scale.
- Admin-login and contact limits are per IP via `x-forwarded-for`, which depends on the host proxy setting that header.
- Passwords use Node `scrypt` (`scrypt$salt$hash`), not bcrypt/argon2; verify with `verifyPassword` and keep the format in sync with `scripts/create-admin.mjs`.
- Colors/typography come from `tailwind.config.js` (`blue`, `navy`, `ink`, `mut`, `sky`, `tint`, `line`, Plus Jakarta Sans); reuse those tokens rather than raw hex in public UI. Admin UI uses a dark palette with arbitrary values.
- Keep `prefers-reduced-motion` support in `globals.css` and the fixed header/`#contact` anchor when changing layout.
- Env vars live in `.env.local` (gitignored, template in `.env.example`): `DATABASE_URL` (Neon pooled) and `SESSION_SECRET` (`openssl rand -hex 32`). Never commit real values.
- `prompts/` holds reusable audit prompt files; the root `*.txt` files are ad-hoc audit/notes, not app input.
