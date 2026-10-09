import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

/**
 * Spam and abuse checks for public forms, in order:
 *   1. honeypot (silently drop bots)
 *   2. Cloudflare Turnstile
 *   3. Postgres-backed rate limit per hashed IP
 */

export interface RequestInfo {
  ipHash: string;
  userAgent: string | null;
  ip: string | null;
}

export async function requestInfo(): Promise<RequestInfo> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim() || null;
  const salt = serverEnv.SUPABASE_SERVICE_ROLE_KEY ?? "ads-global";
  // Only a salted hash of the IP is stored (data minimisation).
  const ipHash = createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex").slice(0, 32);
  return { ipHash, userAgent: h.get("user-agent")?.slice(0, 300) ?? null, ip };
}

let warnedTurnstile = false;

export async function verifyTurnstile(token: string | null | undefined, ip: string | null): Promise<boolean> {
  const secret = serverEnv.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warnedTurnstile) {
      console.warn("[forms] TURNSTILE_SECRET_KEY not set — Turnstile check skipped. Set it before launch.");
      warnedTurnstile = true;
    }
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[forms] Turnstile verification error", err);
    return false;
  }
}

/** Returns true if allowed. Two windows: burst (per 10 min) and daily. */
export async function checkRateLimit(bucket: string, ipHash: string, burst = 5, daily = 25): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return true;
  const [a, b] = await Promise.all([
    supabase.rpc("check_rate_limit", { p_bucket: `${bucket}:10m:${ipHash}`, p_limit: burst, p_window_seconds: 600 }),
    supabase.rpc("check_rate_limit", { p_bucket: `${bucket}:1d:${ipHash}`, p_limit: daily, p_window_seconds: 86400 }),
  ]);
  if (a.error || b.error) {
    console.error("[forms] rate limit error", a.error ?? b.error);
    return true; // fail open on infrastructure errors; Turnstile still applies
  }
  return a.data === true && b.data === true;
}
