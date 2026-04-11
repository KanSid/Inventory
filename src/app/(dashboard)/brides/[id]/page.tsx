import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate, formatLength } from "@/lib/utils";

export default async function BrideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bride } = await supabase.from("brides").select("*").eq("id", id).single();
  if (!bride) notFound();

  const { data: usage } = await supabase
    .from("stock_usage")
    .select("*, rolls(roll_number, products(item_code, description))")
    .eq("bride_id", id)
    .order("usage_date", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title={bride.name} description={bride.wedding_date ? `Wedding: ${formatDate(bride.wedding_date)}` : undefined} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{bride.phone || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{bride.email || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Materials Used</p>
            <p className="text-2xl font-bold">
              {formatLength(usage?.reduce((sum, u) => sum + u.quantity_used, 0) ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Roll</TableHead>
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
                  const roll = u.rolls as { roll_number: string; products: { item_code: string; description: string } } | null;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{formatDate(u.usage_date)}</TableCell>
                      <TableCell>{roll?.products?.item_code} — {roll?.products?.description}</TableCell>
                      <TableCell>{roll?.roll_number}</TableCell>
                      <TableCell className="text-right font-medium">{formatLength(u.quantity_used)}</TableCell>
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
