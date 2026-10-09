"use client";

import { useSyncExternalStore } from "react";

/**
 * Live local time for an IANA time zone, e.g. Africa/Lagos or Asia/Shanghai.
 *
 * Hydration-safe: the server snapshot is null (renders "--:--"), so the server
 * HTML and the first client render match; the real time appears right after.
 * Formatting uses a fixed locale + time zone, so it never depends on the
 * visitor's browser settings.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!timer) {
    timer = setInterval(() => {
      for (const l of listeners) l();
    }, 15_000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function format(timeZone: string): string {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone });
    formatters.set(timeZone, f);
  }
  return f.format(new Date());
}

export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const value = useSyncExternalStore(
    subscribe,
    () => format(timeZone),
    () => null,
  );
  return (
    <time className={className}>
      {value ?? "--:--"}
    </time>
  );
}

/** Whether an office is open right now, computed client-side only. */
export function useIsOpen(timeZone: string, opens = "09:00", closes = "18:00", weekdaysOnly = true): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).formatToParts(new Date());
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const day = get("weekday");
      const hm = `${get("hour")}:${get("minute")}`;
      if (weekdaysOnly && (day === "Sat" || day === "Sun")) return false;
      return hm >= opens && hm < closes;
    },
    () => null,
  );
}
