import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PackageOpen } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { getProjects } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Projects & case studies",
  description: "Selected sourcing, export and logistics projects delivered by ADS Global Limited.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHero
        eyebrow="Projects"
        line1="Work that"
        line2="shipped."
        image={{ src: pexelsUrl(stockImages.stepShipping.id, 2400), alt: stockImages.stepShipping.alt }}
        size="compact"
      />

      <section aria-labelledby="projects-title" className="section-pad">
        <div className="wrap">
          <h2 id="projects-title" className="sr-only">
            Case studies
          </h2>
          {projects.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-signature bg-tint p-10 text-center lg:p-16">
              <PackageOpen className="mx-auto size-12 text-brand" aria-hidden="true" />
              <p className="headline mt-6 text-h3">Case studies are on their way.</p>
              <p className="mt-4 text-muted">
                We&apos;re preparing write-ups of recent sourcing and shipping projects. In the meantime, tell us about yours.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/request-a-quote">Request a quote</ButtonLink>
                <ButtonLink href="/contact" variant="outline-dark">
                  Contact us
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="grid gap-10 md:grid-cols-2">
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <Reveal delay={(i % 2) * 0.08}>
                    <Link href={`/projects/${p.slug}`} className="group block">
                      <div className="relative aspect-[16/11] overflow-hidden rounded-signature bg-ink">
                        {p.coverUrl && (
                          <Image
                            src={p.coverUrl}
                            alt={p.coverAlt}
                            fill
                            sizes="(min-width: 768px) 47vw, 95vw"
                            className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="mt-6 flex items-start justify-between gap-6">
                        <div>
                          <p className="eyebrow text-accent-ink">{[p.client, p.location].filter(Boolean).join(" · ")}</p>
                          <h3 className="headline mt-2 text-4xl">{p.title}</h3>
                          <p className="mt-2 text-muted">{p.summary}</p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform group-hover:rotate-45"
                        >
                          <ArrowUpRight className="size-5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CtaBand />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])} />
    </>
  );
}
