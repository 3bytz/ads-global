import { z } from "zod";

export interface ActionState {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Optional payload (e.g. an invite link to show the super admin). */
  data?: Record<string, string>;
}

export const idle: ActionState = { status: "idle" };

export function fail(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: "error", message, fieldErrors };
}

export function ok(message = "Saved.", data?: Record<string, string>): ActionState {
  return { status: "ok", message, data };
}

export function zodFail(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    fieldErrors[key] ??= issue.message;
  }
  return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
}

/** FormData helpers: blank → undefined, checkboxes → boolean, lines → string[]. */
export const fd = {
  str(form: FormData, key: string): string | undefined {
    const v = form.get(key);
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    return t === "" ? undefined : t;
  },
  bool(form: FormData, key: string): boolean {
    const v = form.get(key);
    return v === "on" || v === "true" || v === "1";
  },
  lines(form: FormData, key: string): string[] {
    const v = form.get(key);
    if (typeof v !== "string") return [];
    return v
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  },
  all(form: FormData, key: string): string[] {
    return form.getAll(key).filter((v): v is string => typeof v === "string" && v.trim() !== "");
  },
};

/** Lowercase URL-safe slug. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.url({ error: "Enter a full URL starting with https://" }).optional(),
);
