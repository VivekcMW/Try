'use client';

export default function OffersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-6">
      <div className="max-w-md rounded-md border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Offers unavailable</h2>
        <p className="mt-2 text-sm text-red-700">We couldn’t load your active offers. Please retry.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
