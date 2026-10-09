import { cn } from "@/lib/utils";

/** Giant outlined word that sits behind a section transition. Decorative. */
export function OutlinedWord({ word, className, tone = "light" }: { word: string; className?: string; tone?: "light" | "dark" }) {
  return (
    <p
      aria-hidden="true"
      className={cn(
        "headline text-outline pointer-events-none select-none whitespace-nowrap text-[clamp(6rem,24vw,30rem)] leading-[0.8]",
        tone === "light" ? "text-ink/[0.07]" : "text-white/[0.08]",
        className,
      )}
    >
      {word}
    </p>
  );
}
