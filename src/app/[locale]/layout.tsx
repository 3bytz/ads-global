import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { fontVariables } from "@/lib/fonts";
import { htmlLang, isLocale, locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/env";
import { SITE_NAME } from "@/lib/seo";
import { getOffices, getSiteSettings } from "@/lib/content/queries";
import { MotionProvider } from "@/components/motion/motion-provider";
import { CookieNotice } from "@/components/site/cookie-notice";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${SITE_NAME} — ${settings.company.positioning}`, template: `%s | ${SITE_NAME}` },
    description: settings.company.shortDescription,
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: "website", locale: "en_GB" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a1f3d",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, offices] = await Promise.all([getSiteSettings(), getOffices()]);

  return (
    // suppressHydrationWarning only here and on <body>: browser extensions inject attributes.
    <html lang={htmlLang[locale]} className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-accent px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <CookieNotice />
        </MotionProvider>
        <JsonLd data={organizationLd(settings, offices)} />
      </body>
    </html>
  );
}
