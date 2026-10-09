"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fail, fd, ok, zodFail, type ActionState } from "@/lib/admin/action-state";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { render } from "@/lib/email/templates";

const roleSchema = z.enum(["admin", "super_admin"]);

/** Service-role writes bypass the audit trigger (no auth.uid()), so log them explicitly. */
async function audit(actor: { id: string; email: string }, action: string, recordId: string, newData: Record<string, unknown>, oldData?: Record<string, unknown>) {
  const svc = createSupabaseServiceClient();
  await svc?.from("audit_log").insert({
    actor_id: actor.id,
    actor_email: actor.email,
    action,
    table_name: "profiles",
    record_id: recordId,
    old_data: oldData ?? null,
    new_data: newData,
  });
}

export async function inviteAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireSuperAdmin();
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email." })),
      fullName: z.string().trim().max(120),
      role: roleSchema,
    })
    .safeParse({ email: fd.str(form, "email"), fullName: fd.str(form, "fullName") ?? "", role: fd.str(form, "role") ?? "admin" });
  if (!parsed.success) return zodFail(parsed.error);

  const svc = createSupabaseServiceClient();
  if (!svc) return fail("SUPABASE_SERVICE_ROLE_KEY is not set, so invites can't be sent.");
  const { email, fullName, role } = parsed.data;

  // Creates the user (if new) and returns a one-time invite token.
  const { data, error } = await svc.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: fullName ? { full_name: fullName } : {} },
  });

  let userId: string | null = data?.user?.id ?? null;
  let link: string | null = null;
  if (!error && data?.properties?.hashed_token) {
    const url = new URL("/auth/confirm", siteUrl);
    url.searchParams.set("token_hash", data.properties.hashed_token);
    url.searchParams.set("type", "invite");
    url.searchParams.set("next", "/admin/account?set-password=1");
    link = url.toString();
  } else if (error) {
    // Already registered: find the user and just grant the role.
    const { data: existing } = await svc.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!existing) return fail(`Couldn't invite: ${error.message}`);
    userId = existing.id as string;
  }
  if (!userId) return fail("Couldn't create the user.");

  const { error: roleError } = await svc.from("profiles").upsert({ id: userId, email, role, ...(fullName ? { full_name: fullName } : {}) }, { onConflict: "id" });
  if (roleError) return fail(roleError.message);
  await audit(me, "user.invite", userId, { email, role });

  revalidatePath("/admin/users");
  if (!link) return ok(`${email} already had an account and now has ${role.replace("_", " ")} access. They can sign in with a magic link.`);

  const mail = render({
    title: "You've been invited to the ADS Global admin",
    intro: `${me.fullName ?? me.email} invited you to manage enquiries and website content for ADS Global Limited. The link below works once; you'll be asked to set a password. If it has expired, ask for a new invitation.`,
    rows: [["Role", role === "super_admin" ? "Super admin" : "Admin"], ["Sign-in page", `${siteUrl}/admin/login`]],
    footer: "If you weren't expecting this, you can ignore the email.",
    cta: { label: "Accept invitation", href: link },
  });
  const sent = await sendEmail({ to: email, subject: "Your ADS Global admin invitation", ...mail });
  return sent
    ? ok(`Invitation sent to ${email}.`)
    : ok("Account created, but the email couldn't be sent (Resend not configured). Send this one-time link to the person directly:", { "Invite link": link });
}

export async function changeRole(userId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireSuperAdmin();
  if (userId === me.id) return fail("You can't change your own role. Ask another super admin.");
  const role = fd.str(form, "role");
  const svc = createSupabaseServiceClient();
  if (!svc) return fail("Service role not configured.");

  const { data: before } = await svc.from("profiles").select("role, email").eq("id", userId).maybeSingle();
  if (!before) return fail("User not found.");

  if (role === "none") {
    const { error } = await svc.from("profiles").update({ role: null }).eq("id", userId);
    if (error) return fail(error.message);
    await audit(me, "user.revoke", userId, { role: null }, { role: before.role });
    revalidatePath("/admin/users");
    return ok("Access removed. They're signed out of the admin on their next request.");
  }

  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return fail("Choose a role.");
  const { error } = await svc.from("profiles").update({ role: parsed.data }).eq("id", userId);
  if (error) return fail(error.message);
  await audit(me, "role.change", userId, { role: parsed.data }, { role: before.role });
  revalidatePath("/admin/users");
  return ok("Role updated.");
}
