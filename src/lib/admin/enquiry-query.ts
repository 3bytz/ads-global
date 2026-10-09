import "server-only";
import { escapeIlike, type EnquiryFilters } from "./enquiries";

export const ENQUIRY_LIST_COLUMNS =
  "id, reference, kind, status, name, email, phone, company, country_code, subject, message, details, office_slug, assignee_id, created_at, status_changed_at";

/** The subset of the PostgREST filter builder we use. */
interface Filterable {
  eq(column: string, value: string): Filterable;
  in(column: string, values: string[]): Filterable;
  is(column: string, value: null): Filterable;
  or(filters: string): Filterable;
}

/** Applies inbox filters to an enquiries query (RLS already limits it to staff). */
export function applyEnquiryFilters<T>(query: T, f: EnquiryFilters): T {
  let q = query as unknown as Filterable;
  if (f.kind !== "all") q = q.eq("kind", f.kind);
  if (f.status === "open") q = q.in("status", ["new", "in_progress", "quoted"]);
  else if (f.status !== "all") q = q.eq("status", f.status);
  if (f.office) q = q.eq("office_slug", f.office);
  if (f.assignee === "unassigned") q = q.is("assignee_id", null);
  else if (f.assignee) q = q.eq("assignee_id", f.assignee);
  if (f.q) {
    const s = escapeIlike(f.q);
    q = q.or(`reference.ilike.%${s}%,name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%,subject.ilike.%${s}%`);
  }
  return q as unknown as T;
}
