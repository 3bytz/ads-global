import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Mail, Phone } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { Select, Textarea } from "@/components/admin/fields";
import { AdminHeader, Badge, Card } from "@/components/admin/ui";
import { addNote, deleteEnquiry, deleteNote, updateEnquiry } from "../actions";
import { staffClient } from "@/lib/admin/server";
import { enquiryStatuses, kindShort, statusLabel, statusTone, type EnquiryKind, type EnquiryStatus } from "@/lib/admin/enquiries";
import { countryName } from "@/lib/countries";
import { formatLagosDateTime } from "@/lib/time";
import { incotermInfo } from "@/content/trade";
import type { Incoterm } from "@/content/types";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiry" };

const detailLabels: Record<string, string> = {
  categories: "Categories",
  productDetails: "Product details",
  quantity: "Quantity",
  unit: "Unit",
  targetPrice: "Target price",
  currency: "Currency",
  incoterm: "Incoterm",
  destinationCountry: "Destination country",
  destinationPort: "Destination port / city",
  timeline: "Timeline",
  notes: "Notes",
  office: "Office requested",
  partnerType: "Partnership type",
  companyUrl: "Website",
  certifications: "Certifications",
};

function formatDetail(key: string, value: unknown, categoryNames: Map<string, string>): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "categories" && Array.isArray(value)) return value.map((s) => categoryNames.get(String(s)) ?? String(s)).join(", ");
  if (key === "destinationCountry") return countryName(String(value));
  if (key === "incoterm") return value === "NOT_SURE" ? "Not sure — advise" : `${value} (${incotermInfo[value as Incoterm]?.name ?? ""})`;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { staff, supabase } = await staffClient();

  const [{ data: e }, { data: notes }, { data: attachments }, { data: people }, { data: offices }, { data: categories }] = await Promise.all([
    supabase.from("enquiries").select("*").eq("id", id).maybeSingle(),
    supabase.from("enquiry_notes").select("id, body, created_at, author_id").eq("enquiry_id", id).order("created_at"),
    supabase.from("enquiry_attachments").select("id, filename, bytes, mime_type, created_at").eq("enquiry_id", id).order("created_at"),
    supabase.from("profiles").select("id, email, full_name").not("role", "is", null).order("email"),
    supabase.from("offices").select("slug, city, email").order("sort_order"),
    supabase.from("categories").select("slug, name"),
  ]);
  if (!e) notFound();

  const enquiry = e as Record<string, unknown>;
  const status = enquiry.status as EnquiryStatus;
  const kind = enquiry.kind as EnquiryKind;
  const staffPeople = (people ?? []) as Array<{ id: string; email: string; full_name: string | null }>;
  const nameOf = (uid: unknown) => {
    const p = staffPeople.find((x) => x.id === uid);
    return p ? (p.full_name ?? p.email) : "Former staff member";
  };
  const categoryNames = new Map(((categories ?? []) as Array<{ slug: string; name: string }>).map((c) => [c.slug, c.name]));
  const details = (enquiry.details ?? {}) as Record<string, unknown>;
  const reference = String(enquiry.reference);
  const replySubject = encodeURIComponent(`Re: [${reference}] ${String(enquiry.subject ?? "Your enquiry to ADS Global")}`);
  const replyBody = encodeURIComponent(`Dear ${String(enquiry.name)},\n\nThank you for your enquiry (${reference}).\n\n`);

  return (
    <div className="space-y-8">
      <Link href="/admin/enquiries" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to inbox
      </Link>

      <AdminHeader
        eyebrow={`${kindShort[kind]} · ${formatLagosDateTime(String(enquiry.created_at))}`}
        title={reference}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
            <span>{String(enquiry.subject ?? "")}</span>
          </span>
        }
        actions={
          <a
            href={`mailto:${String(enquiry.email)}?subject=${replySubject}&body=${replyBody}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-ink"
          >
            <Mail className="size-4" aria-hidden="true" /> Reply by email
          </a>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card title="Sender">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Name", enquiry.name],
                ["Company", enquiry.company],
                ["Email", enquiry.email],
                ["Phone", enquiry.phone],
                ["Country", enquiry.country_code ? countryName(String(enquiry.country_code)) : null],
                ["Source page", enquiry.source_path],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{String(k)}</dt>
                  <dd className="mt-1 break-words">
                    {k === "Email" && v ? (
                      <a href={`mailto:${String(v)}`} className="text-brand underline-offset-4 hover:underline">
                        {String(v)}
                      </a>
                    ) : k === "Phone" && v ? (
                      <a href={telHref(String(v))} className="inline-flex items-center gap-1 text-brand">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {String(v)}
                      </a>
                    ) : (
                      String(v ?? "—")
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title={kind === "rfq" ? "Request details" : kind === "partner" ? "Application" : "Message"}>
            {enquiry.message && kind !== "rfq" ? <p className="whitespace-pre-wrap">{String(enquiry.message)}</p> : null}
            {Object.keys(details).length > 0 && (
              <dl className="mt-4 divide-y divide-line">
                {Object.entries(details)
                  .filter(([k]) => k !== "office" || kind === "contact")
                  .map(([k, v]) => (
                    <div key={k} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
                      <dt className="text-sm font-semibold text-muted">{detailLabels[k] ?? k}</dt>
                      <dd className="whitespace-pre-wrap break-words">{formatDetail(k, v, categoryNames)}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </Card>

          <Card title={`Attachments (${attachments?.length ?? 0})`} description="Files are private. Download links are signed and expire after 5 minutes.">
            {attachments && attachments.length > 0 ? (
              <ul className="divide-y divide-line">
                {(attachments as Array<{ id: string; filename: string; bytes: number }>).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0 truncate">{a.filename}</span>
                    <span className="text-xs text-muted">{Math.max(1, Math.round(a.bytes / 1024))} KB</span>
                    <a
                      href={`/admin/enquiries/${id}/attachments/${a.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink"
                    >
                      <Download className="size-4" aria-hidden="true" /> Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No files attached.</p>
            )}
          </Card>

          <Card title="Internal notes" description="Only visible to ADS staff.">
            <ul className="space-y-4">
              {((notes ?? []) as Array<{ id: string; body: string; created_at: string; author_id: string | null }>).map((n) => (
                <li key={n.id} className="rounded-lg bg-tint p-4">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span>
                      {nameOf(n.author_id)} · {formatLagosDateTime(n.created_at)}
                    </span>
                    {n.author_id === staff.id && (
                      <ActionForm action={deleteNote.bind(null, id, n.id)} submitLabel="Delete" danger compact confirm="Delete this note?">
                        {null}
                      </ActionForm>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ActionForm action={addNote.bind(null, id)} submitLabel="Add note" resetOnSuccess>
                <Textarea name="body" label="New note" rows={3} />
              </ActionForm>
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card title="Handling">
            <ActionForm action={updateEnquiry.bind(null, id)}>
              <Select name="status" label="Status" defaultValue={status} options={enquiryStatuses.map((s) => ({ value: s, label: statusLabel[s] }))} />
              <Select
                name="assignee"
                label="Assignee"
                defaultValue={String(enquiry.assignee_id ?? "")}
                options={[{ value: "", label: "Unassigned" }, ...staffPeople.map((p) => ({ value: p.id, label: p.id === staff.id ? `${p.full_name ?? p.email} (me)` : (p.full_name ?? p.email) }))]}
              />
              <Select
                name="office"
                label="Office"
                defaultValue={String(enquiry.office_slug ?? "")}
                hint="Routed automatically from the destination country. Change it to hand over."
                options={[{ value: "", label: "Unrouted" }, ...((offices ?? []) as Array<{ slug: string; city: string }>).map((o) => ({ value: o.slug, label: o.city }))]}
              />
            </ActionForm>
            {enquiry.status_changed_at ? <p className="mt-4 text-xs text-muted">Status last changed {formatLagosDateTime(String(enquiry.status_changed_at))}</p> : null}
          </Card>

          {staff.role === "super_admin" && (
            <Card title="Danger zone" description="Permanently deletes the enquiry, its notes and attachment records.">
              <ActionForm action={deleteEnquiry.bind(null, id)} submitLabel="Delete enquiry" danger confirm={`Delete ${reference} permanently?`}>
                {null}
              </ActionForm>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
