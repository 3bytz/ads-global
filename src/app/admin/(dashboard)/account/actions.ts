"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AccountState {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"fullName" | "password" | "confirm", string>>;
}

const schema = z
  .object({
    fullName: z.string().trim().max(120, { error: "Keep it under 120 characters." }),
    password: z.string(),
    confirm: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.password.length === 0) return;
    if (v.password.length < 12) ctx.addIssue({ code: "custom", path: ["password"], message: "Use at least 12 characters." });
    if (v.password !== v.confirm) ctx.addIssue({ code: "custom", path: ["confirm"], message: "Passwords don't match." });
  });

export async function updateAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const staff = await requireStaff();
  const parsed = schema.safeParse({
    fullName: formData.get("fullName") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: AccountState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<AccountState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured." };

  const { error: nameError } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName || null })
    .eq("id", staff.id);
  if (nameError) return { status: "error", message: "Couldn't save your name. Try again." };

  if (parsed.data.password) {
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/admin", "layout");
  return { status: "ok", message: parsed.data.password ? "Saved. Your new password is active." : "Saved." };
}
