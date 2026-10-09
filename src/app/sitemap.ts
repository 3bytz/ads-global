import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getCategories, getProjects } from "@/lib/content/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, projects] = await Promise.all([getCategories(), getProjects()]);
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page("", 1, "weekly"),
    page("/about", 0.8),
    page("/products", 0.9, "weekly"),
    ...categories.map((c) => page(`/products/${c.slug}`, 0.8)),
    page("/how-we-work", 0.7),
    page("/projects", 0.6, "weekly"),
    ...projects.map((p) => ({ ...page(`/projects/${p.slug}`, 0.6), lastModified: p.publishedAt ? new Date(p.publishedAt) : now })),
    page("/request-a-quote", 0.9),
    page("/contact", 0.8),
    page("/partners", 0.6),
    page("/legal/privacy", 0.2, "yearly"),
    page("/legal/terms", 0.2, "yearly"),
    page("/legal/cookies", 0.1, "yearly"),
  ];
}
