import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie notice",
  description: "ADS Global uses only essential cookies and local storage. No analytics or advertising cookies.",
  path: "/legal/cookies",
});

const rows = [
  { name: "ads-rfq-draft-v1", type: "Local storage", purpose: "Saves your unfinished quote request on this device so you don't lose it.", duration: "Until you submit or clear it" },
  { name: "ads-cookie-notice-v1", type: "Local storage", purpose: "Remembers that you've seen this notice.", duration: "Until cleared" },
  { name: "Cloudflare Turnstile", type: "Third-party (essential)", purpose: "Anti-spam check on forms. Cloudflare may set a short-lived cookie to complete the challenge.", duration: "Session" },
  { name: "sb-*-auth-token", type: "Cookie (staff only)", purpose: "Keeps ADS staff signed in to the admin area. Not set for public visitors.", duration: "Until the staff member signs out" },
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice" updated="8 October 2026">
      <p>
        We only use storage that is strictly necessary for the site to work. There are no analytics, advertising or social-media tracking cookies, so we don&apos;t ask for cookie consent.
      </p>
      <div className="not-prose -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Essential storage used by this website</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4">Name</th>
              <th scope="col" className="py-3 pr-4">Type</th>
              <th scope="col" className="py-3 pr-4">Purpose</th>
              <th scope="col" className="py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-line align-top">
                <th scope="row" className="py-3 pr-4 font-mono text-xs font-medium">{r.name}</th>
                <td className="py-3 pr-4">{r.type}</td>
                <td className="py-3 pr-4">{r.purpose}</td>
                <td className="py-3">{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>You can clear local storage and cookies in your browser settings at any time; the only effect is that a saved quote draft is lost.</p>
    </LegalPage>
  );
}
