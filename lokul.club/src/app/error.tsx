'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { captureError } from '@/lib/sentry';

/**
 * Error boundary for catching errors in the app
 * Automatically wraps all pages in the app directory
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
    captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-50 p-6">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-2 max-w-sm mx-auto">
          We're experiencing technical difficulties. Our team has been notified and is working to fix the issue.
        </p>

        {/* Error detail in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/web/feed"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
