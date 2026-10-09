import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { Reveal } from "@/components/motion/reveal";
import { CategoryCard } from "@/components/sections/category-card";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { incotermInfo } from "@/content/trade";
import { categoryGroupLabels } from "@/content/types";
import { getCategories, getCategory, getSiteSettings } from "@/lib/content/queries";
import { breadcrumbLd, serviceLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return pageMetadata({
    title: category.name,
    description: `${category.summary} ${category.description}`.slice(0, 300),
    path: `/products/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [category, all, settings] = await Promise.all([getCategory(slug), getCategories(), getSiteSettings()]);
  if (!category) notFound();

  const flag = settings.company.claimsMode === "flag";
  const showExamples = category.exampleProductsConfirmed || flag;
  const showRegions = category.sourcingRegionsConfirmed || flag;
  const related = all.filter((c) => c.group === category.group && c.slug !== category.slug).slice(0, 3);
  const quoteHref = `/request-a-quote?category=${encodeURIComponent(category.slug)}`;

  return (
    <>
      <PageHero
        eyebrow={`${category.hsLabel} · ${categoryGroupLabels[category.group]}`}
        line1={category.name}
        image={category.imageUrl ? { src: category.imageUrl, alt: category.imageAlt } : null}
      >
        <p className="measure text-lead text-white/85">{category.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={quoteHref}>Request a quote for this category</ButtonLink>
          <ButtonLink href="/products" variant="outline-light">
            All categories
          </ButtonLink>
        </div>
      </PageHero>

      <nav aria-label="Breadcrumb" className="wrap pt-8 text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>{" "}
            /
          </li>
          <li>
            <Link href="/products" className="hover:text-ink">
              Products & services
            </Link>{" "}
            /
          </li>
          <li aria-current="page" className="font-semibold text-ink">
            {category.name}
          </li>
        </ol>
      </nav>

      <section className="section-pad pt-16!">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="headline text-[clamp(1.75rem,3vw,3rem)] leading-[1.05]">{category.description}</p>

            {showExamples && category.exampleProducts.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="eyebrow flex items-center gap-3 text-accent-ink">
                  Example products
                  {!category.exampleProductsConfirmed && <Unconfirmed />}
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {category.exampleProducts.map((p) => (
                    <li key={p} className="flex items-start gap-3 rounded-xl border border-line p-4">
                      <Check className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            {showRegions && category.sourcingRegions.length > 0 && (
              <div className="rounded-signature bg-tint p-8">
                <h2 className="eyebrow flex items-center gap-3 text-accent-ink">
                  Typical sourcing regions
                  {!category.sourcingRegionsConfirmed && <Unconfirmed />}
                </h2>
                <ul className="mt-5 space-y-3">
                  {category.sourcingRegions.map((r) => (
                    <li key={r} className="flex items-center gap-3 font-medium">
                      <MapPin className="size-4 text-brand" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {category.incoterms.length > 0 && (
              <div className="rounded-signature bg-ink p-8 text-white">
                <h2 className="eyebrow text-accent">Applicable Incoterms</h2>
                <dl className="mt-5 space-y-4">
                  {category.incoterms.map((t) => (
                    <div key={t}>
                      <dt className="headline text-3xl">
                        {t} <span className="font-sans text-sm font-medium normal-case tracking-normal text-muted-on-dark">{incotermInfo[t]?.name}</span>
                      </dt>
                      <dd className="text-sm text-muted-on-dark">{incotermInfo[t]?.summary}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="rounded-signature border border-line p-8">
              <h2 className="headline text-3xl">Need a price?</h2>
              <p className="mt-2 text-muted">Tell us the product, quantity and destination. We&apos;ll come back with options.</p>
              <ButtonLink href={quoteHref} className="mt-6">
                Request a quote
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-tint section-pad">
          <div className="wrap">
            <h2 id="related-title" className="headline text-h2">
              More in <span className="text-brand">{categoryGroupLabels[category.group]}</span>
            </h2>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((c) => (
                <li key={c.slug}>
                  <CategoryCard category={c} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand title1={`Sourcing ${category.name.toLowerCase()}?`} title2="Let's talk specifics." />
      <JsonLd data={serviceLd(category)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Products & services", path: "/products" },
          { name: category.name, path: `/products/${category.slug}` },
        ])}
      />
    </>
  );
}
