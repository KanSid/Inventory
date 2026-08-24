import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductImageViewer } from "@/components/products/product-image-viewer";
import { RecentUsageCard } from "@/components/products/recent-usage-card";
import { AdjustmentHistoryCard } from "@/components/products/adjustment-history-card";
import { Pencil, Plus, Scale } from "lucide-react";
import { formatQuantity, formatDate, naturalSort } from "@/lib/utils";

const RECENT_LIMIT = 50;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name), product_types(name), costing_categories(name), design_families(name), product_suppliers(suppliers(name))")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const productId = product.id;

  const { data: summary } = await supabase
    .from("product_stock_summary")
    .select("*")
    .eq("id", productId)
    .single();

  const stockUnit = (summary?.stock_unit ?? "roll") as "roll" | "pieces";

  // Fetch stock entries from the correct table
  const isRoll = stockUnit === "roll";

  const [rollsResult, batchesResult] = await Promise.all([
    isRoll
      ? supabase.from("rolls").select("*").eq("product_id", productId)
      : Promise.resolve({ data: [] }),
    !isRoll
      ? supabase.from("piece_batches").select("*").eq("product_id", productId)
      : Promise.resolve({ data: [] }),
  ]);

  const rolls = (rollsResult.data ?? []).sort((a, b) => naturalSort(a.roll_number, b.roll_number));
  const batches = (batchesResult.data ?? []).sort((a, b) => naturalSort(a.batch_number, b.batch_number));

  const rollIds = rolls.map((r) => r.id);
  const batchIds = batches.map((b) => b.id);

  // Fetch recent usage for this product's rolls or batches
  let usage: any[] = [];
  let usageCount = 0;
  if (isRoll && rollIds.length > 0) {
    const { data, count } = await supabase
      .from("stock_usage")
      .select("*, brides(name), rolls(roll_number)", { count: "exact" })
      .in("roll_id", rollIds)
      .order("usage_date", { ascending: false })
      .limit(RECENT_LIMIT);
    usage = data ?? [];
    usageCount = count ?? usage.length;
  } else if (!isRoll && batchIds.length > 0) {
    const { data, count } = await supabase
      .from("stock_usage")
      .select("*, brides(name), piece_batches(batch_number)", { count: "exact" })
      .in("batch_id", batchIds)
      .order("usage_date", { ascending: false })
      .limit(RECENT_LIMIT);
    usage = data ?? [];
    usageCount = count ?? usage.length;
  }

  // Fetch recent stock adjustments for this product's rolls or batches
  let adjustments: any[] = [];
  let adjustmentCount = 0;
  if (isRoll && rollIds.length > 0) {
    const { data, count } = await supabase
      .from("stock_adjustments")
      .select("*, rolls(roll_number), profiles:adjusted_by(full_name)", { count: "exact" })
      .in("roll_id", rollIds)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT);
    adjustments = data ?? [];
    adjustmentCount = count ?? adjustments.length;
  } else if (!isRoll && batchIds.length > 0) {
    const { data, count } = await supabase
      .from("stock_adjustments")
      .select("*, piece_batches(batch_number), profiles:adjusted_by(full_name)", { count: "exact" })
      .in("batch_id", batchIds)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT);
    adjustments = data ?? [];
    adjustmentCount = count ?? adjustments.length;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const cat = product.categories as { name: string } | null;
  const productType = product.product_types as { name: string } | null;
  const costingCat = product.costing_categories as { name: string } | null;
  const designFamily = product.design_families as { name: string } | null;
  const supplierNames = ((product.product_suppliers ?? []) as { suppliers: { name: string } | null }[])
    .map((ps) => ps.suppliers?.name)
    .filter(Boolean) as string[];
  const stockStatus = (summary?.stock_status ?? "out_of_stock") as "in_stock" | "low_stock" | "out_of_stock" | "phased_out";

  const addHref = isRoll
    ? `/products/${product.id}/rolls/add`
    : `/products/${product.id}/pieces/add`;

  const entries = isRoll ? rolls : batches;
  const entryCount = entries.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.item_code}
        description={product.description}
        action={
          canEdit ? (
            <div className="flex gap-2">
              <Link href={addHref}>
                <Button>
                  <Plus size={16} className="mr-2" />
                  {isRoll ? "Add Rolls" : "Add Pieces"}
                </Button>
              </Link>
              <Link href={`/adjustments/new?product=${product.id}`}>
                <Button variant="outline">
                  <Scale size={16} className="mr-2" />
                  Adjust Stock
                </Button>
              </Link>
              <Link href={`/products/${product.id}/edit`}>
                <Button variant="outline">
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="pt-6 space-y-4">
            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Stock</p>
                <p className="text-xl font-bold">{formatQuantity(summary?.total_stock ?? 0, stockUnit)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRoll ? "Active Rolls" : "Active Batches"}</p>
                <p className="text-xl font-bold">{summary?.active_count ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock Threshold</p>
                <p className="text-xl font-bold">{formatQuantity(product.low_stock_threshold ?? 0, stockUnit)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={stockStatus} />
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{cat?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{productType?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Design Family</p>
                <p className="font-medium">{designFamily?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Costing Category</p>
                <p className="font-medium">{costingCat?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Unit</p>
                <p className="font-medium capitalize">{stockUnit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phased Out</p>
                <p className="font-medium">{product.is_phased_out ? "Yes" : "No"}</p>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-muted-foreground">Suppliers</p>
                {supplierNames.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {supplierNames.map((name) => (
                      <span key={name} className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : <p className="font-medium">—</p>}
              </div>
              {product.comment && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-muted-foreground">Comment</p>
                  <p className="mt-0.5">{product.comment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center lg:justify-end">
          <ProductImageViewer imageUrl={product.image_url} description={product.description} />
        </div>
      </div>

      {/* Stock entries table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isRoll ? "Rolls" : "Batches"} ({entryCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRoll ? "Roll #" : "Batch #"}</TableHead>
                <TableHead className="text-right">Initial</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
                {isRoll && <TableHead>Full Roll</TableHead>}
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entryCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={isRoll ? 6 : 5} className="py-8 text-center text-muted-foreground">
                    {isRoll
                      ? "No rolls yet. Add rolls to start tracking stock."
                      : "No batches yet. Add pieces to start tracking stock."}
                  </TableCell>
                </TableRow>
              ) : isRoll ? (
                rolls.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.roll_number}</TableCell>
                    <TableCell className="text-right">{formatQuantity(r.initial_length_m, "roll")}</TableCell>
                    <TableCell className="text-right font-medium">{formatQuantity(r.current_length_m, "roll")}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.status === "active" ? "Active" : "Finished"}
                      </span>
                    </TableCell>
                    <TableCell>{r.is_full_roll ? "Yes" : "No"}</TableCell>
                    <TableCell>{formatDate(r.received_date)}</TableCell>
                  </TableRow>
                ))
              ) : (
                batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.batch_number}</TableCell>
                    <TableCell className="text-right">{formatQuantity(b.initial_count, "pieces")}</TableCell>
                    <TableCell className="text-right font-medium">{formatQuantity(b.current_count, "pieces")}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {b.status === "active" ? "Active" : "Finished"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(b.received_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecentUsageCard
        productId={productId}
        isRoll={isRoll}
        stockUnit={stockUnit}
        initialUsage={usage}
        initialCount={usageCount}
      />

      <AdjustmentHistoryCard
        productId={productId}
        isRoll={isRoll}
        stockUnit={stockUnit}
        initialAdjustments={adjustments}
        initialCount={adjustmentCount}
      />
    </div>
  );
}
