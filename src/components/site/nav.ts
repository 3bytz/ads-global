export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Products & services", href: "/products" },
  { label: "How we work", href: "/how-we-work" },
  { label: "Projects", href: "/projects" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

export const quoteHref = "/request-a-quote";

export const legalNav: NavItem[] = [
  { label: "Privacy policy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
];
