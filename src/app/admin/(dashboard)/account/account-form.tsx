"use client";

import { useActionState, useId } from "react";
import { updateAccount, type AccountState } from "./actions";
import { cn } from "@/lib/utils";

const initial: AccountState = { status: "idle" };

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  autoComplete,
  error,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[hint ? hintId : "", error ? errId : ""].filter(Boolean).join(" ") || undefined}
        className="mt-2 block w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger"
      />
      {error && (
        <p id={errId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function AccountForm({ fullName }: { fullName: string }) {
  const [state, action, pending] = useActionState(updateAccount, initial);
  return (
    <form action={action} className="space-y-6" noValidate>
      <Field label="Full name" name="fullName" defaultValue={fullName} autoComplete="name" error={state.fieldErrors?.fullName} />
      <fieldset className="space-y-4 rounded-xl border border-line p-5">
        <legend className="px-1 text-sm font-semibold">Password</legend>
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 12 characters. Leave blank to keep your current password."
          error={state.fieldErrors?.password}
        />
        <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" error={state.fieldErrors?.confirm} />
      </fieldset>
      <div role="status" aria-live="polite">
        {state.message && (
          <p className={cn("rounded-lg px-4 py-3 text-sm", state.status === "ok" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
            {state.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-full bg-ink px-8 font-semibold text-white hover:bg-ink-2 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
