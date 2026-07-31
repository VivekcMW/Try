import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initSentry() {
  if (initialized || !process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  initSentry();
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
