import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmNote, LegalPage } from "@/components/site/legal-page";
import { getOffices, getSiteSettings } from "@/lib/content/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: "How ADS Global Limited collects, uses and protects personal data under Nigeria's NDPA 2023, China's PIPL and the GDPR.",
  path: "/legal/privacy",
});

export default async function PrivacyPage() {
  const [settings, offices] = await Promise.all([getSiteSettings(), getOffices()]);
  const privacyEmail = settings.contact.generalEmail;
  // One entry per registered company, listing the offices it runs (from Admin → Settings → Offices).
  const entities = Array.from(
    offices.reduce((map, o) => {
      const name = o.legalEntity ?? settings.company.legalName;
      const entry = map.get(name) ?? { name, registration: o.registration, cities: [] as string[] };
      entry.cities.push(`${o.city}, ${o.country}`);
      return map.set(name, entry);
    }, new Map<string, { name: string; registration: string | null; cities: string[] }>()),
  ).map(([, e]) => ({ name: e.name, registration: e.registration, places: e.cities.join("; ") }));
  return (
    <LegalPage title="Privacy policy" updated="8 October 2026">
      <p>
        This policy explains how {settings.company.legalName} (&ldquo;ADS Global&rdquo;, &ldquo;we&rdquo;) handles personal data when you use this website or contact us. It is written to meet
        the Nigeria Data Protection Act 2023 (NDPA), China&apos;s Personal Information Protection Law (PIPL) and, for visitors in the EU/UK, the GDPR.
      </p>
      <p className="text-sm text-muted">
        This policy is a starting draft and should be reviewed by a qualified lawyer before launch. Items marked <ConfirmNote>…</ConfirmNote> need company details.
      </p>

      <h2>Who is responsible</h2>
      <p>
        ADS Global operates through{" "}
        {entities.map((e, i) => (
          <span key={e.name}>
            {i > 0 && (i === entities.length - 1 ? " and " : ", ")}
            <strong>{e.name}</strong>
            {e.registration ? ` (${e.registration})` : ""} — {e.places}
          </span>
        ))}
        . Each company is the data controller for enquiries handled by its offices. Contact for privacy matters: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>{" "}
        <ConfirmNote>dedicated privacy contact / Data Protection Officer, if appointed</ConfirmNote>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Enquiry details you send us</strong> through the quote, contact or partner forms: name, company, email, phone/WhatsApp, country, product and shipping details, and any files you
          attach.
        </li>
        <li>
          <strong>Technical data needed for security</strong>: a one-way, salted hash of your IP address (used for rate limiting — we don&apos;t store the address itself), browser user-agent,
          and the result of the Cloudflare Turnstile anti-spam check.
        </li>
        <li>
          <strong>Admin accounts</strong>: for our staff only — email, name and sign-in records.
        </li>
      </ul>
      <p>We don&apos;t use advertising or analytics cookies, and we don&apos;t sell personal data.</p>

      <h2>Why we use it (lawful basis)</h2>
      <ul>
        <li>To answer your enquiry and prepare quotations — steps you ask for before entering a contract (NDPA section 25; PIPL article 13; GDPR art. 6(1)(b)), and your consent where the law requires it.</li>
        <li>To protect the website from spam and abuse — our legitimate interests (NDPA section 25; GDPR art. 6(1)(f)).</li>
        <li>To keep business records required by law, such as tax and customs records — legal obligation.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>Only with service providers that process data on our behalf under contract, and only as needed:</p>
      <ul>
        <li>Supabase (database and staff sign-in) — hosting region <ConfirmNote>Supabase project region</ConfirmNote></li>
        <li>Vercel (website hosting)</li>
        <li>Resend (sending enquiry emails)</li>
        <li>Cloudinary (private storage of files you attach)</li>
        <li>Cloudflare Turnstile (spam protection)</li>
        <li>Sentry (error monitoring; configured not to collect form contents)</li>
      </ul>
      <p>
        When you request a quotation, we may share the product specification (not your contact details unless needed) with prospective suppliers and logistics partners to obtain prices.
      </p>

      <h2>International transfers</h2>
      <p>
        ADS Global operates in both Nigeria and China, and our service providers may process data in other countries (for example the EU or USA). Your enquiry may therefore be accessed by our
        team in China and in Nigeria. We rely on appropriate safeguards for these transfers, such as standard contractual clauses, and for personal information leaving China we follow the
        PIPL cross-border requirements <ConfirmNote>PIPL mechanism used, e.g. standard contract filing</ConfirmNote>. Under the NDPA we transfer data abroad only where an adequate level of
        protection or another lawful basis applies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that don&apos;t lead to business: up to 24 months, then deleted. Records linked to orders: as long as the law requires for commercial and tax records{" "}
        <ConfirmNote>retention periods</ConfirmNote>. Rate-limit records: up to 2 days.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you can ask to access, correct, delete or receive a copy of your data, object to or restrict processing, and withdraw consent at any time. Email{" "}
        <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. We reply within the time the applicable law requires. You can also complain to the Nigeria Data Protection Commission (NDPC), the
        Cyberspace Administration of China, or your local data protection authority.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit (HTTPS). Database access is restricted with row-level security so only authorised staff can read enquiries; attachments are stored privately and opened via
        short-lived signed links.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        See our <Link href="/legal/cookies">cookie notice</Link>.
      </p>

      <h2>Changes</h2>
      <p>We&apos;ll post any changes on this page and update the date above.</p>
    </LegalPage>
  );
}
