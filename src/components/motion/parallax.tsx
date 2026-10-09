"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Restrained vertical parallax (±distance px) while the element crosses the viewport.
 * `fill`: the moving layer is oversized (absolute, -12% top/bottom) so a fill image never shows gaps;
 * give the wrapper `relative overflow-hidden` and a size.
 */
export function Parallax({
  children,
  distance = 60,
  className,
  fill,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
  fill?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className={fill ? "absolute inset-x-0 -inset-y-[12%]" : "relative h-full w-full"}>
        {children}
      </motion.div>
    </div>
  );
}
