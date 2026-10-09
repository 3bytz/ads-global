import * as Sentry from "@sentry/nextjs";
import { baseSentryOptions, sentryDsn } from "@/lib/sentry-options";

export async function register() {
  if (!sentryDsn) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(baseSentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
