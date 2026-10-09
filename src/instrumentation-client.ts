import * as Sentry from "@sentry/nextjs";
import { baseSentryOptions, sentryDsn } from "@/lib/sentry-options";

// Error monitoring only (no Session Replay: smaller bundle for mobile visitors, no recording of form input).
if (sentryDsn) Sentry.init(baseSentryOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
