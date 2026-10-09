"use server";

import {
  contactSchema,
  honeypotField,
  partnerSchema,
  rfqSchema,
  toFieldErrors,
  type SubmitResult,
} from "@/lib/forms/schemas";
import { checkRateLimit, requestInfo, verifyTurnstile, type RequestInfo } from "@/lib/forms/guard";
import { isServiceRoleConfigured } from "@/lib/env.server";
import { storeEnquiry } from "@/lib/forms/store";
import { notifyEnquiry } from "@/lib/forms/notify";
import { signEnquiryUpload, type UploadSignature } from "@/lib/cloudinary";
import { countryName } from "@/lib/countries";
import { getCategories, getSiteSettings } from "@/lib/content/queries";
import { incotermInfo } from "@/content/trade";
import type { Incoterm } from "@/content/types";

const UNAVAILABLE: SubmitResult = {
  ok: false,
  message: "Sorry — our form is temporarily unavailable. Please email info@adsglobaltd.com and we'll pick it up from there.",
};
const SPAM_CHECK_FAILED: SubmitResult = {
  ok: false,
  message: "We couldn't verify that you're human. Please complete the check and try again.",
};
const RATE_LIMITED: SubmitResult = {
  ok: false,
  message: "You've sent several requests in a short time. Please wait a few minutes and try again.",
};
const SAVE_FAILED: SubmitResult = {
  ok: false,
  message: "Something went wrong while saving. Your answers are still here — please try again, or email info@adsglobaltd.com.",
};

interface Meta {
  turnstileToken?: string | null;
  /** Honeypot value (should be empty). */
  website?: string;
  sourcePath?: string;
}

/** Shared pre-checks. Returns a result to send back, or the request info to continue with. */
async function precheck(bucket: string, meta: Meta): Promise<SubmitResult | RequestInfo> {
  if (!isServiceRoleConfigured) return UNAVAILABLE;
  const info = await requestInfo();
  if (!honeypotField.safeParse(meta.website ?? "").success) {
    // Pretend success so bots learn nothing.
    return { ok: true, reference: null };
  }
  if (!(await verifyTurnstile(meta.turnstileToken, info.ip))) return SPAM_CHECK_FAILED;
  if (!(await checkRateLimit(bucket, info.ipHash))) return RATE_LIMITED;
  return info;
}

async function categoryNames(slugs: string[]): Promise<string> {
  const all = await getCategories();
  return slugs.map((s) => all.find((c) => c.slug === s)?.name ?? s).join(", ");
}

// ------------------------------------------------------------------ RFQ

export async function submitRfq(input: unknown, meta: Meta): Promise<SubmitResult> {
  const parsed = rfqSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const pre = await precheck("rfq", meta);
  if (!("ipHash" in pre)) return pre;

  const d = parsed.data;
  const cats = await categoryNames(d.categories);
  const incoterm = d.incoterm === "NOT_SURE" ? "Not sure — please advise" : `${d.incoterm} (${incotermInfo[d.incoterm as Incoterm].name})`;
  const target = d.targetPrice !== undefined ? `${d.currency} ${d.targetPrice.toLocaleString("en-GB")}` : null;

  const stored = await storeEnquiry({
    kind: "rfq",
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    company: d.company,
    countryCode: d.countryCode,
    subject: `${cats} → ${countryName(d.destinationCountry)}`.slice(0, 300),
    message: d.productDetails,
    details: {
      categories: d.categories,
      productDetails: d.productDetails,
      quantity: d.quantity,
      unit: d.unit,
      targetPrice: d.targetPrice ?? null,
      currency: d.currency,
      incoterm: d.incoterm,
      destinationCountry: d.destinationCountry,
      destinationPort: d.destinationPort,
      timeline: d.timeline,
      notes: d.notes ?? null,
    },
    routeCountry: d.destinationCountry,
    attachments: d.attachments,
    sourcePath: meta.sourcePath ?? "/request-a-quote",
    ipHash: pre.ipHash,
    userAgent: pre.userAgent,
  });
  if (!stored) return SAVE_FAILED;

  await notifyEnquiry({
    kind: "rfq",
    stored,
    sender: { name: d.name, email: d.email },
    headline: `${d.company} — ${cats}`,
    rows: [
      ["Company", d.company],
      ["Contact", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Country", countryName(d.countryCode)],
      ["Categories", cats],
      ["Product details", d.productDetails],
      ["Quantity", `${d.quantity.toLocaleString("en-GB")} ${d.unit}`],
      ["Target price", target],
      ["Incoterm", incoterm],
      ["Destination", `${d.destinationPort}, ${countryName(d.destinationCountry)}`],
      ["Timeline", d.timeline],
      ["Notes", d.notes],
      ["Attachments", stored.attachmentsAccepted ? `${stored.attachmentsAccepted} file(s) — download from the admin inbox` : null],
    ],
  });

  return { ok: true, reference: stored.reference };
}

// ------------------------------------------------------------------ Contact

export async function submitContact(input: unknown, meta: Meta): Promise<SubmitResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const pre = await precheck("contact", meta);
  if (!("ipHash" in pre)) return pre;

  const d = parsed.data;
  const stored = await storeEnquiry({
    kind: "contact",
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    company: d.company ?? null,
    countryCode: d.countryCode ?? null,
    subject: d.subject,
    message: d.message,
    details: { office: d.office },
    routeCountry: d.countryCode ?? null,
    preferredOffice: d.office,
    sourcePath: meta.sourcePath ?? "/contact",
    ipHash: pre.ipHash,
    userAgent: pre.userAgent,
  });
  if (!stored) return SAVE_FAILED;

  await notifyEnquiry({
    kind: "contact",
    stored,
    sender: { name: d.name, email: d.email },
    headline: `${d.subject} from ${d.name}${d.company ? ` (${d.company})` : ""}`,
    rows: [
      ["Name", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Company", d.company],
      ["Country", d.countryCode ? countryName(d.countryCode) : null],
      ["Subject", d.subject],
      ["Message", d.message],
    ],
  });
  return { ok: true, reference: stored.reference };
}

// ------------------------------------------------------------------ Partner / supplier

export async function submitPartner(input: unknown, meta: Meta): Promise<SubmitResult> {
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const pre = await precheck("partner", meta);
  if (!("ipHash" in pre)) return pre;

  const d = parsed.data;
  const cats = await categoryNames(d.categories);
  const settings = await getSiteSettings();

  const stored = await storeEnquiry({
    kind: "partner",
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    company: d.company,
    countryCode: d.countryCode,
    subject: `${d.partnerType} — ${d.company}`,
    message: d.message ?? null,
    details: {
      partnerType: d.partnerType,
      companyUrl: d.companyUrl ?? null,
      categories: d.categories,
      certifications: d.certifications ?? null,
    },
    routeCountry: d.countryCode,
    sourcePath: meta.sourcePath ?? "/partners",
    ipHash: pre.ipHash,
    userAgent: pre.userAgent,
  });
  if (!stored) return SAVE_FAILED;

  await notifyEnquiry({
    kind: "partner",
    stored,
    sender: { name: d.name, email: d.email },
    headline: `${d.partnerType}: ${d.company} (${countryName(d.countryCode)})`,
    rows: [
      ["Type", d.partnerType],
      ["Company", d.company],
      ["Contact", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Country", countryName(d.countryCode)],
      ["Website", d.companyUrl],
      ["Categories", cats],
      ["Certifications", d.certifications],
      ["Message", d.message],
    ],
    extraRecipients: [settings.contact.partnersEmail],
  });
  return { ok: true, reference: stored.reference };
}

// ------------------------------------------------------------------ Uploads

/** Signed parameters for one browser → Cloudinary upload. Rate-limited per IP. */
export async function getAttachmentUploadSignature(): Promise<UploadSignature | { error: string }> {
  const info = await requestInfo();
  if (!(await checkRateLimit("upload", info.ipHash, 20, 60))) return { error: "Too many uploads. Please wait a few minutes." };
  const sig = signEnquiryUpload();
  return sig ?? { error: "File upload isn't available right now. You can email your files after submitting — just quote your reference." };
}
