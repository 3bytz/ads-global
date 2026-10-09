import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminHeader, Badge, Card, EmptyState } from "@/components/admin/ui";
import { staffClient } from "@/lib/admin/server";
import { kindShort, statusLabel, statusTone, type EnquiryKind, type EnquiryStatus } from "@/lib/admin/enquiries";
import { formatLagosDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { staff, supabase } = await staffClient();
  const { denied } = await searchParams;

  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [newCount, mine, open, unconfirmedStats, unconfirmedClaims, settings, recent] = await Promise.all([
    count(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("assignee_id", staff.id).in("status", ["new", "in_progress", "quoted"])),
    count(supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["new", "in_progress", "quoted"])),
    count(supabase.from("stats").select("key", { count: "exact", head: true }).eq("confirmed", false)),
    count(supabase.from("claims").select("key", { count: "exact", head: true }).eq("confirmed", false)),
    supabase.from("site_settings").select("value").eq("key", "company").maybeSingle(),
    supabase.from("enquiries").select("id, reference, kind, status, name, company, subject, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const claimsMode = ((settings.data?.value as { claimsMode?: string } | undefined)?.claimsMode ?? "flag") as "flag" | "hide";

  const cards = [
    { label: "New enquiries", value: newCount, href: "/admin/enquiries?status=new" },
    { label: "Assigned to me (open)", value: mine, href: `/admin/enquiries?assignee=${staff.id}` },
    { label: "Open in total", value: open, href: "/admin/enquiries" },
  ];

  return (
    <div className="space-y-10">
      <AdminHeader eyebrow="Overview" title={`Welcome, ${staff.fullName?.split(" ")[0] ?? "admin"}`} />
      {denied && (
        <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          That area is for super admins only.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-xl border border-line bg-white p-6 hover:border-ink">
            <p className="text-sm font-medium text-muted">{c.label}</p>
            <p className="headline mt-2 text-5xl tabular-nums">{c.value}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
              Open <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>

      {(unconfirmedStats > 0 || unconfirmedClaims > 0) && (
        <Card
          title="Before launch"
          description={
            <>
              {unconfirmedStats} stat(s) and {unconfirmedClaims} claim(s) are unconfirmed. Claims mode is <strong>{claimsMode === "flag" ? "Flag (shown with a marker)" : "Hide"}</strong>.{" "}
              <Link href="/admin/settings#claims" className="font-semibold text-brand underline underline-offset-4">
                Review claims
              </Link>
            </>
          }
        >
          {null}
        </Card>
      )}

      <Card title="Latest enquiries">
        {recent.data && recent.data.length > 0 ? (
          <ul className="divide-y divide-line">
            {(recent.data as Array<{ id: string; reference: string; kind: EnquiryKind; status: EnquiryStatus; name: string; company: string | null; subject: string | null; created_at: string }>).map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-tint/50">
                  <span className="font-mono text-xs text-brand">{e.reference}</span>
                  <Badge>{kindShort[e.kind]}</Badge>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-semibold">{e.company ?? e.name}</span> <span className="text-muted">— {e.subject ?? ""}</span>
                  </span>
                  <Badge tone={statusTone[e.status]}>{statusLabel[e.status]}</Badge>
                  <span className="text-xs text-muted">{formatLagosDateTime(e.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No enquiries yet">They&apos;ll appear here as soon as someone submits a form.</EmptyState>
        )}
      </Card>
    </div>
  );
}
