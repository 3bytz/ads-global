import { cn } from "@/lib/utils";

/**
 * Decorative shipping-route line art: a dot grid with dashed great-circle-ish
 * arcs between East Asia and West Africa. Pure SVG (no image request).
 */
export function RouteLines({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const dot = tone === "light" ? "rgb(10 31 61 / 0.12)" : "rgb(255 255 255 / 0.12)";
  const line = tone === "light" ? "rgb(0 78 152 / 0.35)" : "rgb(255 103 0 / 0.55)";
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <pattern id={`dots-${tone}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill={dot} />
        </pattern>
      </defs>
      <rect width="1200" height="600" fill={`url(#dots-${tone})`} />
      <g fill="none" stroke={line} strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round">
        <path d="M980 190 C 820 40, 520 60, 470 330" />
        <path d="M980 190 C 900 420, 640 520, 470 330" />
        <path d="M470 330 C 360 250, 260 230, 150 260" />
      </g>
      <g fill={line}>
        <circle cx="980" cy="190" r="6" />
        <circle cx="470" cy="330" r="6" />
        <circle cx="150" cy="260" r="4" />
      </g>
    </svg>
  );
}
