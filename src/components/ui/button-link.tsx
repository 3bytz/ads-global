import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "light" | "dark" | "outline-light" | "outline-dark";

const variants: Record<Variant, { pill: string; circle: string }> = {
  // Orange pill takes NAVY text (5.6:1). White on orange fails contrast.
  accent: { pill: "bg-accent text-ink hover:bg-[#ff7a1f]", circle: "bg-ink text-accent" },
  light: { pill: "bg-white text-ink hover:bg-tint", circle: "bg-accent text-ink" },
  dark: { pill: "bg-ink text-white hover:bg-ink-2", circle: "bg-accent text-ink" },
  "outline-light": { pill: "border border-white/40 text-white hover:border-white hover:bg-white/5", circle: "bg-white text-ink" },
  "outline-dark": { pill: "border border-ink/25 text-ink hover:border-ink", circle: "bg-ink text-white" },
};

type Props = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Hide the circular arrow (e.g. in tight UI). */
  plain?: boolean;
};

/** Pill button with the circular arrow badge. Renders a Next <Link>. */
export function ButtonLink({ children, variant = "accent", className, plain, ...props }: Props) {
  const v = variants[variant];
  return (
    <Link
      {...props}
      className={cn(
        "group inline-flex min-h-12 items-center gap-3 rounded-full py-1.5 pl-6 font-semibold transition-colors duration-300",
        plain ? "pr-6" : "pr-1.5",
        v.pill,
        className,
      )}
    >
      <span>{children}</span>
      {!plain && (
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45",
            v.circle,
          )}
        >
          <ArrowUpRight className="size-4" strokeWidth={2.25} />
        </span>
      )}
    </Link>
  );
}
