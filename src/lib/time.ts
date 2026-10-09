import type { HoursRow, Office } from "@/content/types";

/** "UTC+8" → 8, "UTC+1" → 1, "UTC-3:30" → -3.5. Neither China nor Nigeria uses daylight saving. */
export function parseUtcOffset(label: string): number {
  const m = /UTC\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i.exec(label);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) + Number(m[3] ?? 0) / 60);
}

/** Shift "HH:MM" between two UTC offsets. Returns the time and a day delta (-1, 0, +1). */
export function shiftTime(hhmm: string, fromOffset: number, toOffset: number): { time: string; dayDelta: number } {
  const [h = "0", m = "0"] = hhmm.split(":");
  let minutes = Number(h) * 60 + Number(m) + Math.round((toOffset - fromOffset) * 60);
  let dayDelta = 0;
  while (minutes < 0) {
    minutes += 1440;
    dayDelta -= 1;
  }
  while (minutes >= 1440) {
    minutes -= 1440;
    dayDelta += 1;
  }
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return { time: `${hh}:${mm}`, dayDelta };
}

export function formatRange(row: HoursRow): string {
  if (!row.opens || !row.closes) return "Closed";
  return `${row.opens}–${row.closes}`;
}

/** A row's hours expressed in another office's time zone, e.g. "02:00–11:00 WAT". */
export function convertedRange(row: HoursRow, from: Office, to: Office): string | null {
  if (!row.opens || !row.closes) return null;
  const a = shiftTime(row.opens, parseUtcOffset(from.utcOffsetLabel), parseUtcOffset(to.utcOffsetLabel));
  const b = shiftTime(row.closes, parseUtcOffset(from.utcOffsetLabel), parseUtcOffset(to.utcOffsetLabel));
  const day = (d: number) => (d < 0 ? " (prev. day)" : d > 0 ? " (next day)" : "");
  return `${a.time}${day(a.dayDelta)}–${b.time}${day(b.dayDelta)} ${to.tzLabel}`;
}

/** Current year in Africa/Lagos — server-side use only. */
export function lagosYear(date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Africa/Lagos" }).format(date));
}

/** "8 Oct 2026, 20:18 WAT" in Africa/Lagos — fixed locale and zone (no hydration differences). */
export function formatLagosDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  }).format(d)} WAT`;
}
