import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · ADS Global admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a1f3d" };

/** Root layout for the admin area (separate from the public [locale] layout). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-tint">
        {children}
      </body>
    </html>
  );
}
