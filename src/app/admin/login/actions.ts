"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeAdminPath } from "@/lib/auth";
import { siteUrl } from "@/lib/env";

export interface LoginState {
  status: "idle" | "error" | "sent";
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
}

const emailSchema = z
  .string({ error: "Enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

const passwordSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Enter your password." }).min(1, { error: "Enter your password." }),
  next: z.string().optional(),
});

function fieldErrors(error: z.ZodError): LoginState["fieldErrors"] {
  const out: LoginState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if ((key === "email" || key === "password") && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function signInWithPassword(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Sign-in is unavailable: Supabase is not configured." };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { status: "error", message: "Email or password is incorrect." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!profile?.role) {
    await supabase.auth.signOut();
    return { status: "error", message: "This account doesn't have admin access. Ask a super admin to invite you." };
  }

  redirect(safeAdminPath(parsed.data.next));
}

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.object({ email: emailSchema, next: z.string().optional() }).safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Sign-in is unavailable: Supabase is not configured." };

  const callback = new URL("/auth/callback", siteUrl);
  callback.searchParams.set("next", safeAdminPath(parsed.data.next));

  // shouldCreateUser: false — admin accounts are invite-only.
  await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
  });

  // Same response whether or not the account exists (no account enumeration).
  return {
    status: "sent",
    message: "If that email belongs to an admin account, a sign-in link is on its way. It expires in 1 hour.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
