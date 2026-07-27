import Link from 'next/link';
import { SearchX } from 'lucide-react';

/**
 * 404 Not Found page
 * Shown when user navigates to a non-existent route
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-6">
            <SearchX className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-8 max-w-sm mx-auto">
          We couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/web/feed"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] transition-colors"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
