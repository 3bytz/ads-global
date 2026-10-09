"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "motion/react";

/**
 * Scroll-linked "card → full-bleed → card" image. The section is taller than
 * the viewport; the image is sticky and its clip-path inset/radius open up to
 * full-bleed at the middle of the scroll, then close again.
 * Reduced motion: renders a static card.
 */
export function ScrollExpandImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0.1, 0.45, 0.55, 0.9], [7, 0, 0, 7]);
  const radius = useTransform(scrollYProgress, [0.1, 0.45, 0.55, 0.9], [140, 0, 0, 140]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.15]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round 6px 6px ${radius}px 6px)`;

  if (reduce) {
    return (
      <figure className="wrap section-pad">
        <div className="rounded-signature relative aspect-[16/9] overflow-hidden">
          <Image src={src} alt={alt} fill sizes="95vw" quality={60} className="object-cover" />
        </div>
        {caption && <figcaption className="mt-4 text-sm text-muted">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div ref={ref} className="relative h-[180vh]">
      <figure className="sticky top-0 h-svh overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image src={src} alt={alt} fill sizes="100vw" quality={60} className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-ink/25" />
        </motion.div>
        {caption && (
          <figcaption className="wrap headline absolute inset-x-0 bottom-[10vh] text-h2 text-white drop-shadow-[0_2px_20px_rgb(10_31_61/0.6)]">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
