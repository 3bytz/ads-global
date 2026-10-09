"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/** Public error boundary: friendly message, retry, and a way to reach a human. */
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-end bg-ink text-white">
      <div className="wrap pb-20 pt-40">
        <p className="eyebrow text-accent">Something went wrong</p>
        <h1 className="headline mt-6 text-h1">
          <span className="block">We hit a snag.</span>
          <span className="block text-accent">Please try again.</span>
        </h1>
        <p className="mt-8 measure text-lead text-white/85">
          The page didn&apos;t load properly. If it keeps happening, email{" "}
          <a href="mailto:info@adsglobaltd.com" className="font-semibold text-accent underline underline-offset-4">
            info@adsglobaltd.com
          </a>
          {error.digest ? ` and quote code ${error.digest}` : ""}.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="min-h-12 rounded-full bg-accent px-6 font-semibold text-ink">
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
