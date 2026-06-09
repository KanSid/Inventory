import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate, formatQuantity } from "@/lib/utils";

export default async function BrideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bride } = await supabase.from("brides").select("*").eq("id", id).single();
  if (!bride) notFound();

  const { data: usage } = await supabase
    .from("stock_usage")
    .select("*, rolls(roll_number, products(item_code, description, categories(unit))), piece_batches(batch_number, products(item_code, description, categories(unit)))")
    .eq("bride_id", id)
    .order("usage_date", { ascending: false });

  const totalUsages = usage?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title={bride.name} description={bride.wedding_date ? `Wedding: ${formatDate(bride.wedding_date)}` : undefined} />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{bride.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{bride.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wedding Date</p>
              <p className="font-medium">{bride.wedding_date ? formatDate(bride.wedding_date) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Usage Records</p>
              <p className="font-medium">{totalUsages}</p>
            </div>
            {bride.notes && (
              <div className="col-span-2 sm:col-span-4">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="mt-0.5">{bride.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Material Usage</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Roll / Batch</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!usage || usage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No materials used yet.
                  </TableCell>
                </TableRow>
              ) : (
                usage.map((u) => {
                  const roll = u.rolls as { roll_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const batch = u.piece_batches as { batch_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const isRoll = !!roll;
                  const product = isRoll ? roll?.products : batch?.products;
                  const entryNum = isRoll ? roll?.roll_number : batch?.batch_number;
                  const stockUnit = (product?.categories?.unit ?? "roll") as "roll" | "pieces";
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{formatDate(u.usage_date)}</TableCell>
                      <TableCell>{product?.item_code} — {product?.description}</TableCell>
                      <TableCell>{entryNum ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{formatQuantity(u.quantity_used, stockUnit)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
