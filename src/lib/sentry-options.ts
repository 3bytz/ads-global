import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Shared Sentry options. Sentry stays completely off unless NEXT_PUBLIC_SENTRY_DSN is set.
 * Privacy: no default PII, and request bodies / cookies are stripped so enquiry
 * form contents never leave our systems via error reports.
 */
export const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;

export function scrub(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.authorization;
    }
  }
  delete event.user;
  return event;
}

export const baseSentryOptions = {
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  beforeSend: scrub,
};
