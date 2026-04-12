export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-4 w-72 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}
