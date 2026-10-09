import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmNote, LegalPage } from "@/components/site/legal-page";
import { getSiteSettings } from "@/lib/content/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms for using the ADS Global Limited website.",
  path: "/legal/terms",
});

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <LegalPage title="Terms of use" updated="8 October 2026">
      <p>
        These terms apply to your use of this website, operated by {settings.company.legalName}. By using the site you accept them. They should be reviewed by a qualified lawyer before launch.
      </p>

      <h2>Information on this site</h2>
      <p>
        The site describes the products and services we can source and the way we work. Product examples, sourcing regions, transit times and container data are indicative and may change.
        Nothing on the site is an offer to sell.
      </p>

      <h2>Quotations and orders</h2>
      <p>
        Submitting a request for quotation does not create a contract. Prices, Incoterms, delivery times and payment terms are agreed in a written quotation or contract, which takes priority over
        anything on this website. Incoterms® references follow Incoterms 2020 unless the contract says otherwise.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don&apos;t submit false, misleading or unlawful information, or files containing malware.</li>
        <li>Don&apos;t attempt to access the admin area, other users&apos; data or our systems without authorisation.</li>
        <li>Don&apos;t send automated or bulk submissions.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The ADS Global name and logo belong to {settings.company.legalName}. Stock photographs are used under their providers&apos; licences. You may not reuse site content commercially without
        permission.
      </p>

      <h2>Liability</h2>
      <p>
        We take care to keep the site accurate and available but can&apos;t guarantee it is error-free or uninterrupted. To the extent the law allows, we aren&apos;t liable for losses arising from
        use of the site. Nothing here limits liability that can&apos;t be limited by law.
      </p>

      <h2>Privacy</h2>
      <p>
        See our <Link href="/legal/privacy">privacy policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of <ConfirmNote>Federal Republic of Nigeria or People&apos;s Republic of China</ConfirmNote>, and disputes go to the courts of that jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${settings.contact.generalEmail}`}>{settings.contact.generalEmail}</a>
      </p>
    </LegalPage>
  );
}
