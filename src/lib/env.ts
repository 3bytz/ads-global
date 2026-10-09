import { z } from "zod";

/**
 * Public (browser-safe) environment.
 *
 * Rules:
 *  - A blank or whitespace-only value counts as "not set".
 *  - Optional values never throw; features check `isXConfigured` and switch off.
 *  - NEXT_PUBLIC_* must be referenced literally so Next can inline them.
 */
export const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(blankToUndefined, z.url().optional());
const optionalString = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(blankToUndefined, z.url().default("http://localhost:3000")),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
});

function parsePublic() {
  const raw = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  };
  const parsed = publicSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // A malformed optional value must not take the site down: log it and treat it as unset.
  console.warn("[env] Ignoring invalid public env values:", z.treeifyError(parsed.error));
  const cleaned: Record<string, unknown> = { ...raw };
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") cleaned[key] = undefined;
  }
  return publicSchema.parse(cleaned);
}

export const publicEnv = parsePublic();

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

export const isSupabaseConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isTurnstileConfigured = Boolean(publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
