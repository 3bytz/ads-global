import { renderOg, ogSize } from "@/lib/og";
import { getCategory } from "@/lib/content/queries";

export const alt = "ADS Global product category";
export const size = ogSize;
export const contentType = "image/png";

export default async function CategoryOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  return renderOg({
    eyebrow: category ? `${category.hsLabel} · Products & services` : "Products & services",
    title: category?.name ?? "Products & services",
    subtitle: category?.summary,
  });
}
