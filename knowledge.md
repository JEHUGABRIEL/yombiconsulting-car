# Project knowledge

## What this is
- **Yo Mbi Consulting** is a bilingual French/English consulting, training, and business-development website for a Central African firm based in Bangui.
- It is a Next.js App Router application using React, TypeScript, Tailwind CSS, `next-intl`, Framer Motion, and Lucide icons.

## Where code lives
- `src/app/[locale]/`: localized routes for the home page, services, training, news, About, and legal pages.
- `src/components/`: reusable client-side UI sections such as `Header`, `Hero`, `Services`, `Contact`, `Footer`, FAQ, testimonials, and reveal animations.
- `src/data/`: typed static content for services, training programs, and news articles.
- `src/i18n/`: locale configuration and `next-intl` request/routing setup.
- `messages/fr.json` and `messages/en.json`: the primary UI/content translations; keep keys aligned between both files.
- `public/`: static assets such as the logo and icons.
- `src/app/globals.css` and Tailwind theme configuration: shared colors, typography, responsive styles, and animations.
- `src/middleware.ts`: locale routing plus security headers/CSP nonce handling.

## Commands
- Install dependencies: `npm install`
- Run development server: `npm run dev`
- Run lint: `npm run lint`
- Create a production build: `npm run build`
- Serve a production build: `npm run start`
- There is currently no test script or test suite in `package.json`.

## Conventions and gotchas
- Use the `@/*` import alias for `src/*` (for example, `@/components/Header`). TypeScript is strict and configured with `noEmit`.
- Routes are locale-prefixed (`/fr/...` and `/en/...`). Middleware handles locale detection and redirects unprefixed pages; use `src/i18n/routing.ts` rather than hard-coding routing behavior.
- Most interactive pages/components are client components and obtain copy through `useTranslations`. Keep translated strings in both locale JSON files rather than adding user-facing text inline.
- Route data is static and keyed by slugs. When adding a service, formation, or news article, update the relevant typed data file and both translation files as needed.
- Contact forms intentionally use `mailto:` links; there is no server-side form endpoint or persistence. Preserve the privacy copy unless the implementation changes.
- External images currently come from Unsplash and are explicitly allowed by the CSP in `src/middleware.ts`; new external assets may require CSP updates.
- The site uses custom Tailwind colors (`blue`, `navy`, `ink`, `mut`, `sky`, `tint`, and line colors), Plus Jakarta Sans, rounded cards, and motion/reveal effects. Follow existing utility-class and responsive-layout patterns.
- Keep the fixed header behavior and the `#contact` anchor in mind when changing page layout. Respect `prefers-reduced-motion` support in global styles.
- Security headers are split between Next response headers and middleware-generated CSP. Changes involving scripts, fonts, images, or frames must remain compatible with the CSP.
