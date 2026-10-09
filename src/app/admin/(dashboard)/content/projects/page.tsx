import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, AdminLink, Badge, EmptyState } from "@/components/admin/ui";
import { staffClient } from "@/lib/admin/server";
import { formatLagosDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { supabase } = await staffClient();
  const { deleted } = await searchParams;
  const { data } = await supabase.from("projects").select("slug, title, client, published, published_at, updated_at").order("sort_order").order("updated_at", { ascending: false });
  const rows = (data ?? []) as Array<{ slug: string; title: string; client: string; published: boolean; published_at: string | null; updated_at: string }>;

  return (
    <div>
      <AdminHeader eyebrow="Content" title="Projects" description="Case studies shown at /projects." actions={<AdminLink href="/admin/content/projects/new">New project</AdminLink>} />
      {deleted && <p className="mt-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Project deleted.</p>}
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No projects yet">
            The Projects page shows a &ldquo;coming soon&rdquo; message until you publish the first one.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {rows.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/content/projects/${p.slug}`} className="flex items-center justify-between gap-4 p-4 hover:bg-tint/60">
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="block text-xs text-muted">
                    {p.client || "—"} · updated {formatLagosDateTime(p.updated_at)}
                  </span>
                </span>
                {p.published ? <Badge tone="won">Published</Badge> : <Badge tone="closed">Draft</Badge>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
