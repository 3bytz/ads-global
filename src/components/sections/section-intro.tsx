import type { ReactNode } from "react";
import { LineReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Eyebrow + two-tone masked headline + optional lead. */
export function SectionIntro({
  eyebrow,
  lines,
  accentFrom = 1,
  lead,
  tone = "light",
  id,
  className,
  align = "left",
}: {
  eyebrow: string;
  lines: string[];
  accentFrom?: number;
  lead?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
  align?: "left" | "center";
}) {
  const dark = tone === "dark";
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow flex items-center gap-3", dark ? "text-accent" : "text-accent-ink", align === "center" && "justify-center")}>
        <span aria-hidden="true" className={cn("h-px w-8", dark ? "bg-accent" : "bg-accent-ink")} />
        {eyebrow}
      </p>
      <LineReveal
        id={id}
        lines={lines}
        accentFrom={accentFrom}
        accentClassName={dark ? "text-accent" : "text-brand"}
        className={cn("mt-5 text-h2", dark ? "text-white" : "text-ink")}
      />
      {lead && (
        <div className={cn("mt-6 measure text-lead", dark ? "text-muted-on-dark" : "text-muted", align === "center" && "mx-auto")}>{lead}</div>
      )}
    </div>
  );
}
