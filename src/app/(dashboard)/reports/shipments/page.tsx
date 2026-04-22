import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";
import { ShipmentReportClient } from "./client";

export default async function ShipmentReportPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canExport = profile?.role === "admin" || profile?.role === "inventory_manager";

  if (!canExport) notFound();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, shipment_number, status, date, created_at, shipment_items(quantity_in_meters, suppliers(name))")
    .order("created_at", { ascending: false });

  const shipmentData = (shipments ?? []).map((s: any) => {
    const items = s.shipment_items ?? [];
    const supplierSet = new Set<string>();
    items.forEach((item: any) => {
      if (item.suppliers?.name) {
        supplierSet.add(item.suppliers.name);
      }
    });
    const supplierCount = supplierSet.size;

    return {
      shipment_number: s.shipment_number,
      supplier_count: supplierCount,
      status: s.status,
      date: s.date || s.created_at,
      item_count: items.length || 0,
      total_meters: items.reduce((sum: number, item: any) => sum + (item.quantity_in_meters || 0), 0),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Shipment History" description="Received and pending shipments" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Shipments</CardTitle>
          <ShipmentReportClient data={shipmentData} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment #</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total (m)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipmentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No shipments
                    </TableCell>
                  </TableRow>
                ) : (
                  shipmentData.map((s, idx) => {
                    const supplierCountText = s.supplier_count === 1 ? "1 supplier" : `${s.supplier_count} suppliers`;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{s.shipment_number}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {s.supplier_count > 0 ? supplierCountText : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            s.status === "received" ? "bg-emerald-100 text-emerald-700" :
                            s.status === "pending" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(s.date)}</TableCell>
                        <TableCell className="text-right text-sm">{s.item_count}</TableCell>
                        <TableCell className="text-right">{s.total_meters}m</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
