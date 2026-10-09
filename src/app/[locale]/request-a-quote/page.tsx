import type { Metadata } from "next";
import { Clock, FileText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { RfqForm } from "@/components/forms/rfq-form";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { getCategories, getOffices } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { formatPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Request a quote",
  description:
    "Send a request for quotation: product, quantity, Incoterm and destination. Attach spec sheets and get a reference number instantly.",
  path: "/request-a-quote",
});

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const [{ category }, categories, offices] = await Promise.all([searchParams, getCategories(), getOffices()]);
  const initialCategory = Array.isArray(category) ? category[0] : category;

  return (
    <>
      <PageHero
        size="compact"
        eyebrow="Request for quotation"
        line1="Request"
        line2="a quote."
        image={{ src: pexelsUrl(stockImages.terminal.id, 2400), alt: stockImages.terminal.alt }}
      />

      <section className="section-pad pt-16! lg:pt-24!">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RfqForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} initialCategory={initialCategory} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-signature bg-tint p-8">
              <h2 className="headline text-3xl">What happens next</h2>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: FileText, text: "You get a reference number (e.g. ADS-2026-0001) on screen and by email." },
                  { icon: Clock, text: "The office that handles your destination reviews the request and may ask a few questions." },
                  { icon: ShieldCheck, text: "We come back with supplier options and a quotation on your Incoterm." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-signature bg-ink p-8 text-white">
              <h2 className="eyebrow text-accent">Prefer to talk?</h2>
              <ul className="mt-5 space-y-4">
                {offices.map((o) => (
                  <li key={o.slug}>
                    <p className="font-semibold">{o.city}</p>
                    <a href={telHref(o.phone)} className="text-white/90 hover:text-accent">
                      {formatPhone(o.phone)}
                    </a>
                    <br />
                    <a href={`mailto:${o.email}`} className="text-white/90 hover:text-accent">
                      {o.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Request a quote", path: "/request-a-quote" }])} />
    </>
  );
}
