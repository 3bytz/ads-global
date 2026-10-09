import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CategoryCard } from "@/components/sections/category-card";
import { CtaBand } from "@/components/sections/cta-band";
import { SectionIntro } from "@/components/sections/section-intro";
import { JsonLd } from "@/components/seo/json-ld";
import { CategoryFilter } from "./category-filter";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { incotermInfo, rfqIncoterms } from "@/content/trade";
import { categoryGroupLabels, type CategoryGroup } from "@/content/types";
import { getCategories } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Products & services",
  description:
    "14 product and service categories: food and beverages, electronics, machinery, building materials, chemicals, vehicles, FMCG and more — sourced and shipped on EXW, FOB, CIF or DDP terms.",
  path: "/products",
});

export default async function ProductsPage() {
  const categories = await getCategories();
  const groups = Object.keys(categoryGroupLabels) as CategoryGroup[];
  const counts = {
    all: categories.length,
    ...Object.fromEntries(groups.map((g) => [g, categories.filter((c) => c.group === g).length])),
  } as Record<CategoryGroup | "all", number>;

  return (
    <>
      <PageHero
        eyebrow="Products & services"
        line1={`${categories.length} categories.`}
        line2="Sourced, checked, shipped."
        image={{ src: pexelsUrl(stockImages.terminal.id, 2400), alt: stockImages.terminal.alt }}
      >
        <p className="measure text-lead text-white/85">
          From packaged foods to trucks and EVs. Pick a category to see example products, sourcing regions and the Incoterms we quote on.
        </p>
      </PageHero>

      <section aria-labelledby="catalogue-title" className="section-pad">
        <div className="wrap">
          <h2 id="catalogue-title" className="sr-only">
            All categories
          </h2>
          <CategoryFilter
            counts={counts}
            items={categories.map((c, i) => ({ group: c.group, slug: c.slug, node: <CategoryCard category={c} index={i} priority={i < 2} /> }))}
          />
        </div>
      </section>

      <section aria-labelledby="terms-title" className="bg-tint section-pad">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro
              id="terms-title"
              eyebrow="Trade terms"
              lines={["Quoted on the", "terms you buy on."]}
              lead="Every quotation states the Incoterm, so it's clear who pays for freight, insurance and duties — and where risk passes to you."
            />
          </div>
          <dl className="grid gap-px overflow-hidden rounded-signature bg-line sm:grid-cols-2 lg:col-span-7">
            {rfqIncoterms.map((t) => (
              <div key={t} className="bg-white p-7">
                <dt>
                  <span className="headline text-4xl text-brand">{t}</span>
                  <span className="ml-3 text-sm font-semibold text-muted">{incotermInfo[t].name}</span>
                </dt>
                <dd className="mt-2 text-muted">{incotermInfo[t].summary}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBand />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Products & services", path: "/products" }])} />
    </>
  );
}
