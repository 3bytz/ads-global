"use client";

import { useActionState, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { sendMagicLink, signInWithPassword, type LoginState } from "./actions";
import { cn } from "@/lib/utils";

const initial: LoginState = { status: "idle" };

export function LoginForm({ next, disabled }: { next?: string; disabled?: boolean }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState(signInWithPassword, initial);
  const [mlState, mlAction, mlPending] = useActionState(sendMagicLink, initial);
  const state = mode === "password" ? pwState : mlState;
  const pending = mode === "password" ? pwPending : mlPending;
  const ids = { email: useId(), password: useId(), emailErr: useId(), pwErr: useId() };

  return (
    <div>
      <div role="group" aria-label="Sign-in method" className="grid grid-cols-2 rounded-full bg-tint p-1 text-sm font-semibold">
        {(["password", "magic"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-full px-4 py-2.5 transition-colors", mode === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>

      <form action={mode === "password" ? pwAction : mlAction} className="mt-8 space-y-5" noValidate>
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label htmlFor={ids.email} className="block text-sm font-semibold">
            Work email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={disabled}
            aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
            aria-describedby={state.fieldErrors?.email ? ids.emailErr : undefined}
            className="mt-2 block w-full rounded-lg border border-line bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger"
          />
          {state.fieldErrors?.email && (
            <p id={ids.emailErr} className="mt-2 text-sm text-danger">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        {mode === "password" && (
          <div>
            <label htmlFor={ids.password} className="block text-sm font-semibold">
              Password
            </label>
            <input
              id={ids.password}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={disabled}
              aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
              aria-describedby={state.fieldErrors?.password ? ids.pwErr : undefined}
              className="mt-2 block w-full rounded-lg border border-line bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger"
            />
            {state.fieldErrors?.password && (
              <p id={ids.pwErr} className="mt-2 text-sm text-danger">
                {state.fieldErrors.password}
              </p>
            )}
          </div>
        )}

        <div role="status" aria-live="polite" className="min-h-0">
          {state.message && (
            <p className={cn("rounded-lg px-4 py-3 text-sm", state.status === "sent" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
              {state.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || disabled}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-white transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "password" ? "Sign in" : "Send sign-in link"}
        </button>
      </form>
    </div>
  );
}
