import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Download, Paperclip } from "lucide-react";
import { AdminHeader, Badge, EmptyState } from "@/components/admin/ui";
import { staffClient } from "@/lib/admin/server";
import { applyEnquiryFilters, ENQUIRY_LIST_COLUMNS } from "@/lib/admin/enquiry-query";
import {
  enquiryKinds,
  enquiryStatuses,
  filtersToQuery,
  kindLabel,
  kindShort,
  parseFilters,
  statusLabel,
  statusTone,
  type EnquiryFilters,
  type EnquiryKind,
  type EnquiryStatus,
  type SortColumn,
} from "@/lib/admin/enquiries";
import { countryName } from "@/lib/countries";
import { formatLagosDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };

const PAGE_SIZE = 25;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { staff, supabase } = await staffClient();
  const f = parseFilters(await searchParams);

  const from = (f.page - 1) * PAGE_SIZE;
  const base = supabase.from("enquiries").select(`${ENQUIRY_LIST_COLUMNS}, enquiry_attachments(count)`, { count: "exact" });
  const [{ data, count, error }, { data: staffList }, { data: offices }, ...kindCounts] = await Promise.all([
    applyEnquiryFilters(base, f)
      .order(f.sort, { ascending: f.dir === "asc" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase.from("profiles").select("id, email, full_name").not("role", "is", null).order("email"),
    supabase.from("offices").select("slug, city").order("sort_order"),
    ...enquiryKinds.map((k) => supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("kind", k).eq("status", "new")),
  ]);

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const people = (staffList ?? []) as Array<{ id: string; email: string; full_name: string | null }>;
  const personName = (id: unknown) => {
    const p = people.find((x) => x.id === id);
    return p ? (p.full_name ?? p.email) : "—";
  };
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (patch: Partial<EnquiryFilters>) => `/admin/enquiries${filtersToQuery({ ...f, page: 1, ...patch })}`;

  const sortLink = (col: SortColumn, label: string) => {
    const active = f.sort === col;
    const nextDir = active && f.dir === "desc" ? "asc" : "desc";
    return (
      <Link href={link({ sort: col, dir: nextDir })} className="inline-flex items-center gap-1 hover:text-ink" aria-label={`Sort by ${label}${active ? `, currently ${f.dir === "desc" ? "descending" : "ascending"}` : ""}`}>
        {label}
        {active && (f.dir === "desc" ? <ArrowDown className="size-3.5" aria-hidden="true" /> : <ArrowUp className="size-3.5" aria-hidden="true" />)}
      </Link>
    );
  };

  return (
    <div>
      <AdminHeader
        eyebrow="Inbox"
        title="Enquiries"
        description="RFQs, contact messages and partner applications. Open items are New, In progress and Quoted."
        actions={
          <a
            href={`/admin/enquiries/export${filtersToQuery({ ...f, page: undefined })}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold hover:border-ink"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      {/* Tabs */}
      <nav aria-label="Enquiry type" className="mt-8 flex flex-wrap gap-2 border-b border-line">
        {(["all", ...enquiryKinds] as const).map((k, i) => {
          const newCount = k === "all" ? null : (kindCounts[i - 1]?.count ?? 0);
          return (
            <Link
              key={k}
              href={link({ kind: k })}
              aria-current={f.kind === k ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold",
                f.kind === k ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {k === "all" ? "All" : kindLabel[k as EnquiryKind]}
              {newCount ? <Badge tone="new">{newCount} new</Badge> : null}
            </Link>
          );
        })}
      </nav>

      {/* Filters (plain GET form: works without JavaScript) */}
      <form method="get" className="mt-6 grid gap-3 rounded-xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input type="hidden" name="kind" value={f.kind} />
        <input type="hidden" name="sort" value={f.sort} />
        <input type="hidden" name="dir" value={f.dir} />
        <label className="text-sm font-semibold lg:col-span-2">
          Search
          <input
            name="q"
            defaultValue={f.q}
            placeholder="Reference, name, email, company…"
            className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-semibold">
          Status
          <select name="status" defaultValue={f.status} className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm font-normal">
            <option value="open">Open</option>
            <option value="all">All statuses</option>
            {enquiryStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Office
          <select name="office" defaultValue={f.office} className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm font-normal">
            <option value="">All offices</option>
            {((offices ?? []) as Array<{ slug: string; city: string }>).map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.city}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Assignee
          <select name="assignee" defaultValue={f.assignee} className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm font-normal">
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            <option value={staff.id}>Me</option>
            {people
              .filter((p) => p.id !== staff.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? p.email}
                </option>
              ))}
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <button type="submit" className="min-h-10 rounded-full bg-ink px-5 text-sm font-semibold text-white">
            Apply filters
          </button>
          <Link href="/admin/enquiries" className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-muted hover:text-ink">
            Reset
          </Link>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          Couldn&apos;t load enquiries: {error.message}
        </p>
      )}

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {total} {total === 1 ? "enquiry" : "enquiries"}
        {pages > 1 && ` · page ${f.page} of ${pages}`}
      </p>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Nothing here">No enquiries match these filters.</EmptyState>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <caption className="sr-only">Enquiries, sortable by column</caption>
            <thead className="border-b border-line bg-tint/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">{sortLink("reference", "Reference")}</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">{sortLink("company", "From")}</th>
                <th scope="col" className="px-4 py-3">Subject</th>
                <th scope="col" className="px-4 py-3">{sortLink("status", "Status")}</th>
                <th scope="col" className="px-4 py-3">Assignee</th>
                <th scope="col" className="px-4 py-3">{sortLink("created_at", "Received")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const status = r.status as EnquiryStatus;
                const attachments = (r.enquiry_attachments as Array<{ count: number }> | undefined)?.[0]?.count ?? 0;
                return (
                  <tr key={String(r.id)} className={cn("hover:bg-tint/50", status === "new" && "font-semibold")}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/enquiries/${r.id}`} className="font-mono text-xs text-brand underline-offset-4 hover:underline">
                        {String(r.reference)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{kindShort[r.kind as EnquiryKind]}</td>
                    <td className="px-4 py-3">
                      <span className="block">{String(r.company ?? r.name)}</span>
                      <span className="block text-xs font-normal text-muted">
                        {String(r.email)}
                        {r.country_code ? ` · ${countryName(String(r.country_code))}` : ""}
                      </span>
                    </td>
                    <td className="max-w-[18rem] px-4 py-3">
                      <span className="line-clamp-2">{String(r.subject ?? "—")}</span>
                      {attachments > 0 && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-normal text-muted">
                          <Paperclip className="size-3" aria-hidden="true" /> {attachments}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
                    </td>
                    <td className="px-4 py-3 font-normal">{r.assignee_id ? personName(r.assignee_id) : <span className="text-muted">Unassigned</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-normal text-muted">{formatLagosDateTime(String(r.created_at))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
          {f.page > 1 ? (
            <Link href={link({ page: f.page - 1 })} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {f.page < pages && (
            <Link href={link({ page: f.page + 1 })} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
