export default function SubscribersLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
