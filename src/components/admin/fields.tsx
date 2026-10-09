"use client";

import type { ReactNode } from "react";
import { useActionFormState } from "./action-form";

/**
 * Admin form fields (uncontrolled, for Server Action forms). Errors come from the
 * surrounding ActionForm's state via context, so server pages can render them.
 */

function useFieldError(name: string, explicit?: string): string | undefined {
  const state = useActionFormState();
  return explicit ?? state.fieldErrors?.[name];
}

const inputCls =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger";

interface InputProps {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  /** Unique prefix when the same field name appears in several forms on one page. */
  idPrefix?: string;
}

export function Input({ name, label, defaultValue, error: errorProp, hint, required, className, type = "text", placeholder, idPrefix }: InputProps & { type?: string; placeholder?: string }) {
  const id = `${idPrefix ?? "f"}-${name}`;
  const error = useFieldError(name, errorProp);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={inputCls}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ name, label, defaultValue, error: errorProp, hint, required, className, rows = 4, idPrefix }: InputProps & { rows?: number }) {
  const id = `${idPrefix ?? "f"}-${name}`;
  const error = useFieldError(name, errorProp);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={inputCls}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  name,
  label,
  defaultValue,
  error: errorProp,
  hint,
  required,
  className,
  options,
  idPrefix,
}: InputProps & { options: ReadonlyArray<{ value: string; label: string }> }) {
  const id = `${idPrefix ?? "f"}-${name}`;
  const error = useFieldError(name, errorProp);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} required={required} aria-invalid={Boolean(error) || undefined} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint, idPrefix }: { name: string; label: ReactNode; defaultChecked?: boolean; hint?: ReactNode; idPrefix?: string }) {
  const id = `${idPrefix ?? "f"}-${name}`;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm font-semibold">
        <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
        <span>
          {label}
          {hint && <span className="mt-0.5 block text-xs font-normal text-muted">{hint}</span>}
        </span>
      </label>
    </div>
  );
}

