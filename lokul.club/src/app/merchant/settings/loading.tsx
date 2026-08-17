export default function SettingsLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md border border-gray-200 bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-md border border-gray-200 bg-white shadow-sm" />
    </div>
  );
}
