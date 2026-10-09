"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-white p-8">
      <p className="eyebrow text-danger">Error</p>
      <h1 className="headline mt-2 text-4xl">This page couldn&apos;t load.</h1>
      <p className="mt-3 text-muted">
        {error.message.includes("Supabase is not configured")
          ? "Supabase isn't configured — check the environment variables."
          : "Try again. If it keeps failing, check the database connection or contact the developer."}
        {error.digest && <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span>}
      </p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">
        Try again
      </button>
    </div>
  );
}
