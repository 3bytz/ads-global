"use client";

import { createContext, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/admin/action-state";
import { cn } from "@/lib/utils";

const ActionStateContext = createContext<ActionState>({ status: "idle" });

/** Current form state (field errors) for admin fields rendered inside an ActionForm. */
export function useActionFormState(): ActionState {
  return useContext(ActionStateContext);
}

/**
 * Wraps a Server Action form: pending state, announced success/error message,
 * and per-field errors shared with the admin fields through context.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  className,
  danger,
  confirm,
  compact,
  resetOnSuccess,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  danger?: boolean;
  /** Ask for confirmation before submitting (destructive actions). */
  confirm?: string;
  compact?: boolean;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as ActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.status === "ok") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn(compact ? "flex flex-wrap items-end gap-3" : "space-y-5", className)}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      <ActionStateContext.Provider value={state}>{children}</ActionStateContext.Provider>
      <div className={cn("flex flex-wrap items-center gap-4", compact && "contents")}>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60",
            danger ? "bg-danger text-white hover:bg-danger/90" : "bg-ink text-white hover:bg-ink-2",
          )}
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
        <p role="status" aria-live="polite" className={cn("text-sm", state.status === "error" ? "text-danger" : "text-success")}>
          {state.message}
        </p>
      </div>
      {state.data && Object.keys(state.data).length > 0 && (
        <dl className="w-full rounded-lg bg-tint p-4 text-sm">
          {Object.entries(state.data).map(([k, v]) => (
            <div key={k} className="grid gap-1">
              <dt className="font-semibold">{k}</dt>
              <dd className="break-all font-mono text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </form>
  );
}
