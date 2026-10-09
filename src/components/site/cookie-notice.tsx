"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

/**
 * Essential-storage notice. The public site sets no tracking or analytics
 * cookies, so no consent is needed — this is an informational notice only.
 * Server snapshot = "dismissed" so it never flashes or mismatches during hydration.
 */
const KEY = "ads-cookie-notice-v1";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "dismissed";
  } catch {
    return true; // storage blocked: don't nag
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function dismiss() {
  try {
    window.localStorage.setItem(KEY, "dismissed");
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

export function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, read, () => true);
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-col gap-4 rounded-2xl bg-white p-5 text-sm text-ink shadow-[0_20px_60px_-20px_rgb(10_31_61/0.45)] ring-1 ring-line sm:flex-row sm:items-center"
    >
      <p className="flex-1">
        We use only essential storage (for example, to save your quote draft on this device). No tracking or advertising cookies.{" "}
        <Link href="/legal/cookies" className="font-semibold text-brand underline underline-offset-4">
          Learn more
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="min-h-11 shrink-0 rounded-full bg-ink px-5 font-semibold text-white hover:bg-ink-2"
      >
        OK
      </button>
    </div>
  );
}
