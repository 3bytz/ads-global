"use client";

import { LocalTime, useIsOpen } from "@/components/ui/local-time";
import { cn } from "@/lib/utils";

/** Live clock + open/closed pill. Renders neutral placeholders on the server (no hydration mismatch). */
export function OfficeStatus({
  timeZone,
  tzLabel,
  opens,
  closes,
  tone = "dark",
}: {
  timeZone: string;
  tzLabel: string;
  opens?: string | null;
  closes?: string | null;
  tone?: "dark" | "light";
}) {
  const open = useIsOpen(timeZone, opens ?? "09:00", closes ?? "18:00");
  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <p className="headline text-[clamp(3.5rem,6vw,6rem)] leading-none tabular-nums">
        <LocalTime timeZone={timeZone} />
        <span className={cn("ml-2 align-top text-xl", tone === "dark" ? "text-muted-on-dark" : "text-muted")}>{tzLabel}</span>
      </p>
      <p
        className={cn(
          "mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
          tone === "dark" ? "bg-white/10 text-white" : "bg-tint text-ink",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", open === null ? "bg-white/40" : open ? "bg-[#3ccf8e]" : "bg-accent")}
        />
        {open === null ? "Local time" : open ? "Open now" : "Closed now"}
      </p>
    </div>
  );
}
