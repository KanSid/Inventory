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
import { Pencil, Plus } from "lucide-react";
import { formatQuantity, formatDate } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: itemCode } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("item_code", itemCode)
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
      ? supabase.from("rolls").select("*").eq("product_id", productId).order("roll_number")
      : Promise.resolve({ data: [] }),
    !isRoll
      ? supabase.from("piece_batches").select("*").eq("product_id", productId).order("batch_number")
      : Promise.resolve({ data: [] }),
  ]);

  const rolls = rollsResult.data ?? [];
  const batches = batchesResult.data ?? [];

  // Fetch recent usage for this product's rolls or batches
  let usage: any[] = [];
  if (isRoll && rolls.length > 0) {
    const rollIds = rolls.map((r) => r.id);
    const { data } = await supabase
      .from("stock_usage")
      .select("*, brides(name), rolls(roll_number)")
      .in("roll_id", rollIds)
      .order("usage_date", { ascending: false })
      .limit(20);
    usage = data ?? [];
  } else if (!isRoll && batches.length > 0) {
    const batchIds = batches.map((b) => b.id);
    const { data } = await supabase
      .from("stock_usage")
      .select("*, brides(name), piece_batches(batch_number)")
      .in("batch_id", batchIds)
      .order("usage_date", { ascending: false })
      .limit(20);
    usage = data ?? [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const cat = product.categories as { name: string } | null;
  const stockStatus = (summary?.stock_status ?? "out_of_stock") as "in_stock" | "low_stock" | "out_of_stock" | "phased_out";

  const addHref = isRoll
    ? `/products/${product.item_code}/rolls/add`
    : `/products/${product.item_code}/pieces/add`;

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
              <Link href={`/products/${product.item_code}/edit`}>
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 flex-1">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Category</p>
              {cat && (
                <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {cat.name}
                </span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-2xl font-bold">{formatQuantity(summary?.total_stock ?? 0, stockUnit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isRoll ? "Active Rolls" : "Active Batches"}</p>
              <p className="text-2xl font-bold">{summary?.active_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={stockStatus} />
              </div>
            </CardContent>
          </Card>
        </div>

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

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Usage</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bride</TableHead>
                <TableHead>{isRoll ? "Roll" : "Batch"}</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No usage recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                usage.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{formatDate(u.usage_date)}</TableCell>
                    <TableCell>{(u.brides as { name: string } | null)?.name ?? "—"}</TableCell>
                    <TableCell>
                      {isRoll
                        ? (u.rolls as { roll_number: string } | null)?.roll_number ?? "—"
                        : (u.piece_batches as { batch_number: string } | null)?.batch_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatQuantity(u.quantity_used, stockUnit)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
