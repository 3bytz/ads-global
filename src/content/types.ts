/**
 * Content model shared by the database, the seed generator and the
 * no-database fallback. Field names are camelCase here; the data layer maps
 * them to/from snake_case columns.
 */

export type CategoryGroup = "consumer" | "industrial" | "automotive_transport" | "services";

export const categoryGroupLabels: Record<CategoryGroup, string> = {
  consumer: "Consumer goods",
  industrial: "Industrial",
  automotive_transport: "Automotive & transport",
  services: "Services",
};

export type Incoterm = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "CPT" | "CIP" | "DAP" | "DPU" | "DDP";

export interface Category {
  slug: string;
  name: string;
  /** HS-code-style label, e.g. "HS 84". Indicative customs chapters, not a company claim. */
  hsLabel: string;
  group: CategoryGroup;
  summary: string;
  description: string;
  exampleProducts: string[];
  /** false until ADS confirms the example product list. */
  exampleProductsConfirmed: boolean;
  sourcingRegions: string[];
  sourcingRegionsConfirmed: boolean;
  incoterms: Incoterm[];
  imageUrl: string | null;
  imageAlt: string;
  /** true while the image is a stock photo; admin shows "Replace with company photo". */
  imageIsStock: boolean;
  sortOrder: number;
  published: boolean;
}

export interface HoursRow {
  /** e.g. "Mon–Fri" */
  days: string;
  /** 24h local time "09:00", or null when closed */
  opens: string | null;
  closes: string | null;
  note?: string;
}

export interface Office {
  slug: string;
  name: string;
  /** Registered company that operates this office (from the letterhead). */
  legalEntity: string | null;
  /** e.g. "RC 8079004" (Nigeria CAC). */
  registration: string | null;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  city: string;
  address: string;
  addressConfirmed: boolean;
  phone: string; // E.164
  whatsapp: string | null; // E.164, null until confirmed
  email: string;
  timezone: string; // IANA
  tzLabel: string; // e.g. "WAT"
  utcOffsetLabel: string; // e.g. "UTC+1"
  isHq: boolean;
  mapUrl: string | null;
  hours: HoursRow[];
  hoursConfirmed: boolean;
  sortOrder: number;
}

export interface Stat {
  key: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  /** Unconfirmed stats are flagged (preview) or hidden (live) depending on settings.claimsMode. */
  confirmed: boolean;
  note: string;
  sortOrder: number;
}

export interface Claim {
  key: string;
  label: string;
  /** Text shown on the site once confirmed. */
  text: string;
  /** Where the claim appeared on the old site. */
  source: string;
  confirmed: boolean;
  note: string;
}

export interface Strength {
  slug: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  sortOrder: number;
}

export interface ProcessStep {
  slug: string;
  title: string;
  description: string;
  details: string[];
  imageUrl: string | null;
  imageAlt: string;
  sortOrder: number;
}

export interface Value {
  title: string;
  description: string;
}

export interface Leader {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  confirmed: boolean;
  sortOrder: number;
}

export interface Certification {
  slug: string;
  name: string;
  issuer: string;
  reference: string;
  validUntil: string | null;
  confirmed: boolean;
  sortOrder: number;
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  location: string;
  categorySlugs: string[];
  summary: string;
  body: string;
  coverUrl: string | null;
  coverAlt: string;
  published: boolean;
  publishedAt: string | null;
  sortOrder: number;
}

export type ClaimsMode = "flag" | "hide";

export interface CompanySettings {
  name: string;
  legalName: string;
  tagline: string;
  positioning: string;
  shortDescription: string;
  /** "flag" shows unconfirmed claims with a visible marker (pre-launch). "hide" removes them (live). */
  claimsMode: ClaimsMode;
}

export interface AboutSettings {
  story: string[];
  mission: string;
  vision: string;
  /** The conflicting second version from the old About section, kept for review. */
  alternateMission: string;
  alternateVision: string;
  missionVisionConfirmed: boolean;
  values: Value[];
}

export interface ContactSettings {
  generalEmail: string;
  partnersEmail: string;
  website: string;
  primaryPhone: string;
  /** Office slug that receives enquiries when no routing rule matches. */
  defaultOfficeSlug: string;
}

export interface SocialSettings {
  linkedin: string | null;
  x: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface HeroSettings {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subhead: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Optional muted loop for desktop only. Null = photo hero. */
  videoUrl: string | null;
}

export interface SiteSettings {
  company: CompanySettings;
  about: AboutSettings;
  contact: ContactSettings;
  socials: SocialSettings;
  hero: HeroSettings;
}

export interface RoutingRule {
  countryCode: string;
  officeSlug: string;
}
