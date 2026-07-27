'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

/**
 * 403 Forbidden page
 * Shown when user is authenticated but lacks permission to access a resource
 */
export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-50 p-6">
            <ShieldX className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Permission Denied
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-8 max-w-sm mx-auto">
          You don't have permission to view this page. Contact your community admin if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push('/web/feed')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
