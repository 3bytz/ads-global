"use client";

import { useEffect, useRef } from "react";

/**
 * Optional hero loop. Server HTML has no `src`, so nothing downloads on mobile.
 * The source is attached only on ≥768px screens, without reduced motion and
 * without the Save-Data hint. The optimised hero photo underneath acts as the poster.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (!wide || reduce || saveData) return;
    video.src = src;
    video.play().catch(() => {
      /* autoplay blocked: poster stays */
    });
  }, [src]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 hidden size-full object-cover md:block"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
