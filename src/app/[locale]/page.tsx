import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Marquee } from "@/components/site/marquee";
import { ButtonLink } from "@/components/ui/button-link";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { RotatingBadge } from "@/components/ui/rotating-badge";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { ScrollExpandImage } from "@/components/motion/scroll-expand-image";
import { SectionIntro } from "@/components/sections/section-intro";
import { OutlinedWord } from "@/components/sections/outlined-word";
import { StatsBand } from "@/components/sections/stats-band";
import { CategoryCard } from "@/components/sections/category-card";
import { ProcessStepsCompact } from "@/components/sections/process-steps";
import { StrengthsGrid } from "@/components/sections/strengths-grid";
import { OfficesBand } from "@/components/sections/offices-band";
import { CtaBand } from "@/components/sections/cta-band";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import {
  getCategories,
  getClaims,
  getOffices,
  getProcessSteps,
  getSiteSettings,
  getStats,
  getStrengths,
} from "@/lib/content/queries";
import { claimVisibility } from "@/lib/content/claims";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({ description: settings.company.shortDescription, path: "/" });
}

export default async function HomePage() {
  const [settings, categories, stats, claims, offices, steps, strengths] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getStats(),
    getClaims(),
    getOffices(),
    getProcessSteps(),
    getStrengths(),
  ]);
  const mode = settings.company.claimsMode;
  const highlightClaims = ["iso_status", "support_247"]
    .map((key) => claims[key])
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ c, vis: claimVisibility(c.confirmed, mode) }))
    .filter((x) => x.vis !== "hide");

  return (
    <>
      <PageHero
        size="home"
        eyebrow={settings.hero.eyebrow}
        line1={settings.hero.headlineLine1}
        line2={settings.hero.headlineLine2}
        image={settings.hero.imageUrl ? { src: settings.hero.imageUrl, alt: settings.hero.imageAlt } : null}
        videoUrl={settings.hero.videoUrl}
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="measure text-lead text-white/85">{settings.hero.subhead}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/request-a-quote">Request a quote</ButtonLink>
            <ButtonLink href="/products" variant="outline-light">
              Explore products
            </ButtonLink>
          </div>
        </div>
      </PageHero>

      <Marquee items={["Import", "Export", "Sourcing", "Logistics", "Consulting", "FOB · CIF · DDP", "20ft · 40ft · 40HC"]} />

      {/* Who we are */}
      <section aria-labelledby="who-title" className="relative overflow-hidden section-pad">
        <OutlinedWord word="Trade" className="absolute -right-[4vw] top-10 hidden lg:block" />
        <div className="wrap relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-7">
            <Parallax fill distance={30} className="relative aspect-[5/4] w-[86%] overflow-hidden rounded-signature">
              <Image
                src={pexelsUrl(stockImages.warehouse.id, 1600)}
                alt={stockImages.warehouse.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 85vw"
                className="object-cover"
              />
            </Parallax>
            <Reveal delay={0.15} className="absolute bottom-[-10%] right-0 w-[48%]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-signature border-[6px] border-white shadow-[0_30px_60px_-30px_rgb(10_31_61/0.5)]">
                <Image
                  src={pexelsUrl(stockImages.meeting.id, 1000)}
                  alt={stockImages.meeting.alt}
                  fill
                  sizes="(min-width: 1024px) 26vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <RotatingBadge text="Import ✦ Export ✦ Sourcing ✦ Logistics ✦ " className="absolute left-[70%] top-[-8%] hidden -translate-x-1/2 sm:grid" />
          </div>

          <div className="lg:col-span-5 lg:pl-6">
            <SectionIntro id="who-title" eyebrow="Who we are" lines={["A trading house", "built for two markets."]} />
            <div className="mt-8 space-y-5 measure text-lead text-muted">
              {settings.about.story.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            {highlightClaims.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {highlightClaims.map(({ c, vis }) => (
                  <li key={c.key} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium">
                    {c.text}
                    {vis === "flag" && <Unconfirmed className="text-accent-ink" />}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10">
              <ButtonLink href="/about" variant="dark">
                About ADS Global
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <StatsBand stats={stats} mode={mode} />

      {/* Categories: header on navy, cards overlap the band edge */}
      <section aria-labelledby="categories-title">
        <div className="bg-ink pb-40 pt-4 text-white lg:pb-56">
          <div className="wrap flex flex-wrap items-end justify-between gap-8 border-t border-line-dark pt-20">
            <SectionIntro
              id="categories-title"
              tone="dark"
              eyebrow="What we trade"
              lines={[`${categories.length} categories.`, "One accountable partner."]}
            />
            <ButtonLink href="/products" variant="outline-light">
              All products & services
            </ButtonLink>
          </div>
        </div>
        <div className="wrap -mt-28 pb-24 lg:-mt-40 lg:pb-36">
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={(i % 3) * 0.06}>
                  <CategoryCard category={c} index={i} />
                </Reveal>
              </li>
            ))}
            <li>
              <Link
                href="/request-a-quote"
                className="group flex aspect-[4/5] flex-col justify-between rounded-signature bg-accent p-7 text-ink"
              >
                <span className="eyebrow">Not listed?</span>
                <span>
                  <span className="headline block text-[clamp(2rem,3.2vw,3rem)] leading-[0.95]">Tell us what you need to source.</span>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                    Request a quote
                    <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <ScrollExpandImage src={pexelsUrl(stockImages.port.id, 2400)} alt={stockImages.port.alt} caption="From factory floor to your warehouse door." />

      {/* How we work */}
      <section aria-labelledby="process-title" className="section-pad">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionIntro
              id="process-title"
              eyebrow="How we work"
              lines={["Five steps.", "No surprises at the port."]}
              lead="One team follows your order from the first enquiry to delivery and after-sales, with clear documents at every hand-off."
            />
            <ButtonLink href="/how-we-work" variant="outline-dark">
              Logistics in detail
            </ButtonLink>
          </div>
          <div className="mt-16">
            <ProcessStepsCompact steps={steps} />
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section aria-labelledby="strengths-title" className="relative overflow-hidden bg-tint section-pad">
        <OutlinedWord word="Trust" className="absolute -left-[3vw] bottom-0 hidden lg:block" />
        <div className="wrap relative">
          <SectionIntro id="strengths-title" eyebrow="Why ADS Global" lines={["Why buyers and suppliers", "work with us."]} />
          <div className="mt-14">
            <StrengthsGrid strengths={strengths} />
          </div>
        </div>
      </section>

      <OfficesBand offices={offices} mode={mode} />

      <CtaBand />
    </>
  );
}
