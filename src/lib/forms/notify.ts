import "server-only";
import { sendEmail } from "@/lib/email/send";
import { render, type Row } from "@/lib/email/templates";
import { siteUrl } from "@/lib/env";
import { formatPhone } from "@/lib/utils";
import { defaultSettings } from "@/content/defaults";
import type { StoredEnquiry, EnquiryKind } from "./store";

const kindLabel: Record<EnquiryKind, string> = {
  rfq: "Request for quotation",
  contact: "Contact message",
  partner: "Partner / supplier application",
};

/**
 * Sends (1) a notification to the routed office (Reply-To = the sender) and
 * (2) an auto-reply to the sender with the reference number (Reply-To = the office).
 * Email failures are logged only; the enquiry is already safe in the database.
 */
export async function notifyEnquiry(opts: {
  kind: EnquiryKind;
  stored: StoredEnquiry;
  sender: { name: string; email: string };
  headline: string;
  rows: Row[];
  extraRecipients?: string[];
}) {
  const { stored, sender, kind } = opts;
  const office = stored.office;
  const officeEmail = office?.email ?? defaultSettings.contact.generalEmail;
  const ref = stored.reference;

  const staff = render({
    title: `${kindLabel[kind]} · ${ref}`,
    intro: `${opts.headline}${stored.attachmentsRejected ? ` (${stored.attachmentsRejected} attachment(s) were rejected by the size/type check.)` : ""}`,
    rows: [["Reference", ref], ["Routed to", office ? `${office.name} (${office.city})` : "Default inbox"], ...opts.rows],
    footer: "Reply to this email to answer the sender directly. Update the status in the admin inbox so the team can see it's handled.",
    cta: { label: "Open in admin", href: `${siteUrl}/admin/enquiries/${stored.id}` },
  });

  const customer = render({
    title: `Thank you — we've received your ${kind === "rfq" ? "request for quotation" : kind === "partner" ? "application" : "message"}`,
    intro: `Hello ${sender.name}, your reference number is ${ref}. Our ${office ? `${office.city} ` : ""}team will review it and reply by email. Please quote the reference in any follow-up.`,
    rows: opts.rows.filter(([label]) => !["IP", "User agent"].includes(label)),
    footer: office
      ? `ADS Global Limited · ${office.name}, ${office.city} · ${formatPhone(office.phone)} · ${office.email}`
      : `ADS Global Limited · ${defaultSettings.contact.generalEmail}`,
  });

  await Promise.all([
    sendEmail({
      to: officeEmail,
      cc: opts.extraRecipients?.filter((e) => e && e !== officeEmail),
      subject: `[${ref}] ${kindLabel[kind]} — ${opts.headline}`.slice(0, 200),
      replyTo: sender.email,
      ...staff,
    }),
    sendEmail({
      to: sender.email,
      subject: `We've received your enquiry — ${ref}`,
      replyTo: officeEmail,
      ...customer,
    }),
  ]);
}
