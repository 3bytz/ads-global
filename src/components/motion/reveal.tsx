"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** Fade-and-rise on scroll into view. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Masked line reveal for headlines: each line slides up from behind a mask.
 * Pass the headline as separate lines. The accessible name is the full text.
 */
export function LineReveal({
  lines,
  accentFrom,
  accentClassName = "text-brand",
  className,
  as = "h2",
  id,
}: {
  lines: string[];
  /** Lines with index ≥ accentFrom get `accentClassName` (two-tone headline). */
  accentFrom?: number;
  accentClassName?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
}) {
  const Tag = as;
  return (
    <Tag id={id} className={cn("headline", className)}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={cn("block", accentFrom !== undefined && i >= accentFrom && accentClassName)}
            initial={{ y: "105%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1.05, ease, delay: i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
