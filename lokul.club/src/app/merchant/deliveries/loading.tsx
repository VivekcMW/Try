export default function DeliveriesLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="h-12 w-56 animate-pulse rounded-md bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
