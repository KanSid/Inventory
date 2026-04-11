import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";
import { AdjustmentReportClient } from "./client";

export default async function AdjustmentReportPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canExport = profile?.role === "admin" || profile?.role === "inventory_manager";

  if (!canExport) notFound();

  const { data: adjustments } = await supabase
    .from("stock_adjustments")
    .select("*, rolls(roll_number, products(item_code)), profiles:adjusted_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(500);

  const adjustmentData = (adjustments ?? []).map((item: any) => ({
    created_at: item.created_at,
    item_code: item.rolls?.products?.item_code || "Unknown",
    roll_number: item.rolls?.roll_number || "—",
    adjustment_type: item.adjustment_type,
    quantity: item.quantity,
    reason: item.reason || "—",
    adjusted_by: item.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Adjustments Log" description="Stock corrections and damage records" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Adjustments</CardTitle>
          <AdjustmentReportClient data={adjustmentData} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No adjustments
                    </TableCell>
                  </TableRow>
                ) : (
                  adjustmentData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{formatDate(item.created_at)}</TableCell>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell className="text-sm">{item.roll_number}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          item.adjustment_type === "addition" ? "bg-emerald-100 text-emerald-700" :
                          item.adjustment_type === "deduction" ? "bg-red-100 text-red-700" :
                          item.adjustment_type === "damage" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {item.adjustment_type.charAt(0).toUpperCase() + item.adjustment_type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.adjustment_type === "addition" || item.adjustment_type === "correction" ? "+" : "−"}{item.quantity}m</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.adjusted_by}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
