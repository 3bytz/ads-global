export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <div className="h-4 w-24 animate-pulse rounded bg-line" />
      <div className="h-12 w-72 animate-pulse rounded bg-line" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white" />
    </div>
  );
}
