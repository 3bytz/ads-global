"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, fd, ok, slugify, zodFail, type ActionState } from "@/lib/admin/action-state";
import { revalidatePublicSite, staffClient } from "@/lib/admin/server";

const imageUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .url({ error: "Enter a full https:// URL." })
    .refine((u) => /^https:\/\/(res\.cloudinary\.com|images\.pexels\.com|images\.unsplash\.com)\//.test(u), {
      error: "Images must come from Cloudinary (upload above), Pexels or Unsplash.",
    })
    .optional(),
);

const slugSchema = z.string().regex(/^[a-z0-9-]{2,80}$/, { error: "Use 2–80 lowercase letters, numbers and dashes." });

// ------------------------------------------------------------------ Categories

const categorySchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(2).max(80),
    hs_label: z.string().trim().max(40),
    category_group: z.enum(["consumer", "industrial", "automotive_transport", "services"]),
    summary: z.string().trim().min(10, { error: "Write a one-line summary (10+ characters)." }).max(240),
    description: z.string().trim().max(2000),
    example_products: z.array(z.string().max(120)).max(20),
    example_products_confirmed: z.boolean(),
    sourcing_regions: z.array(z.string().max(80)).max(12),
    sourcing_regions_confirmed: z.boolean(),
    incoterms: z.array(z.enum(["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"])),
    image_url: imageUrl,
    image_alt: z.string().trim().max(200),
    image_is_stock: z.boolean(),
    sort_order: z.coerce.number().int().min(0).max(999),
    published: z.boolean(),
  })
  .refine((v) => !v.image_url || v.image_alt.length >= 5, { path: ["image_alt"], error: "Alt text is required when there's an image." });

export async function saveCategory(originalSlug: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const name = fd.str(form, "name") ?? "";
  const parsed = categorySchema.safeParse({
    slug: fd.str(form, "slug") ?? slugify(name),
    name,
    hs_label: fd.str(form, "hs_label") ?? "",
    category_group: fd.str(form, "category_group"),
    summary: fd.str(form, "summary") ?? "",
    description: fd.str(form, "description") ?? "",
    example_products: fd.lines(form, "example_products"),
    example_products_confirmed: fd.bool(form, "example_products_confirmed"),
    sourcing_regions: fd.lines(form, "sourcing_regions"),
    sourcing_regions_confirmed: fd.bool(form, "sourcing_regions_confirmed"),
    incoterms: fd.all(form, "incoterms"),
    image_url: fd.str(form, "image_url"),
    image_alt: fd.str(form, "image_alt") ?? "",
    image_is_stock: fd.bool(form, "image_is_stock"),
    sort_order: fd.str(form, "sort_order") ?? "0",
    published: fd.bool(form, "published"),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const { supabase } = await staffClient();
  const row = { ...parsed.data, image_url: parsed.data.image_url ?? null };
  const { error } = originalSlug
    ? await supabase.from("categories").update(row).eq("slug", originalSlug)
    : await supabase.from("categories").insert(row);
  if (error) return fail(error.code === "23505" ? "That slug is already used by another category." : error.message);

  revalidatePublicSite();
  if (!originalSlug || originalSlug !== row.slug) redirect(`/admin/content/categories/${row.slug}?saved=1`);
  return ok("Category saved. The website updates within a few seconds.");
}

export async function deleteCategory(slug: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  const { supabase } = await staffClient();
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) return fail(error.message);
  revalidatePublicSite();
  redirect("/admin/content/categories?deleted=1");
}

// ------------------------------------------------------------------ Projects

const projectSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(3).max(140),
    client: z.string().trim().max(140),
    location: z.string().trim().max(140),
    category_slugs: z.array(z.string().max(80)).max(14),
    summary: z.string().trim().max(400),
    body: z.string().trim().max(20000),
    cover_url: imageUrl,
    cover_alt: z.string().trim().max(200),
    published: z.boolean(),
    sort_order: z.coerce.number().int().min(0).max(999),
  })
  .refine((v) => !v.cover_url || v.cover_alt.length >= 5, { path: ["cover_alt"], error: "Alt text is required when there's a cover image." });

export async function saveProject(originalSlug: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const title = fd.str(form, "title") ?? "";
  const parsed = projectSchema.safeParse({
    slug: fd.str(form, "slug") ?? slugify(title),
    title,
    client: fd.str(form, "client") ?? "",
    location: fd.str(form, "location") ?? "",
    category_slugs: fd.all(form, "category_slugs"),
    summary: fd.str(form, "summary") ?? "",
    body: (form.get("body") as string | null)?.trim() ?? "",
    cover_url: fd.str(form, "cover_url"),
    cover_alt: fd.str(form, "cover_alt") ?? "",
    published: fd.bool(form, "published"),
    sort_order: fd.str(form, "sort_order") ?? "0",
  });
  if (!parsed.success) return zodFail(parsed.error);

  const { supabase } = await staffClient();
  let publishedAt: string | null = null;
  if (parsed.data.published) {
    const { data: existing } = originalSlug
      ? await supabase.from("projects").select("published_at").eq("slug", originalSlug).maybeSingle()
      : { data: null };
    publishedAt = (existing?.published_at as string | null | undefined) ?? new Date().toISOString();
  }
  const row = { ...parsed.data, cover_url: parsed.data.cover_url ?? null, published_at: publishedAt };
  const { error } = originalSlug ? await supabase.from("projects").update(row).eq("slug", originalSlug) : await supabase.from("projects").insert(row);
  if (error) return fail(error.code === "23505" ? "That slug is already used by another project." : error.message);

  revalidatePublicSite();
  if (!originalSlug || originalSlug !== row.slug) redirect(`/admin/content/projects/${row.slug}?saved=1`);
  return ok(parsed.data.published ? "Saved and published." : "Saved as draft.");
}

export async function deleteProject(slug: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  const { supabase } = await staffClient();
  const { error } = await supabase.from("projects").delete().eq("slug", slug);
  if (error) return fail(error.message);
  revalidatePublicSite();
  redirect("/admin/content/projects?deleted=1");
}

// ------------------------------------------------------------------ Process steps

const stepSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400),
  details: z.array(z.string().max(200)).max(8),
  image_url: imageUrl,
  image_alt: z.string().trim().max(200),
  sort_order: z.coerce.number().int().min(0).max(99),
});

export async function saveProcessStep(slug: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = stepSchema.safeParse({
    title: fd.str(form, "title") ?? "",
    description: fd.str(form, "description") ?? "",
    details: fd.lines(form, "details"),
    image_url: fd.str(form, "image_url"),
    image_alt: fd.str(form, "image_alt") ?? "",
    sort_order: fd.str(form, "sort_order") ?? "0",
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const { error } = await supabase.from("process_steps").update({ ...parsed.data, image_url: parsed.data.image_url ?? null }).eq("slug", slug);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Step saved.");
}
