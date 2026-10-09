# ADS Global Limited — website and enquiry management

Corporate website for **ADS Global Limited** (import/export, sourcing, logistics and trade consulting; Shenyang, China and Nigeria) with an admin area for enquiries and content.

**Stack:** Next.js 16 (App Router, React Server Components, Server Actions) · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres, Auth, RLS) · Zod · Motion + Lenis · Resend · Cloudflare Turnstile · Cloudinary · Sentry · Vercel.

| Doc | What it covers |
|---|---|
| [`docs/CLAIMS.md`](docs/CLAIMS.md) | Every unverified company fact and placeholder to confirm |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Vercel, domain, Supabase production settings, Resend/SPF/DKIM/DMARC, launch checklist, Lighthouse |
| [`docs/ADMIN-GUIDE.md`](docs/ADMIN-GUIDE.md) | One-page guide for staff: answer an RFQ, add a category, change stats |
| [`docs/CONTRAST.md`](docs/CONTRAST.md) | Every colour pair used, with WCAG contrast ratios |

---

## 1. What's included

**Public site** (each page has its own URL, metadata, canonical and JSON-LD):
Home · About · Products & services (filterable) + 14 category pages · How we work / logistics · Projects (list + detail) · Request a quote · Contact · Partners/suppliers · Privacy · Terms · Cookies · styled 404 and error pages · sitemap, robots, generated OG images, favicon set, web manifest.

**Forms:** multi-step RFQ (5 steps, draft saved on the device, category pre-fill via `?category=slug`, private attachments), contact form, partner application. All validated with the same Zod schemas in the browser and the Server Action, protected by a honeypot, Cloudflare Turnstile and Postgres rate limits. Each enquiry gets a reference (`ADS-2026-0001`, numbered per year in Lagos time), is routed to the Nigeria or China office by country (editable), emails the office and sends the customer an auto-reply.

**Admin** (`/admin`, Supabase Auth, roles `admin` / `super_admin`): enquiries inbox (tabs, filters, search, sort, pagination, CSV export, status workflow new → in progress → quoted → won/lost → closed, assignee, internal notes, signed attachment downloads, reply-by-email), content (categories, projects, home hero, process steps, with image upload and required alt text), company settings (claims mode, stats and claims with *confirmed* toggles, offices and hours, routing, socials, certifications, leadership), users (invite, roles, revoke) and an audit log of every change.

**Design:** navy `#0A1F3D` / logo blue `#004E98` / one orange accent `#FF6700`; Barlow Condensed + Figtree; 95% content width; signature large bottom-right corner; marquee, two-tone headlines, outlined background words, offset image pair with rotating badge, cards overlapping a navy band, scroll-linked card → full-bleed image, masked line reveals, restrained parallax, Ken Burns hero. All motion is disabled under `prefers-reduced-motion`; smooth scrolling only on fine-pointer devices.

## 2. Quick start

Requirements: **Node.js ≥ 22.18**, npm, and `psql` for the database tests.

```bash
npm install
cp .env.example .env.local      # fill in what you have (see §3)
npm run dev                     # http://localhost:3000
```

Without Supabase the public site still renders from the built-in content (`src/content/defaults.ts`); forms show "temporarily unavailable" and the admin explains what's missing.

Before every delivery:

```bash
npm run typecheck && npm run lint && npm run build
```

| Script | Does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run seed:generate` | Rebuilds `supabase/seed.sql` from `src/content/defaults.ts` |
| `npm run create-super-admin -- email "Name"` | Creates or promotes a super admin |
| `npm run test:rls` | RLS tests against `SUPABASE_DB_URL` (rolls back; safe on production) |
| `npm run test:rls:local` | Migrations + seed ×2 + RLS tests on a throwaway plain-Postgres DB (`PGURL`) |
| `npm run db:link` / `db:push` | `supabase link` / `supabase db push --include-seed` |

## 3. Environment variables

Blank values count as **not set**; optional features switch off instead of crashing.

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonicals, sitemap, OG, email links (production: `https://www.adsglobaltd.com`) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live content, admin |
| `SUPABASE_SERVICE_ROLE_KEY` | Storing form submissions, inviting users. **Server only.** |
| `SUPABASE_DB_URL` | `npm run test:rls` only |
| `RESEND_API_KEY`, `EMAIL_FROM` | Office notifications, auto-replies, invites |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Spam protection (skipped with a warning if unset — set before launch) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | RFQ attachments (private) and admin image uploads |
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring (optional; form data is never sent) |

## 4. Database

### 4.1 Remote project: link, migrate, seed

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push --include-seed
```

`db push` applies `supabase/migrations/*`; `--include-seed` runs `supabase/seed.sql`. **The seed is idempotent** (`ON CONFLICT DO NOTHING`): re-running adds missing rows and never overwrites admin edits.

Then in the Supabase dashboard: disable public sign-up, set the Site URL and redirect URLs, point the email templates at `/auth/confirm` and set Resend as SMTP — exact values in [`docs/DEPLOY.md`](docs/DEPLOY.md#1-supabase-production-project).

Email template links (Dashboard → Authentication → Emails):

| Template | Link |
|---|---|
| Magic link | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/admin` |
| Invite user | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/account?set-password=1` |
| Reset password | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/account?set-password=1` |

### 4.2 First super admin, then more admins

```bash
npm run create-super-admin -- you@adsglobaltd.com "Your Name"
```

Prints a one-time link to set a password (or promotes an existing user). After that, invite colleagues from **Admin → Users**.

### 4.3 Security model

- RLS is enabled on **every** table. Anonymous visitors can only read published content; internal notes on stats/claims are hidden by column privileges.
- Enquiries have **no insert policy**: only Server Actions insert them, using the service role, after Zod validation, honeypot, Turnstile and the rate limit.
- Staff read/update enquiries; only super admins delete them. Users can't change their own role (column privileges). The audit log can't be written, edited or deleted by any user — triggers record every admin change with the actor.
- Attachments are private Cloudinary assets; staff download them through short-lived signed URLs. The server re-verifies each upload's signature, size and type.
- The service-role key is only imported in `server-only` modules.

The RLS suite (`supabase/tests/rls.test.sql`, 47 assertions) covers anonymous, signed-in-without-role, admin, super admin and service-role access.

### 4.4 Schema

`site_settings` · `offices` · `categories` · `stats` · `claims` · `strengths` · `process_steps` · `leaders` · `certifications` · `projects` · `routing_rules` · `enquiries` · `enquiry_notes` · `enquiry_attachments` · `profiles` · `audit_log` · `rate_limits` · `reference_counters`.

## 5. Content, claims and images

- Content from the old site lives in `src/content/defaults.ts` (seed source + offline fallback). After seeding, edit everything in the admin.
- **Claims mode** (Admin → Settings): *Flag* shows unconfirmed facts with an "Unconfirmed" marker; *Hide* removes them. Switch to Hide before launch.
- Stock images: `src/content/image-credits.ts` (Pexels, free commercial licence) with alt text and source page. Check each for logos or replace with company photos.
- The old site's `Solar_Charging_System_Project_Proposal.docx` is a student project, not ADS work, so it is not used.

## 6. Project structure

```
src/
  app/
    [locale]/            public site (English served without a prefix)
    admin/               admin (own root layout): login/, (dashboard)/enquiries|content|settings|users|audit|account
    actions/forms.ts     public form Server Actions
    auth/                callback + confirm route handlers
    sitemap.ts robots.ts manifest.ts global-error.tsx icons
  components/
    site/ sections/ motion/ forms/ admin/ ui/ seo/
  content/               types, defaults (seed source), image credits, trade reference data
  lib/                   env (Zod), supabase clients, auth, content queries, forms (schemas/guard/store/notify),
                         email, cloudinary, admin helpers, SEO/structured data, time, i18n
  proxy.ts               Next 16 proxy: admin session guard + locale rewrite
  instrumentation*.ts    Sentry (only when a DSN is set)
supabase/                migrations, seed.sql (generated), tests (RLS + plain-Postgres shim), config.toml
scripts/                 create-super-admin, generate-seed, test-rls(.ts|-local.sh)
docs/                    CLAIMS, DEPLOY, ADMIN-GUIDE, CONTRAST
.github/workflows/ci.yml typecheck + lint + build, and migrations/seed/RLS tests on Postgres 17
```

## 7. Internationalisation (ready, not enabled)

Public pages live under `src/app/[locale]/`; only `en` is enabled and served without a prefix (the proxy rewrites `/about` → `/en/about`). To add French or Chinese, add the locale in `src/lib/i18n/config.ts` plus translations — no page moves.

## 8. Verification status

Verified in the build environment: migrations, seed (applied twice) and all 47 RLS assertions on PostgreSQL 16; the Zod schemas and env handling against Zod 4 (types and behaviour); time-zone conversion, email escaping, inbox filter parsing and Cloudinary request signing (matches Cloudinary's documented example); every TS/TSX file parses.

**Not yet run:** `npm install`, `typecheck`, `lint`, `build` and a browser test — the npm registry was blocked in the build environment. Run them first (CI does too) and send any errors; fixes will come back as changed files only.
# ads-global
