'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/web/feed';

  const handleSignIn = () => {
    // Redirect to login with return URL
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleCreateAccount = () => {
    router.push(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-50 p-6">
            <Lock className="h-16 w-16 text-[#1D65AF]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-8 max-w-sm mx-auto">
          You need to sign in to access this page. Create an account or sign in to continue.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleCreateAccount}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#1D65AF] text-[#1D65AF] font-medium hover:bg-blue-50 transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 401 Unauthorized page
 * Shown when user tries to access protected content without authentication
 * Usage: redirect to /unauthorized?returnUrl=/protected/page
 */
export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
