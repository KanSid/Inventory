import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { UsageTableSkeleton } from "@/components/usage/usage-table-skeleton";
import { UsageFilters } from "@/components/usage/usage-filters";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { formatDate, formatQuantity } from "@/lib/utils";

const PAGE_SIZE = 100;

interface UsageSearchParams {
  page?: string;
  bride_id?: string;
  product_id?: string;
  roll_number?: string;
  from?: string;
  to?: string;
}

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<UsageSearchParams>;
}) {
  const supabase = await createClient();

  const params = await searchParams;
  const parsedPage = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const [{ data: brides }, { data: products }] = await Promise.all([
    supabase.from("brides").select("id, name").order("name"),
    supabase.from("products").select("id, item_code, description").order("item_code"),
  ]);

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

      <UsageFilters brides={brides ?? []} products={products ?? []} currentFilters={params} />

      <Suspense key={`${page}-${params.bride_id ?? ""}-${params.product_id ?? ""}-${params.roll_number ?? ""}-${params.from ?? ""}-${params.to ?? ""}`} fallback={<UsageTableSkeleton canEdit={canEdit} />}>
        <UsageTable page={page} canEdit={canEdit} filters={params} />
      </Suspense>
    </div>
  );
}

async function UsageTable({
  page,
  canEdit,
  filters,
}: {
  page: number;
  canEdit: boolean;
  filters: UsageSearchParams;
}) {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;

  let noMatch = false;
  let rollIdFilter: string[] | null = null;
  let orCondition: string | null = null;

  if (filters.roll_number) {
    let rollQuery = supabase.from("rolls").select("id").ilike("roll_number", `%${filters.roll_number}%`);
    if (filters.product_id) rollQuery = rollQuery.eq("product_id", filters.product_id);
    const { data: matchedRolls } = await rollQuery;
    const rollIds = (matchedRolls ?? []).map((r) => r.id);
    if (rollIds.length === 0) {
      noMatch = true;
    } else {
      rollIdFilter = rollIds;
    }
  } else if (filters.product_id) {
    const [{ data: matchedRolls }, { data: matchedBatches }] = await Promise.all([
      supabase.from("rolls").select("id").eq("product_id", filters.product_id),
      supabase.from("piece_batches").select("id").eq("product_id", filters.product_id),
    ]);
    const rollIds = (matchedRolls ?? []).map((r) => r.id);
    const batchIds = (matchedBatches ?? []).map((b) => b.id);
    const conditions: string[] = [];
    if (rollIds.length > 0) conditions.push(`roll_id.in.(${rollIds.join(",")})`);
    if (batchIds.length > 0) conditions.push(`batch_id.in.(${batchIds.join(",")})`);
    if (conditions.length === 0) {
      noMatch = true;
    } else {
      orCondition = conditions.join(",");
    }
  }

  let query = supabase
    .from("stock_usage")
    .select("*, brides(name), rolls(roll_number, products(item_code, description, categories(unit))), piece_batches(batch_number, products(item_code, description, categories(unit))), profiles:logged_by(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  let sumQuery = supabase.from("stock_usage").select("quantity_used, roll_id, batch_id");

  if (filters.bride_id) {
    query = query.eq("bride_id", filters.bride_id);
    sumQuery = sumQuery.eq("bride_id", filters.bride_id);
  }
  if (filters.from) {
    query = query.gte("usage_date", filters.from);
    sumQuery = sumQuery.gte("usage_date", filters.from);
  }
  if (filters.to) {
    query = query.lte("usage_date", filters.to);
    sumQuery = sumQuery.lte("usage_date", filters.to);
  }
  if (rollIdFilter) {
    query = query.in("roll_id", rollIdFilter);
    sumQuery = sumQuery.in("roll_id", rollIdFilter);
  }
  if (orCondition) {
    query = query.or(orCondition);
    sumQuery = sumQuery.or(orCondition);
  }

  const [{ data: usage, count }, { data: sumRows }] = noMatch
    ? [{ data: [], count: 0 }, { data: [] }]
    : await Promise.all([query, sumQuery]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const totalMeters = (sumRows ?? [])
    .filter((r) => r.roll_id)
    .reduce((sum, r) => sum + Number(r.quantity_used), 0);
  const totalPieces = (sumRows ?? [])
    .filter((r) => r.batch_id)
    .reduce((sum, r) => sum + Number(r.quantity_used), 0);
  const summaryParts = [
    totalMeters > 0 ? formatQuantity(totalMeters, "roll") : null,
    totalPieces > 0 ? formatQuantity(totalPieces, "pieces") : null,
  ].filter(Boolean);

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
                    No usage logged yet. Log material used on a commission to start tracking consumption.
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
                            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit usage entry">
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
            {summaryParts.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">Total</TableCell>
                  <TableCell className="text-right font-serif">{summaryParts.join(" + ")}</TableCell>
                  <TableCell colSpan={canEdit ? 2 : 1} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (() => {
        const baseParams: Record<string, string> = {};
        if (filters.bride_id) baseParams.bride_id = filters.bride_id;
        if (filters.product_id) baseParams.product_id = filters.product_id;
        if (filters.roll_number) baseParams.roll_number = filters.roll_number;
        if (filters.from) baseParams.from = filters.from;
        if (filters.to) baseParams.to = filters.to;
        return (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0} entries
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`?${new URLSearchParams({ ...baseParams, page: String(page - 1) }).toString()}`}
                className="rounded border p-1.5 hover:bg-muted transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </Link>
            )}
            <form action="/usage" className="flex items-center gap-1.5">
              {Object.entries(baseParams).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
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
                href={`?${new URLSearchParams({ ...baseParams, page: String(page + 1) }).toString()}`}
                className="rounded border p-1.5 hover:bg-muted transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
        );
      })()}
    </>
  );
}
