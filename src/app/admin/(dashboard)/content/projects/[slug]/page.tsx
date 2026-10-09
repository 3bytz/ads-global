import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { Checkbox, Input, Textarea } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { AdminHeader, Card } from "@/components/admin/ui";
import { deleteProject, saveProject } from "../../actions";
import { staffClient } from "@/lib/admin/server";

export const metadata: Metadata = { title: "Edit project" };

export default async function ProjectEditor({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const isNew = slug === "new";
  const { supabase } = await staffClient();

  const [{ data: project }, { data: categories }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : supabase.from("projects").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("categories").select("slug, name").order("sort_order"),
  ]);
  if (!isNew && !project) notFound();
  const p = (project ?? { slug: "", title: "", client: "", location: "", category_slugs: [], summary: "", body: "", cover_url: null, cover_alt: "", published: false, sort_order: 0 }) as Record<string, unknown>;
  const chosen = (p.category_slugs as string[]) ?? [];

  return (
    <div className="space-y-8">
      <Link href="/admin/content/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All projects
      </Link>
      <AdminHeader eyebrow="Projects" title={isNew ? "New project" : String(p.title)} />
      {saved && <p className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Saved.</p>}

      <Card>
        <ActionForm action={saveProject.bind(null, isNew ? null : slug)}>
          <div className="grid gap-5 md:grid-cols-2">
            <Input name="title" label="Title" required defaultValue={String(p.title)} className="md:col-span-2" />
            <Input name="slug" label="URL slug" defaultValue={String(p.slug)} hint="Leave blank to generate from the title." />
            <Input name="sort_order" label="Sort order" type="number" defaultValue={Number(p.sort_order ?? 0)} />
            <Input name="client" label="Client (or sector, if confidential)" defaultValue={String(p.client)} />
            <Input name="location" label="Location / trade lane" defaultValue={String(p.location)} hint="e.g. Ningbo → Lagos Apapa" />
            <Textarea name="summary" label="Summary" rows={2} defaultValue={String(p.summary)} className="md:col-span-2" />
            <Textarea
              name="body"
              label="Story"
              rows={12}
              defaultValue={String(p.body)}
              hint="Plain text. Leave a blank line between paragraphs. Only publish genuine projects you have permission to describe."
              className="md:col-span-2"
            />
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold">Categories</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {((categories ?? []) as Array<{ slug: string; name: string }>).map((c) => (
                  <label key={c.slug} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                    <input type="checkbox" name="category_slugs" value={c.slug} defaultChecked={chosen.includes(c.slug)} className="accent-[var(--color-accent)]" />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="md:col-span-2">
              <ImageField urlName="cover_url" altName="cover_alt" label="Cover photo" defaultUrl={(p.cover_url as string | null) ?? ""} defaultAlt={String(p.cover_alt ?? "")} />
            </div>
            <Checkbox name="published" label="Published" defaultChecked={Boolean(p.published)} hint="Drafts are only visible here." />
          </div>
        </ActionForm>
      </Card>

      {!isNew && (
        <Card title="Delete project">
          <ActionForm action={deleteProject.bind(null, slug)} submitLabel="Delete project" danger confirm="Delete this project permanently?">
            {null}
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
