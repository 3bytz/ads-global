import Image from "next/image";
import type { ClaimsMode, Office } from "@/content/types";
import { OfficeStatus } from "./office-status";
import { Unconfirmed } from "@/components/ui/unconfirmed";
import { stockImages, pexelsUrl } from "@/content/image-credits";
import { formatPhone, telHref } from "@/lib/utils";

const officeImage: Record<string, { src: string; alt: string }> = {
  shenyang: { src: pexelsUrl(stockImages.shenyang.id, 1600), alt: stockImages.shenyang.alt },
  abuja: { src: pexelsUrl(stockImages.abuja.id, 1600), alt: stockImages.abuja.alt },
  kano: { src: pexelsUrl(stockImages.kano.id, 1600), alt: stockImages.kano.alt },
};

/** Dual-office band: photo, live local time, open/closed, phone and email for each office. */
export function OfficesBand({ offices, mode }: { offices: Office[]; mode: ClaimsMode }) {
  return (
    <section aria-labelledby="offices-title" className="bg-ink py-24 text-white lg:py-36">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="offices-title" className="headline text-h2">
            {offices.length} offices. <span className="text-accent">Two time zones.</span>
          </h2>
          <p className="measure text-muted-on-dark">
            Shenyang and Shandong in China, Abuja and Kano in Nigeria: one team working the China–Africa trade lane across seven hours of time difference.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 lg:grid-cols-2">
          {offices.map((o) => {
            const img = officeImage[o.slug];
            const weekday = o.hours[0];
            return (
              <li key={o.slug} className="relative overflow-hidden rounded-signature bg-ink-2">
                {img && (
                  <div className="absolute inset-0">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 47vw, 95vw" className="object-cover opacity-35" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_31_61/0.4),rgb(10_31_61/0.95))]" />
                  </div>
                )}
                <div className="relative flex min-h-[26rem] flex-col justify-between gap-10 p-8 pb-10 pr-[max(2rem,calc(var(--signature-radius)*0.5))] lg:pl-12 lg:pt-12 lg:pb-14">
                  <div>
                    <p className="eyebrow text-accent">
                      {o.isHq ? "Headquarters" : "Regional office"} · {o.utcOffsetLabel}
                    </p>
                    <h3 className="headline mt-3 text-5xl lg:text-6xl">{o.city}</h3>
                    <p className="text-muted-on-dark">
                      {o.legalEntity ? `${o.country} · ${o.legalEntity}` : o.country}
                      {!o.addressConfirmed && mode === "flag" && <Unconfirmed className="ml-2 text-accent" label="Address to confirm" />}
                    </p>
                  </div>
                  <div className="space-y-6">
                    <OfficeStatus timeZone={o.timezone} tzLabel={o.tzLabel} opens={weekday?.opens} closes={weekday?.closes} />
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-white/90">
                      <a href={telHref(o.phone)} className="hover:text-accent">
                        {formatPhone(o.phone)}
                      </a>
                      <a href={`mailto:${o.email}`} className="hover:text-accent">
                        {o.email}
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
