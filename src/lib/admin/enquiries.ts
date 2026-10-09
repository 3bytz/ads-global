export const enquiryStatuses = ["new", "in_progress", "quoted", "won", "lost", "closed"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const statusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  closed: "Closed",
};

export const statusTone: Record<EnquiryStatus, "new" | "progress" | "quoted" | "won" | "lost" | "closed"> = {
  new: "new",
  in_progress: "progress",
  quoted: "quoted",
  won: "won",
  lost: "lost",
  closed: "closed",
};

export const enquiryKinds = ["rfq", "contact", "partner"] as const;
export type EnquiryKind = (typeof enquiryKinds)[number];
export const kindLabel: Record<EnquiryKind, string> = { rfq: "RFQs", contact: "Contact messages", partner: "Partner applications" };
export const kindShort: Record<EnquiryKind, string> = { rfq: "RFQ", contact: "Contact", partner: "Partner" };

export const sortableColumns = ["created_at", "reference", "status", "company", "name"] as const;
export type SortColumn = (typeof sortableColumns)[number];

export interface EnquiryFilters {
  kind: EnquiryKind | "all";
  status: EnquiryStatus | "open" | "all";
  office: string;
  assignee: string;
  q: string;
  sort: SortColumn;
  dir: "asc" | "desc";
  page: number;
}

const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

export function parseFilters(sp: Record<string, string | string[] | undefined>): EnquiryFilters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Number.parseInt(one("page") ?? "1", 10);
  return {
    kind: pick(one("kind"), ["all", ...enquiryKinds] as const, "all"),
    status: pick(one("status"), ["all", "open", ...enquiryStatuses] as const, "open"),
    office: (one("office") ?? "").slice(0, 40),
    assignee: (one("assignee") ?? "").slice(0, 40),
    q: (one("q") ?? "").trim().slice(0, 100),
    sort: pick(one("sort"), sortableColumns, "created_at"),
    dir: one("dir") === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function filtersToQuery(f: Partial<EnquiryFilters>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === "" || v === null) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Escapes a value for use inside a PostgREST `or=(...ilike...)` filter. */
export function escapeIlike(q: string): string {
  return q.replace(/[%_\\]/g, (m) => `\\${m}`).replace(/[,()]/g, " ");
}
