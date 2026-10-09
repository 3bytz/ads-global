import "server-only";
import { cache } from "react";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import {
  defaultCategories,
  defaultCertifications,
  defaultClaims,
  defaultLeaders,
  defaultOffices,
  defaultProcessSteps,
  defaultProjects,
  defaultSettings,
  defaultStats,
  defaultStrengths,
} from "@/content/defaults";
import type {
  Category,
  CategoryGroup,
  Certification,
  Claim,
  HoursRow,
  Incoterm,
  Leader,
  Office,
  ProcessStep,
  Project,
  SiteSettings,
  Stat,
  Strength,
} from "@/content/types";

/**
 * Public content reads. Every function:
 *  - uses the cookie-free anon client (RLS: published rows only), so pages stay static/ISR;
 *  - falls back to the built-in defaults when Supabase isn't configured or a query fails,
 *    so the public site never crashes because of the database.
 */

export type ContentSource = "database" | "defaults";

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const strOrNull = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const bool = (v: unknown, fallback = false): boolean => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
};
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

async function selectRows(table: string, columns: string, order = "sort_order"): Promise<Row[] | null> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select(columns).order(order, { ascending: true });
  if (error) {
    console.error(`[content] ${table}:`, error.message);
    return null;
  }
  return (data ?? []) as unknown as Row[];
}

// ------------------------------------------------------------------ settings

export const getSiteSettings = cache(async (): Promise<SiteSettings & { source: ContentSource }> => {
  const rows = await selectRows("site_settings", "key, value", "key");
  if (!rows) return { ...defaultSettings, source: "defaults" };
  const byKey = new Map<string, unknown>(rows.map((r) => [str(r.key), r.value]));
  const part = <K extends keyof SiteSettings>(key: K) => byKey.get(key) as Partial<SiteSettings[K]> | undefined;
  // Shallow-merge each settings group over the defaults so new fields always have a value.
  return {
    company: { ...defaultSettings.company, ...part("company") },
    about: { ...defaultSettings.about, ...part("about") },
    contact: { ...defaultSettings.contact, ...part("contact") },
    socials: { ...defaultSettings.socials, ...part("socials") },
    hero: { ...defaultSettings.hero, ...part("hero") },
    source: "database",
  };
});

// ------------------------------------------------------------------ offices

const OFFICE_COLUMNS =
  "slug, name, legal_entity, registration, country, country_code, city, address, address_confirmed, phone, whatsapp, email, timezone, tz_label, utc_offset_label, is_hq, map_url, hours, hours_confirmed, sort_order";

function mapOffice(r: Row): Office {
  return {
    slug: str(r.slug),
    name: str(r.name),
    legalEntity: strOrNull(r.legal_entity),
    registration: strOrNull(r.registration),
    country: str(r.country),
    countryCode: str(r.country_code).trim(),
    city: str(r.city),
    address: str(r.address),
    addressConfirmed: bool(r.address_confirmed),
    phone: str(r.phone),
    whatsapp: strOrNull(r.whatsapp),
    email: str(r.email),
    timezone: str(r.timezone, "Africa/Lagos"),
    tzLabel: str(r.tz_label),
    utcOffsetLabel: str(r.utc_offset_label),
    isHq: bool(r.is_hq),
    mapUrl: strOrNull(r.map_url),
    hours: Array.isArray(r.hours) ? (r.hours as HoursRow[]) : [],
    hoursConfirmed: bool(r.hours_confirmed),
    sortOrder: num(r.sort_order),
  };
}

export const getOffices = cache(async (): Promise<Office[]> => {
  const rows = await selectRows("offices", OFFICE_COLUMNS);
  return rows ? rows.map(mapOffice) : defaultOffices;
});

// ------------------------------------------------------------------ stats & claims

export const getStats = cache(async (): Promise<Stat[]> => {
  // `note` is internal and not readable by anon (column grants).
  const rows = await selectRows("stats", "key, label, value, prefix, suffix, confirmed, sort_order");
  if (!rows) return defaultStats;
  return rows.map((r) => ({
    key: str(r.key),
    label: str(r.label),
    value: num(r.value),
    prefix: str(r.prefix),
    suffix: str(r.suffix),
    confirmed: bool(r.confirmed),
    note: "",
    sortOrder: num(r.sort_order),
  }));
});

export const getClaims = cache(async (): Promise<Record<string, Claim>> => {
  const rows = await selectRows("claims", "key, label, text, confirmed", "key");
  const list: Claim[] = rows
    ? rows.map((r) => ({ key: str(r.key), label: str(r.label), text: str(r.text), confirmed: bool(r.confirmed), source: "", note: "" }))
    : defaultClaims;
  return Object.fromEntries(list.map((c) => [c.key, c]));
});

// ------------------------------------------------------------------ categories

const CATEGORY_COLUMNS =
  "slug, name, hs_label, category_group, summary, description, example_products, example_products_confirmed, sourcing_regions, sourcing_regions_confirmed, incoterms, image_url, image_alt, image_is_stock, sort_order, published";

function mapCategory(r: Row): Category {
  return {
    slug: str(r.slug),
    name: str(r.name),
    hsLabel: str(r.hs_label),
    group: str(r.category_group, "consumer") as CategoryGroup,
    summary: str(r.summary),
    description: str(r.description),
    exampleProducts: strArr(r.example_products),
    exampleProductsConfirmed: bool(r.example_products_confirmed),
    sourcingRegions: strArr(r.sourcing_regions),
    sourcingRegionsConfirmed: bool(r.sourcing_regions_confirmed),
    incoterms: strArr(r.incoterms) as Incoterm[],
    imageUrl: strOrNull(r.image_url),
    imageAlt: str(r.image_alt),
    imageIsStock: bool(r.image_is_stock, true),
    sortOrder: num(r.sort_order),
    published: bool(r.published, true),
  };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await selectRows("categories", CATEGORY_COLUMNS);
  const list = rows ? rows.map(mapCategory) : defaultCategories;
  return list.filter((c) => c.published);
});

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
});

// ------------------------------------------------------------------ other content

export const getStrengths = cache(async (): Promise<Strength[]> => {
  const rows = await selectRows("strengths", "slug, title, description, icon, sort_order");
  if (!rows) return defaultStrengths;
  return rows.map((r) => ({ slug: str(r.slug), title: str(r.title), description: str(r.description), icon: str(r.icon), sortOrder: num(r.sort_order) }));
});

export const getProcessSteps = cache(async (): Promise<ProcessStep[]> => {
  const rows = await selectRows("process_steps", "slug, title, description, details, image_url, image_alt, sort_order");
  if (!rows) return defaultProcessSteps;
  return rows.map((r) => ({
    slug: str(r.slug),
    title: str(r.title),
    description: str(r.description),
    details: strArr(r.details),
    imageUrl: strOrNull(r.image_url),
    imageAlt: str(r.image_alt),
    sortOrder: num(r.sort_order),
  }));
});

export const getLeaders = cache(async (): Promise<Leader[]> => {
  const rows = await selectRows("leaders", "slug, name, role, bio, photo_url, confirmed, sort_order");
  if (!rows) return defaultLeaders;
  return rows.map((r) => ({
    slug: str(r.slug),
    name: str(r.name),
    role: str(r.role),
    bio: str(r.bio),
    photoUrl: strOrNull(r.photo_url),
    confirmed: bool(r.confirmed),
    sortOrder: num(r.sort_order),
  }));
});

export const getCertifications = cache(async (): Promise<Certification[]> => {
  const rows = await selectRows("certifications", "slug, name, issuer, reference, valid_until, confirmed, sort_order");
  if (!rows) return defaultCertifications;
  return rows.map((r) => ({
    slug: str(r.slug),
    name: str(r.name),
    issuer: str(r.issuer),
    reference: str(r.reference),
    validUntil: strOrNull(r.valid_until),
    confirmed: bool(r.confirmed),
    sortOrder: num(r.sort_order),
  }));
});

const PROJECT_COLUMNS =
  "slug, title, client, location, category_slugs, summary, body, cover_url, cover_alt, published, published_at, sort_order";

export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await selectRows("projects", PROJECT_COLUMNS);
  const list: Project[] = rows
    ? rows.map((r) => ({
        slug: str(r.slug),
        title: str(r.title),
        client: str(r.client),
        location: str(r.location),
        categorySlugs: strArr(r.category_slugs),
        summary: str(r.summary),
        body: str(r.body),
        coverUrl: strOrNull(r.cover_url),
        coverAlt: str(r.cover_alt),
        published: bool(r.published),
        publishedAt: strOrNull(r.published_at),
        sortOrder: num(r.sort_order),
      }))
    : defaultProjects;
  return list.filter((p) => p.published);
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
});
