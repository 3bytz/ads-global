import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Circular rotating text badge (CSS animation, stops under reduced motion).
 * Decorative: hidden from assistive tech.
 */
export function RotatingBadge({ text, className }: { text: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div aria-hidden="true" className={cn("relative grid size-36 place-items-center rounded-full bg-accent text-ink lg:size-44", className)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path id={`badge-${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text className="fill-current font-sans text-[15px] font-semibold uppercase" letterSpacing="4.2">
          <textPath href={`#badge-${id}`}>{text}</textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
