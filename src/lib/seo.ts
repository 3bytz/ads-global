import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";

export const SITE_NAME = "ADS Global Limited";

/** Per-page metadata with an unprefixed canonical URL (one indexed version per page). */
export function pageMetadata({
  title,
  description,
  path,
  noIndex,
}: {
  title?: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}` || siteUrl;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image", title: title ?? SITE_NAME, description },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
