export default function BroadcastLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-md bg-gray-200" />
        <div className="h-80 animate-pulse rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
