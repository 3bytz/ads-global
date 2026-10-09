import Link from "next/link";
import type { ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Calm admin primitives (white cards on the tint background, navy text, one orange accent). */

export function AdminHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        {eyebrow && <p className="eyebrow text-accent-ink">{eyebrow}</p>}
        <h1 className="headline mt-2 text-5xl">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className }: { title?: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-line bg-white p-6 lg:p-8", className)}>
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && <div className="mt-1 text-sm text-muted">{description}</div>}
      <div className={cn(title || description ? "mt-6" : "")}>{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "new" | "progress" | "quoted" | "won" | "lost" | "closed" | "warn" }) {
  const tones = {
    neutral: "bg-tint text-ink",
    new: "bg-accent/15 text-accent-ink",
    progress: "bg-brand/10 text-brand",
    quoted: "bg-[#ece7fb] text-[#4b2fa3]",
    won: "bg-success/10 text-success",
    lost: "bg-danger/10 text-danger",
    closed: "bg-line text-muted",
    warn: "bg-accent/15 text-accent-ink",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function AdminLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
        variant === "primary" ? "bg-ink text-white hover:bg-ink-2" : "border border-line bg-white text-ink hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}

export function StockPhotoNote() {
  return (
    <p className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs font-semibold text-accent-ink">
      <ImageOff className="size-4" aria-hidden="true" />
      Stock photo — replace with a company photo when available.
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}
