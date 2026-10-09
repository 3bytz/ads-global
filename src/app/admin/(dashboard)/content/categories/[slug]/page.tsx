import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { Checkbox, Input, Select, Textarea } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { AdminHeader, Card } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "../../actions";
import { staffClient } from "@/lib/admin/server";
import { categoryGroupLabels, type CategoryGroup } from "@/content/types";
import { incotermInfo } from "@/content/trade";

export const metadata: Metadata = { title: "Edit category" };

const allTerms = Object.keys(incotermInfo) as Array<keyof typeof incotermInfo>;

export default async function CategoryEditor({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const isNew = slug === "new";
  const { supabase } = await staffClient();

  let c: Record<string, unknown> = {
    slug: "",
    name: "",
    hs_label: "",
    category_group: "consumer",
    summary: "",
    description: "",
    example_products: [],
    example_products_confirmed: false,
    sourcing_regions: [],
    sourcing_regions_confirmed: false,
    incoterms: ["FOB", "CIF", "DDP"],
    image_url: null,
    image_alt: "",
    image_is_stock: false,
    sort_order: 99,
    published: false,
  };
  if (!isNew) {
    const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
    if (!data) notFound();
    c = data as Record<string, unknown>;
  }
  const terms = (c.incoterms as string[]) ?? [];

  return (
    <div className="space-y-8">
      <Link href="/admin/content/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All categories
      </Link>
      <AdminHeader
        eyebrow="Products & services"
        title={isNew ? "New category" : String(c.name)}
        actions={
          !isNew ? (
            <a href={`/products/${slug}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold">
              <ExternalLink className="size-4" aria-hidden="true" /> View on site
            </a>
          ) : undefined
        }
      />
      {saved && <p className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Saved.</p>}

      <Card>
        <ActionForm action={saveCategory.bind(null, isNew ? null : slug)}>
          <div className="grid gap-5 md:grid-cols-2">
            <Input name="name" label="Name" required defaultValue={String(c.name)} />
            <Input name="slug" label="URL slug" defaultValue={String(c.slug)} hint={`/products/${String(c.slug) || "your-slug"} — leave blank to generate from the name. Changing it breaks old links.`} />
            <Input name="hs_label" label="HS-code label" defaultValue={String(c.hs_label)} hint='e.g. "HS 84" — indicative customs chapters.' />
            <Select
              name="category_group"
              label="Group"
              defaultValue={String(c.category_group)}
              options={(Object.keys(categoryGroupLabels) as CategoryGroup[]).map((g) => ({ value: g, label: categoryGroupLabels[g] }))}
            />
            <Textarea name="summary" label="Summary (one line)" required rows={2} defaultValue={String(c.summary)} className="md:col-span-2" />
            <Textarea name="description" label="Description" rows={4} defaultValue={String(c.description)} className="md:col-span-2" />
            <div className="space-y-2">
              <Textarea name="example_products" label="Example products (one per line)" rows={6} defaultValue={((c.example_products as string[]) ?? []).join("\n")} />
              <Checkbox name="example_products_confirmed" label="Confirmed by ADS" defaultChecked={Boolean(c.example_products_confirmed)} hint="Unconfirmed lists are hidden once Claims mode is set to Hide." />
            </div>
            <div className="space-y-2">
              <Textarea name="sourcing_regions" label="Typical sourcing regions (one per line)" rows={6} defaultValue={((c.sourcing_regions as string[]) ?? []).join("\n")} />
              <Checkbox name="sourcing_regions_confirmed" label="Confirmed by ADS" defaultChecked={Boolean(c.sourcing_regions_confirmed)} />
            </div>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold">Applicable Incoterms</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {allTerms.map((t) => (
                  <label key={t} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                    <input type="checkbox" name="incoterms" value={t} defaultChecked={terms.includes(t)} className="accent-[var(--color-accent)]" />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="md:col-span-2">
              <ImageField
                urlName="image_url"
                altName="image_alt"
                stockName="image_is_stock"
                label="Card & hero image"
                defaultUrl={(c.image_url as string | null) ?? ""}
                defaultAlt={String(c.image_alt ?? "")}
                defaultStock={Boolean(c.image_is_stock)}
              />
            </div>
            <Input name="sort_order" label="Sort order" type="number" defaultValue={Number(c.sort_order)} />
            <div className="flex items-end">
              <Checkbox name="published" label="Published (visible on the website)" defaultChecked={Boolean(c.published)} />
            </div>
          </div>
        </ActionForm>
      </Card>

      {!isNew && (
        <Card title="Delete category" description="Removes the page and its card. Consider unpublishing instead.">
          <ActionForm action={deleteCategory.bind(null, slug)} submitLabel="Delete category" danger confirm="Delete this category permanently?">
            {null}
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
