import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeAdminPath } from "@/lib/auth";

const allowedTypes: EmailOtpType[] = ["magiclink", "email", "invite", "recovery", "email_change", "signup"];

/**
 * Server-side verification of `token_hash` links (works across browsers and
 * devices). Point the Supabase email templates here — see README → "Email templates".
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const defaultNext = type === "invite" || type === "recovery" ? "/admin/account?set-password=1" : "/admin";
  const next = safeAdminPath(url.searchParams.get("next"), defaultNext);

  if (tokenHash && type && allowedTypes.includes(type)) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
}
