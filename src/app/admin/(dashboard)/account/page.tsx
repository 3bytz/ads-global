import type { Metadata } from "next";
import { AccountForm } from "./account-form";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ "set-password"?: string }> }) {
  const staff = await requireStaff();
  const params = await searchParams;
  return (
    <div className="max-w-xl">
      <p className="eyebrow text-accent-ink">Account</p>
      <h1 className="headline mt-2 text-5xl">Your account</h1>
      <p className="mt-2 text-muted">{staff.email}</p>
      {params["set-password"] && (
        <p className="mt-6 rounded-lg border border-brand/30 bg-white px-4 py-3 text-sm">
          Welcome! Set a password below so you can sign in without an email link next time.
        </p>
      )}
      <div className="mt-10 rounded-xl border border-line bg-white p-6 lg:p-8">
        <AccountForm fullName={staff.fullName ?? ""} />
      </div>
    </div>
  );
}
