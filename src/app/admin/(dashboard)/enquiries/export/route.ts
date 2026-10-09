import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applyEnquiryFilters, ENQUIRY_LIST_COLUMNS } from "@/lib/admin/enquiry-query";
import { parseFilters, statusLabel, kindShort, type EnquiryKind, type EnquiryStatus } from "@/lib/admin/enquiries";
import { countryName } from "@/lib/countries";
import { formatLagosDateTime } from "@/lib/time";

/** CSV export of the current inbox filter (staff only, RLS-bound, max 5,000 rows). */
export async function GET(request: NextRequest) {
  const staff = await getStaff();
  if (!staff) return new NextResponse("Unauthorized", { status: 401 });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 503 });

  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const f = parseFilters(sp);
  const { data, error } = await applyEnquiryFilters(supabase.from("enquiries").select(ENQUIRY_LIST_COLUMNS), f)
    .order(f.sort, { ascending: f.dir === "asc" })
    .limit(5000);
  if (error) return new NextResponse(error.message, { status: 500 });

  const { data: people } = await supabase.from("profiles").select("id, email, full_name");
  const nameOf = (id: unknown) => {
    const p = (people ?? []).find((x) => x.id === id) as { email: string; full_name: string | null } | undefined;
    return p ? (p.full_name ?? p.email) : "";
  };

  const header = ["Reference", "Type", "Status", "Received (WAT)", "Company", "Name", "Email", "Phone", "Country", "Subject", "Message", "Office", "Assignee", "Details (JSON)"];
  const rows = ((data ?? []) as Array<Record<string, unknown>>).map((r) => [
    r.reference,
    kindShort[r.kind as EnquiryKind],
    statusLabel[r.status as EnquiryStatus],
    formatLagosDateTime(String(r.created_at)),
    r.company,
    r.name,
    r.email,
    r.phone,
    r.country_code ? countryName(String(r.country_code)) : "",
    r.subject,
    r.message,
    r.office_slug,
    nameOf(r.assignee_id),
    JSON.stringify(r.details ?? {}),
  ]);

  // Quote every cell; neutralise spreadsheet formula injection (=, +, -, @ at the start).
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ads-enquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
