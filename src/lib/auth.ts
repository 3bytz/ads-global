import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "super_admin";

export interface Staff {
  id: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
}

/** The signed-in staff member, or null (not signed in / no role / Supabase not configured). */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) return null;
  return {
    id: profile.id as string,
    email: (profile.email as string) || user.email || "",
    fullName: (profile.full_name as string | null) ?? null,
    role: profile.role as StaffRole,
  };
});

export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

export async function requireSuperAdmin(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "super_admin") redirect("/admin?denied=1");
  return staff;
}

/** Only allow internal admin paths as post-login redirects (prevents open redirects). */
export function safeAdminPath(next: string | null | undefined, fallback = "/admin"): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
