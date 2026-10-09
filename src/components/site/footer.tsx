import Link from "next/link";
import { Logo } from "./logo";
import { legalNav, primaryNav, quoteHref } from "./nav";
import { ButtonLink } from "@/components/ui/button-link";
import { getCategories, getOffices, getSiteSettings } from "@/lib/content/queries";
import { formatPhone, telHref } from "@/lib/utils";
import { lagosYear } from "@/lib/time";

const socialLabels = { linkedin: "LinkedIn", x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram" } as const;

export async function Footer() {
  const [settings, offices, categories] = await Promise.all([getSiteSettings(), getOffices(), getCategories()]);
  const socials = (Object.keys(socialLabels) as Array<keyof typeof socialLabels>)
    .map((key) => ({ key, label: socialLabels[key], href: settings.socials[key] }))
    .filter((s): s is { key: keyof typeof socialLabels; label: string; href: string } => Boolean(s.href));
  // Server component: the year is computed once on the server (Africa/Lagos), so it can't mismatch on hydration.
  const year = lagosYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="wrap pt-24 pb-10 lg:pt-32">
        <div className="grid gap-12 border-b border-line-dark pb-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="headline text-h2 text-white">
              Ready to move <span className="text-accent">your next shipment?</span>
            </p>
            <p className="mt-6 measure text-muted-on-dark">{settings.company.shortDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={quoteHref}>Request a quote</ButtonLink>
              <ButtonLink href="/contact" variant="outline-light">
                Contact us
              </ButtonLink>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="eyebrow text-accent">Explore</h2>
              <ul className="mt-5 space-y-3">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white/90 transition-colors hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow text-accent">Products</h2>
              <ul className="mt-5 space-y-3">
                {categories.slice(0, 7).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/products/${c.slug}`} className="text-white/90 transition-colors hover:text-accent">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products" className="font-semibold text-accent underline-offset-4 hover:underline">
                    All {categories.length} categories
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="eyebrow text-accent">Offices</h2>
              <ul className="mt-5 space-y-6">
                {offices.map((o) => (
                  <li key={o.slug} className="space-y-1">
                    <p className="font-semibold">
                      {o.city}, {o.country}
                    </p>
                    <p>
                      <a href={telHref(o.phone)} className="text-white/90 hover:text-accent">
                        {formatPhone(o.phone)}
                      </a>
                    </p>
                    {o.email !== settings.contact.generalEmail && (
                      <p>
                        <a href={`mailto:${o.email}`} className="break-all text-white/90 hover:text-accent">
                          {o.email}
                        </a>
                      </p>
                    )}
                  </li>
                ))}
                <li>
                  <a href={`mailto:${settings.contact.generalEmail}`} className="break-all text-white/90 hover:text-accent">
                    {settings.contact.generalEmail}
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-6 pt-8 text-sm text-muted-on-dark md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Logo tone="light" className="h-8" />
            <p>
              © {year} {settings.company.legalName}. All rights reserved.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="headline text-outline pointer-events-none -mb-[0.18em] select-none text-center text-[clamp(5rem,22vw,26rem)] leading-none text-white/10"
      >
        ADS Global
      </p>
    </footer>
  );
}
