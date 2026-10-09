"use client";

import { forwardRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { countries, priorityCountryCodes } from "@/lib/countries";
import { cn } from "@/lib/utils";

/**
 * Controlled form fields. Every field:
 *  - has a visible <label> (or fieldset legend),
 *  - is linked to its hint and error with aria-describedby,
 *  - sets aria-invalid when it has an error.
 * Field ids are `${idPrefix}-${name}` so the error summary can link to them.
 */

const inputBase =
  "block w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 disabled:bg-tint";

interface BaseProps {
  idPrefix: string;
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

export const fieldId = (idPrefix: string, name: string) => `${idPrefix}-${name}`;

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-ink">
      {label}
      {required ? (
        <span className="text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      ) : (
        <span className="font-normal text-muted"> (optional)</span>
      )}
    </label>
  );
}

function HintAndError({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({
  idPrefix,
  name,
  label,
  required,
  hint,
  error,
  className,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  min,
  step,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel" | "url" | "number";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal";
  placeholder?: string;
  min?: number;
  step?: string;
}) {
  const id = fieldId(idPrefix, name);
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        min={min}
        step={step}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputBase, "mt-2")}
      />
      <HintAndError id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  idPrefix,
  name,
  label,
  required,
  hint,
  error,
  className,
  value,
  onChange,
  rows = 5,
  maxLength,
}: BaseProps & { value: string; onChange: (v: string) => void; rows?: number; maxLength?: number }) {
  const id = fieldId(idPrefix, name);
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputBase, "mt-2 resize-y")}
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-muted" aria-hidden="true">
          {value.length}/{maxLength}
        </p>
      )}
      <HintAndError id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  idPrefix,
  name,
  label,
  required,
  hint,
  error,
  className,
  value,
  onChange,
  options,
  placeholder = "Choose…",
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const id = fieldId(idPrefix, name);
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <div className="relative mt-2">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(inputBase, "appearance-none pr-12")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink" />
      </div>
      <HintAndError id={id} hint={hint} error={error} />
    </div>
  );
}

const countryOptions = (() => {
  const top = priorityCountryCodes
    .map((code) => countries.find(([c]) => c === code))
    .filter((x): x is readonly [string, string] => Boolean(x));
  return { top, rest: countries };
})();

export function CountryField(props: BaseProps & { value: string; onChange: (v: string) => void }) {
  const { idPrefix, name, label, required, hint, error, className, value, onChange } = props;
  const id = fieldId(idPrefix, name);
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete="country"
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputBase, "mt-2")}
      >
        <option value="">Choose a country…</option>
        <optgroup label="Common">
          {countryOptions.top.map(([code, n]) => (
            <option key={`top-${code}`} value={code}>
              {n}
            </option>
          ))}
        </optgroup>
        <optgroup label="All countries">
          {countryOptions.rest.map(([code, n]) => (
            <option key={code} value={code}>
              {n}
            </option>
          ))}
        </optgroup>
      </select>
      <HintAndError id={id} hint={hint} error={error} />
    </div>
  );
}

/** Multi-select as a fieldset of checkbox "chips". */
export function CheckboxGroup({
  idPrefix,
  name,
  label,
  required,
  hint,
  error,
  className,
  values,
  onChange,
  options,
}: BaseProps & { values: string[]; onChange: (v: string[]) => void; options: ReadonlyArray<{ value: string; label: string; detail?: string }> }) {
  const id = fieldId(idPrefix, name);
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className={cn("outline-none", className)}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={describedBy(id, hint, error)}
    >
      <legend className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </legend>
      <HintAndError id={id} hint={hint} />
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/25",
                checked ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(checked ? values.filter((v) => v !== o.value) : [...values, o.value])}
                className="size-4 accent-[var(--color-accent)]"
              />
              {o.label}
              {o.detail && <span className={checked ? "text-white/70" : "text-muted"}>{o.detail}</span>}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function ConsentField({ idPrefix, error, checked, onChange }: { idPrefix: string; error?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = fieldId(idPrefix, "consent");
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="text-sm text-muted">
          I agree that ADS Global may store and use these details to respond to my request, as described in the{" "}
          <Link href="/legal/privacy" target="_blank" className="font-semibold text-brand underline underline-offset-4">
            privacy policy
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen honeypot. Humans never see or fill it; many bots do. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

/** Error summary: focused when shown, announced, links jump to each field. */
export const ErrorSummary = forwardRef<HTMLDivElement, { idPrefix: string; errors: Record<string, string>; labels: Record<string, string>; message?: string }>(
  function ErrorSummary({ idPrefix, errors, labels, message }, ref) {
    const entries = Object.entries(errors);
    if (entries.length === 0 && !message) return null;
    return (
      <div ref={ref} tabIndex={-1} role="alert" className="rounded-2xl border border-danger/30 bg-danger/5 p-5 outline-none focus:ring-4 focus:ring-danger/20">
        <p className="font-semibold text-danger">{message ?? "Please fix the following:"}</p>
        {entries.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {entries.map(([key, msg]) => (
              <li key={key}>
                <a href={`#${fieldId(idPrefix, key)}`} className="text-danger underline underline-offset-2">
                  {labels[key] ? `${labels[key]}: ` : ""}
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

export function SubmitButton({ pending, children, className }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-accent py-1.5 pl-6 pr-1.5 font-semibold text-ink transition-colors hover:bg-[#ff7a1f] disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      {pending ? "Sending…" : children}
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-ink text-accent">
        →
      </span>
    </button>
  );
}
