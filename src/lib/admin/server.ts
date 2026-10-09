import "server-only";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff, requireSuperAdmin, type Staff } from "@/lib/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Staff check + RLS-bound client (so every write is attributed in the audit log via auth.uid()). */
export async function staffClient(): Promise<{ staff: Staff; supabase: SupabaseClient }> {
  const staff = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return { staff, supabase };
}

export async function superAdminClient(): Promise<{ staff: Staff; supabase: SupabaseClient }> {
  const staff = await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return { staff, supabase };
}

/** Refresh every public page after a content change (pages are ISR-cached for 5 minutes otherwise). */
export function revalidatePublicSite() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
