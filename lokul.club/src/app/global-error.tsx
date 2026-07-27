'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';

/**
 * Global error boundary
 * Catches errors in the root layout
 * Must be a Client Component
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);

    // Report to error tracking
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          isGlobal: true,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-50 p-6">
                <ServerCrash className="h-16 w-16 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Critical Error
            </h1>

            {/* Description */}
            <p className="text-base text-gray-600 mb-8 max-w-sm mx-auto">
              We encountered a critical error. Our team has been notified. Please try reloading the page.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
