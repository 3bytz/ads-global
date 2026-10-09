import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { OfficeStatus } from "@/components/sections/office-status";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { getClaims, getOffices, getSiteSettings } from "@/lib/content/queries";
import { claimVisibility } from "@/lib/content/claims";
import { breadcrumbLd, localBusinessLd } from "@/lib/structured-data";
import { convertedRange, formatRange } from "@/lib/time";
import { pageMetadata } from "@/lib/seo";
import { formatPhone, telHref, whatsappHref } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact ADS Global in Shenyang and Shandong, China (CST, UTC+8) and Abuja and Kano, Nigeria (WAT, UTC+1): addresses, phone, email, WhatsApp, business hours and a contact form.",
  path: "/contact",
});

export default async function ContactPage() {
  const [settings, offices, claims] = await Promise.all([getSiteSettings(), getOffices(), getClaims()]);
  const mode = settings.company.claimsMode;
  const support = claims.support_247;
  const supportVis = support ? claimVisibility(support.confirmed, mode) : "hide";

  return (
    <>
      <PageHero
        size="compact"
        eyebrow="Contact"
        line1="Talk to"
        line2="our team."
        image={{ src: pexelsUrl(stockImages.meeting.id, 2400), alt: stockImages.meeting.alt }}
      />

      {/* Offices */}
      <section aria-labelledby="offices-title" className="section-pad pt-16! lg:pt-24!">
        <div className="wrap">
          <h2 id="offices-title" className="headline text-h2">
            {offices.length} offices. <span className="text-brand">Two time zones.</span>
          </h2>
          <ul className="mt-12 grid gap-6 lg:grid-cols-2">
            {offices.map((o) => {
              // Show hours converted into the other country's time zone (CST ⇄ WAT).
              const other = offices.find((x) => x.tzLabel !== o.tzLabel);
              const weekday = o.hours[0];
              return (
                <li key={o.slug} className="rounded-signature border border-line bg-white p-8 lg:p-10">
                  <p className="eyebrow text-accent-ink">
                    {o.name} · {o.tzLabel} ({o.utcOffsetLabel})
                  </p>
                  <h3 className="headline mt-3 text-5xl">{o.city}</h3>
                  {o.legalEntity && (
                    <p className="mt-2 font-semibold">
                      {o.legalEntity}
                      {o.registration && <span className="font-normal text-muted"> · {o.registration}</span>}
                    </p>
                  )}
                  <address className="mt-1 not-italic text-muted">
                    {o.address}
                    {!o.addressConfirmed && mode === "flag" && <Unconfirmed className="ml-2 text-accent-ink" label="Address to confirm" />}
                  </address>

                  <div className="mt-6">
                    <OfficeStatus timeZone={o.timezone} tzLabel={o.tzLabel} opens={weekday?.opens} closes={weekday?.closes} tone="light" />
                  </div>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    <li>
                      <a href={telHref(o.phone)} className="flex min-h-12 items-center gap-3 rounded-xl bg-tint px-4 font-semibold hover:bg-line">
                        <Phone className="size-5 text-brand" aria-hidden="true" />
                        {formatPhone(o.phone)}
                      </a>
                    </li>
                    <li>
                      <a href={`mailto:${o.email}`} className="flex min-h-12 items-center gap-3 rounded-xl bg-tint px-4 font-semibold hover:bg-line">
                        <Mail className="size-5 text-brand" aria-hidden="true" />
                        <span className="truncate">{o.email}</span>
                      </a>
                    </li>
                    {o.whatsapp ? (
                      <li>
                        <a
                          href={whatsappHref(o.whatsapp, "Hello ADS Global, I have an enquiry.")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-12 items-center gap-3 rounded-xl bg-tint px-4 font-semibold hover:bg-line"
                        >
                          <MessageCircle className="size-5 text-success" aria-hidden="true" />
                          WhatsApp chat<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ) : (
                      mode === "flag" && (
                        <li className="flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-line px-4 text-sm text-muted">
                          <MessageCircle className="size-5" aria-hidden="true" />
                          WhatsApp number to confirm
                        </li>
                      )
                    )}
                    {o.mapUrl && (
                      <li>
                        <a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl bg-tint px-4 font-semibold hover:bg-line">
                          <MapPin className="size-5 text-brand" aria-hidden="true" />
                          Open in Maps<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )}
                  </ul>

                  <div className="mt-8">
                    <h4 className="text-sm font-semibold">
                      Business hours{" "}
                      {!o.hoursConfirmed && mode === "flag" && <Unconfirmed className="ml-1 text-accent-ink" label="Hours to confirm" />}
                    </h4>
                    <table className="mt-3 w-full text-sm">
                      <caption className="sr-only">
                        Business hours for {o.city}, shown in {o.tzLabel}
                        {other ? ` and ${other.tzLabel}` : ""}
                      </caption>
                      <thead className="sr-only">
                        <tr>
                          <th scope="col">Days</th>
                          <th scope="col">Local time ({o.tzLabel})</th>
                          {other && <th scope="col">In {other.tzLabel}</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {o.hours.map((h) => (
                          <tr key={h.days}>
                            <th scope="row" className="py-2.5 pr-4 text-left font-medium">
                              {h.days}
                            </th>
                            <td className="py-2.5 pr-4 tabular-nums">
                              {formatRange(h)} {h.opens && <span className="text-muted">{o.tzLabel}</span>}
                            </td>
                            {other && <td className="py-2.5 text-right tabular-nums text-muted">{convertedRange(h, o, other) ?? ""}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-muted">
            <p>
              General: <a href={`mailto:${settings.contact.generalEmail}`} className="font-semibold text-brand underline-offset-4 hover:underline">{settings.contact.generalEmail}</a>
            </p>
            <p>
              Partnerships: <a href={`mailto:${settings.contact.partnersEmail}`} className="font-semibold text-brand underline-offset-4 hover:underline">{settings.contact.partnersEmail}</a>
            </p>
            {supportVis !== "hide" && support && (
              <p className="flex items-center gap-2">
                {support.text}
                {supportVis === "flag" && <Unconfirmed className="text-accent-ink" />}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Form */}
      <section aria-labelledby="form-title" className="bg-tint section-pad">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="form-title" className="headline text-h2">
              Send a <span className="text-brand">message.</span>
            </h2>
            <p className="mt-6 text-muted">
              For a price on specific products, use the{" "}
              <Link href="/request-a-quote" className="font-semibold text-brand underline underline-offset-4">
                request a quote
              </Link>{" "}
              form instead — it captures everything we need to quote.
            </p>
          </div>
          <div className="rounded-signature bg-white p-6 sm:p-10 lg:col-span-8">
            <ContactForm offices={offices.map((o) => ({ slug: o.slug, label: `${o.city}, ${o.country}` }))} />
          </div>
        </div>
      </section>

      {offices.map((o) => (
        <JsonLd key={o.slug} data={localBusinessLd(o)} />
      ))}
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}
