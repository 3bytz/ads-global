import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Badge, EmptyState } from "@/components/admin/ui";
import { staffClient } from "@/lib/admin/server";
import { formatLagosDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Audit log" };

const PAGE = 50;
const IGNORED_KEYS = new Set(["updated_at", "created_at"]);

const tables = [
  "enquiries",
  "enquiry_notes",
  "categories",
  "projects",
  "site_settings",
  "stats",
  "claims",
  "offices",
  "routing_rules",
  "process_steps",
  "certifications",
  "leaders",
  "profiles",
];

function changes(oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) {
  const keys = new Set([...Object.keys(oldData ?? {}), ...Object.keys(newData ?? {})]);
  const out: Array<{ key: string; from: string; to: string }> = [];
  for (const k of keys) {
    if (IGNORED_KEYS.has(k)) continue;
    const a = JSON.stringify(oldData?.[k] ?? null);
    const b = JSON.stringify(newData?.[k] ?? null);
    if (a !== b) out.push({ key: k, from: a, to: b });
  }
  return out;
}

const short = (s: string) => (s.length > 160 ? `${s.slice(0, 160)}…` : s);

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ table?: string; page?: string }> }) {
  const { supabase } = await staffClient();
  const sp = await searchParams;
  const table = sp.table && tables.includes(sp.table) ? sp.table : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let query = supabase.from("audit_log").select("id, actor_email, action, table_name, record_id, old_data, new_data, created_at", { count: "exact" });
  if (table) query = query.eq("table_name", table);
  const { data, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  const rows = (data ?? []) as Array<{
    id: number;
    actor_email: string | null;
    action: string;
    table_name: string;
    record_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    created_at: string;
  }>;
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const href = (p: number, t = table) => `/admin/audit?${new URLSearchParams({ ...(t ? { table: t } : {}), page: String(p) }).toString()}`;

  return (
    <div>
      <AdminHeader eyebrow="Security" title="Audit log" description="Every change made in the admin, who made it and when (WAT). Entries can't be edited or deleted." />

      <nav aria-label="Filter by area" className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/audit" aria-current={!table ? "page" : undefined} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white">
          All
        </Link>
        {tables.map((t) => (
          <Link
            key={t}
            href={href(1, t)}
            aria-current={table === t ? "page" : undefined}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
          >
            {t.replace(/_/g, " ")}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No entries yet">Changes made in the admin will appear here.</EmptyState>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {rows.map((r) => {
            const diff = changes(r.old_data, r.new_data);
            return (
              <li key={r.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={r.action === "DELETE" || r.action === "user.revoke" ? "lost" : r.action === "INSERT" || r.action === "user.invite" ? "won" : "progress"}>{r.action}</Badge>
                  <span className="font-semibold">{r.table_name.replace(/_/g, " ")}</span>
                  {r.record_id && <span className="font-mono text-xs text-muted">{r.record_id}</span>}
                  <span className="ml-auto text-muted">
                    {r.actor_email ?? "system"} · {formatLagosDateTime(r.created_at)}
                  </span>
                </div>
                {diff.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand">
                      {diff.length} field{diff.length === 1 ? "" : "s"} changed
                    </summary>
                    <table className="mt-3 w-full text-left text-xs">
                      <thead className="text-muted">
                        <tr>
                          <th scope="col" className="py-1 pr-3">Field</th>
                          <th scope="col" className="py-1 pr-3">Before</th>
                          <th scope="col" className="py-1">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {diff.map((d) => (
                          <tr key={d.key} className="align-top">
                            <th scope="row" className="py-1.5 pr-3 font-mono font-medium">{d.key}</th>
                            <td className="break-all py-1.5 pr-3 font-mono text-danger">{short(d.from)}</td>
                            <td className="break-all py-1.5 font-mono text-success">{short(d.to)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex justify-between">
          {page > 1 ? <Link href={href(page - 1)} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">← Newer</Link> : <span />}
          {page < pages && <Link href={href(page + 1)} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">Older →</Link>}
        </nav>
      )}
    </div>
  );
}
