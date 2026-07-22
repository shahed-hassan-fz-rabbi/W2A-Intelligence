export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />
    </div>
  );
}