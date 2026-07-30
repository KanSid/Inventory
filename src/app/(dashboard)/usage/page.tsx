import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { UsageTableSkeleton } from "@/components/usage/usage-table-skeleton";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { formatDate, formatQuantity } from "@/lib/utils";

const PAGE_SIZE = 100;

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();

  const { page: pageParam } = await searchParams;
  const parsedPage = parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Usage"
        description="Material consumption log"
        action={
          canEdit ? (
            <Link href="/usage/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Log Usage
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Suspense key={page} fallback={<UsageTableSkeleton canEdit={canEdit} />}>
        <UsageTable page={page} canEdit={canEdit} />
      </Suspense>
    </div>
  );
}

async function UsageTable({ page, canEdit }: { page: number; canEdit: boolean }) {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;

  const { data: usage, count } = await supabase
    .from("stock_usage")
    .select("*, brides(name), rolls(roll_number, products(item_code, description, categories(unit))), piece_batches(batch_number, products(item_code, description, categories(unit))), profiles:logged_by(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <>
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
              {!usage || usage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="py-12 text-center text-muted-foreground">
                    No usage logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                usage.map((u) => {
                  const bride = u.brides as { name: string } | null;
                  const roll = u.rolls as { roll_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const batch = u.piece_batches as { batch_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const logger = u.profiles as { full_name: string } | null;
                  const isRoll = !!roll;
                  const stockUnit = (isRoll ? roll?.products?.categories?.unit : batch?.products?.categories?.unit) ?? "roll";
                  const product = isRoll ? roll?.products : batch?.products;
                  const entryNum = isRoll ? roll?.roll_number : batch?.batch_number;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(u.usage_date)}</TableCell>
                      <TableCell className="font-serif">{bride?.name ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                          <span className="font-serif">{product?.item_code} — {product?.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entryNum ?? "—"}</TableCell>
                      <TableCell className="text-right font-serif">{formatQuantity(u.quantity_used, stockUnit as "roll" | "pieces")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{logger?.full_name ?? "—"}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <Link href={`/usage/${u.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Pencil size={13} />
                            </Button>
                          </Link>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0} entries
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}`}
                className="rounded border p-1.5 hover:bg-muted transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </Link>
            )}
            <form action="/usage" className="flex items-center gap-1.5">
              <span>Page</span>
              <input
                type="number"
                name="page"
                min={1}
                max={totalPages}
                defaultValue={page}
                className="w-14 rounded border bg-background px-2 py-1 text-center"
              />
              <span>of {totalPages}</span>
              <button
                type="submit"
                className="rounded border px-3 py-1 hover:bg-muted transition-colors"
              >
                Go
              </button>
            </form>
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}`}
                className="rounded border p-1.5 hover:bg-muted transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
