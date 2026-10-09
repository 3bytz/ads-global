import { BadgeCheck, Check, Globe, Handshake, LayoutGrid, Network, ShieldCheck, Ship, Truck, Users, type LucideIcon } from "lucide-react";
import type { Strength } from "@/content/types";
import { Reveal } from "@/components/motion/reveal";

/** Only the icons admins can pick from (keeps the bundle small). */
export const strengthIcons: Record<string, LucideIcon> = { LayoutGrid, BadgeCheck, Network, Users, Handshake, Check, Globe, ShieldCheck, Ship, Truck };

export function StrengthsGrid({ strengths }: { strengths: Strength[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-signature bg-line sm:grid-cols-2 lg:grid-cols-3">
      {strengths.map((s, i) => {
        const Icon = strengthIcons[s.icon] ?? Check;
        return (
          <li key={s.slug} className="bg-white">
            <Reveal delay={i * 0.06} className="h-full p-8 lg:p-10">
              <span className="grid size-14 place-items-center rounded-full bg-tint text-brand">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="headline mt-6 text-3xl">{s.title}</h3>
              <p className="mt-3 text-muted">{s.description}</p>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
