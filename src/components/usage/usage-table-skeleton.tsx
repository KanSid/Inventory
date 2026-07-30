import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`h-4 rounded bg-neutral-200 dark:bg-neutral-700 ${className}`} />;
}

export function UsageTableSkeleton({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="animate-pulse">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bride</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Logged By</TableHead>
                {canEdit && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><SkeletonBar className="w-16" /></TableCell>
                  <TableCell><SkeletonBar className="w-24" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                      <SkeletonBar className="w-48" />
                    </div>
                  </TableCell>
                  <TableCell><SkeletonBar className="w-14" /></TableCell>
                  <TableCell className="text-right"><SkeletonBar className="w-12 ml-auto" /></TableCell>
                  <TableCell><SkeletonBar className="w-20" /></TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="h-7 w-7 rounded bg-neutral-200 dark:bg-neutral-700 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <SkeletonBar className="w-40" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded border" />
          <SkeletonBar className="w-32" />
          <div className="h-7 w-7 rounded border" />
        </div>
      </div>
    </div>
  );
}
