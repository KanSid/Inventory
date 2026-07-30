import { UsageTableSkeleton } from "@/components/usage/usage-table-skeleton";

export default function UsageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2 animate-pulse">
        <div className="space-y-1">
          <div className="h-9 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-56 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="h-9 w-32 rounded-md bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <UsageTableSkeleton canEdit />
    </div>
  );
}
