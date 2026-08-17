export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md border border-gray-200 bg-white shadow-sm" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-md border border-gray-200 bg-white shadow-sm" />
        <div className="h-80 animate-pulse rounded-md border border-gray-200 bg-white shadow-sm" />
      </div>
    </div>
  );
}
