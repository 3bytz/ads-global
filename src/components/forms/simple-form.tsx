"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { CircleCheckBig } from "lucide-react";
import type { z } from "zod";
import { ErrorSummary, Honeypot, SubmitButton, ConsentField } from "./fields";
import { Turnstile } from "./turnstile";
import { toFieldErrors, type FieldErrors, type SubmitResult } from "@/lib/forms/schemas";

type Action = (input: unknown, meta: { turnstileToken?: string | null; website?: string; sourcePath?: string }) => Promise<SubmitResult>;

/**
 * Shared shell for single-step forms (contact, partner): client validation with
 * the same Zod schema as the server, focused error summary, honeypot,
 * Turnstile, and a success panel with the reference number.
 */
export function SimpleForm<S extends Record<string, unknown>>({
  idPrefix,
  initial,
  schema,
  action,
  labels,
  submitLabel,
  successTitle,
  children,
}: {
  idPrefix: string;
  initial: S;
  schema: z.ZodType;
  action: Action;
  labels: Record<string, string>;
  submitLabel: string;
  successTitle: string;
  children: (ctx: { state: S; set: <K extends keyof S>(k: K) => (v: S[K]) => void; error: (k: string) => string | undefined }) => ReactNode;
}) {
  const [state, setState] = useState<S>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | undefined>();
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [reference, setReference] = useState<string | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length || message) summaryRef.current?.focus();
  }, [errors, message]);

  useEffect(() => {
    if (reference !== undefined) successRef.current?.focus();
  }, [reference]);

  const set =
    <K extends keyof S>(k: K) =>
    (v: S[K]) => {
      setState((s) => ({ ...s, [k]: v }));
      if (errors[k as string]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([key]) => key !== k)));
    };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(state);
    if (!parsed.success) {
      setMessage(undefined);
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    startTransition(async () => {
      const res = await action(state, { turnstileToken: token, website: honeypot, sourcePath: window.location.pathname });
      if (res.ok) {
        setReference(res.reference);
        return;
      }
      setResetKey((k) => k + 1);
      setErrors(res.fieldErrors ?? {});
      setMessage(res.message);
    });
  }

  if (reference !== undefined) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-signature bg-ink p-10 text-white outline-none">
        <CircleCheckBig className="size-10 text-accent" aria-hidden="true" />
        <h2 className="headline mt-5 text-4xl">{successTitle}</h2>
        {reference && (
          <p className="mt-3">
            Reference: <strong className="headline text-3xl text-accent">{reference}</strong>
          </p>
        )}
        <p className="mt-3 text-muted-on-dark">We&apos;ve emailed you a copy and will reply by email.</p>
        <button
          type="button"
          onClick={() => {
            setState(initial);
            setReference(undefined);
          }}
          className="mt-6 min-h-11 rounded-full border border-white/40 px-5 font-semibold"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6">
      <ErrorSummary ref={summaryRef} idPrefix={idPrefix} errors={errors} labels={labels} message={message} />
      <Honeypot value={honeypot} onChange={setHoneypot} />
      {children({ state, set, error: (k) => errors[k] })}
      <ConsentField idPrefix={idPrefix} checked={Boolean(state.consent)} onChange={(v) => set("consent" as keyof S)(v as S[keyof S])} error={errors.consent} />
      <Turnstile onToken={setToken} resetKey={resetKey} />
      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}
