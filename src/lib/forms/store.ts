import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { defaultSettings } from "@/content/defaults";
import { verifyAttachment } from "@/lib/cloudinary";
import type { AttachmentInput } from "./schemas";

export type EnquiryKind = "rfq" | "contact" | "partner";

export interface RoutedOffice {
  slug: string;
  name: string;
  city: string;
  email: string;
  phone: string;
}

/**
 * Picks the office that handles an enquiry:
 *   1. the office the visitor chose (contact form), else
 *   2. routing_rules for the destination/visitor country (editable in admin), else
 *   3. site_settings.contact.defaultOfficeSlug.
 */
export async function resolveOffice(supabase: SupabaseClient, countryCode: string | null | undefined, preferred?: string | null): Promise<RoutedOffice | null> {
  let slug: string | null = preferred && preferred !== "any" ? preferred : null;

  if (!slug && countryCode) {
    const { data } = await supabase.from("routing_rules").select("office_slug").eq("country_code", countryCode.toUpperCase()).maybeSingle();
    slug = (data?.office_slug as string | undefined) ?? null;
  }
  if (!slug) {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle();
    const value = (data?.value ?? {}) as { defaultOfficeSlug?: string };
    slug = value.defaultOfficeSlug ?? defaultSettings.contact.defaultOfficeSlug;
  }

  const { data: office } = await supabase.from("offices").select("slug, name, city, email, phone").eq("slug", slug).maybeSingle();
  if (!office) return null;
  return office as RoutedOffice;
}

export interface NewEnquiry {
  kind: EnquiryKind;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  countryCode?: string | null;
  subject?: string | null;
  message?: string | null;
  details: Record<string, unknown>;
  /** Country used for routing (RFQ: destination; others: sender's country). */
  routeCountry?: string | null;
  preferredOffice?: string | null;
  attachments?: AttachmentInput[];
  sourcePath?: string | null;
  ipHash: string;
  userAgent: string | null;
}

export interface StoredEnquiry {
  id: string;
  reference: string;
  office: RoutedOffice | null;
  attachmentsAccepted: number;
  attachmentsRejected: number;
}

/** Inserts the enquiry with the service role (RLS has no public insert policy). */
export async function storeEnquiry(input: NewEnquiry): Promise<StoredEnquiry | null> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const office = await resolveOffice(supabase, input.routeCountry ?? input.countryCode, input.preferredOffice);

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      company: input.company ?? null,
      country_code: input.countryCode ?? null,
      subject: input.subject ?? null,
      message: input.message ?? null,
      details: input.details,
      office_slug: office?.slug ?? null,
      source_path: input.sourcePath ?? null,
      ip_hash: input.ipHash,
      user_agent: input.userAgent,
    })
    .select("id, reference")
    .single();

  if (error || !data) {
    console.error("[forms] insert failed", error);
    return null;
  }

  let accepted = 0;
  let rejected = 0;
  for (const a of input.attachments ?? []) {
    const verified = await verifyAttachment(a);
    if (!verified) {
      rejected++;
      continue;
    }
    const { error: attErr } = await supabase.from("enquiry_attachments").insert({
      enquiry_id: data.id,
      public_id: a.publicId,
      resource_type: a.resourceType,
      format: verified.format,
      filename: a.filename.slice(0, 200),
      mime_type: a.mimeType || "application/octet-stream",
      bytes: verified.bytes,
    });
    if (attErr) rejected++;
    else accepted++;
  }

  return { id: data.id as string, reference: data.reference as string, office, attachmentsAccepted: accepted, attachmentsRejected: rejected };
}
