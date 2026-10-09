import type { Metadata } from "next";
import Image from "next/image";
import { UserRound, FileBadge2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { SectionIntro } from "@/components/sections/section-intro";
import { OutlinedWord } from "@/components/sections/outlined-word";
import { OfficesBand } from "@/components/sections/offices-band";
import { CtaBand } from "@/components/sections/cta-band";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { getCertifications, getLeaders, getOffices, getSiteSettings } from "@/lib/content/queries";
import { claimVisibility } from "@/lib/content/claims";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description:
    "ADS Global Limited is an international trading house headquartered in Shenyang, China, with operations in Nigeria: sourcing, import and export, logistics and trade consulting.",
  path: "/about",
});

export default async function AboutPage() {
  const [settings, leaders, certifications, offices] = await Promise.all([
    getSiteSettings(),
    getLeaders(),
    getCertifications(),
    getOffices(),
  ]);
  const mode = settings.company.claimsMode;
  // Mission/vision are always shown; the wording is only flagged while in pre-launch mode.
  const mvFlagged = !settings.about.missionVisionConfirmed && mode === "flag";
  const visibleLeaders = leaders.filter((l) => claimVisibility(l.confirmed, mode) !== "hide");
  const visibleCerts = certifications.filter((c) => claimVisibility(c.confirmed, mode) !== "hide");

  return (
    <>
      <PageHero
        eyebrow="About ADS Global"
        line1="Two markets."
        line2="One trading house."
        image={{ src: pexelsUrl(stockImages.warehouse.id, 2400), alt: stockImages.warehouse.alt }}
      >
        <p className="measure text-lead text-white/85">{settings.company.shortDescription}</p>
      </PageHero>

      {/* Story */}
      <section aria-labelledby="story-title" className="relative overflow-hidden section-pad">
        <OutlinedWord word="Story" className="absolute -right-[3vw] top-6 hidden lg:block" />
        <div className="wrap relative grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionIntro id="story-title" eyebrow="Our story" lines={["Building bridges", "in global commerce."]} />
            <div className="mt-8 space-y-5 measure text-lead text-muted">
              {settings.about.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Parallax fill distance={40} className="relative aspect-[4/5] overflow-hidden rounded-signature">
              <Image src={pexelsUrl(stockImages.meeting.id, 1400)} alt={stockImages.meeting.alt} fill sizes="(min-width: 1024px) 40vw, 95vw" className="object-cover" />
            </Parallax>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section aria-labelledby="mv-title" className="bg-tint section-pad">
        <div className="wrap">
          <h2 id="mv-title" className="sr-only">
            Mission and vision
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <article className="flex h-full flex-col justify-between gap-10 rounded-signature bg-ink p-10 text-white lg:p-14">
                <p className="eyebrow text-accent">Our mission</p>
                <p className="headline text-[clamp(1.75rem,3vw,3rem)] leading-[1.02]">{settings.about.mission}</p>
                {mvFlagged && <Unconfirmed className="self-start text-accent" label="Wording to confirm" />}
              </article>
            </Reveal>
            <Reveal delay={0.1} className="h-full">
              <article className="flex h-full flex-col justify-between gap-10 rounded-signature bg-white p-10 lg:p-14">
                <p className="eyebrow text-accent-ink">Our vision</p>
                <p className="headline text-[clamp(1.75rem,3vw,3rem)] leading-[1.02] text-brand">{settings.about.vision}</p>
                {mvFlagged && <Unconfirmed className="self-start text-accent-ink" label="Wording to confirm" />}
              </article>
            </Reveal>
          </div>

          <div className="mt-24">
            <SectionIntro eyebrow="Our values" lines={["What we hold", "ourselves to."]} />
            <ol className="mt-12 grid gap-px overflow-hidden rounded-signature bg-line sm:grid-cols-2 lg:grid-cols-4">
              {settings.about.values.map((v, i) => (
                <li key={v.title} className="bg-white p-8 lg:p-10">
                  <p className="headline text-5xl text-accent-ink">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="headline mt-6 text-3xl">{v.title}</h3>
                  <p className="mt-3 text-muted">{v.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Leadership */}
      {visibleLeaders.length > 0 && (
        <section aria-labelledby="leaders-title" className="section-pad">
          <div className="wrap">
            <SectionIntro id="leaders-title" eyebrow="Leadership" lines={["The people", "behind the trade."]} />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleLeaders.map((l) => (
                <li key={l.slug}>
                  <article>
                    <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-signature bg-tint">
                      {l.photoUrl ? (
                        <Image src={l.photoUrl} alt={`Portrait of ${l.name}`} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                      ) : (
                        <UserRound className="size-20 text-muted/50" aria-hidden="true" />
                      )}
                    </div>
                    <h3 className="headline mt-5 text-3xl">{l.name}</h3>
                    <p className="font-medium text-brand">{l.role}</p>
                    <p className="mt-2 text-muted">{l.bio}</p>
                    {!l.confirmed && <Unconfirmed className="mt-3 text-accent-ink" />}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Certifications */}
      {visibleCerts.length > 0 && (
        <section aria-labelledby="certs-title" className="border-t border-line section-pad">
          <div className="wrap grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionIntro id="certs-title" eyebrow="Registrations & certifications" lines={["On the record."]} accentFrom={0} />
            </div>
            <ul className="grid gap-4 lg:col-span-7">
              {visibleCerts.map((c) => (
                <li key={c.slug} className="flex items-start gap-5 rounded-2xl border border-line p-6">
                  <FileBadge2 className="mt-1 size-6 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted">
                      {c.issuer}
                      {c.reference && ` · ${c.reference}`}
                      {c.validUntil && ` · valid until ${c.validUntil}`}
                    </p>
                    {!c.confirmed && <Unconfirmed className="mt-2 text-accent-ink" />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <OfficesBand offices={offices} mode={mode} />
      <CtaBand />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}
