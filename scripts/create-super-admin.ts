/**
 * Creates (or promotes) a super admin.
 *
 *   npm run create-super-admin -- you@adsglobaltd.com "Full Name"
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (or the environment). Works against local or remote projects.
 *
 *  - New email → the user is created with a random temporary password and a
 *    password-reset link is printed (also emailed if SMTP is configured in Supabase).
 *  - Existing user → promoted to super_admin.
 * Safe to re-run.
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [emailArg, ...nameParts] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const fullName = nameParts.join(" ").trim() || null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run create-super-admin -- <email> ["Full Name"]');
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (in .env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserId(target: string): Promise<string | null> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  let userId = await findUserId(email!);
  let created = false;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email!,
      password: randomBytes(24).toString("base64url"),
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : {},
    });
    if (error) throw error;
    userId = data.user.id;
    created = true;
  }

  // The on_auth_user_created trigger creates the profile; upsert covers users created before the migration.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, email, role: "super_admin", ...(fullName ? { full_name: fullName } : {}) }, { onConflict: "id" });
  if (profileError) throw profileError;

  await supabase.from("audit_log").insert({
    actor_id: null,
    actor_email: "cli:create-super-admin",
    action: "role.grant",
    table_name: "profiles",
    record_id: userId,
    new_data: { email, role: "super_admin" },
  });

  console.log(`${created ? "Created" : "Promoted"} super admin: ${email} (${userId})`);

  if (created) {
    const { data, error } = await supabase.auth.admin.generateLink({ type: "recovery", email: email! });
    if (error) throw error;
    // Verified server-side by /auth/confirm (works without browser-side hash parsing).
    const link = new URL("/auth/confirm", siteUrl);
    link.searchParams.set("token_hash", data.properties.hashed_token);
    link.searchParams.set("type", "recovery");
    link.searchParams.set("next", "/admin/account");
    console.log("\nSet a password with this one-time link (expires per your Supabase OTP expiry, default 1 hour):\n");
    console.log(link.toString());
    console.log("\nOr sign in with a magic link at", `${siteUrl}/admin/login`);
  }
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
