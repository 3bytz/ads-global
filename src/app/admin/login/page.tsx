import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/site/logo";
import { getStaff, safeAdminPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

const errors: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one.",
  access: "This account doesn't have admin access.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  if (await getStaff()) redirect(safeAdminPath(next));

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo tone="light" className="h-12" />
        <div>
          <p className="eyebrow text-accent">Admin</p>
          <p className="headline mt-4 text-h2">
            Enquiries, content <span className="text-accent">and settings.</span>
          </p>
        </div>
        <p className="text-sm text-muted-on-dark">Access is by invitation only.</p>
      </section>

      <section className="flex items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-sm">
          <Logo className="h-10 lg:hidden" />
          <h1 className="headline mt-8 text-5xl lg:mt-0">Sign in</h1>
          <p className="mt-2 text-muted">Use your ADS Global admin account.</p>

          {error && errors[error] && (
            <p role="alert" className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {errors[error]}
            </p>
          )}

          {!isSupabaseConfigured && (
            <p role="alert" className="mt-6 rounded-lg border border-dashed border-accent-ink px-4 py-3 text-sm text-accent-ink">
              Supabase isn&apos;t configured yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see README).
            </p>
          )}

          <div className="mt-8">
            <LoginForm next={next} disabled={!isSupabaseConfigured} />
          </div>

          <p className="mt-10 text-sm text-muted">
            <Link href="/" className="underline underline-offset-4 hover:text-ink">
              ← Back to the website
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
