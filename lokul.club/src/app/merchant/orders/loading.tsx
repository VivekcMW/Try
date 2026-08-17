export default function OrdersLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-md bg-gray-200" />
    </div>
  );
}
