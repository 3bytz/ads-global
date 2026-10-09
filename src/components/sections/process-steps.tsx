import Image from "next/image";
import type { ProcessStep } from "@/content/types";
import { Reveal } from "@/components/motion/reveal";

/** Compact 5-step process (home). */
export function ProcessStepsCompact({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {steps.map((step, i) => (
        <li key={step.slug}>
          <Reveal delay={i * 0.08} className="group flex h-full flex-col">
            <div className="relative aspect-[4/3] overflow-hidden rounded-signature bg-ink">
              {step.imageUrl && (
                <Image
                  src={step.imageUrl}
                  alt={step.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 19vw, (min-width: 768px) 46vw, 92vw"
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              )}
              <span className="headline absolute left-4 top-3 text-6xl text-white drop-shadow-[0_2px_12px_rgb(10_31_61/0.6)]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="headline mt-6 text-3xl">{step.title}</h3>
            <p className="mt-2 text-muted">{step.description}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/** Detailed alternating process (How we work page). */
export function ProcessStepsDetailed({ steps, showFlags }: { steps: ProcessStep[]; showFlags: boolean }) {
  return (
    <ol className="space-y-24 lg:space-y-36">
      {steps.map((step, i) => (
        <li key={step.slug} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className={i % 2 === 0 ? "lg:col-span-7" : "lg:order-2 lg:col-span-7 lg:col-start-6"}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-signature bg-ink">
              {step.imageUrl && (
                <Image src={step.imageUrl} alt={step.imageAlt} fill sizes="(min-width: 1024px) 55vw, 95vw" className="object-cover" />
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1} className={i % 2 === 0 ? "lg:col-span-5" : "lg:order-1 lg:col-span-5"}>
            <p className="headline text-7xl text-accent-ink lg:text-8xl">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="headline mt-2 text-h3">{step.title}</h3>
            <p className="mt-4 text-lead text-muted">{step.description}</p>
            <ul className="mt-6 space-y-3">
              {step.details
                .filter((d) => showFlags || !/\[CONFIRM/i.test(d))
                .map((d) => (
                  <li key={d} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{d}</span>
                  </li>
                ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
