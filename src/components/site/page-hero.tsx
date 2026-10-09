import Image from "next/image";
import type { ReactNode } from "react";
import { HeroVideo } from "./hero-video";
import { cn } from "@/lib/utils";

/**
 * Navy page hero used at the top of every public page (the header sits on top
 * of it in its transparent state). Full-bleed photo with dark overlay and a
 * slow Ken Burns drift. The headline rises in with a pure-CSS masked reveal, so
 * it paints before JavaScript loads (good for LCP); reduced motion disables it.
 */
export function PageHero({
  eyebrow,
  line1,
  line2,
  children,
  image,
  videoUrl,
  size = "page",
  className,
}: {
  eyebrow: string;
  line1: string;
  line2?: string;
  children?: ReactNode;
  image?: { src: string; alt: string } | null;
  /** Optional muted loop — desktop only, never autoplays on mobile or with reduced motion / data saver. */
  videoUrl?: string | null;
  size?: "home" | "page" | "compact";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex overflow-hidden bg-ink text-white",
        size === "home" && "min-h-[100svh] items-end",
        size === "page" && "min-h-[72svh] items-end",
        size === "compact" && "min-h-[48svh] items-end",
        className,
      )}
    >
      {image ? (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            fetchPriority="high"
            quality={60}
            sizes="100vw"
            className="animate-ken-burns object-cover motion-reduce:animate-none"
          />
          {videoUrl && <HeroVideo src={videoUrl} />}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_31_61/0.6)_0%,rgb(10_31_61/0.3)_38%,rgb(10_31_61/0.94)_100%)]" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-70 [background-image:linear-gradient(var(--color-line-dark)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-dark)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_72%)]"
        />
      )}

      <div className="wrap pb-14 pt-36 lg:pb-24">
        <p className="eyebrow flex animate-fade-up items-center gap-3 text-accent">
          <span aria-hidden="true" className="h-px w-10 bg-accent" />
          {eyebrow}
        </p>
        <h1 className={cn("headline mt-6", size === "home" ? "text-display" : "text-h1")}>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="block animate-rise [animation-delay:120ms]">{line1}</span>
          </span>
          {line2 && (
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="block animate-rise text-accent [animation-delay:240ms]">{line2}</span>
            </span>
          )}
        </h1>
        {children && <div className="mt-8 animate-fade-up [animation-delay:420ms] lg:mt-10">{children}</div>}
      </div>
    </section>
  );
}
