import type { Metadata } from "next";
import { Factory, Handshake, Truck, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { PartnerForm } from "@/components/forms/partner-form";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { getCategories, getSiteSettings } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Become a supplier or partner",
  description: "Manufacturers, distributors, agents and logistics providers: apply to work with ADS Global on the China–Africa trade lane.",
  path: "/partners",
});

const audiences = [
  { icon: Factory, title: "Suppliers & manufacturers", text: "Reach buyers in Nigeria and West Africa with clear specifications, inspection and export handling." },
  { icon: Users, title: "Distributors & resellers", text: "Source a reliable product range with consolidated shipping and one point of contact." },
  { icon: Handshake, title: "Sales agents", text: "Represent ADS Global in your market and refer buyers who need sourcing support." },
  { icon: Truck, title: "Logistics providers", text: "Freight forwarders, customs brokers and hauliers on our routes." },
];

export default async function PartnersPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSiteSettings()]);
  return (
    <>
      <PageHero
        eyebrow="Partners & suppliers"
        line1="Grow with"
        line2="ADS Global."
        image={{ src: pexelsUrl(stockImages.stepSourcing.id, 2400), alt: stockImages.stepSourcing.alt }}
      >
        <p className="measure text-lead text-white/85">We&apos;re building a network of trusted manufacturers, distributors and service partners in China and Africa.</p>
      </PageHero>

      <section aria-labelledby="who-title" className="section-pad">
        <div className="wrap">
          <SectionIntro id="who-title" eyebrow="Who we work with" lines={["Four ways", "to partner."]} />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-signature bg-line sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="bg-white">
                <Reveal delay={i * 0.06} className="h-full p-8">
                  <Icon className="size-8 text-brand" aria-hidden="true" />
                  <h3 className="headline mt-6 text-3xl">{title}</h3>
                  <p className="mt-3 text-muted">{text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="apply-title" className="bg-tint section-pad">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="apply-title" className="headline text-h2">
              Apply to <span className="text-brand">partner.</span>
            </h2>
            <p className="mt-6 text-muted">
              Tell us about your company and what you supply. Applications go to our partnerships team ({settings.contact.partnersEmail}) and the office for your country.
            </p>
          </div>
          <div className="rounded-signature bg-white p-6 sm:p-10 lg:col-span-8">
            <PartnerForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Partners", path: "/partners" }])} />
    </>
  );
}
