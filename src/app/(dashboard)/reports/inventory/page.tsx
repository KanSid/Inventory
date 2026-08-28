import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
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
import { InventoryReportClient } from "./client";

export default async function InventoryReportPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canExport = profile?.role === "admin" || profile?.role === "inventory_manager";

  if (!canExport) {
    notFound();
  }

  const { data: inventory } = await supabase
    .from("product_stock_summary")
    .select("*")
    .order("item_code");

  const inventoryData = (inventory ?? []).map((item: any) => ({
    item_code: item.item_code || "Unknown",
    description: item.description || "",
    total_stock: item.total_stock || 0,
    active_count: item.active_count || 0,
    stock_unit: item.stock_unit || "roll",
    stock_status: item.stock_status || "unknown",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Snapshot"
        description="Current stock levels across all products"

      />

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Products</CardTitle>
          <InventoryReportClient data={inventoryData} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No inventory data
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryData.map((item) => (
                    <TableRow key={item.item_code}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell className="text-right">
                        {item.stock_unit === "pieces" ? `${Math.round(item.total_stock)} pcs` : `${item.total_stock.toFixed(1)}m`}
                      </TableCell>
                      <TableCell className="text-right">{item.active_count}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          item.stock_status === "in_stock" ? "bg-emerald-100 text-emerald-700" :
                          item.stock_status === "low_stock" ? "bg-amber-100 text-amber-700" :
                          item.stock_status === "out_of_stock" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {item.stock_status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
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
