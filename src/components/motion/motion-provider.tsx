"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import Lenis from "lenis";

/**
 * Global motion setup:
 *  - MotionConfig reducedMotion="user": Motion skips transform/opacity animations
 *    when the visitor prefers reduced motion.
 *  - Lenis smooth scrolling, only when motion is allowed and the device has a
 *    fine pointer (no smooth-scroll hijacking on touch devices).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !finePointer) return;

    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    return () => lenis.destroy();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
