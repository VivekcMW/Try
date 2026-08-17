'use client';

export default function AnalyticsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Analytics unavailable</h2>
        <p className="mt-2 text-sm text-red-700">
          We couldn’t load the analytics dashboard. Please retry in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
