/** Tiny className joiner (no dependency). Falsy values are dropped. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** "+2349030428141" → "+234 903 042 8141"; "+8618012824844" → "+86 180 1282 4844". */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.startsWith("86") && digits.length === 13) {
    return `+86 ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`;
  }
  return e164;
}

export function telHref(e164: string): string {
  return `tel:+${e164.replace(/[^\d]/g, "")}`;
}

export function whatsappHref(e164: string, text?: string): string {
  const base = `https://wa.me/${e164.replace(/[^\d]/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const isPlaceholder = (value: string | null | undefined): boolean =>
  !value || /\[CONFIRM/i.test(value);
