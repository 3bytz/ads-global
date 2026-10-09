import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { AdminHeader, AdminLink, Badge, EmptyState } from "@/components/admin/ui";
import { staffClient } from "@/lib/admin/server";
import { categoryGroupLabels, type CategoryGroup } from "@/content/types";

export const metadata: Metadata = { title: "Products & services" };

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { supabase } = await staffClient();
  const { deleted } = await searchParams;
  const { data } = await supabase
    .from("categories")
    .select("slug, name, hs_label, category_group, image_url, image_is_stock, published, sort_order, example_products_confirmed")
    .order("sort_order");
  const rows = (data ?? []) as Array<{
    slug: string;
    name: string;
    hs_label: string;
    category_group: CategoryGroup;
    image_url: string | null;
    image_is_stock: boolean;
    published: boolean;
    sort_order: number;
    example_products_confirmed: boolean;
  }>;

  return (
    <div>
      <AdminHeader
        eyebrow="Content"
        title="Products & services"
        description="Order is set by the sort number (lowest first)."
        actions={<AdminLink href="/admin/content/categories/new">Add category</AdminLink>}
      />
      {deleted && <p className="mt-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Category deleted.</p>}
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No categories yet">Run the seed or add the first category.</EmptyState>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {rows.map((c) => (
            <li key={c.slug}>
              <Link href={`/admin/content/categories/${c.slug}`} className="flex items-center gap-4 p-4 hover:bg-tint/60">
                <span className="w-8 text-center text-sm tabular-nums text-muted">{c.sort_order}</span>
                <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-tint">
                  {c.image_url ? <Image src={c.image_url} alt="" fill sizes="56px" className="object-cover" /> : <ImageOff className="size-5 text-muted" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted">
                    {c.hs_label} · {categoryGroupLabels[c.category_group]}
                  </span>
                </span>
                <span className="hidden flex-wrap justify-end gap-2 sm:flex">
                  {!c.published && <Badge tone="closed">Hidden</Badge>}
                  {c.image_is_stock && <Badge tone="warn">Stock photo</Badge>}
                  {!c.example_products_confirmed && <Badge tone="warn">Examples to confirm</Badge>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
