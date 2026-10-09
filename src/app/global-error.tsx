"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/** Last-resort boundary (replaces the root layout), so it renders its own <html>. Inline styles only. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a1f3d", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ color: "#ff6700", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 13 }}>ADS Global Limited</p>
            <h1 style={{ fontSize: 40, lineHeight: 1.05, margin: "16px 0" }}>Something went wrong.</h1>
            <p style={{ color: "#a9b8cc", lineHeight: 1.6 }}>
              Please try again. If the problem continues, email <a href="mailto:info@adsglobaltd.com" style={{ color: "#ff6700" }}>info@adsglobaltd.com</a>
              {error.digest ? ` (code ${error.digest})` : ""}.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 24, minHeight: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#ff6700", color: "#0a1f3d", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
