import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getProject, getProjects } from "@/lib/content/queries";
import { breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({ title: project.title, description: project.summary || project.title, path: `/projects/${project.slug}` });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, categories] = await Promise.all([getProject(slug), getCategories()]);
  if (!project) notFound();

  const related = categories.filter((c) => project.categorySlugs.includes(c.slug));
  // Body is plain text; blank lines separate paragraphs (no HTML is rendered from the database).
  const paragraphs = project.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={[project.client, project.location].filter(Boolean).join(" · ") || "Case study"}
        line1={project.title}
        image={project.coverUrl ? { src: project.coverUrl, alt: project.coverAlt } : null}
      >
        {project.summary && <p className="measure text-lead text-white/85">{project.summary}</p>}
      </PageHero>

      <article className="section-pad">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-lead lg:col-span-7">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          {related.length > 0 && (
            <aside className="lg:col-span-4 lg:col-start-9">
              <h2 className="eyebrow text-accent-ink">Categories</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {related.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/products/${c.slug}`} className="inline-block rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>

      <CtaBand />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
    </>
  );
}
