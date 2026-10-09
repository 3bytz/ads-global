# Deploying ADS Global (Vercel + Supabase + Resend)

Order matters: **database → services → Vercel → domain → email DNS → checks**.

## 1. Supabase (production project)

1. Create the project (region close to Nigeria, e.g. `eu-west-2` London or `eu-central-1` Frankfurt). Save the database password.
2. Push the schema and seed from your machine:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref>
   npx supabase db push --include-seed
   ```
3. Dashboard → **Authentication**:
   - Providers → Email: enabled, **Allow new users to sign up: OFF**.
   - URL configuration: Site URL `https://www.adsglobaltd.com`; redirect URLs `https://www.adsglobaltd.com/auth/callback`, `https://www.adsglobaltd.com/auth/confirm`.
   - Emails → templates: use the `/auth/confirm?token_hash=…` links from the README (§3.3).
   - Emails → SMTP: host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key, sender `no-reply@adsglobaltd.com`.
4. Run the RLS test against production (safe — it rolls back):
   `SUPABASE_DB_URL="postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres" npm run test:rls`
5. Create the first super admin: `npm run create-super-admin -- you@adsglobaltd.com "Your Name"` (with the production URL and service key in `.env.local`).

## 2. Third-party services (all have free tiers)

| Service | What to create | Env vars |
|---|---|---|
| **Resend** | Add domain `adsglobaltd.com` (DNS in §5), create an API key with "sending access" | `RESEND_API_KEY`, `EMAIL_FROM="ADS Global <no-reply@adsglobaltd.com>"` |
| **Cloudflare Turnstile** | Add a widget for `adsglobaltd.com` and `*.vercel.app` (mode: Managed) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| **Cloudinary** | Free account; Settings → Security: enable "Strict transformations" | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Sentry** (optional) | Next.js project, copy the DSN | `NEXT_PUBLIC_SENTRY_DSN` |

Nothing beyond these is required. (Paid tiers only if volumes grow — ask first.)

## 3. Vercel

1. Import the GitHub repository (framework preset: Next.js; Node 22).
2. Add every variable from `.env.example` for **Production** (and **Preview** with test keys). `NEXT_PUBLIC_SITE_URL=https://www.adsglobaltd.com` in Production; preview deployments are automatically `noindex`.
3. Deploy. The build works even before the services above are configured (forms then show a friendly "temporarily unavailable" message).

## 4. Domain

In Vercel → Project → Domains add `adsglobaltd.com` and `www.adsglobaltd.com` (make `www` primary and redirect the apex to it). At your DNS host set the records Vercel shows — typically:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

HTTPS certificates are issued automatically. HSTS is already sent by the app.

## 5. Email DNS for adsglobaltd.com (SPF, DKIM, DMARC)

Resend sends from a subdomain (`send.adsglobaltd.com`) so it doesn't interfere with your existing mailboxes (info@, china@, nigeria@, partners@). **Copy the exact values from Resend → Domains**; they look like:

| Type | Name | Value | Purpose |
|---|---|---|---|
| MX | `send` | `feedback-smtp.<region>.amazonses.com` (priority 10) | bounce handling |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF for Resend |
| TXT | `resend._domainkey` | `p=MIGfMA0…` (long key from Resend) | DKIM signature |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@adsglobaltd.com; fo=1` | DMARC reporting |

Notes:
- Keep **one** SPF record on the root domain for your mailbox provider (e.g. Google Workspace `include:_spf.google.com`, Zoho `include:zoho.com`) — [CONFIRM which provider hosts @adsglobaltd.com]. Don't add a second root SPF record.
- Start DMARC at `p=none`; after 2–4 weeks of clean reports, move to `p=quarantine`, then `p=reject`.
- Test with [mail-tester.com](https://www.mail-tester.com): submit the contact form to a mail-tester address and aim for 9+/10.

## 6. Launch checks

- [ ] `npm run typecheck && npm run lint && npm run build` pass (CI runs them on every push).
- [ ] `npm run test:rls` passes against production.
- [ ] Submit each form (RFQ with an attachment, contact, partner): reference shown, both emails arrive, the enquiry is in the admin inbox, the attachment downloads.
- [ ] Check routing: an RFQ to Ghana goes to the Nigeria office; one to Germany goes to the default office.
- [ ] All claims in `docs/CLAIMS.md` answered; **Claims mode switched to Hide** (Admin → Settings).
- [ ] Each stock photo checked on its Pexels page for visible logos (see `src/content/image-credits.ts`), or replaced with company photos.
- [ ] Privacy policy and terms reviewed by a lawyer; `[CONFIRM]` markers resolved.
- [ ] Lighthouse (mobile) on the live URL: `npx @lhci/cli autorun` (uses `lighthouserc.json`; targets Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, LCP < 2.5 s).
- [ ] Submit `https://www.adsglobaltd.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] Test at 375, 768, 1280 and 1920 px wide, keyboard-only, and with "reduce motion" switched on.

## Rollback

Vercel → Deployments → previous deployment → **Promote to Production** (instant). Database migrations are additive; to revert data changes, use the audit log (before/after values) or Supabase point-in-time recovery (paid plan) / daily backups.
