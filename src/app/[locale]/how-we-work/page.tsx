import type { Metadata } from "next";
import Image from "next/image";
import { Anchor, Plane, Ship, Truck, FileCheck2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { ProcessStepsDetailed } from "@/components/sections/process-steps";
import { OutlinedWord } from "@/components/sections/outlined-word";
import { RouteLines } from "@/components/sections/route-lines";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { complianceItems, containerSpecs, incotermInfo, portsChina, portsWestAfrica, rfqIncoterms, shippingModes } from "@/content/trade";
import { getProcessSteps, getSiteSettings } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "How we work & logistics",
  description:
    "Our five-step process from enquiry to delivery: sourcing, quality inspection, sea FCL/LCL, air and road freight, export documents and customs support between China and West Africa.",
  path: "/how-we-work",
});

const modeIcons = { fcl: Ship, lcl: Anchor, air: Plane, road: Truck } as const;

export default async function HowWeWorkPage() {
  const [steps, settings] = await Promise.all([getProcessSteps(), getSiteSettings()]);
  const flag = settings.company.claimsMode === "flag";

  return (
    <>
      <PageHero
        eyebrow="How we work · Logistics"
        line1="Factory floor"
        line2="to your door."
        image={{ src: pexelsUrl(stockImages.port.id, 2400), alt: stockImages.port.alt }}
      >
        <p className="measure text-lead text-white/85">
          Five clear steps, one accountable team, and the paperwork done right — so your cargo clears and arrives when planned.
        </p>
      </PageHero>

      <section aria-labelledby="steps-title" className="relative overflow-hidden section-pad">
        <OutlinedWord word="Process" className="absolute -right-[4vw] top-4 hidden lg:block" />
        <div className="wrap relative">
          <SectionIntro id="steps-title" eyebrow="The process" lines={["From enquiry", "to after-sales."]} />
          <div className="mt-20">
            <ProcessStepsDetailed steps={steps} showFlags={flag} />
          </div>
        </div>
      </section>

      {/* Shipping modes */}
      <section aria-labelledby="modes-title" className="relative overflow-hidden bg-ink text-white section-pad">
        <RouteLines tone="dark" className="opacity-60" />
        <div className="wrap relative">
          <SectionIntro tone="dark" id="modes-title" eyebrow="Shipping modes" lines={["Sea, air and road.", "Matched to your cargo."]} />
          <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {shippingModes.map((m, i) => {
              const Icon = modeIcons[m.key];
              return (
                <li key={m.key}>
                  <Reveal delay={i * 0.07} className="flex h-full flex-col rounded-signature bg-ink-2 p-8">
                    <Icon className="size-8 text-accent" aria-hidden="true" />
                    <h3 className="headline mt-6 text-3xl">{m.title}</h3>
                    <p className="mt-3 text-muted-on-dark">{m.text}</p>
                    <ul className="mt-6 space-y-2 border-t border-line-dark pt-5 text-sm">
                      {m.specs.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span aria-hidden="true" className="text-accent">
                            ✦
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <div className="mt-20 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <caption className="eyebrow mb-6 text-left text-accent">Container sizes (typical internal dimensions)</caption>
              <thead>
                <tr className="border-b border-line-dark text-sm text-muted-on-dark">
                  <th scope="col" className="py-3 pr-6 font-semibold">
                    Container
                  </th>
                  <th scope="col" className="py-3 pr-6 font-semibold">
                    L × W × H
                  </th>
                  <th scope="col" className="py-3 pr-6 font-semibold">
                    Volume
                  </th>
                  <th scope="col" className="py-3 font-semibold">
                    Max payload
                  </th>
                </tr>
              </thead>
              <tbody>
                {containerSpecs.map((c) => (
                  <tr key={c.size} className="border-b border-line-dark">
                    <th scope="row" className="headline py-5 pr-6 text-2xl">
                      {c.size}
                    </th>
                    <td className="py-5 pr-6 tabular-nums">{c.internal}</td>
                    <td className="py-5 pr-6 tabular-nums">{c.volume}</td>
                    <td className="py-5 tabular-nums">{c.payload}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Customs & compliance */}
      <section aria-labelledby="customs-title" className="section-pad">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro
              id="customs-title"
              eyebrow="Customs & compliance"
              lines={["Paperwork that", "clears first time."]}
              lead="Most delays happen at the border. We prepare export documents in China and coordinate the import requirements at your end."
            />
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-signature">
              <Image src={pexelsUrl(stockImages.stepPaperwork.id, 1400)} alt={stockImages.stepPaperwork.alt} fill sizes="(min-width: 1024px) 38vw, 95vw" className="object-cover" />
            </div>
          </div>
          <ul className="grid content-start gap-4 lg:col-span-6 lg:col-start-7">
            {complianceItems.map((c) => (
              <li key={c.title}>
                <Reveal className="flex gap-5 rounded-2xl border border-line p-7">
                  <FileCheck2 className="mt-1 size-6 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="mt-2 text-muted">{c.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ports & Incoterms */}
      <section aria-labelledby="ports-title" className="bg-tint section-pad">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <SectionIntro id="ports-title" eyebrow="Trade lane" lines={["Common ports", "on our routes."]} />
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="eyebrow text-accent-ink">Loading — China</h3>
                <ul className="mt-4 space-y-2">
                  {portsChina.map((p) => (
                    <li key={p} className="font-medium">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="eyebrow text-accent-ink">Discharge — West Africa</h3>
                <ul className="mt-4 space-y-2">
                  {portsWestAfrica.map((p) => (
                    <li key={p} className="font-medium">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 className="eyebrow text-accent-ink">Incoterms we quote on</h3>
            <dl className="mt-6 divide-y divide-line rounded-signature bg-white">
              {rfqIncoterms.map((t) => (
                <div key={t} className="grid grid-cols-[5rem_1fr] gap-4 p-6">
                  <dt className="headline text-3xl text-brand">{t}</dt>
                  <dd>
                    <span className="font-semibold">{incotermInfo[t].name}.</span> <span className="text-muted">{incotermInfo[t].summary}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <CtaBand />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "How we work", path: "/how-we-work" }])} />
    </>
  );
}
