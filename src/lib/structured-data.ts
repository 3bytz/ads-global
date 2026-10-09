import type { Category, Office, SiteSettings } from "@/content/types";
import { siteUrl } from "@/lib/env";

const ORG_ID = `${siteUrl}/#organization`;

export function organizationLd(settings: SiteSettings, offices: Office[]) {
  const sameAs = Object.values(settings.socials).filter((v): v is string => Boolean(v));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: settings.company.legalName,
    alternateName: settings.company.name,
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-blue.png`,
    email: settings.contact.generalEmail,
    description: settings.company.shortDescription,
    ...(sameAs.length ? { sameAs } : {}),
    contactPoint: offices.map((o) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: o.phone,
      email: o.email,
      areaServed: o.countryCode,
      availableLanguage: ["English"],
    })),
  };
}

const dayMap: Record<string, string[]> = {
  "Mon–Fri": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  Saturday: ["Saturday"],
  Sunday: ["Sunday"],
};

export function localBusinessLd(office: Office) {
  const hours = office.hoursConfirmed
    ? office.hours
        .filter((h) => h.opens && h.closes && dayMap[h.days])
        .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayMap[h.days], opens: h.opens, closes: h.closes }))
    : [];
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/contact#${office.slug}`,
    name: office.legalEntity ? `${office.legalEntity} — ${office.city}` : `ADS Global Limited — ${office.city}`,
    parentOrganization: { "@id": ORG_ID },
    telephone: office.phone,
    email: office.email,
    url: `${siteUrl}/contact`,
    address: {
      "@type": "PostalAddress",
      addressLocality: office.city,
      addressCountry: office.countryCode,
      ...(office.addressConfirmed ? { streetAddress: office.address } : {}),
    },
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
  };
}

export function serviceLd(category: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: category.name,
    serviceType: category.group === "services" ? category.name : `${category.name} sourcing and export`,
    description: category.description,
    url: `${siteUrl}/products/${category.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: ["Nigeria", "West Africa", "Africa", "China"],
    ...(category.imageUrl ? { image: category.imageUrl } : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
