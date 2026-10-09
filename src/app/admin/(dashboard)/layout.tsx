import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, UserCircle } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { AdminNav } from "./admin-nav";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

/** Every page in this group requires a signed-in admin or super admin. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff();
  const supabase = await createSupabaseServerClient();
  const { count } = supabase ? await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new") : { count: 0 };

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[260px_1fr]">
      <a href="#admin-main" className="sr-only rounded-full bg-accent px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
        Skip to content
      </a>
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-svh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 p-5 lg:gap-8 lg:p-6">
          <Link href="/admin" className="block" aria-label="Admin overview">
            <Logo className="h-9" />
          </Link>
          <AdminNav isSuperAdmin={staff.role === "super_admin"} newCount={count ?? 0} />
          <div className="space-y-1 border-t border-line pt-4 text-sm">
            <Link href="/admin/account" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-tint">
              <UserCircle className="size-4 text-brand" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{staff.fullName ?? staff.email}</span>
                <span className="block text-xs text-muted">{staff.role === "super_admin" ? "Super admin" : "Admin"}</span>
              </span>
            </Link>
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted hover:bg-tint hover:text-ink">
              <ExternalLink className="size-4" aria-hidden="true" />
              View website
            </Link>
            <form action={signOut}>
              <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-muted hover:bg-tint hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <main id="admin-main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-10 outline-none sm:px-8 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
