import type { ClaimsMode, Stat } from "@/content/types";
import { Counter } from "@/components/motion/counter";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { claimVisibility } from "@/lib/content/claims";

/** Navy band with faint grid lines and animated counters. Unconfirmed stats follow the claims mode. */
export function StatsBand({ stats, mode, title = "ADS Global in numbers" }: { stats: Stat[]; mode: ClaimsMode; title?: string }) {
  const visible = stats
    .map((s) => ({ s, vis: claimVisibility(s.confirmed, mode) }))
    .filter((x) => x.vis !== "hide");
  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="stats-title" className="relative overflow-hidden bg-ink py-24 text-white lg:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:linear-gradient(var(--color-line-dark)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-dark)_1px,transparent_1px)] [background-size:96px_96px]"
      />
      <div className="wrap relative">
        <h2 id="stats-title" className="eyebrow text-accent">
          {title}
        </h2>
        <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-signature bg-line-dark sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ s, vis }) => (
            <div key={s.key} className="flex flex-col-reverse gap-3 bg-ink p-8 lg:p-10">
              <dt className="text-muted-on-dark">
                {s.label}
                {vis === "flag" && <Unconfirmed className="ml-2 text-accent" />}
              </dt>
              <dd className="headline text-[clamp(3.5rem,7vw,7rem)] leading-none">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
