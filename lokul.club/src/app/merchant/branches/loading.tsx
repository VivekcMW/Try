export default function BranchesLoading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
