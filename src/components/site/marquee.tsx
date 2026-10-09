import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Accent marquee band. Pure CSS (no JS), pauses on hover, and stops under
 * prefers-reduced-motion. Text is navy on orange (5.6:1).
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          <li className="headline px-6 text-[clamp(1.75rem,4vw,3.5rem)] leading-none lg:px-10">{item}</li>
          <li aria-hidden="true" className="text-[clamp(1.25rem,2.5vw,2.25rem)] leading-none">
            ✦
          </li>
        </Fragment>
      ))}
    </ul>
  );

  return (
    <div className={cn("group relative overflow-hidden bg-accent py-6 text-ink lg:py-8", className)}>
      <p className="sr-only">{items.join(", ")}</p>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none" aria-hidden="true">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
