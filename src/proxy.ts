import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";
import { updateAdminSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 proxy (formerly "middleware").
 *  1. /admin/**: refresh the Supabase session and guard the area.
 *  2. Public pages: serve the default locale without a prefix by rewriting
 *     `/about` → `/en/about`. Already-prefixed paths pass through untouched
 *     (generated OG images live under `/en/…`); canonical tags always point
 *     at the unprefixed URL, so search engines index one version.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return updateAdminSession(request);
  }

  const first = pathname.split("/")[1] ?? "";
  if ((locales as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Everything except Next internals, route handlers, static assets and files with an extension.
    "/((?!_next/|api/|auth/|brand/|images/|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
