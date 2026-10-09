import "server-only";
import { isEmailConfigured, serverEnv } from "@/lib/env.server";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  cc?: string[];
}

/**
 * Sends through the Resend REST API (no SDK dependency).
 * Returns false (and logs) instead of throwing, so a mail outage never loses an enquiry —
 * it's already stored in the database and visible in the admin inbox.
 */
export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  if (!isEmailConfigured) {
    console.warn(`[email] Resend not configured — skipped "${msg.subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: serverEnv.EMAIL_FROM,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        ...(msg.cc?.length ? { cc: msg.cc } : {}),
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}
