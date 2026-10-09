import { z } from "zod";
import { isCountryCode } from "@/lib/countries";
import { currencies, quantityUnits, rfqIncoterms, timelines } from "@/content/trade";

/**
 * Form schemas shared by the browser (step validation, instant feedback) and
 * the Server Actions (authoritative validation). Blank optional strings become undefined.
 */

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `Enter ${label}.` })
    .trim()
    .min(1, { error: `Enter ${label}.` })
    .min(min, { error: `${label[0]?.toUpperCase()}${label.slice(1)} must be at least ${min} characters.` })
    .max(max, { error: `Keep ${label} under ${max} characters.` });
const optionalText = (max: number, label: string) =>
  z.preprocess(blank, z.string().trim().max(max, { error: `Keep ${label} under ${max} characters.` }).optional());

export const emailField = z
  .string({ error: "Enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address, like name@company.com." }));

const phoneField = z.preprocess(
  blank,
  z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()\-.]{7,24}$/, { error: "Enter a valid phone number, including the country code (e.g. +234…)." })
    .optional(),
);

const countryField = (label = "a country") =>
  z
    .string({ error: `Choose ${label}.` })
    .trim()
    .toUpperCase()
    .refine((v) => isCountryCode(v), { error: `Choose ${label}.` });

const consentField = z.literal(true, { error: "Please agree to the privacy policy so we can process your request." });

/** Honeypot: must be empty. Bots that fill every field are silently dropped. */
export const honeypotField = z.string().max(0).optional();

// ------------------------------------------------------------------ RFQ

export const attachmentSchema = z.object({
  publicId: z.string().min(1).max(300),
  version: z.coerce.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]{40}$/i),
  resourceType: z.enum(["image", "raw", "video"]),
  format: z.string().max(20).optional(),
  bytes: z.number().int().positive(),
  filename: z.string().min(1).max(200),
  mimeType: z.string().max(120),
});
export type AttachmentInput = z.infer<typeof attachmentSchema>;

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXT = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "csv"] as const;
export const ATTACHMENT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,application/pdf,image/jpeg,image/png,image/webp";

export const rfqStep1 = z.object({
  company: text(2, 160, "your company name"),
  name: text(2, 120, "your name"),
  email: emailField,
  phone: phoneField,
  countryCode: countryField("your country"),
});

export const rfqStep2 = z.object({
  categories: z.array(z.string().min(1).max(80)).min(1, { error: "Choose at least one category." }).max(14),
  productDetails: text(10, 4000, "product details"),
  quantity: z.coerce
    .number({ error: "Enter a quantity." })
    .positive({ error: "Quantity must be more than zero." })
    .max(1_000_000_000, { error: "That quantity looks too large." }),
  unit: z.enum(quantityUnits, { error: "Choose a unit." }),
  targetPrice: z.preprocess(blank, z.coerce.number().nonnegative({ error: "Target price can't be negative." }).optional()),
  currency: z.enum(currencies).default("USD"),
});

export const rfqStep3 = z.object({
  incoterm: z.enum([...rfqIncoterms, "NOT_SURE"] as const, { error: "Choose an Incoterm, or “Not sure”." }),
  destinationCountry: countryField("the destination country"),
  destinationPort: text(2, 160, "the destination port or city"),
  timeline: z.enum(timelines, { error: "Choose a timeline." }),
});

export const rfqStep4 = z.object({
  notes: optionalText(4000, "your notes"),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS, { error: `Attach up to ${MAX_ATTACHMENTS} files.` }).default([]),
  consent: consentField,
});

export const rfqSchema = rfqStep1.extend(rfqStep2.shape).extend(rfqStep3.shape).extend(rfqStep4.shape);
export type RfqInput = z.input<typeof rfqSchema>;
export type Rfq = z.output<typeof rfqSchema>;

// ------------------------------------------------------------------ Contact

export const contactSubjects = ["General enquiry", "Quotation follow-up", "Shipment update", "Partnership", "Media", "Other"] as const;

export const contactSchema = z.object({
  name: text(2, 120, "your name"),
  email: emailField,
  phone: phoneField,
  company: optionalText(160, "your company name"),
  countryCode: z.preprocess(blank, countryField("your country").optional()),
  office: z.string().regex(/^(any|[a-z0-9-]{2,40})$/, { error: "Choose an office." }).default("any"),
  subject: z.enum(contactSubjects, { error: "Choose a subject." }),
  message: text(10, 4000, "your message"),
  consent: consentField,
});
export type ContactInput = z.input<typeof contactSchema>;

// ------------------------------------------------------------------ Partner / supplier

export const partnerTypes = ["Supplier / manufacturer", "Distributor / reseller", "Sales agent", "Logistics provider", "Other"] as const;

export const partnerSchema = z.object({
  partnerType: z.enum(partnerTypes, { error: "Choose how you'd like to work with us." }),
  company: text(2, 160, "your company name"),
  name: text(2, 120, "your name"),
  email: emailField,
  phone: phoneField,
  countryCode: countryField("your country"),
  companyUrl: z.preprocess(
    (v) => {
      const b = blank(v);
      if (typeof b === "string" && !/^https?:\/\//i.test(b)) return `https://${b.trim()}`;
      return b;
    },
    z.url({ error: "Enter a valid website address." }).max(300).optional(),
  ),
  categories: z.array(z.string().min(1).max(80)).min(1, { error: "Choose at least one category." }).max(14),
  certifications: optionalText(1000, "certifications"),
  message: optionalText(4000, "your message"),
  consent: consentField,
});
export type PartnerInput = z.input<typeof partnerSchema>;

// ------------------------------------------------------------------ helpers

export type FieldErrors = Record<string, string>;

/** First error message per top-level field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type SubmitResult =
  | { ok: true; reference: string | null }
  | { ok: false; message: string; fieldErrors?: FieldErrors };
