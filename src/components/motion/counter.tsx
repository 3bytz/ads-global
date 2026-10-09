"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Animated number. The server renders the final value (good for SEO and
 * no-JS); on the client it counts up from 0 the first time it scrolls into view.
 * Formatting is fixed to en-GB so server and client output always match.
 */
const fmt = new Intl.NumberFormat("en-GB");

export function Counter({ value, prefix = "", suffix = "", className }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || started.current) return;
    if (!inView) {
      el.textContent = fmt.format(0);
      return;
    }
    started.current = true;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = fmt.format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span className={className}>
      {prefix}
      <span ref={ref} className="tabular-nums">
        {fmt.format(value)}
      </span>
      {suffix}
    </span>
  );
}
