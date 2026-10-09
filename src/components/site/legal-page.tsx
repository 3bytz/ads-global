import type { ReactNode } from "react";
import { PageHero } from "./page-hero";

/** Shared layout for legal pages: compact hero, readable measure, styled headings. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero size="compact" eyebrow={`Legal · Last updated ${updated}`} line1={title} />
      <div className="section-pad pt-16!">
        <article className="wrap">
          <div className="measure space-y-5 text-[1.0625rem] leading-relaxed [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_h2]:headline [&_h2]:pt-8 [&_h2]:text-4xl [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </article>
      </div>
    </>
  );
}

/** Highlighted note for facts the company must still confirm. */
export function ConfirmNote({ children }: { children: ReactNode }) {
  return <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.95em] font-medium text-accent-ink">[CONFIRM: {children}]</span>;
}
